#!/usr/bin/env node

/**
 * Storybook Bundle Size Budget Enforcement
 *
 * Validates that the built Storybook output (storybook-static/) stays within
 * defined size budgets. Intended to run immediately after `storybook build`.
 *
 * Budgets:
 *   - Total output size: < 50 MB
 *   - Largest single chunk: < 3 MB
 *
 * Usage:
 *   node scripts/check-storybook-budget.mjs
 *   node scripts/check-storybook-budget.mjs --output-dir ./custom-storybook-static
 *
 * Exit codes:
 *   0 - within budget
 *   1 - over budget or output not found
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Maximum total size of all files in storybook-static/ (bytes). */
const TOTAL_BUDGET = 50 * 1024 * 1024; // 50 MB

/** Maximum size of any single .js chunk file (bytes). */
const CHUNK_BUDGET = 3 * 1024 * 1024; // 3 MB

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
 * Recursively collect all files under a directory.
 */
function collectAllFiles(dir, results = []) {
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectAllFiles(full, results);
    } else {
      results.push(full);
    }
  }
  return results;
}

// ---------------------------------------------------------------------------
// Resolve output directory
// ---------------------------------------------------------------------------

let outputDir = join(ROOT, 'storybook-static');

const outputFlagIndex = process.argv.indexOf('--output-dir');
if (outputFlagIndex !== -1 && process.argv[outputFlagIndex + 1]) {
  outputDir = join(process.cwd(), process.argv[outputFlagIndex + 1]);
}

if (!existsSync(outputDir)) {
  console.error(
    `\nStorybook output directory not found: ${outputDir}\n` +
    'Run "storybook build" first.\n'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Analyze
// ---------------------------------------------------------------------------

console.log('\n--- Storybook Bundle Budget Check ---\n');

const allFiles = collectAllFiles(outputDir);
let totalSize = 0;
let largestChunk = { path: '', size: 0 };
const jsChunks = [];

for (const filePath of allFiles) {
  const size = statSync(filePath).size;
  totalSize += size;

  if (filePath.endsWith('.js')) {
    const relPath = relative(outputDir, filePath);
    jsChunks.push({ path: relPath, size });
    if (size > largestChunk.size) {
      largestChunk = { path: relPath, size };
    }
  }
}

// Sort JS chunks by size descending for the report
jsChunks.sort((a, b) => b.size - a.size);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

let failures = 0;

// Total size check
const totalOver = totalSize > TOTAL_BUDGET;
if (totalOver) failures++;

console.log('Total output size:');
console.log(
  `  ${formatBytes(totalSize)} / ${formatBytes(TOTAL_BUDGET)} (${pct(totalSize, TOTAL_BUDGET)}%)` +
  `  ${totalOver ? '\x1b[31mFAIL\x1b[0m' : '\x1b[32mPASS\x1b[0m'}`
);
console.log(`  Files: ${allFiles.length}`);
console.log('');

// Largest chunk check
const chunkOver = largestChunk.size > CHUNK_BUDGET;
if (chunkOver) failures++;

console.log('Largest JS chunk:');
console.log(
  `  ${largestChunk.path}: ${formatBytes(largestChunk.size)} / ${formatBytes(CHUNK_BUDGET)} (${pct(largestChunk.size, CHUNK_BUDGET)}%)` +
  `  ${chunkOver ? '\x1b[31mFAIL\x1b[0m' : '\x1b[32mPASS\x1b[0m'}`
);
console.log('');

// Top 10 largest JS chunks
console.log('Top 10 JS chunks by size:');
const top10 = jsChunks.slice(0, 10);
for (const chunk of top10) {
  const overChunkBudget = chunk.size > CHUNK_BUDGET;
  const marker = overChunkBudget ? '\x1b[31m!\x1b[0m' : ' ';
  console.log(`  ${marker} ${formatBytes(chunk.size).padStart(10)}  ${chunk.path}`);
}
console.log('');

// Chunks over budget
const overBudgetChunks = jsChunks.filter((c) => c.size > CHUNK_BUDGET);
if (overBudgetChunks.length > 0) {
  console.log(`\x1b[31mChunks over ${formatBytes(CHUNK_BUDGET)} budget:\x1b[0m`);
  for (const chunk of overBudgetChunks) {
    console.log(`  ${formatBytes(chunk.size).padStart(10)}  ${chunk.path}`);
  }
  console.log('');
}

// ---------------------------------------------------------------------------
// Exit
// ---------------------------------------------------------------------------

if (failures > 0) {
  console.error(
    `\x1b[31m${failures} budget check(s) failed.\x1b[0m\n` +
    'To fix: optimize Storybook chunks via manualChunks in .storybook/main.ts,\n' +
    'or review which stories/addons are pulling in heavy dependencies.\n'
  );
  process.exit(1);
} else {
  console.log('\x1b[32mAll Storybook budgets within limits.\x1b[0m\n');
  process.exit(0);
}
