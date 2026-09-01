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

import { CI_GATES, blockingGates, validateManifest } from '../gates/manifest/index.mjs';
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
  assert.deepEqual(
    excluded.map((g) => g.id).sort(),
    ['channel-liveness'],
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
  // El plan tiene que anunciar exactamente las exclusiones que el manifiesto
  // declara -- ni una de mas (un gate degradado en silencio) ni una de menos
  // (una exclusion que el runner no muestra y por tanto nadie revisa).
  const excludedMarkers = result.stdout.split('[excluded]').length - 1;
  assert.equal(
    excludedMarkers,
    CI_GATES.filter((g) => !g.blocking).length,
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
  for (const id of [FRESHNESS, 'taxonomy-parity-drill', 'taxonomy-owner-nesting-drill', 'taxonomy-public-root-drill']) {
    assert.ok(
      indexOf(id) < taxonomyIndex,
      `${id} (index ${indexOf(id)}) must run strictly before taxonomy-parity (index ${taxonomyIndex})`,
    );
  }
});

test('the manifest-generator drill is reachable and enforced ahead of its gate, and REV-C removed the modern-rescue tooling cohort for good', () => {
  // REV-C (2026-08-31, Codex decision, Fable-audited): `modern-rescue-tooling-drills`
  // named two suites, `scripts/check/modern-rescue/check/index.test.mjs` and
  // `scripts/generate/tokens/manifest/generation/index.test.mjs`, neither of
  // which resolves against HEAD or the current worktree -- both sat under
  // paths that moved (or never landed) with the still-uncommitted
  // architecture-refactor migration. The gate, its two sibling gates
  // (`modern-rescue-program-contract`, `modern-rescue-checkpoint-state`) and
  // `lane-control-drills` (same fate, `scripts/check/orchestration/**`) were
  // removed outright rather than left excluded-with-a-dead-path: attribution
  // lives in /private/tmp/rottay-revc-sonnet-report.md, not in dead wiring.
  //
  // That removal also dropped drill coverage for
  // `modern-rescue-customization-manifest-freshness`, which stayed and stays
  // blocking: its own generator drill,
  // `manifest/generator/index.test.mjs` (HEAD-tracked, unlike its former
  // cohort-mate), was restored standalone as `manifest-generator-drill`.
  // This test proves that restoration and proves the removed cohort does not
  // resurface anywhere in the manifest, not merely under its old id.
  //
  // Every clause below is load-bearing, so state them separately rather than
  // as one loose "is it mentioned somewhere" check.
  const DRILL = 'manifest-generator-drill';
  const DRILL_ARGV = ['node', '--test', 'manifest/generator/index.test.mjs'];
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
    'scripts/generate/tokens/manifest/generation/index.test.mjs',
  ];

  const indexOf = (id) => {
    const found = CI_GATES.map((gate, index) => (gate.id === id ? index : -1)).filter((i) => i >= 0);
    assert.equal(found.length, 1, `${id} must appear exactly once in CI_GATES, found ${found.length}`);
    return found[0];
  };

  // Exact argv, not a substring match: a gate that dropped `--test`, or that
  // pointed at a differently-cased or differently-rooted path, would satisfy
  // any looser check while leaving the drill unrun or unresolved.
  const drill = CI_GATES[indexOf(DRILL)];
  assert.deepEqual(drill.run, DRILL_ARGV, 'the manifest-generator drill must run exactly this suite under node --test');
  assert.equal(drill.blocking, true, 'a non-blocking drill proves nothing about the gate it vouches for');

  // Strict order. A drill that ran AFTER the gate it certifies would report on
  // a detector whose verdict had already been trusted.
  const drillIndex = indexOf(DRILL);
  assert.ok(
    drillIndex < indexOf(FRESHNESS),
    `${DRILL} (index ${drillIndex}) must run strictly before ${FRESHNESS} (index ${indexOf(FRESHNESS)})`,
  );

  // Once only, across the WHOLE manifest and by path rather than by id: a
  // second entry naming the same suite would pass the per-id uniqueness above
  // while making the drill's cost and ordering ambiguous.
  const carriers = CI_GATES.filter((gate) => gate.run.includes(DRILL_ARGV[2]));
  assert.deepEqual(
    carriers.map((gate) => gate.id),
    [DRILL],
    `manifest/generator/index.test.mjs must be carried exactly once, by ${DRILL}`,
  );

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
  assert.equal(
    CI_GATES.some((gate) =>
      gate.run.some((arg) => typeof arg === 'string' && arg.startsWith('scripts/check/orchestration')),
    ),
    false,
    'no gate may reference scripts/check/orchestration/** -- the whole tree is absent from HEAD and the worktree',
  );
});

test('DRILL: a gate killed by a signal counts as a failure, not a pass', () => {
  // `spawnSync` reports status === null when a child is signalled (OOM, timeout).
  // A truthiness check on `status` would read null as success and let a killed
  // gate pass -- the same class of bug as reading `tee`'s exit code.
  const nullStatus = null;
  const ok = nullStatus === 0;
  assert.equal(ok, false, 'a signalled gate must never be treated as passing');
});
