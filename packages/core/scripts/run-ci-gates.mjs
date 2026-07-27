#!/usr/bin/env node
/**
 * Runs the gate inventory in `ci-gates.manifest.mjs`, in order, fail-fast.
 *
 * Invoked as `pnpm gates:ci` by both the `pretest` hook and the CI job, so the
 * two can never diverge -- the divergence between them is what let sixteen
 * gates silently stop running in CI.
 *
 * Exit code is 1 if any blocking gate fails, or if the manifest itself is
 * malformed. Excluded gates are printed loudly in the summary and never affect
 * the exit code; they are also never run, so an excluded gate cannot cost CI
 * time while pretending to protect something.
 *
 * Usage:
 *   node scripts/run-ci-gates.mjs            # run every blocking gate
 *   node scripts/run-ci-gates.mjs --list     # print the plan, run nothing
 */

import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CI_GATES, validateManifest } from './ci-gates.manifest.mjs';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const listOnly = process.argv.includes('--list');

const problems = validateManifest();
if (problems.length > 0) {
  console.error('ci-gates manifest is invalid:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const blocking = CI_GATES.filter((gate) => gate.blocking);
const excluded = CI_GATES.filter((gate) => !gate.blocking);

console.log(`ci-gates: ${blocking.length} blocking, ${excluded.length} excluded\n`);

if (listOnly) {
  for (const gate of blocking) console.log(`  [blocking] ${gate.id}: ${gate.run.join(' ')}`);
  for (const gate of excluded) console.log(`  [excluded] ${gate.id}: ${gate.excluded.reason}`);
  process.exit(0);
}

const results = [];
let failed = null;

for (const gate of blocking) {
  const startedAt = process.hrtime.bigint();
  const outcome = spawnSync(gate.run[0], gate.run.slice(1), {
    cwd: packageRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  const ms = Number((process.hrtime.bigint() - startedAt) / 1_000_000n);
  // A gate killed by a signal (OOM, timeout) has a null status. Treating that
  // as anything but a failure would reintroduce fail-open through the back door.
  const status = outcome.status === null ? `signal:${outcome.signal ?? 'unknown'}` : outcome.status;
  const ok = outcome.status === 0;
  results.push({ id: gate.id, ok, status, ms });

  if (!ok) {
    failed = { id: gate.id, status, run: gate.run.join(' ') };
    break; // fail fast: later gates read artifacts this one guards
  }
}

console.log('\n─── ci-gates summary ───');
for (const result of results) {
  console.log(`  ${result.ok ? 'PASS' : 'FAIL'}  ${result.id.padEnd(38)} ${result.ms}ms`);
}
const skipped = blocking.length - results.length;
if (skipped > 0) console.log(`  ....  ${skipped} gate(s) not reached (fail-fast)`);
for (const gate of excluded) {
  console.log(`  SKIP  ${gate.id.padEnd(38)} excluded — ${gate.excluded.reason}`);
  console.log(`        owner=${gate.excluded.owner} since=${gate.excluded.trackedSince ?? 'unrecorded'}`);
}

if (failed) {
  console.error(`\nci-gates FAILED at ${failed.id} (exit ${failed.status})`);
  console.error(`  reproduce: ${failed.run}`);
  process.exit(1);
}

console.log(`\nci-gates OK — ${results.length} blocking gate(s) passed.`);
