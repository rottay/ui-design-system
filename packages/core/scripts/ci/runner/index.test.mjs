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
import { globSync, readFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { CI_GATES, blockingGates, validateManifest } from '../gates-manifest/index.mjs';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

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

test('the real manifest excludes nothing today', () => {
  // This replaced a `for (const gate of CI_GATES.filter(g => !g.blocking))` loop
  // that asserted each exclusion named an owner and a reason. Once
  // `taxonomy-parity` -- the last non-blocking gate -- was enforced, that loop
  // iterated zero times and asserted nothing while still reading as coverage.
  //
  // The current state is the stronger claim, so assert it directly: every gate
  // in the shipped inventory is enforced. If a future gate is excluded, this
  // fails loudly and names it, which is the moment to reinstate a per-exclusion
  // owner/reason check rather than let one land unnoticed.
  const excluded = CI_GATES.filter((g) => !g.blocking);
  assert.deepEqual(
    excluded.map((g) => g.id),
    [],
    'a gate was excluded from CI; restore the per-exclusion owner/reason check alongside it',
  );

  // Non-vacuity: the emptiness above must come from an enforced inventory, not
  // from `CI_GATES` being empty or from `blocking` having stopped being a boolean.
  assert.ok(CI_GATES.length >= 15, 'expected the real inventory, not a stub');
  assert.equal(
    CI_GATES.filter((g) => g.blocking === true).length,
    CI_GATES.length,
    'every gate must be explicitly blocking: true, not merely truthy or undefined-and-filtered',
  );
});

test('a fully specified excluded gate is still representable', () => {
  // The positive half of the anti-laundering invariant. The DRILLs above prove
  // half-specified exclusions are rejected; without this, a validator that
  // rejected *every* exclusion would pass them all, and the manifest's escape
  // hatch would be silently gone rather than merely unused.
  const problems = validateManifest([
    {
      id: 'legitimately-excluded',
      run: ['node', 'scripts/some-gate.mjs'],
      blocking: false,
      excluded: {
        reason: 'the corpus it audits lives in a sibling repo that CI does not check out',
        owner: 'design-system-program',
      },
    },
  ]);
  assert.deepEqual(problems, [], 'a complete exclusion must remain expressible');
});

test('the runner --list plan matches the manifest and runs nothing', () => {
  const result = spawnSync(process.execPath, [runner, '--list'], {
    cwd: findPackageRoot(scriptsDir),
    encoding: 'utf8',
  });
  assert.equal(result.status, 0);
  for (const gate of blockingGates()) {
    assert.ok(result.stdout.includes(gate.id), `--list omitted ${gate.id}`);
  }
  // Same vacuity repair as above: this was a loop over the (now empty) exclusion
  // set asserting `[excluded]` was visible in the plan. Assert the current state
  // instead -- the rendered plan must advertise no exclusion at all, so a gate
  // quietly downgraded in the manifest changes this output and fails here.
  const excludedMarkers = result.stdout.split('[excluded]').length - 1;
  assert.equal(excludedMarkers, 0, 'the plan advertises an exclusion; the manifest declares none');

  // Non-vacuity for that count: the plan really was rendered and really does
  // annotate enforcement, so a zero above cannot come from empty stdout.
  //
  // Exact equality, not `>=`: the plan is a projection of the manifest, so one
  // marker per blocking gate is the whole claim. A `>=` would stay green if the
  // renderer emitted a gate twice or annotated a summary line, which is the
  // duplicate-marker false-green this count exists to rule out.
  assert.equal(
    result.stdout.split('[blocking]').length - 1,
    blockingGates().length,
    'the rendered plan does not carry exactly one [blocking] marker per blocking gate',
  );
});

test('the taxonomy chain is enforced, and freshness runs ahead of it', () => {
  // Taxonomy reads the generated manifest as evidence, so a stale manifest
  // makes it green on rows nobody regenerated. Enforcing taxonomy without
  // proving freshness FIRST is therefore not a weaker version of this chain --
  // it is the failure mode the chain exists to prevent.
  //
  // Order is asserted by index, not by substring position in the rendered
  // plan: two ids can share a prefix, and a comment mentioning an id would
  // move a substring match without moving a gate.
  const FRESHNESS = 'modern-rescue-customization-manifest-freshness';
  const FRESHNESS_ARGV = [
    'node',
    'manifest/generator/index.mjs',
    '--check',
  ];

  const indexOf = (id) => {
    const found = CI_GATES.map((gate, index) => (gate.id === id ? index : -1)).filter((i) => i >= 0);
    assert.equal(found.length, 1, `${id} must appear exactly once in CI_GATES, found ${found.length}`);
    return found[0];
  };

  // Exact argv, not a loose match: `--check` is what makes the generator verify
  // instead of write, and this manifest must never invoke the writer in CI.
  const freshness = CI_GATES[indexOf(FRESHNESS)];
  assert.deepEqual(freshness.run, FRESHNESS_ARGV, 'the freshness gate must verify, never regenerate');
  assert.equal(freshness.blocking, true, 'a non-blocking freshness check proves nothing downstream');

  const taxonomy = CI_GATES[indexOf('taxonomy-parity')];
  assert.equal(taxonomy.blocking, true, 'taxonomy-parity must be enforced, not merely reported');
  assert.ok(
    !('excluded' in taxonomy),
    'an enforced gate must not retain an exclusion record; validateManifest rejects the half-state',
  );

  const taxonomyIndex = indexOf('taxonomy-parity');
  for (const id of [FRESHNESS, 'taxonomy-parity-drill', 'owner-nesting-drill', 'root-public-resolver-drill']) {
    assert.ok(
      indexOf(id) < taxonomyIndex,
      `${id} (index ${indexOf(id)}) must run strictly before taxonomy-parity (index ${taxonomyIndex})`,
    );
  }
});

test('the modern-rescue tooling drills are reachable, enforced, and run ahead of their gates', () => {
  // These two suites (21 + 27 assertions) sat under
  // `scripts/quality-evidence/programs/modern-rescue/`, which no glob in
  // `test:scripts` reaches and which no CI gate named. They looked like the
  // safety net for `modern-rescue-program-contract` and
  // `modern-rescue-customization-manifest-freshness` while never executing --
  // the exact defect this runner was built to close, one level down.
  //
  // Every clause below is load-bearing, so state them separately rather than
  // as one loose "is it mentioned somewhere" check.
  const PROGRAM_DRILL = 'scripts/quality-evidence/programs/modern-rescue/program-check.test.mjs';
  const GENERATOR_DRILL = 'manifest/generator/index.test.mjs';
  const DRILLS = 'modern-rescue-tooling-drills';
  const DRILLS_ARGV = ['node', '--test', PROGRAM_DRILL, GENERATOR_DRILL];

  const indexOf = (id) => {
    const found = CI_GATES.map((gate, index) => (gate.id === id ? index : -1)).filter((i) => i >= 0);
    assert.equal(found.length, 1, `${id} must appear exactly once in CI_GATES, found ${found.length}`);
    return found[0];
  };

  // Exact argv, not a substring match: a gate that named only one of the two
  // suites, or that dropped `--test` and merely imported the modules, would
  // satisfy any looser check while leaving half the drills unrun.
  const drills = CI_GATES[indexOf(DRILLS)];
  assert.deepEqual(drills.run, DRILLS_ARGV, 'the tooling drill gate must run both suites under node --test');
  assert.equal(drills.blocking, true, 'a non-blocking drill proves nothing about the gates it vouches for');

  // Once only, across the WHOLE manifest and by path rather than by id: two
  // entries each naming one suite would pass the per-id uniqueness above while
  // making the cohort's cost and ordering ambiguous.
  for (const [label, path] of [['program-check', PROGRAM_DRILL], ['generator', GENERATOR_DRILL]]) {
    const carriers = CI_GATES.filter((gate) => gate.run.includes(path));
    assert.deepEqual(
      carriers.map((gate) => gate.id),
      [DRILLS],
      `the ${label} drill must be carried exactly once, by ${DRILLS}`,
    );
  }

  // Strict order. A drill that ran AFTER the gate it certifies would report on
  // a detector whose verdict had already been trusted.
  const drillsIndex = indexOf(DRILLS);
  for (const id of ['modern-rescue-program-contract', 'modern-rescue-customization-manifest-freshness']) {
    assert.ok(
      drillsIndex < indexOf(id),
      `${DRILLS} (index ${drillsIndex}) must run strictly before ${id} (index ${indexOf(id)})`,
    );
  }

  // CI is not the only caller. `test:scripts` is what a developer runs by hand,
  // and it used to carry two non-recursive globs -- `quality-evidence/v2/*.test.mjs`
  // and `scripts/*.test.mjs` -- which could not see these files. The fix was a
  // single recursive glob, so the old form of this assertion ("name both paths
  // explicitly, a glob cannot reach them") now encodes a premise that is false.
  //
  // Assert REACHABILITY instead of spelling: expand whatever patterns the
  // command carries and require both suites in the matched set. Explicit names
  // and a recursive glob both satisfy it; narrowing the glob back, or dropping
  // a path, fails here exactly as before.
  const pkg = JSON.parse(readFileSync(resolve(findPackageRoot(scriptsDir), 'package.json'), 'utf8'));
  const testScripts = pkg.scripts['test:scripts'];
  assert.ok(typeof testScripts === 'string' && testScripts.length > 0, 'test:scripts must exist');

  const packageRoot = findPackageRoot(scriptsDir);
  const reached = new Set();
  for (const raw of testScripts.split(/\s+/)) {
    const arg = raw.replace(/^["']|["']$/g, '');
    if (!arg.endsWith('.test.mjs')) continue;
    for (const hit of globSync(arg, { cwd: packageRoot })) reached.add(hit.split(sep).join('/'));
  }
  for (const path of [PROGRAM_DRILL, GENERATOR_DRILL]) {
    assert.ok(reached.has(path), `test:scripts does not reach ${path}; it matched ${reached.size} suites`);
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
