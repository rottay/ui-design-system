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
 * `--continue` is a DIAGNOSTIC mode: it runs every blocking gate instead of
 * stopping at the first red, so a full `id -> PASS/FAIL` matrix can be measured
 * in one pass. It never softens the verdict -- one red gate still exits 1. It
 * is deliberately absent from `pretest` and from `ci.yml`, which use the
 * fail-fast default, because a mode that keeps going past a red gate would let
 * later gates read artifacts an earlier one was supposed to guard.
 *
 * Usage:
 *   node scripts/check/automation/runner/index.mjs            # run every blocking gate
 *   node scripts/check/automation/runner/index.mjs --list     # print the plan, run nothing
 *   node scripts/check/automation/runner/index.mjs --continue # full matrix, still exits 1 on red
 */

import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CI_GATES, validateManifest } from '../gates/manifest/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(HERE);
const listOnly = process.argv.includes('--list');
const continueOnFailure = process.argv.includes('--continue');

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

if (continueOnFailure) {
  console.log('ci-gates: --continue (diagnostic full matrix; a red gate still exits 1)\n');
}

const results = [];
const failures = [];

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
    failures.push({ id: gate.id, status, run: gate.run.join(' ') });
    if (!continueOnFailure) break; // fail fast: later gates read artifacts this one guards
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

if (continueOnFailure) {
  const passed = results.filter((result) => result.ok).length;
  console.log(
    `\nci-gates matrix: ${passed} PASS, ${failures.length} FAIL, of ${blocking.length} blocking gate(s).`,
  );
}

if (failures.length > 0) {
  const first = failures[0];
  console.error(`\nci-gates FAILED at ${first.id} (exit ${first.status})`);
  console.error(`  reproduce: ${first.run}`);
  for (const failure of failures.slice(1)) {
    console.error(`  also FAILED ${failure.id} (exit ${failure.status})`);
    console.error(`  reproduce: ${failure.run}`);
  }
  process.exit(1);
}

console.log(`\nci-gates OK — ${results.length} blocking gate(s) passed.`);
