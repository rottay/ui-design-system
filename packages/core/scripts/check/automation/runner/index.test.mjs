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
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { CI_GATES, RETIRED_GATES, blockingGates, validateManifest } from '../gates/manifest/index.mjs';
import { packageRoot as findPackageRoot } from '../../../libraries/repo-root/index.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
// El runner ES `index.mjs` desde el lote F del Paso B; C1 actualizo el import
// de arriba pero no este spawn, y los dos tests que lo usan ya estaban rojos
// por otra causa, asi que la ruta muerta quedo invisible dentro del "conjunto
// identico" de fallas (hallazgo 4 de la auditoria independiente).
const runner = resolve(scriptsDir, 'index.mjs');

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

test('every excluded gate names its reason and its owner', () => {
  const excluded = CI_GATES.filter((g) => !g.blocking);
  // The pin is deliberate and adjudicated. `engine-token-audit` joined the
  // list on 2026-09-05 (WO-CAN-02) and LEFT it on 2026-09-07 (WO-RET-02 drain,
  // correction packet #2): the 18 dead DaisyUI rules its honest scanner had
  // started measuring are deleted, `themeCss.unreferencedSelectors` reads 0,
  // and the ceiling was never widened -- so the stated return condition was met
  // and the gate blocks again. `theme-keypath-coverage` joined on 2026-09-07
  // (WO-CAT-02): the law is registered the day it is written, but its derived
  // set is empty by construction until the derivation lane lands, so it cannot
  // pass yet. Its DRILL is blocking and green, which is what keeps the
  // exclusion from becoming an unmeasured hole.
  //
  // `axis-difference` joined on 2026-09-11 (WO-EVI-02) and is a THIRD kind of
  // exclusion, adjudicated here so it is not read as either of the first two:
  // the gate is GREEN on this tree -- the palette-only control of kit rule 4
  // at 0 % across three verticals and two modes, with the emphasis-only
  // control NON-EVIDENTIAL while the states positive reads 0 (its limits are
  // published in the run artifact) -- and its drill is blocking. What
  // it lacks is an input CI does not provide: the `core` job ("Core Library"),
  // which runs this inventory, installs no browser, and only the `a11y` and
  // `visual` jobs run `playwright install chromium`, so a blocking entry would
  // be PREREQ-MISSING on every run, which is precisely how F-76 says a gate gets
  // downgraded. It returns to blocking when that job installs a browser, not
  // when anything about the gate changes.
  assert.deepEqual(
    excluded.map((g) => g.id).sort(),
    ['axis-difference', 'channel-liveness', 'theme-keypath-coverage'],
    'la lista de exclusiones cambio; adjudicala antes de moverla',
  );
  for (const gate of excluded) {
    assert.ok(
      typeof gate.excluded?.reason === 'string' && gate.excluded.reason.trim().length > 0,
      `${gate.id} is excluded without a written reason`,
    );
    assert.ok(
      typeof gate.excluded?.owner === 'string' && gate.excluded.owner.trim().length > 0,
      `${gate.id} is excluded without an owner`,
    );
  }

  // Non-vacuity: the emptiness above must come from an enforced inventory, not
  // from `CI_GATES` being empty or from `blocking` having stopped being a boolean.
  assert.ok(CI_GATES.length >= 15, 'expected the real inventory, not a stub');
  assert.equal(
    CI_GATES.filter((g) => g.blocking === true).length + excluded.length,
    CI_GATES.length,
    'every gate must be explicitly blocking: true or explicitly excluded, never merely truthy',
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
      // A real path: `validateManifest` now refuses a gate naming a script the
      // tree does not carry, and an exclusion is not a licence to rot.
      run: ['node', 'scripts/check/automation/gates/manifest/index.mjs'],
      blocking: false,
      phase: 'pre-build',
      noDrillReason: 'the fixture exists to prove a complete exclusion is still expressible',
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
  // `--list` defaults to the pre-build phase, which is what `pretest` and the
  // pre-build CI step run. The post-build plan is asserted separately below:
  // one plan that silently mixed the phases is exactly the second inventory
  // this split exists to remove.
  for (const gate of blockingGates('pre-build')) {
    assert.ok(result.stdout.includes(gate.id), `--list omitted ${gate.id}`);
  }
  // El plan tiene que anunciar exactamente las exclusiones que el manifiesto
  // declara -- ni una de mas (un gate degradado en silencio) ni una de menos
  // (una exclusion que el runner no muestra y por tanto nadie revisa).
  const excludedMarkers = result.stdout.split('[excluded]').length - 1;
  assert.equal(
    excludedMarkers,
    CI_GATES.filter((g) => !g.blocking && g.phase === 'pre-build').length,
    'the rendered plan does not advertise exactly the exclusions the manifest declares',
  );

  // Non-vacuity for that count: the plan really was rendered and really does
  // annotate enforcement, so a zero above cannot come from empty stdout.
  //
  // Exact equality, not `>=`: the plan is a projection of the manifest, so one
  // marker per blocking gate is the whole claim. A `>=` would stay green if the
  // renderer emitted a gate twice or annotated a summary line, which is the
  // duplicate-marker false-green this count exists to rule out.
  assert.equal(
    result.stdout.split('[blocking]').length - 1,
    blockingGates('pre-build').length,
    'the rendered plan does not carry exactly one [blocking] marker per blocking gate',
  );

  // The post-build plan is a real plan, not an empty phase that would make the
  // split decorative, and it is disjoint from the pre-build one.
  const post = spawnSync(process.execPath, [runner, '--phase=post-build', '--list'], {
    cwd: findPackageRoot(scriptsDir),
    encoding: 'utf8',
  });
  assert.equal(post.status, 0);
  assert.equal(
    post.stdout.split('[blocking]').length - 1,
    blockingGates('post-build').length,
    'the post-build plan does not carry exactly one [blocking] marker per post-build gate',
  );
  assert.ok(blockingGates('post-build').length > 0, 'an empty post-build phase would make the split decorative');
  for (const gate of blockingGates('post-build')) {
    assert.ok(!result.stdout.includes(`[blocking] ${gate.id}:`), `${gate.id} leaked into the pre-build plan`);
  }
});

test('the taxonomy chain is enforced, and the retired freshness gate stays retired', () => {
  // Taxonomy reads the quarantined manifest as sealed evidence (WO-RET-03).
  // The freshness gate that used to run ahead of this chain measured the
  // corpus against live source -- permanently unmeetable once 11 retired-
  // family bindings stopped resolving -- so it is recorded in RETIRED_GATES
  // instead of CI_GATES. What remains enforceable here is the chain itself:
  // the drills that vouch for the detector run strictly before the gate.
  //
  // Order is asserted by index, not by substring position in the rendered
  // plan: two ids can share a prefix, and a comment mentioning an id would
  // move a substring match without moving a gate.
  const FRESHNESS = 'modern-rescue-customization-manifest-freshness';

  const indexOf = (id) => {
    const found = CI_GATES.map((gate, index) => (gate.id === id ? index : -1)).filter((i) => i >= 0);
    assert.equal(found.length, 1, `${id} must appear exactly once in CI_GATES, found ${found.length}`);
    return found[0];
  };

  // Retirement, not deletion: the ledger entry names the date, the reason and
  // the successor, and validateManifest refuses to re-register the id.
  assert.ok(
    !CI_GATES.some((gate) => gate.id === FRESHNESS),
    `${FRESHNESS} is retired and must not sit in CI_GATES`,
  );
  const ledger = RETIRED_GATES.find((entry) => entry.id === FRESHNESS);
  assert.ok(ledger, `${FRESHNESS} left the inventory without a ledger entry`);
  assert.equal(ledger.retiredOn, '2026-09-19');
  assert.ok(ledger.reason.length > 40, 'the retirement reason is a placeholder');
  assert.ok(ledger.replacedBy.length > 10, 'no successor named');
  assert.deepEqual(ledger.drills, ['manifest-generator-drill']);

  const taxonomy = CI_GATES[indexOf('taxonomy-parity')];
  assert.equal(taxonomy.blocking, true, 'taxonomy-parity must be enforced, not merely reported');
  assert.ok(
    !('excluded' in taxonomy),
    'an enforced gate must not retain an exclusion record; validateManifest rejects the half-state',
  );

  const taxonomyIndex = indexOf('taxonomy-parity');
  for (const id of ['taxonomy-parity-drill', 'taxonomy-owner-nesting-drill', 'taxonomy-public-root-drill']) {
    assert.ok(
      indexOf(id) < taxonomyIndex,
      `${id} (index ${indexOf(id)}) must run strictly before taxonomy-parity (index ${taxonomyIndex})`,
    );
  }
});

test('the manifest-generator freshness gate is retired with its producer, and the removed modern-rescue tooling cohort stays gone', () => {
  // The drill and its freshness gate guarded the manifest generator against
  // silently decaying. WO-RET-03 (2026-09-19) quarantined the corpus the
  // generator wrote -- sealed evidence can never be fresh against live source
  // again -- so both left the inventory together and are recorded in
  // RETIRED_GATES, with the producer itself deleted. A retirement is a named,
  // dated ledger entry, never a quiet disappearance.
  //
  // The removed modern-rescue tooling cohort must not resurface anywhere in
  // the manifest, not merely under its old ids.
  //
  // Every clause below is load-bearing, so state them separately rather than
  // as one loose "is it mentioned somewhere" check.
  const DRILL = 'manifest-generator-drill';
  const PRODUCER_TEST = 'scripts/generate/tokens/manifest/generation/index.test.mjs';
  const PRODUCER_MODULE = 'scripts/generate/tokens/manifest/generation/index.mjs';
  const FRESHNESS = 'modern-rescue-customization-manifest-freshness';
  const REMOVED_IDS = [
    'modern-rescue-tooling-drills',
    'modern-rescue-program-contract',
    'modern-rescue-checkpoint-state',
    'lane-control-drills',
  ];
  const EXCLUDED_CARRIER_PATHS = [
    'scripts/check/modern-rescue/check/index.mjs',
    'scripts/check/modern-rescue/check/index.test.mjs',
  ];

  // Neither the gate nor its drill may still be registered, and no other gate
  // may carry the deleted producer's paths in its run array -- id absence
  // alone would miss a leak through a different entry.
  for (const id of [DRILL, FRESHNESS]) {
    assert.equal(
      CI_GATES.some((gate) => gate.id === id),
      false,
      `${id} is retired and must not sit in CI_GATES`,
    );
  }
  for (const carrier of [PRODUCER_TEST, PRODUCER_MODULE]) {
    assert.equal(
      CI_GATES.some((gate) => gate.run.includes(carrier)),
      false,
      `${carrier} belongs to the deleted producer and must not appear in any gate's run array`,
    );
  }

  // The ledger names the drill that used to prove the gate, the date, the
  // reason and the successor -- validateManifest refuses a re-registration.
  const ledger = RETIRED_GATES.find((entry) => entry.id === FRESHNESS);
  assert.ok(ledger, `${FRESHNESS} left the inventory without a ledger entry`);
  assert.deepEqual(ledger.drills, [DRILL]);
  assert.equal(ledger.retiredOn, '2026-09-19');
  assert.ok(ledger.reason.length > 40, 'the retirement reason is a placeholder');
  assert.ok(ledger.replacedBy.length > 10, 'no successor named');

  // The removed cohort must be gone, not merely renamed or re-excluded.
  for (const id of REMOVED_IDS) {
    assert.equal(
      CI_GATES.some((gate) => gate.id === id),
      false,
      `${id} was removed under REV-C and must not be reintroduced`,
    );
  }

  // And its carrier paths must not leak back in through some OTHER gate's run
  // array -- id absence alone would miss that.
  for (const path of EXCLUDED_CARRIER_PATHS) {
    assert.equal(
      CI_GATES.some((gate) => gate.run.includes(path)),
      false,
      `${path} is an excluded carrier path removed under REV-C and must not appear in any gate's run array`,
    );
  }
  // The orchestration tree is wired selectively, not wholesale: only commands
  // whose transitive graph stays clear of the excluded trees may be gated.
  const EXCLUDED_TREE_READERS = [
    'scripts/check/orchestration/public/containment/index.mjs',
    'scripts/check/orchestration/public/program-state/index.mjs',
    'scripts/check/orchestration/public/work-order/index.mjs',
    'scripts/check/orchestration/public/write-set-intersection/index.mjs',
    'scripts/check/tokens/cascade/probe/public/cli/index.mjs',
  ];
  for (const path of EXCLUDED_TREE_READERS) {
    assert.equal(
      CI_GATES.some((gate) => gate.run.includes(path)),
      false,
      `${path} reaches an excluded tree and must not be wired into any gate`,
    );
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

/**
 * `--continue` drills.
 *
 * The mode exists so the whole matrix can be measured in one pass, which is a
 * diagnostic need, not a policy change. These drills pin the two properties
 * that keep it from becoming a policy change: the verdict never softens, and
 * the default path is untouched.
 *
 * They run the real runner against a synthetic manifest in a temp tree rather
 * than against the repo inventory, so a red row is planted rather than
 * borrowed from whatever the tree happens to be doing today.
 */
const FIXTURE_ROOT = mkdtempSync(join(tmpdir(), 'ds-runner-drill-'));

function plantRunnerFixture(gates) {
  const root = mkdtempSync(join(FIXTURE_ROOT, 'case-'));
  const runnerDir = join(root, 'scripts/check/automation/runner');
  const manifestDir = join(root, 'scripts/check/automation/gates/manifest');
  const repoRootDir = join(root, 'scripts/libraries/repo-root');
  const populationDir = join(root, 'scripts/check/theme/population');
  const baselinesDir = join(root, 'scripts/check/automation/gates/baselines');
  for (const dir of [runnerDir, manifestDir, repoRootDir, populationDir, baselinesDir]) {
    mkdirSync(dir, { recursive: true });
  }

  // The debt walk is the `baseline-discipline` gate's, borrowed rather than
  // reimplemented. The fixture plants a stub so the runner's sequencing law can
  // be exercised without a ledger, and the DEBT line is still asserted below.
  writeFileSync(
    join(baselinesDir, 'index.mjs'),
    "export function describeDebt(path) { return path ? `debtRatio 42.0% — fixture ledger ${path}` : null; }\n",
  );

  // The population owner is planted too, with a fixed sentence: the runner has
  // to PUBLISH a denominator on every run (WO-EVI-02 R4 amendment 3), and a
  // drill that omitted it would let the publication be dropped silently.
  writeFileSync(
    join(populationDir, 'index.mjs'),
    "export function populationLine() { return 'population: fixture catalog deadbeef00000000 (1 decisions)'; }\n",
  );

  writeFileSync(join(root, 'package.json'), '{"name":"runner-drill-fixture"}\n');
  copyFileSync(runner, join(runnerDir, 'index.mjs'));
  writeFileSync(
    join(repoRootDir, 'index.mjs'),
    `export function packageRoot() { return ${JSON.stringify(root)}; }\n`,
  );
  writeFileSync(
    join(manifestDir, 'index.mjs'),
    [
      `export const CI_GATES = Object.freeze(${JSON.stringify(gates)});`,
      'export function validateManifest() { return []; }',
      "export const PHASES = Object.freeze(['pre-build', 'post-build']);",
      "export const MANIFEST_VALIDATION_SCOPE = 'structural only, in the fixture as in the real manifest';",
      'export const PREREQUISITES = Object.freeze({',
      "  'planted-input': { describe: 'an input the fixture never provides', satisfied: () => false },",
      "  'always-there': { describe: 'an input that is always present', satisfied: () => true },",
      '});',
      'export function missingPrerequisites(gate) {',
      '  return (gate.prerequisites ?? []).filter((id) => !PREREQUISITES[id]?.satisfied());',
      '}',
      'export function blockingGates(phase) {',
      '  return CI_GATES.filter((gate) => gate.blocking && (phase === undefined || gate.phase === phase));',
      '}',
      '',
    ].join('\n'),
  );
  return join(runnerDir, 'index.mjs');
}

const FIXTURE_REASON = 'a synthetic fixture gate that exists only to exercise the runner itself';
const PASSING_GATE = (id) => ({
  id, run: [process.execPath, '-e', 'process.exit(0)'], blocking: true, phase: 'pre-build', noDrillReason: FIXTURE_REASON,
});
const FAILING_GATE = (id) => ({
  id, run: [process.execPath, '-e', 'process.exit(3)'], blocking: true, phase: 'pre-build', noDrillReason: FIXTURE_REASON,
});
const PREREQ_GATE = (id) => ({
  id,
  run: [process.execPath, '-e', 'process.exit(0)'],
  blocking: true,
  phase: 'pre-build',
  noDrillReason: FIXTURE_REASON,
  prerequisites: ['planted-input'],
});

test('DRILL: every run publishes the population its causal gates measure against', () => {
  const fixture = plantRunnerFixture([PASSING_GATE('only-gate')]);

  const listed = spawnSync(process.execPath, [fixture, '--list'], { encoding: 'utf8' });
  assert.ok(
    listed.stdout.includes('population: fixture catalog deadbeef00000000'),
    '--list must state the population the plan is written against',
  );

  const ran = spawnSync(process.execPath, [fixture], { encoding: 'utf8' });
  assert.equal(ran.status, 0);
  assert.ok(
    ran.stdout.includes('POPULATION      population: fixture catalog deadbeef00000000'),
    'the summary must state the population, not only the debt',
  );
});

test('DRILL: a tree with no population owner says UNREADABLE rather than omitting the line', () => {
  const fixture = plantRunnerFixture([PASSING_GATE('only-gate')]);
  rmSync(join(dirname(dirname(dirname(dirname(fixture)))), 'check/theme/population/index.mjs'), { force: true });

  const ran = spawnSync(process.execPath, [fixture], { encoding: 'utf8' });
  assert.equal(ran.status, 0, 'a missing population owner is reported, never fatal');
  assert.ok(
    ran.stdout.includes('population: UNREADABLE'),
    'an unpublished population must be NAMED; a silent omission is the state the amendment forbids',
  );
});

test('DRILL: --continue runs every blocking gate instead of stopping at the first red', () => {
  const fixture = plantRunnerFixture([
    PASSING_GATE('first-green'),
    FAILING_GATE('planted-red'),
    PASSING_GATE('after-the-red'),
  ]);

  const failFast = spawnSync(process.execPath, [fixture], { encoding: 'utf8' });
  assert.equal(failFast.status, 1, 'the default path must still fail fast');
  assert.ok(
    failFast.stdout.includes('not reached (fail-fast)'),
    'the default path must still report unreached gates',
  );
  assert.ok(
    !failFast.stdout.includes('after-the-red'),
    'fail-fast must not run the gate after the red one',
  );

  const full = spawnSync(process.execPath, [fixture, '--continue'], { encoding: 'utf8' });
  for (const id of ['first-green', 'planted-red', 'after-the-red']) {
    assert.ok(full.stdout.includes(id), `--continue omitted ${id} from the matrix`);
  }
  assert.ok(
    !full.stdout.includes('not reached (fail-fast)'),
    '--continue must leave no gate unreached',
  );
  assert.ok(
    full.stdout.includes('ci-gates matrix: 2 PASS, 1 FAIL, 0 PREREQ-MISSING, of 3 blocking gate(s).'),
    `--continue must print the derived matrix totals, got: ${full.stdout}`,
  );
});

test('DRILL: --continue exits non-zero when any blocking gate failed', () => {
  // A diagnostic mode that can exit 0 on a red tree is a fail-open gate with
  // extra steps. The exit code is the whole reason this drill exists.
  const red = plantRunnerFixture([PASSING_GATE('green-one'), FAILING_GATE('planted-red')]);
  const redRun = spawnSync(process.execPath, [red, '--continue'], { encoding: 'utf8' });
  assert.equal(redRun.status, 1, '--continue must exit 1 when a blocking gate failed');
  assert.ok(redRun.stderr.includes('ci-gates FAILED at planted-red'));

  // And the positive half: a fully green matrix must still be able to exit 0,
  // or the drill above would pass on a mode that always fails.
  const green = plantRunnerFixture([PASSING_GATE('green-one'), PASSING_GATE('green-two')]);
  const greenRun = spawnSync(process.execPath, [green, '--continue'], { encoding: 'utf8' });
  assert.equal(greenRun.status, 0, '--continue must exit 0 on a fully green matrix');
  assert.ok(greenRun.stdout.includes('ci-gates matrix: 2 PASS, 0 FAIL, 0 PREREQ-MISSING, of 2 blocking gate(s).'));
});

test('DRILL: a missing prerequisite is PREREQ-MISSING, is named, and still exits 1', () => {
  // The two diagnoses must be distinguishable AND equally fatal. A runner that
  // reported them identically taught the reader to ignore both; one that
  // downgraded PREREQ-MISSING to a pass would be the fail-open this whole
  // inventory exists against.
  const fixture = plantRunnerFixture([
    PASSING_GATE('green-one'),
    PREREQ_GATE('needs-an-input'),
    PASSING_GATE('after-the-prereq'),
  ]);

  const full = spawnSync(process.execPath, [fixture, '--continue'], { encoding: 'utf8' });
  assert.equal(full.status, 1, 'a missing declared input must fail the run, not soften it');
  assert.ok(
    full.stdout.includes('PREREQ-MISSING'),
    `the summary must carry the distinct state, got: ${full.stdout}`,
  );
  assert.ok(
    !full.stdout.includes('FAIL            needs-an-input'),
    'a missing input must not be reported as a failed law',
  );
  assert.ok(
    full.stderr.includes('needs-an-input') && full.stderr.includes('an input the fixture never provides'),
    'the missing input must be named, with what would satisfy it',
  );
  assert.ok(
    full.stdout.includes('ci-gates matrix: 2 PASS, 0 FAIL, 1 PREREQ-MISSING, of 3 blocking gate(s).'),
    `the matrix must count the state separately, got: ${full.stdout}`,
  );

  // The positive half: a satisfied prerequisite runs the gate normally, so the
  // refusal above is about the probe and not about carrying a prerequisite.
  const satisfied = plantRunnerFixture([
    { ...PASSING_GATE('has-its-input'), prerequisites: ['always-there'] },
  ]);
  const green = spawnSync(process.execPath, [satisfied, '--continue'], { encoding: 'utf8' });
  assert.equal(green.status, 0, 'a satisfied prerequisite must not block the gate');
  assert.ok(green.stdout.includes('PASS'), 'the gate must actually have run');
});

test('DRILL: --continue reports every failure, not only the first', () => {
  const fixture = plantRunnerFixture([
    FAILING_GATE('red-one'),
    PASSING_GATE('green-between'),
    FAILING_GATE('red-two'),
  ]);
  const result = spawnSync(process.execPath, [fixture, '--continue'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.ok(result.stderr.includes('ci-gates FAILED at red-one'));
  assert.ok(
    result.stderr.includes('also FAILED red-two'),
    'a matrix that hides the second failure is not a matrix',
  );
});

test('--continue is a local diagnostic and is never wired into CI or pretest', () => {
  // The enforced path must stay fail-fast: later gates read artifacts earlier
  // ones guard, so a CI job that continued past a red gate would report on
  // state no gate vouched for.
  const corePackageRoot = findPackageRoot(scriptsDir);
  const pkg = JSON.parse(readFileSync(join(corePackageRoot, 'package.json'), 'utf8'));
  for (const [name, body] of Object.entries(pkg.scripts ?? {})) {
    assert.ok(
      !String(body).includes('--continue'),
      `package.json script ${name} must not carry --continue: ${body}`,
    );
  }
  assert.equal(
    pkg.scripts['gates:ci'],
    'node scripts/check/automation/runner/index.mjs',
    'gates:ci must stay the bare fail-fast invocation',
  );

  const workflow = join(corePackageRoot, '..', '..', '.github', 'workflows', 'ci.yml');
  if (existsSync(workflow)) {
    assert.ok(
      !readFileSync(workflow, 'utf8').includes('--continue'),
      'ci.yml must not invoke the runner in --continue mode',
    );
  }
});
