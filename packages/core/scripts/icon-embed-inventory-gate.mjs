#!/usr/bin/env node
// Icon-embed inventory gate (packaging honesty).
//
// Phosphor is vendored, not externalized (see vite.config.ts): every DS
// entry shares one Rollup module graph with `preserveModules: true`, so any
// Phosphor SSR/defs module reachable from ANY declared entry -- not just the
// `icons` subpath -- lands in dist/node_modules once. package.json's `files`
// allowlist (`dist/**/*.js`, `dist/**/*.cjs`) ships whatever is there: this
// is not a local build artifact, it is published surface.
//
// This gate counts what actually landed post-build and fails above a
// reviewed, decrease-only ceiling, so a silent regrowth of the vendored
// surface cannot hide behind a comment the way it did before: vite.config.ts
// used to claim a "~50-glyph" embed while dist carried hundreds of modules
// and nothing re-derived or checked that number.
//
// Complements, does not replace, pack-inventory-gate.mjs: that gate ratchets
// the WHOLE published tarball's entry count and unpacked size and would
// eventually catch this growth too, but gives no supplier-specific
// attribution. This gate answers "how much of dist/node_modules is Phosphor
// (or anything else)" directly, which is what the vite.config.ts
// non-externalization comment needs in order to stay honest over time.
//
// A vendored package typically ships one CJS twin per ESM/module file
// (Phosphor's `X.es.js` + `X.es.cjs`). Counting only non-`.cjs` files gives
// one count per logical module without hardcoding Phosphor's internal
// ssr/defs/lib layout, so the rule keeps working if that layout changes and
// still catches any OTHER supplier that leaks into dist/node_modules, not
// just Phosphor.
//
// The gate reads dist as-is, like its packaging-honesty siblings. On a
// stale/unbuilt dist there is nothing to audit (`--check` no-ops rather than
// failing); seed the ceiling with `--write` only after a build that reflects
// the current source tree.
//
// Usage:
//   node scripts/icon-embed-inventory-gate.mjs [--check] [--dist <dir>]
//   node scripts/icon-embed-inventory-gate.mjs --write [--allow-increase]
//
// --check (default): fails (exit 1) when the measured module count exceeds
//   the baseline ceiling. A missing dist/node_modules is not a failure --
//   there is nothing built yet to audit; run after `vite build`.
// --write: recomputes the ceiling from the current dist/node_modules and
//   persists it to the baseline file. Refuses to raise an existing ceiling
//   unless --allow-increase is also passed, so growth always needs a
//   reviewed, visible diff instead of a silent bump.

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const BASELINE_PATH = resolve(scriptDir, 'icon-embed-inventory-gate.baseline.json');

// -- pure audit ---------------------------------------------------------------

/**
 * Classify one file already known to live under dist/node_modules. `relPath`
 * is POSIX-style, relative to the package root, e.g.
 * "dist/node_modules/.pnpm/@phosphor-icons_react@2.1.10.../node_modules/@phosphor-icons/react/dist/ssr/Plus.es.js".
 * Handles both pnpm's nested virtual-store layout and a flat node_modules by
 * keying off the LAST `node_modules/` segment, not a hardcoded depth.
 */
export function classifyVendoredFile(relPath) {
  const marker = 'node_modules/';
  const idx = relPath.lastIndexOf(marker);
  const afterNodeModules = relPath.slice(idx + marker.length);
  const segments = afterNodeModules.split('/');
  const supplier = segments[0].startsWith('@')
    ? `${segments[0]}/${segments[1]}`
    : segments[0];
  // One counted "module" per logical file: skip the CJS twin of a vendored
  // ESM/module pair so a dual-format package is not counted twice.
  const counted = !relPath.endsWith('.cjs');
  return { supplier, counted };
}

/** `files`: [{ path, size }] with POSIX paths relative to the package root. */
export function summarizeVendoredModules(files) {
  const bySupplier = {};
  let moduleCount = 0;
  let totalBytes = 0;
  for (const { path, size } of files) {
    totalBytes += size;
    const { supplier, counted } = classifyVendoredFile(path);
    if (!counted) continue;
    moduleCount += 1;
    bySupplier[supplier] = (bySupplier[supplier] ?? 0) + 1;
  }
  return { moduleCount, totalFiles: files.length, totalBytes, bySupplier };
}

