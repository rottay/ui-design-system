#!/usr/bin/env node
/**
 * Runs the gate inventory in `../gates/manifest/index.mjs`, in order, fail-fast.
 *
 * Invoked as `pnpm gates:ci` by both the `pretest` hook and the CI job, so the
 * two can never diverge -- the divergence between them is what let sixteen
 * gates silently stop running in CI.
 *
 * TWO PHASES, ONE INVENTORY. `pre-build` is what a clean checkout can run;
 * `post-build` is everything that needs `dist/`. Before the split, CI ran the
 * pre-build chain from this manifest and then a hand-written list of named
 * steps in `ci.yml` -- a second inventory, which is how `prepack`'s two gates
 * ended up wired to a hook that fires on `npm pack` and therefore never in CI.
 *
 * Exit code is 1 if any blocking gate fails, if a blocking gate's declared
 * prerequisite is missing, or if the manifest itself is malformed. Excluded
 * gates are printed loudly in the summary and never affect the exit code; they
 * are also never run, so an excluded gate cannot cost CI time while pretending
 * to protect something.
 *
 * PREREQ-MISSING IS NOT SOFTER THAN FAIL. It is a different DIAGNOSIS with the
 * same verdict. A gate that dies because its input was never provided teaches
 * the reader nothing about the law it holds, and a runner that reports the two
 * identically is how "this one is always red, ignore it" becomes true.
 *
 * `--continue` is a DIAGNOSTIC mode: it runs every blocking gate instead of
 * stopping at the first red, so a full `id -> PASS/FAIL` matrix can be measured
 * in one pass. It never softens the verdict -- one red gate still exits 1. It
 * is deliberately absent from `pretest` and from `ci.yml`, which use the
 * fail-fast default, because a mode that keeps going past a red gate would let
 * later gates read artifacts an earlier one was supposed to guard.
 *
 * Usage:
 *   node scripts/check/automation/runner/index.mjs                     # the pre-build phase
 *   node scripts/check/automation/runner/index.mjs --phase=post-build  # after `pnpm build`
 *   node scripts/check/automation/runner/index.mjs --phase=all         # both, in order
 *   node scripts/check/automation/runner/index.mjs --list              # print the plan, run nothing
 *   node scripts/check/automation/runner/index.mjs --continue          # full matrix, still exits 1 on red
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CI_GATES,
  PHASES,
  PREREQUISITES,
  missingPrerequisites,
  validateManifest,
} from '../gates/manifest/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const packageRoot = findPackageRoot(HERE);
const listOnly = process.argv.includes('--list');
const continueOnFailure = process.argv.includes('--continue');

const phaseArgument = process.argv.find((argument) => argument.startsWith('--phase='))?.slice('--phase='.length)
  ?? 'pre-build';
if (phaseArgument !== 'all' && !PHASES.includes(phaseArgument)) {
  console.error(`ci-gates: --phase must be one of ${[...PHASES, 'all'].join(' | ')}; got ${phaseArgument}`);
  process.exit(1);
}
const selectedPhases = phaseArgument === 'all' ? [...PHASES] : [phaseArgument];

const problems = validateManifest();
if (problems.length > 0) {
  console.error('ci-gates manifest is invalid:');
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

const selected = CI_GATES.filter((gate) => selectedPhases.includes(gate.phase));
const blocking = selected.filter((gate) => gate.blocking);
const excluded = selected.filter((gate) => !gate.blocking);

/**
 * The debt a ratcheted gate is standing on, read from the baseline it enforces.
 *
 * A decrease-only ceiling is a promise about the DIRECTION of a number, and a
 * green run says nothing about its size: ~9,000 findings sat frozen across
 * these files while every ratchet reported OK. The ratio is printed on every
 * run so the size is visible without reading a 3,000-key JSON.
 */
function debtOf(gate) {
  if (!gate.ratchet) return null;
  const path = join(packageRoot, gate.ratchet);
  if (!existsSync(path)) return { error: `baseline missing: ${gate.ratchet}` };
  let baseline;
  try {
    baseline = JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    return { error: `baseline unreadable: ${error instanceof Error ? error.message : String(error)}` };
  }
  // Baselines in this tree are not one shape: some are a flat counter map, some
  // a ledger of named finding lists, some a nested policy document. The walk
  // below counts what every one of them agrees on -- a numeric leaf is a
  // ceiling, a list of findings is that many frozen findings -- and skips
  // prose. It is a SIZE report, never a verdict; the gate itself owns the
  // verdict.
  const buckets = [];
  const walk = (node) => {
    if (Array.isArray(node)) {
      buckets.push(node.length);
      return;
    }
    if (node && typeof node === 'object') {
      for (const value of Object.values(node)) walk(value);
      return;
    }
    if (Number.isFinite(node)) buckets.push(node);
  };
  walk(baseline);
  if (buckets.length === 0) return { error: `baseline carries no counter: ${gate.ratchet}` };
  const frozen = buckets.reduce((total, value) => total + value, 0);
  const atZero = buckets.filter((value) => value === 0).length;
  return {
    counters: buckets.length,
    frozen,
    atZero,
    ratio: (buckets.length - atZero) / buckets.length,
  };
}

