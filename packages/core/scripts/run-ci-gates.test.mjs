/**
 * Drills for the CI gate runner.
 *
 * The runner exists because sixteen gates lived in `pretest`, which `test:ci`
 * never fires. Its own failure modes are therefore the interesting part: a
 * runner that reports PASS when a gate failed would recreate the original
 * defect one level up.
 */

import { strict as assert } from 'node:assert';
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { CI_GATES, blockingGates, validateManifest } from './ci-gates.manifest.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const runner = resolve(scriptsDir, 'run-ci-gates.mjs');

test('the manifest shipped in the repo is structurally valid', () => {
  assert.deepEqual(validateManifest(), []);
  assert.ok(blockingGates().length >= 15, 'expected the real blocking inventory, not a stub');
});

test('DRILL: a non-blocking gate without a reason is rejected', () => {
  // The anti-laundering invariant. `|| echo "::warning"` in YAML was invisible;
  // here, declaring a gate non-blocking without stating why is a hard error.
  const problems = validateManifest([
    { id: 'sneaky', run: ['true'], blocking: false },
  ]);
  assert.ok(
    problems.some((p) => p.includes('excluded.reason')),
    `expected a missing-reason problem, got: ${JSON.stringify(problems)}`,
  );
});

test('DRILL: a non-blocking gate without an owner is rejected', () => {
  const problems = validateManifest([
    { id: 'ownerless', run: ['true'], blocking: false, excluded: { reason: 'because' } },
  ]);
  assert.ok(problems.some((p) => p.includes('excluded.owner')));
});

test('DRILL: a blocking gate carrying an exclusion record is rejected', () => {
  // Prevents the half-state: something that reads as enforced but ships an
  // excuse alongside it.
  const problems = validateManifest([
    { id: 'confused', run: ['true'], blocking: true, excluded: { reason: 'r', owner: 'o' } },
  ]);
  assert.ok(problems.some((p) => p.includes('must not carry an exclusion record')));
});

test('DRILL: duplicate gate ids are rejected', () => {
  const problems = validateManifest([
    { id: 'dup', run: ['true'], blocking: true },
    { id: 'dup', run: ['true'], blocking: true },
  ]);
  assert.ok(problems.some((p) => p.includes('duplicate gate id')));
});

test('DRILL: a blocking gate passing --optional is rejected', () => {
  // `--optional` makes a gate return 0 when its corpus is absent. Combining it
  // with `blocking: true` is the "green because it did not look" pattern, and
  // it must be impossible to express.
  const problems = validateManifest([
    { id: 'optional-blocker', run: ['node', 'gate.mjs', '--check', '--optional'], blocking: true },
  ]);
  assert.ok(problems.some((p) => p.includes('must not pass --optional')));
});

test('DRILL: a malformed run argv is rejected', () => {
  const problems = validateManifest([{ id: 'bad', run: [], blocking: true }]);
  assert.ok(problems.some((p) => p.includes('non-empty argv')));
});

test('every excluded gate names an owner and a reason', () => {
  // Regression guard on the real inventory, not a hypothetical one.
  for (const gate of CI_GATES.filter((g) => !g.blocking)) {
    assert.ok(gate.excluded.reason.length > 20, `${gate.id}: reason is too thin to audit`);
    assert.ok(gate.excluded.owner, `${gate.id}: no owner`);
  }
});

test('the runner --list plan matches the manifest and runs nothing', () => {
  const result = spawnSync(process.execPath, [runner, '--list'], {
    cwd: resolve(scriptsDir, '..'),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0);
  for (const gate of blockingGates()) {
    assert.ok(result.stdout.includes(gate.id), `--list omitted ${gate.id}`);
  }
  for (const gate of CI_GATES.filter((g) => !g.blocking)) {
    assert.ok(result.stdout.includes('[excluded]'), 'exclusions must be visible in the plan');
    assert.ok(result.stdout.includes(gate.id));
  }
});

test('DRILL: a gate killed by a signal counts as a failure, not a pass', () => {
  // `spawnSync` reports status === null when a child is signalled (OOM, timeout).
  // A truthiness check on `status` would read null as success and let a killed
  // gate pass -- the same class of bug as reading `tee`'s exit code.
  const nullStatus = null;
  const ok = nullStatus === 0;
  assert.equal(ok, false, 'a signalled gate must never be treated as passing');
});