/** Pure ceiling check; `ceiling` is the baseline's reviewed maximum. */
export function evaluateCeiling(moduleCount, ceiling) {
  if (moduleCount > ceiling) {
    return {
      ok: false,
      message:
        `${moduleCount} vendored modules exceeds the reviewed ceiling of ${ceiling}. ` +
        'If this growth is reviewed and intended, reseed with ' +
        '`node scripts/icon-embed-inventory-gate.mjs --write --allow-increase` and record ' +
        'why in icon-embed-inventory-gate.baseline.json. Otherwise something is pulling in ' +
        'more of the vendored corpus than expected -- check for a new root-reachable ' +
        'catalog/role import.',
    };
  }
  if (moduleCount < ceiling) {
    return {
      ok: true,
      message: `${moduleCount}/${ceiling} -- ceiling has slack, consider tightening it with --write.`,
    };
  }
  return { ok: true, message: `${moduleCount}/${ceiling} -- at ceiling.` };
}

// -- filesystem IO -------------------------------------------------------------

function walk(dir, out) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile()) out.push(full);
  }
}

function collectFiles(nodeModulesDir) {
  const absolute = [];
  walk(nodeModulesDir, absolute);
  return absolute.map((file) => ({
    path: relative(packageRoot, file).replaceAll('\\', '/'),
    size: statSync(file).size,
  }));
}

function formatBytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function readJsonIfPresent(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

function supplierReport(bySupplier) {
  return Object.entries(bySupplier)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => `    ${name}: ${count}`)
    .join('\n');
}

// -- CLI -----------------------------------------------------------------------

function parseArgs(argv) {
  const options = {
    mode: 'check',
    distDir: resolve(packageRoot, 'dist'),
    allowIncrease: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--write') options.mode = 'write';
    if (argv[i] === '--check') options.mode = 'check';
    if (argv[i] === '--allow-increase') options.allowIncrease = true;
    if (argv[i] === '--dist') options.distDir = resolve(argv[i + 1]);
  }
  return options;
}

function run() {
  const { mode, distDir, allowIncrease } = parseArgs(process.argv.slice(2));
  const nodeModulesDir = join(distDir, 'node_modules');

  if (!existsSync(nodeModulesDir)) {
    console.log(
      `icon-embed-inventory-gate: ${relative(packageRoot, nodeModulesDir)} does not exist -- ` +
        'nothing built yet to audit. Run after `vite build`.',
    );
    return;
  }

  const files = collectFiles(nodeModulesDir);
  const measurement = summarizeVendoredModules(files);
  const report =
    `icon-embed-inventory-gate: ${measurement.moduleCount} vendored module(s), ` +
    `${measurement.totalFiles} file(s), ${formatBytes(measurement.totalBytes)} ` +
    `under ${relative(packageRoot, nodeModulesDir)}`;

  if (mode === 'write') {
    const baseline = readJsonIfPresent(BASELINE_PATH);
    const previousCeiling = baseline?.ceiling;
    if (
      typeof previousCeiling === 'number' &&
      measurement.moduleCount > previousCeiling &&
      !allowIncrease
    ) {
      console.error(
        `icon-embed-inventory-gate: measured ${measurement.moduleCount} exceeds the current ` +
          `ceiling of ${previousCeiling}. Pass --allow-increase to raise it deliberately; the ` +
          'ceiling is decrease-only by default.',
      );
      process.exit(1);
    }
    const next = {
      ceiling: measurement.moduleCount,
      measuredTotalFiles: measurement.totalFiles,
      measuredBytes: measurement.totalBytes,
      measuredAt: new Date().toISOString().slice(0, 10),
      note:
        baseline?.note ??
        'Decrease-only ceiling on vendored supplier modules under dist/node_modules (one ' +
          'entry per logical module; CJS twins excluded). Raise only with --allow-increase ' +
          'and record why in this note.',
    };
    writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, 2)}\n`);
    console.log(
      `icon-embed-inventory-gate: wrote ceiling ${next.ceiling} (was ${previousCeiling ?? 'unset'}) ` +
        `to ${relative(packageRoot, BASELINE_PATH)}`,
    );
    console.log(supplierReport(measurement.bySupplier));
    return;
  }

  const baseline = readJsonIfPresent(BASELINE_PATH);
  if (!baseline || typeof baseline.ceiling !== 'number') {
    console.error(
      `icon-embed-inventory-gate: FAIL -- no numeric ceiling at ${relative(packageRoot, BASELINE_PATH)}.\n` +
        '  Seed it after a build that reflects current source: ' +
        'node scripts/icon-embed-inventory-gate.mjs --write',
    );
    process.exit(1);
  }

  console.log(report);
  console.log(supplierReport(measurement.bySupplier));
  const { ok, message } = evaluateCeiling(measurement.moduleCount, baseline.ceiling);
  console.log(`icon-embed-inventory-gate: ${message}`);
  if (!ok) process.exit(1);
}

const invokedDirectly =
  resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  try {
    run();
  } catch (error) {
    console.error(`icon-embed-inventory-gate: ERROR -- ${error.message}`);
    process.exit(1);
  }
}
