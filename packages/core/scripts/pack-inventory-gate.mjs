#!/usr/bin/env node
// Pack-inventory gate (BLD packaging honesty).
//
// `npm pack` decides what ships from the `files` allowlist + `.npmignore` +
// the working-tree `dist/`. Nothing pinned that surface, so the tarball could
// silently grow (a new dir slips into `files`), balloon in size, or ship
// content it must never ship -- test fixtures, tenant proof-fixture names, or
// lucide-tainted icon code -- with every other gate green.
//
// This gate snapshots the exact `npm pack --dry-run --json` file list + total
// size into a committed baseline (pack-inventory.baseline.json) and enforces:
//
//   1. Additions: a packed path that is neither in the baseline nor in the
//      explicit-review pack-inventory.additions.json fails. New published
//      surface must be a deliberate, reviewed act.
//   2. Size ratchet (decrease-only): the total unpacked size and entry count
//      may only shrink relative to the baseline. Growth fails; a genuine
//      shrink re-seeds the baseline via `--write`.
//   3. Forbidden PATHS: no `fixtures/` segment, no tenant proof-fixture name
//      (themanagementmiami / torture-*), no `lucide` -- except paths on the
//      reviewed lucide allowlist (the ban-rule subtree + the honesty contract).
//   4. Forbidden CONTENT: the bytes of every shipped file are scanned for
//      `lucide` (outside the allowlist) and for tenant proof-fixture
//      identifiers. This is the check that catches lucide-tainted `dist/`
//      artifacts whose PATHS look innocent.
//
// The forbidden tenant-name list is derived from the compilers' torture
// fixtures at runtime (the fixture folders + their theme ids/exports), so it
// tracks the fixtures instead of drifting from a hand-copied constant.
//
// The gate reads dist as-is. On a stale/tainted dist it fails, by design; it
// goes green once dist is rebuilt clean and the fixture leak is excluded from
// the pack (see the report handoff). `--check` requires a baseline; seed it
// with `--write` ONLY after a clean build.
//
// Usage:
//   node scripts/pack-inventory-gate.mjs --check   (default)
//   node scripts/pack-inventory-gate.mjs --write    (re-seed baseline; refuses a dirty pack)

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRootDefault = resolve(scriptDir, '..');
const BASELINE_PATH = resolve(scriptDir, 'pack-inventory.baseline.json');
const ADDITIONS_PATH = resolve(scriptDir, 'pack-inventory.additions.json');
const LUCIDE_ALLOWLIST_PATH = resolve(scriptDir, 'pack-inventory.lucide-allowlist.json');
const FIXTURES_DIR_REL = 'src/foundation/tokens/ts/presentation/brand-themes/fixtures';
const SEED_HINT =
  'Seed it after a clean build: pnpm --filter @rottay/design-system build && ' +
  'pnpm --filter @rottay/design-system packinv:write';

// -- inputs ------------------------------------------------------------------

/**
 * Run `npm pack --dry-run` and return the parsed inventory. `--ignore-scripts`
 * skips lifecycle hooks: it prevents this gate (reachable from prepack) from
 * re-triggering prepack, and keeps the file list identical (the list is decided
 * by files/.npmignore, not by scripts). `--dry-run` writes no tarball.
 */
export function runNpmPackDryRun(packageRoot) {
  const result = spawnSync(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts'],
    { cwd: packageRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  if (result.error) {
    throw new Error(`npm pack failed to spawn: ${result.error.message}`);
  }
  const stdout = result.stdout ?? '';
  const start = stdout.indexOf('[');
  const end = stdout.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `npm pack --dry-run --json produced no JSON array (status ${result.status}).\n${result.stderr ?? ''}`,
    );
  }
  const parsed = JSON.parse(stdout.slice(start, end + 1));
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!entry || !Array.isArray(entry.files)) {
    throw new Error('npm pack --dry-run --json did not report a files array');
  }
  return {
    name: entry.name,
    version: entry.version,
    entryCount: entry.entryCount ?? entry.files.length,
    unpackedSize: entry.unpackedSize ?? 0,
    files: entry.files.map((f) => ({ path: f.path, size: f.size ?? 0 })),
  };
}

function readJsonIfPresent(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
}

/**
 * Derive the forbidden tenant-fixture token set from the torture fixtures.
 * `all` (paths + content) covers folder names, theme ids, and export symbols.
 * `content` drops bare single-word folder tokens (e.g. `torture`) that collide
 * with ordinary English, keeping only the unambiguous slugs/symbols so the
 * content scan cannot false-positive on prose.
 */
