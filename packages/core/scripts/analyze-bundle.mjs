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
import { readdirSync, statSync, existsSync } from 'node:fs';
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
const cssDirs = [distDir, join(ROOT, 'src', 'theme', 'tokens', 'css')];
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
