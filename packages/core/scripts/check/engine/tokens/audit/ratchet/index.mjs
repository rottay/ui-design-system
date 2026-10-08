import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import {
  evaluateBaselineTightening,
  evaluateZeroLockCheck,
  summarizeZeroLocks,
} from '../../../../../libraries/engine/zero-locks/index.mjs';
import {
  ENGINE_TOKEN_EXACT as EXACT,
  ENGINE_TOKEN_MINIMUM as MIN,
} from '../../../../../libraries/engine/tokens/index.mjs';
import { baselinePath } from '../context/paths/index.mjs';

/** `--update-baseline`: tighten existing ceilings atomically, or refuse and exit 1. Always exits. */
function runBaselineUpdate({ counters, fixtureActive }) {
  if (fixtureActive) {
    console.error('engine-token-audit: --update-baseline cannot run with a drill fixture');
    process.exit(1);
  }
  if (!existsSync(baselinePath)) {
    console.error('engine-token-audit: baseline initialization requires an explicit reviewed file, not --update-baseline');
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const tightening = evaluateBaselineTightening({ baseline, candidate: counters, exact: EXACT, minimum: MIN });
  if (!tightening.ok) {
    console.error('engine-token-audit --update-baseline REFUSED (updates may only tighten existing counters):');
    for (const error of tightening.errors) console.error(`  - ${error}`);
    process.exit(1);
  }
  const temporaryPath = `${baselinePath}.tmp-${process.pid}`;
  writeFileSync(temporaryPath, JSON.stringify(counters, null, 2) + '\n');
  renameSync(temporaryPath, baselinePath);
  const locks = summarizeZeroLocks(counters, { exact: EXACT, minimum: MIN });
  if (!locks.ok) throw new Error(`cannot summarize tightened baseline: ${locks.errors.join('; ')}`);
  console.log(
    `engine-token-audit: baseline tightened atomically (${locks.counters} counters; ${locks.zeroLocked} zero-locked; ${locks.positiveOrdinaryCeilings} decrease-only ceilings; ${locks.positiveExactInvariants} positive exact invariants; ${locks.positiveMinimumFloors} positive minimum floors)`,
  );
  process.exit(0);
}

/** `--check`: the decrease-only, zero-lock, exact and minimum policy against the reviewed baseline. */
function runCheck({ counters, evasionProbe }) {
  if (!existsSync(baselinePath)) {
    console.error('engine-token-audit --check: no baseline (initialization requires an explicit reviewed baseline file)');
    process.exit(1);
  }
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const policy = evaluateZeroLockCheck({ baseline, current: counters, exact: EXACT, minimum: MIN });
  if (!policy.ok) {
    console.error('engine-token-audit --check FAILED:');
    for (const error of policy.errors) console.error(`  - ${error}`);
    if (evasionProbe) console.error(`  - WO-GAT-07 evasion fixture result: ${JSON.stringify(evasionProbe)}`);
    process.exit(1);
  }
  const locks = summarizeZeroLocks(baseline, { exact: EXACT, minimum: MIN });
  if (!locks.ok) {
    console.error(`engine-token-audit --check FAILED:\n  - ${locks.errors.join('\n  - ')}`);
    process.exit(1);
  }
  console.log(
    `engine-token-audit --check OK (${locks.counters} counters; ${locks.zeroLocked} completed zeros locked exactly; ${locks.positiveOrdinaryCeilings} decrease-only ceilings; ${locks.positiveExactInvariants} positive exact invariants; ${locks.positiveMinimumFloors} positive minimum floors)`,
  );
}

export { runBaselineUpdate, runCheck };