export function collectForbiddenTenantTokens(packageRoot) {
  const all = new Set();
  const dir = resolve(packageRoot, FIXTURES_DIR_REL);
  if (existsSync(dir)) {
    for (const dirent of readdirSync(dir, { withFileTypes: true })) {
      if (!dirent.isDirectory()) continue;
      all.add(dirent.name);
      const index = resolve(dir, dirent.name, 'index.ts');
      if (!existsSync(index)) continue;
      const source = readFileSync(index, 'utf8');
      for (const match of source.matchAll(/id:\s*'([^']+)'/gu)) all.add(match[1]);
      for (const match of source.matchAll(/export const (\w+)/gu)) all.add(match[1]);
    }
  }
  if (all.size === 0) {
    // Defensive fallback if the fixtures tree ever moves; the self-test pins the
    // real derivation so this never silently becomes the only source of truth.
    for (const token of ['themanagementmiami', 'torture', 'torture-dark', 'torture-light']) {
      all.add(token);
    }
  }
  const content = new Set(
    [...all].filter((token) => /[-_A-Z]/u.test(token) || token === 'themanagementmiami'),
  );
  return { all, content };
}

export function loadLucideAllowlist(path) {
  const raw = readJsonIfPresent(path);
  const entries = Array.isArray(raw?.allow) ? raw.allow : [];
  return {
    prefixes: entries.filter((e) => typeof e.prefix === 'string').map((e) => e.prefix),
    exacts: new Set(entries.filter((e) => typeof e.path === 'string').map((e) => e.path)),
  };
}

function isLucideAllowed(path, allow) {
  if (allow.exacts.has(path)) return true;
  return allow.prefixes.some((prefix) => path.startsWith(prefix));
}

function countOccurrences(haystack, re) {
  const matches = haystack.match(re);
  return matches ? matches.length : 0;
}

// -- audit -------------------------------------------------------------------

/**
 * Pure inventory audit. `pack` is the runNpmPackDryRun shape; `readPackedFile`
 * returns the bytes-as-string of a packed path (injected so the self-test runs
 * without a real tree). Returns `{ failures, notes }`.
 */
export function auditPackInventory({
  pack,
  baseline,
  additions,
  lucideAllow,
  forbiddenTokens,
  readPackedFile,
}) {
  const failures = [];
  const notes = [];
  const lucideRe = /lucide/giu;

  // (3) forbidden PATHS
  for (const { path } of pack.files) {
    if (path.split('/').includes('fixtures')) {
      failures.push(`fixture path shipped in pack: ${path} (fixtures must never ship)`);
    }
    const lower = path.toLowerCase();
    for (const token of forbiddenTokens.all) {
      if (lower.includes(token.toLowerCase())) {
        failures.push(`tenant proof-fixture token '${token}' in packed path: ${path}`);
        break;
      }
    }
    if (/lucide/iu.test(path) && !isLucideAllowed(path, lucideAllow)) {
      failures.push(`lucide token in packed path (not on the reviewed allowlist): ${path}`);
    }
  }

  // (4) forbidden CONTENT
  for (const { path } of pack.files) {
    let content;
    try {
      content = readPackedFile(path);
    } catch (error) {
      failures.push(`cannot read packed file to scan its content: ${path} -- ${error.message}`);
      continue;
    }
    if (!isLucideAllowed(path, lucideAllow)) {
      const hits = countOccurrences(content, lucideRe);
      if (hits > 0) {
        failures.push(`lucide token in shipped file content: ${path} (${hits} occurrence(s)) -- icon source must be 100% Phosphor`);
      }
    }
    for (const token of forbiddenTokens.content) {
      if (content.includes(token)) {
        failures.push(`tenant proof-fixture identifier '${token}' in shipped file content: ${path}`);
        break;
      }
    }
  }

  // (1) + (2) baseline compare
  if (baseline) {
    const baselinePaths = new Set(baseline.files.map((f) => f.path));
    const additionsSet = new Set(additions);
    const currentPaths = new Set(pack.files.map((f) => f.path));

    for (const { path } of pack.files) {
      if (!baselinePaths.has(path) && !additionsSet.has(path)) {
        failures.push(
          `unexpected new packed entry (not in baseline, not in pack-inventory.additions.json): ${path}`,
        );
      }
    }
    for (const path of additionsSet) {
      if (!currentPaths.has(path)) {
        notes.push(`stale additions review entry (no longer packed): ${path}`);
      }
    }
    for (const path of baselinePaths) {
      if (!currentPaths.has(path)) {
        notes.push(`packed entry removed since baseline (allowed shrink): ${path}`);
      }
    }
    if (pack.unpackedSize > baseline.unpackedSize) {
      failures.push(
        `pack unpacked size grew: ${pack.unpackedSize} > baseline ${baseline.unpackedSize} ` +
        '(size ratchet is decrease-only; investigate the growth, then re-seed via packinv:write)',
      );
    } else if (pack.unpackedSize < baseline.unpackedSize) {
      notes.push(
        `pack unpacked size shrank to ${pack.unpackedSize} (baseline ${baseline.unpackedSize}) -- ` +
        're-seed the baseline with packinv:write to tighten the ratchet',
      );
    }
    if (pack.entryCount > baseline.entryCount) {
      failures.push(
        `pack entry count grew: ${pack.entryCount} > baseline ${baseline.entryCount} (decrease-only)`,
      );
    }
  }

  return { failures, notes };
}

