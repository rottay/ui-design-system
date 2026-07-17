#!/usr/bin/env node

/**
 * Relocate only path-keyed engine-audit ceilings using Git's reviewed rename
 * inventory. Values never change and the default mode is a dry run.
 *
 * Usage:
 *   node scripts/relocate-engine-token-baseline.mjs
 *   node scripts/relocate-engine-token-baseline.mjs --write
 *   node scripts/relocate-engine-token-baseline.mjs \
 *     --old-root packages/core/src/components \
 *     --new-root packages/core/src/ui
 *   node scripts/relocate-engine-token-baseline.mjs --adopt-new-zero
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  adoptNewZeroPathCounters,
  parseGitRenameStatus,
  relocatePathKeyedCounters,
} from './lib/path-keyed-baseline-relocation.mjs';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDirectory, '..');
const repositoryRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], {
  cwd: packageRoot,
  encoding: 'utf8',
}).trim();

function argument(name, fallback) {
  const prefix = `${name}=`;
  const inline = process.argv.find((value) => value.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

const oldRoot = argument('--old-root', 'packages/core/src/ui');
const newRoot = argument('--new-root', oldRoot);
const similarity = argument('--similarity', '60%');
if (!/^(?:[1-9]|[1-9]\d|100)%$/u.test(similarity)) {
  throw new Error('--similarity must be an integer percentage from 1% to 100%');
}
const baselinePath = resolve(repositoryRoot, argument(
  '--baseline',
  'packages/core/scripts/engine-token-audit.baseline.json',
));
const write = process.argv.includes('--write');
const adoptNewZero = process.argv.includes('--adopt-new-zero');
const status = execFileSync('git', [
  'diff',
  '--name-status',
  `--find-renames=${similarity}`,
  'HEAD',
  '--',
  oldRoot,
  ...(newRoot === oldRoot ? [] : [newRoot]),
], { cwd: repositoryRoot, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
const renames = parseGitRenameStatus(status, { repositoryRoot, oldRoot, newRoot });
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const result = relocatePathKeyedCounters(baseline, renames);
let candidate = result.baseline;
let adoption = { adopted: [], refused: [] };
if (adoptNewZero) {
  const current = JSON.parse(execFileSync(process.execPath, [
    resolve(scriptDirectory, 'engine-token-audit.mjs'),
    '--current-json',
    '--quiet',
  ], { cwd: packageRoot, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }));
  adoption = adoptNewZeroPathCounters(candidate, current);
  candidate = adoption.baseline;
}

console.log(`path-keyed baseline relocation | git-renames=${renames.length} | counters=${result.relocated.length}`);
for (const entry of result.relocated.slice(0, 30)) console.log(`  ${entry.from} -> ${entry.to}`);
if (result.relocated.length > 30) console.log(`  ... ${result.relocated.length - 30} more`);
if (adoptNewZero) {
  console.log(`new zero counters: adopted=${adoption.adopted.length} | refused-positive=${adoption.refused.length}`);
  for (const entry of adoption.refused.slice(0, 30)) console.log(`  refused ${entry.key}=${entry.value}`);
}

if (!write) {
  console.log('dry run; pass --write after reviewing the rename inventory');
  process.exit(0);
}
if (adoption.refused.length > 0) {
  throw new Error('refusing to write: new positive path counters require a code fix or explicit reviewed edit');
}
writeFileSync(baselinePath, `${JSON.stringify(candidate, null, 2)}\n`);
console.log(`baseline rewritten: ${relative(repositoryRoot, baselinePath)}`);
