#!/usr/bin/env node

/**
 * Bundle Size Analyzer for @rottay/design-system
 *
 * Builds the library with Vite, measures every dist/ entry-point file,
 * and compares against the performance budget defined in PERFORMANCE_BUDGET.md.
 *
 * Usage:
 *   node scripts/analyze-bundle.mjs            # build + analyze
 *   node scripts/analyze-bundle.mjs --skip-build  # analyze existing dist/
 *
 * Exit codes:
 *   0 - all files within budget
 *   1 - one or more files over budget
 */

import { execSync } from 'node:child_process';
import { readdirSync, statSync, existsSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Writable } from 'node:stream';

// ---------------------------------------------------------------------------
// Configuration -- keep in sync with PERFORMANCE_BUDGET.md
// ---------------------------------------------------------------------------

/** Maximum uncompressed size in bytes for each entry-point file. */
const BUDGET = {
  'dist/index.js': 500_000,
  'dist/index.cjs': 500_000,
  'dist/icons.js': 150_000,
  'dist/icons.cjs': 150_000,
  'dist/tokens.js': 80_000,
  'dist/tokens.cjs': 80_000,
  'dist/i18n.js': 80_000,
  'dist/i18n.cjs': 80_000,
};

/**
 * Maximum total uncompressed size for all .js + .cjs files under dist/.
 * This acts as a catch-all for preserveModules chunks that don't have an
 * individual entry in BUDGET.
 */
const TOTAL_JS_BUDGET = 2_000_000; // 2 MB uncompressed total

/**
 * Maximum total size for CSS files under dist/ and src/theme/tokens/css/.
 */
const TOTAL_CSS_BUDGET = 200_000; // 200 KB uncompressed

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function pct(actual, limit) {
  return ((actual / limit) * 100).toFixed(1);
}

/**
 * Estimate gzipped size of a file by streaming through zlib.
 */
async function gzipSize(filePath) {
  let size = 0;
  const sink = new Writable({
    write(chunk, _encoding, cb) {
      size += chunk.length;
      cb();
    },
  });
  await pipeline(createReadStream(filePath), createGzip({ level: 9 }), sink);
  return size;
}

/**
 * Recursively collect files matching a predicate.
 */