// -- CLI ---------------------------------------------------------------------

function buildBaseline(pack) {
  return {
    schemaVersion: 1,
    generatedBy: 'pnpm --filter @rottay/design-system packinv:write (after a clean build)',
    producer: pack.name,
    producerVersion: pack.version,
    entryCount: pack.entryCount,
    unpackedSize: pack.unpackedSize,
    files: [...pack.files].sort((a, b) => a.path.localeCompare(b.path)),
  };
}

function parseArgs(argv) {
  const options = { mode: 'check', packageRoot: packageRootDefault };
  for (const arg of argv) {
    if (arg === '--write') options.mode = 'write';
    if (arg === '--check') options.mode = 'check';
  }
  return options;
}

function run() {
  const { mode, packageRoot } = parseArgs(process.argv.slice(2));
  const pack = runNpmPackDryRun(packageRoot);
  const forbiddenTokens = collectForbiddenTenantTokens(packageRoot);
  const lucideAllow = loadLucideAllowlist(LUCIDE_ALLOWLIST_PATH);
  const readPackedFile = (path) => readFileSync(resolve(packageRoot, path), 'utf8');

  if (mode === 'write') {
    // Never bless a dirty pack: run the forbidden scans (no baseline) and refuse
    // to seed if the current tarball ships anything it must not.
    const { failures } = auditPackInventory({
      pack,
      baseline: null,
      additions: [],
      lucideAllow,
      forbiddenTokens,
      readPackedFile,
    });
    if (failures.length > 0) {
      console.error(`pack-inventory-gate: refusing to seed a baseline over a dirty pack (${failures.length}):`);
      for (const failure of failures) console.error(`  - ${failure}`);
      process.exit(1);
    }
    writeFileSync(BASELINE_PATH, `${JSON.stringify(buildBaseline(pack), null, 2)}\n`);
    console.log(
      `pack-inventory-gate: baseline seeded -- ${pack.entryCount} entries, ${pack.unpackedSize} unpacked bytes ` +
      `for ${pack.name}@${pack.version}`,
    );
    return;
  }

  const baseline = readJsonIfPresent(BASELINE_PATH);
  if (!baseline) {
    console.error(
      `pack-inventory-gate: FAIL -- no baseline at ${BASELINE_PATH}.\n  ${SEED_HINT}`,
    );
    process.exit(1);
  }
  const additionsRaw = readJsonIfPresent(ADDITIONS_PATH);
  const additions = Array.isArray(additionsRaw?.additions)
    ? additionsRaw.additions.map((a) => (typeof a === 'string' ? a : a.path)).filter(Boolean)
    : [];

  const { failures, notes } = auditPackInventory({
    pack,
    baseline,
    additions,
    lucideAllow,
    forbiddenTokens,
    readPackedFile,
  });

  for (const note of notes) console.log(`pack-inventory-gate: note -- ${note}`);
  if (failures.length > 0) {
    console.error(`pack-inventory-gate: FAIL (${failures.length})`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
  }
  console.log(
    `pack-inventory-gate: OK -- ${pack.entryCount} entries, ${pack.unpackedSize} unpacked bytes, ` +
    'no forbidden content, within baseline',
  );
}

const invokedDirectly = resolve(process.argv[1] ?? '') === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) {
  try {
    run();
  } catch (error) {
    console.error(`pack-inventory-gate: ERROR -- ${error.message}`);
    process.exit(1);
  }
}