function describeDebt(gate) {
  const debt = debtOf(gate);
  if (!debt) return null;
  if (debt.error) return `debt: UNREADABLE (${debt.error})`;
  // Deliberately NOT called "findings": these baselines pin counts, byte
  // ceilings and module ceilings side by side, so their sum has no single
  // unit. `debtRatio` is the figure that means the same thing everywhere --
  // how much of a gate's ledger is still standing on debt rather than on zero.
  return `debtRatio ${(debt.ratio * 100).toFixed(1)}% — ${debt.counters - debt.atZero} of `
    + `${debt.counters} pinned ceilings are above zero (ceiling sum ${debt.frozen}, mixed units)`;
}

console.log(
  `ci-gates [${selectedPhases.join(' + ')}]: ${blocking.length} blocking, ${excluded.length} excluded\n`,
);

if (listOnly) {
  for (const gate of blocking) {
    console.log(`  [blocking] ${gate.id}: ${gate.run.join(' ')}`);
    console.log(`             phase=${gate.phase} ${gate.drillId ? `drill=${gate.drillId}`
      : gate.drillFor ? `drills=${gate.drillFor.join(',')}` : 'drill=NONE (written reason)'}`);
    if (gate.noDrillReason) console.log(`             no drill because: ${gate.noDrillReason}`);
    for (const id of gate.prerequisites ?? []) {
      const satisfied = PREREQUISITES[id]?.satisfied() ? 'present' : 'MISSING';
      console.log(`             prerequisite ${id} [${satisfied}]: ${PREREQUISITES[id]?.describe ?? 'undeclared'}`);
    }
    const debt = describeDebt(gate);
    if (debt) console.log(`             ${debt}`);
  }
  for (const gate of excluded) {
    console.log(`  [excluded] ${gate.id}: ${gate.excluded.reason}`);
    console.log(`             owner=${gate.excluded.owner} since=${gate.excluded.trackedSince ?? 'unrecorded'}`);
    const debt = describeDebt(gate);
    if (debt) console.log(`             ${debt}`);
  }
  process.exit(0);
}

if (continueOnFailure) {
  console.log('ci-gates: --continue (diagnostic full matrix; a red gate still exits 1)\n');
}

const results = [];
const failures = [];
const prerequisiteFailures = [];

for (const gate of blocking) {
  const missing = missingPrerequisites(gate);
  if (missing.length > 0) {
    const detail = missing
      .map((id) => `${id} (${PREREQUISITES[id]?.describe ?? 'undeclared prerequisite'})`)
      .join('; ');
    console.error(`ci-gates: PREREQ-MISSING ${gate.id} — ${detail}`);
    results.push({ id: gate.id, state: 'PREREQ-MISSING', detail, ms: 0 });
    prerequisiteFailures.push({ id: gate.id, detail, run: gate.run.join(' ') });
    if (!continueOnFailure) break;
    continue;
  }

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
  results.push({ id: gate.id, state: ok ? 'PASS' : 'FAIL', status, ms });

  if (!ok) {
    failures.push({ id: gate.id, status, run: gate.run.join(' ') });
    if (!continueOnFailure) break; // fail fast: later gates read artifacts this one guards
  }
}

console.log('\n─── ci-gates summary ───');
for (const result of results) {
  console.log(`  ${result.state.padEnd(15)} ${result.id.padEnd(46)} ${result.ms}ms`);
  if (result.state === 'PREREQ-MISSING') console.log(`        missing: ${result.detail}`);
}
const skipped = blocking.length - results.length;
if (skipped > 0) console.log(`  ....            ${skipped} gate(s) not reached (fail-fast)`);
for (const gate of excluded) {
  console.log(`  SKIP            ${gate.id.padEnd(46)} excluded — ${gate.excluded.reason}`);
  console.log(`        owner=${gate.excluded.owner} since=${gate.excluded.trackedSince ?? 'unrecorded'}`);
}

for (const gate of blocking.concat(excluded)) {
  const debt = describeDebt(gate);
  if (debt) console.log(`  DEBT            ${gate.id.padEnd(46)} ${debt}`);
}

if (continueOnFailure) {
  const passed = results.filter((result) => result.state === 'PASS').length;
  console.log(
    `\nci-gates matrix: ${passed} PASS, ${failures.length} FAIL, `
    + `${prerequisiteFailures.length} PREREQ-MISSING, of ${blocking.length} blocking gate(s).`,
  );
}

if (prerequisiteFailures.length > 0) {
  console.error('\nci-gates PREREQ-MISSING — declared inputs CI did not provide:');
  for (const missing of prerequisiteFailures) {
    console.error(`  ${missing.id}: ${missing.detail}`);
    console.error(`  reproduce: ${missing.run}`);
  }
}

if (failures.length > 0) {
  const first = failures[0];
  console.error(`\nci-gates FAILED at ${first.id} (exit ${first.status})`);
  console.error(`  reproduce: ${first.run}`);
  for (const failure of failures.slice(1)) {
    console.error(`  also FAILED ${failure.id} (exit ${failure.status})`);
    console.error(`  reproduce: ${failure.run}`);
  }
}

if (failures.length > 0 || prerequisiteFailures.length > 0) process.exit(1);

console.log(`\nci-gates OK — ${results.length} blocking gate(s) passed.`);