function collectFiles(dir, predicate, results = []) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip node_modules inside dist (e.g. re-exports)
      if (entry.name === 'node_modules') continue;
      collectFiles(full, predicate, results);
    } else if (predicate(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Per-component bundle budgets (WO-GAT-02, proposal P-14)
// ---------------------------------------------------------------------------
//
// Builds each flagship component as an INDIVIDUAL externals-heavy Vite library bundle (its own
// throwaway out dir, entry = the component's public `index.ts` barrel -- what an app actually
// imports), gzip-measures the result, and compares against COMPONENT_BUDGET below. This is a
// SEPARATE, smaller build path from the full-package `pnpm run build` above: it calls Vite's
// JS API directly with a minimal one-off config (no tsc/dts/CSS steps), so it stays fast and
// never triggers the package's own "build" script.

/**
 * Flagship component entries: Button/Input/Select/Card/Badge/Table/Tabs/Modal under
 * `primitives/**` + the data-table pattern, per WO-GAT-02. Entry paths are each component's
 * public barrel (`index.ts`), matching what an app actually imports
 * (`import { Button } from '@rottay/design-system'`).
 *
 * Two components share a category name with a non-flagship sibling that lives in a DIFFERENT
 * folder -- resolved by checking which one the public barrel actually exports as that name:
 *  - Modal: `primitives/feedback/Modal` is the canonical public `Modal` export (see
 *    `primitives/feedback/index.ts`); `primitives/overlay/Modal` is exported as `OverlayModal`
 *    (an internal/advanced primitive used by Sheet/Drawer), not this one.
 *  - Badge: `primitives/display/Badge` is the standalone flagship primitive;
 *    `primitives/display/Avatar/compound/Badge` is an Avatar-internal compound sub-part, not
 *    a top-level export.
 */
const COMPONENT_ENTRIES = {
  Button: 'src/components/primitives/inputs/Button/index.ts',
  Input: 'src/components/primitives/inputs/Input/index.ts',
  Select: 'src/components/primitives/inputs/Select/index.ts',
  Card: 'src/components/primitives/display/Card/index.ts',
  Badge: 'src/components/primitives/display/Badge/index.ts',
  Table: 'src/components/primitives/display/Table/index.ts',
  Tabs: 'src/components/primitives/navigation/Tabs/index.ts',
  Modal: 'src/components/primitives/feedback/Modal/index.ts',
  PatternDataTable: 'src/components/patterns/data/data-table/index.ts',
};

/**
 * Maximum GZIP size in bytes for each flagship component's standalone bundle (see
 * `buildComponentBundle` -- all three engines inlined into one file via
 * `inlineDynamicImports`, since `createEngineComponent`'s `lazy(() => import(...))` per-engine
 * loaders mean a bundler cannot statically tree-shake unused engines out of a single build the
 * way it can drop genuinely-unreachable code; measuring the worst case -- all engines present
 * -- is the honest per-component weight a budget should track).
 *
 * Measured 2026-07-09 (WO-GAT-02) with `DS_KEEP_BUNDLE_ANALYSIS=1 node scripts/analyze-bundle.mjs
 * --components` (keeps the throwaway `.bundle-analysis-components/` output instead of deleting
 * it) and exact-byte `gzip -9 -c <bundle> | wc -c` on each `bundle.js` (the printed table only
 * shows KB rounded to 1 decimal, too imprecise to derive a byte budget from). Exact measured
 * gzip bytes, then +10% headroom, then rounded UP to the nearest 500 B for a round number:
 *   Button 15,799 -> 17,500 | Input 11,047 -> 12,500 | Select 16,749 -> 18,500
 *   Card 14,963 -> 16,500 | Badge 12,387 -> 14,000 | Table 15,093 -> 17,000
 *   Tabs 7,376 -> 8,500 | Modal 8,805 -> 10,000 | PatternDataTable 60,808 -> 67,000
 * NOT an aspirational target -- re-measure and bump deliberately if a component's real weight
 * grows for a legitimate reason (a new required feature); never bump this table just to
 * silence a red CI run.
 */
const COMPONENT_BUDGET = {
  Button: 17_500,
  Input: 12_500,
  Select: 18_500,
  Card: 16_500,
  Badge: 14_000,
  Table: 17_000,
  Tabs: 8_500,
  Modal: 10_000,
  PatternDataTable: 67_000,
};

/** Same externals list as `vite.config.ts`'s `rollupOptions.external` -- keeps the per-component
 * measurement honest to what the published package actually externalizes (peer deps + other
 * `@rottay/*` packages), so it isn't inflated by bundling React/antd/d3/etc. into every entry. */
const COMPONENT_BUNDLE_EXTERNALS = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'd3',
  /^d3\/.*/,
  'antd',
  '@ant-design/icons',
  'motion',
  'lucide-react',
  'dayjs',
  /^@rottay\/.*/,
  /^antd\/.*/,
  /^@ant-design\/icons\/.*/,
  /^lucide-react\/.*/,
  /^d3-.*/,
  /^motion\/.*/,
  /^dayjs\/.*/,
];

/**
 * Build a single flagship component as a standalone library bundle. `inlineDynamicImports:
 * true` folds `createEngineComponent`'s per-engine `lazy(() => import(...))` loaders into the
 * one output file instead of Rollup code-splitting them into separate chunks -- see
 * `COMPONENT_BUDGET`'s doc comment for why that is the size worth budgeting. Reuses the same
 * aliases as `vite.config.ts`; skips the `dts`/`preserveDirectives` plugins from that config
 * since this is a throwaway size measurement, not a shipped artifact.
 */
async function buildComponentBundle(entryRelPath, outDir) {
  const { build } = await import('vite');
  const react = (await import('@vitejs/plugin-react')).default;
  await build({
    configFile: false,
    logLevel: 'silent',
    root: ROOT,
    resolve: {
      alias: {
        '@': join(ROOT, 'src'),
        '@types': join(ROOT, 'src', 'contracts'),
        '@components': join(ROOT, 'src', 'components'),
      },
    },
    plugins: [react()],
    build: {
      outDir,
      emptyOutDir: true,
      lib: {
        entry: join(ROOT, entryRelPath),
        formats: ['es'],
        fileName: () => 'bundle.js',
      },
      rollupOptions: {
        external: COMPONENT_BUNDLE_EXTERNALS,
        output: { inlineDynamicImports: true },
        onwarn: () => {}, // throwaway measurement build; suppress "use client" directive noise
      },
      sourcemap: false,
      minify: 'esbuild',
      target: 'esnext',
      reportCompressedSize: false,
    },
    esbuild: { treeShaking: true, minifyIdentifiers: true, minifySyntax: true },
    logLevel: 'silent',
  });
}

/** Run the `--components` mode: build + gzip-measure every `COMPONENT_ENTRIES` entry, compare
 * against `COMPONENT_BUDGET`, print a table, clean up the throwaway out dir, and return an exit
 * code (0 = all within budget, 1 = at least one over budget or failed to build). */
async function runComponentBudgets() {
  console.log('\n--- Per-component bundle budgets (--components) ---\n');
  const outRoot = join(ROOT, '.bundle-analysis-components');
  let failures = 0;
  const rows = [];

  for (const [name, entryRelPath] of Object.entries(COMPONENT_ENTRIES)) {
    const outDir = join(outRoot, name);
    try {
      await buildComponentBundle(entryRelPath, outDir);
    } catch (err) {
      failures++;
      rows.push({ file: name, raw: '-', gz: '-', limit: '-', usage: '-', status: 'BUILD FAIL' });
      console.error(`\x1b[31mFailed to build ${name}: ${err.message}\x1b[0m`);
      continue;
    }

    const jsFiles = collectFiles(outDir, (n) => n.endsWith('.js'));
    let raw = 0;
    let gz = 0;
    for (const f of jsFiles) {
      raw += statSync(f).size;
      gz += await gzipSize(f);
    }
    const limit = COMPONENT_BUDGET[name];
    const overBudget = limit !== undefined && gz > limit;
    if (overBudget) failures++;
    rows.push({
      file: name,
      raw: formatBytes(raw),
      gz: formatBytes(gz),
      limit: limit !== undefined ? formatBytes(limit) : '-',
      usage: limit !== undefined ? `${pct(gz, limit)}%` : '-',
      status: limit === undefined ? 'NO BUDGET' : overBudget ? 'FAIL' : 'PASS',
    });
  }

  if (!process.env.DS_KEEP_BUNDLE_ANALYSIS) rmSync(outRoot, { recursive: true, force: true }); // throwaway -- never committed

  const cols = ['file', 'raw', 'gz', 'limit', 'usage', 'status'];
  const headers = { file: 'Component', raw: 'Raw', gz: 'Gzip', limit: 'Budget (gzip)', usage: 'Usage', status: 'Status' };
  const widths = {};
  for (const col of cols) {
    widths[col] = headers[col].length;
    for (const row of rows) widths[col] = Math.max(widths[col], String(row[col]).length);
  }
  const pad = (str, len) => String(str).padEnd(len);
  console.log(cols.map((c) => pad(headers[c], widths[c])).join(' | '));
  console.log(cols.map((c) => '-'.repeat(widths[c])).join('-+-'));
  for (const row of rows) {
    const line = cols.map((c) => pad(row[c], widths[c])).join(' | ');
    if (row.status === 'FAIL' || row.status === 'BUILD FAIL') console.log(`\x1b[31m${line}\x1b[0m`);
    else if (row.status === 'PASS') console.log(`\x1b[32m${line}\x1b[0m`);
    else console.log(line);
  }
  console.log('');

  if (failures > 0) {
    console.error(`\x1b[31m${failures} component(s) over budget or failed to build.\x1b[0m\n`);
  } else {
    console.log('\x1b[32mAll components within budget.\x1b[0m\n');
  }
  return failures > 0 ? 1 : 0;
}

if (process.argv.includes('--components')) {
  const code = await runComponentBudgets();
  process.exit(code);
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const skipBuild = process.argv.includes('--skip-build');

if (!skipBuild) {
  console.log('\n--- Building @rottay/design-system ---\n');
  try {
    execSync('pnpm run build', { cwd: ROOT, stdio: 'inherit' });
  } catch {
    console.error('\nBuild failed. Cannot analyze bundle.\n');
    process.exit(1);
  }
}

const distDir = join(ROOT, 'dist');
if (!existsSync(distDir)) {
  console.error(`\ndist/ directory not found at ${distDir}. Run a build first.\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Analyze
// ---------------------------------------------------------------------------

console.log('\n--- Bundle Size Analysis ---\n');

let failures = 0;
const rows = [];

// 1. Check budgeted entry-point files
for (const [relPath, limit] of Object.entries(BUDGET)) {
  const absPath = join(ROOT, relPath);
  if (!existsSync(absPath)) {
    rows.push({
      file: relPath,
      raw: '-',
      gz: '-',
      limit: formatBytes(limit),
      usage: '-',
      status: 'SKIP (not found)',
    });
    continue;
  }

  const raw = statSync(absPath).size;
  const gz = await gzipSize(absPath);
  const overBudget = raw > limit;
  if (overBudget) failures++;

  rows.push({
    file: relPath,
    raw: formatBytes(raw),
    gz: formatBytes(gz),
    limit: formatBytes(limit),
    usage: `${pct(raw, limit)}%`,
    status: overBudget ? 'FAIL' : 'PASS',
  });
}

// 2. Total JS size
const jsFiles = collectFiles(distDir, (name) => name.endsWith('.js') || name.endsWith('.cjs'));
let totalJS = 0;
for (const f of jsFiles) {
  totalJS += statSync(f).size;
}
{
  const overBudget = totalJS > TOTAL_JS_BUDGET;
  if (overBudget) failures++;
  rows.push({
    file: 'TOTAL JS (dist/**/*.{js,cjs})',
    raw: formatBytes(totalJS),
    gz: '-',
    limit: formatBytes(TOTAL_JS_BUDGET),
    usage: `${pct(totalJS, TOTAL_JS_BUDGET)}%`,
    status: overBudget ? 'FAIL' : 'PASS',
  });
}

// 3. Total CSS size
const cssDirs = [distDir, join(ROOT, 'src', 'tokens', 'css')];
let totalCSS = 0;
for (const dir of cssDirs) {
  const cssFiles = collectFiles(dir, (name) => name.endsWith('.css'));
  for (const f of cssFiles) {
    totalCSS += statSync(f).size;
  }
}
{
  const overBudget = totalCSS > TOTAL_CSS_BUDGET;
  if (overBudget) failures++;
  rows.push({
    file: 'TOTAL CSS',
    raw: formatBytes(totalCSS),
    gz: '-',
    limit: formatBytes(TOTAL_CSS_BUDGET),
    usage: `${pct(totalCSS, TOTAL_CSS_BUDGET)}%`,
    status: overBudget ? 'FAIL' : 'PASS',
  });
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

// Print table
const cols = ['file', 'raw', 'gz', 'limit', 'usage', 'status'];
const headers = { file: 'File', raw: 'Raw', gz: 'Gzip', limit: 'Limit', usage: 'Usage', status: 'Status' };

const widths = {};
for (const col of cols) {
  widths[col] = headers[col].length;
  for (const row of rows) {
    widths[col] = Math.max(widths[col], String(row[col]).length);
  }
}

function pad(str, len) {
  return String(str).padEnd(len);
}

const separator = cols.map((c) => '-'.repeat(widths[c])).join('-+-');
const headerLine = cols.map((c) => pad(headers[c], widths[c])).join(' | ');

console.log(headerLine);
console.log(separator);
for (const row of rows) {
  const line = cols.map((c) => {
    const val = row[c];
    return pad(val, widths[c]);
  }).join(' | ');

  // Highlight failures
  if (row.status === 'FAIL') {
    console.log(`\x1b[31m${line}\x1b[0m`);
  } else if (row.status === 'PASS') {
    console.log(`\x1b[32m${line}\x1b[0m`);
  } else {
    console.log(line);
  }
}

console.log('');

if (failures > 0) {
  console.error(`\x1b[31m${failures} file(s) over budget. See PERFORMANCE_BUDGET.md for limits.\x1b[0m\n`);
  process.exit(1);
} else {
  console.log('\x1b[32mAll files within budget.\x1b[0m\n');
  process.exit(0);
}
