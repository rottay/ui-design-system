/**
 * WHY THIS FILE EXISTS.
 *
 * `claim-exactness` sat in the blocking manifest invoked with `--check`, a
 * flag the script never parses. The script has exactly four flags
 * (`--write`, `--check-artifact`, `--allow-unsealed-documentation`,
 * `--print-doc-allowlist`); `--check` fell through, the default path ran, the
 * gate printed OK and exited 0 without checking the artifact it exists to
 * check. A blocking gate that cannot fail is worse than no gate: it spends CI
 * time buying a guarantee nobody holds.
 *
 * THE RULE THIS ENCODES. Every flag the manifest hands to a script must appear
 * literally in that script's source. This cannot prove the flag is honoured,
 * but it does make a typo or an invented flag impossible to merge -- which is
 * the whole failure mode observed.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CI_GATES, PHASES, manifestScriptTargets, validateManifest } from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(HERE);

/** Flags consumed by the node binary itself, never by the target script. */
const NODE_OWNED = new Set(['--test', '--experimental-vm-modules', '--conditions']);

const PKG = JSON.parse(readFileSync(join(CORE_ROOT, 'package.json'), 'utf8'));

/**
 * A gate may be spelled `node script.mjs --flag`, `pnpm run <npm-script>` or
 * `pnpm exec vitest run <file>`. Only the first form hands flags to a script
 * this repo owns; the other two are resolved to their real command first so a
 * phantom flag cannot hide behind an npm alias.
 */
function resolveCommand(run) {
  if (run[0] === 'pnpm' && run[1] === 'run') {
    const cmd = PKG.scripts?.[run[2]];
    assert.ok(cmd, `gate names an npm script that does not exist: ${run[2]}`);
    return cmd.split(/\s+/);
  }
  if (run[0] === 'pnpm' && run[1] === 'exec') return run.slice(2);
  return run;
}

function targetsOf(rawRun) {
  const run = resolveCommand(rawRun);
  if (run[0] !== 'node') return { scripts: [], flags: [] };
  const scripts = [];
  const flags = [];
  for (const arg of run.slice(1)) {
    if (arg.startsWith('--')) {
      if (!NODE_OWNED.has(arg.split('=')[0])) flags.push(arg);
      continue;
    }
    // Bare words that are not module paths are values for the preceding flag
    // (`--repositories ui-design-system`), not scripts to resolve.
    if (/\.(mjs|cjs|js|mts|cts|ts|tsx)$/.test(arg)) scripts.push(arg);
  }
  return { scripts, flags };
}

test('every script the manifest names exists', () => {
  for (const gate of CI_GATES) {
    for (const script of targetsOf(gate.run).scripts) {
      const abs = join(CORE_ROOT, script);
      assert.ok(existsSync(abs), `gate ${gate.id} names a script that does not exist: ${script}`);
    }
  }
});

test('folder naming is a blocking structural gate backed by the live package alias', () => {
  const target = 'scripts/check/architecture/conventions/folder-naming/index.mjs';
  const matches = CI_GATES.filter((gate) => gate.id === 'folder-naming');
  assert.equal(matches.length, 1, 'folder-naming must appear exactly once in the CI manifest');
  const gate = matches[0];
  assert.deepEqual(gate.run, ['pnpm', 'run', 'lint:folders']);
  assert.equal(gate.blocking, true, 'folder-naming may not be silently excluded');
  assert.equal(Object.hasOwn(gate, 'excluded'), false);
  assert.ok(targetsOf(gate.run).scripts.includes(target), 'lint:folders no longer runs folder-naming');
  assert.ok(existsSync(join(CORE_ROOT, target)), 'folder-naming points at a missing target');

  const index = CI_GATES.indexOf(gate);
  assert.equal(CI_GATES[index - 1]?.id, 'folder-naming-drill', 'the drill runs first');
  assert.equal(CI_GATES[index + 1]?.id, 'eslint-config-drill');
});

test('no gate passes a flag its target script does not recognise', () => {
  const phantom = [];
  for (const gate of CI_GATES) {
    const { scripts, flags } = targetsOf(gate.run);
    if (flags.length === 0) continue;
    // A `node --test a.mjs b.mjs` entry has no script-owned flags left by here.
    const sources = scripts
      .map((s) => join(CORE_ROOT, s))
      .filter((abs) => existsSync(abs))
      .map((abs) => readFileSync(abs, 'utf8'));
    for (const flag of flags) {
      const name = flag.split('=')[0];
      const known = sources.some((src) => src.includes(`'${name}'`) || src.includes(`"${name}"`));
      if (!known) phantom.push(`${gate.id}: ${name} (${scripts.join(', ')})`);
    }
  }
  assert.deepEqual(
    phantom,
    [],
    `the manifest passes flags no target script parses:\n  ${phantom.join('\n  ')}`,
  );
});

test('DRILL: a planted missing path makes validateManifest refuse the inventory', () => {
  // The test above walks CI_GATES, but it lives in `test:scripts`, which
  // `gates:ci` never runs. Eight gates therefore pointed at deleted scripts
  // through a whole refactor while the runner reported the FIRST of them as an
  // ordinary gate failure and never reached the other seven. Existence is now
  // structural validation, so the runner refuses the manifest before running
  // anything.
  const planted = validateManifest([
    {
      id: 'ghost',
      run: ['node', 'scripts/check/automation/does-not-exist/index.mjs'],
      blocking: true,
      phase: 'pre-build',
      noDrillReason: 'a fixture entry that exists only to be refused for its missing path',
    },
  ]);
  assert.ok(
    planted.some((problem) => problem.includes('names a script that does not exist')),
    `expected a missing-path problem, got: ${JSON.stringify(planted)}`,
  );

  // The positive half: the same shape with a real path is accepted, so the
  // refusal above is about existence and not about the argv shape.
  assert.deepEqual(
    validateManifest([
      {
        id: 'real',
        run: ['node', 'scripts/check/automation/gates/manifest/index.mjs'],
        blocking: true,
        phase: 'pre-build',
        noDrillReason: 'a fixture entry that exists only to prove the positive half of the existence law',
      },
    ]),
    [],
  );
});

test('DRILL: the existence law reads argv, not flag values or npm aliases', () => {
  // A loose predicate would report a phantom on `--repositories ui-design-system`
  // or on a `pnpm run` alias, and a manifest that cannot be validated without
  // false positives gets its validator disabled.
  assert.deepEqual(manifestScriptTargets(['pnpm', 'run', 'lint:folders']), []);
  assert.deepEqual(manifestScriptTargets(['node', 'a/b.mjs', '--repositories', 'ui-design-system']), ['a/b.mjs']);
  assert.deepEqual(manifestScriptTargets(['node', '--test', 'a.test.mjs', 'b.test.mjs']), ['a.test.mjs', 'b.test.mjs']);
  assert.deepEqual(manifestScriptTargets(['true']), []);
});

test('the recreated evidence-framework drills are carried by exactly one gate, and all eight run', () => {
  // The monolith this replaces was one file; the recreation is eight owners.
  // Carrying them under one id keeps the gate's identity, but it also means a
  // silently dropped suite would be invisible -- hence the exact roster.
  const OWNERS = [
    'admission',
    'craft-scoring',
    'eligibility',
    'integration',
    'inventory-correspondence',
    'ownership-overlap',
    'receipts',
    'rounds/evidence',
  ];
  const matches = CI_GATES.filter((gate) => gate.id === 'quality-evidence-v2-drills');
  assert.equal(matches.length, 1);
  const gate = matches[0];
  assert.equal(gate.blocking, true);
  assert.deepEqual(
    gate.run.slice(0, 2),
    ['node', '--test'],
    'the suites must run under node --test, not through an alias',
  );
  assert.deepEqual(
    gate.run.slice(2).sort(),
    OWNERS.map((owner) => `scripts/check/evidence/framework/${owner}/index.test.mjs`).sort(),
  );
  for (const script of gate.run.slice(2)) {
    assert.ok(existsSync(join(CORE_ROOT, script)), `${script} does not exist`);
  }
  // And no other gate may carry one of them: a second carrier would make the
  // cost and the ordering of these suites ambiguous.
  for (const script of gate.run.slice(2)) {
    assert.deepEqual(
      CI_GATES.filter((candidate) => candidate.run.includes(script)).map((candidate) => candidate.id),
      ['quality-evidence-v2-drills'],
    );
  }
});

// ---------------------------------------------------------------------------
// WO-CAN-02: the two laws that make a green matrix mean something
// ---------------------------------------------------------------------------

/**
 * A manifest entry the fixtures below reuse. Everything the laws under test do
 * not care about is filled in, so a refusal can only be about the one field
 * the fixture perturbs.
 */
function wellFormedEntry(overrides = {}) {
  return {
    id: 'fixture',
    run: ['node', 'scripts/check/automation/gates/manifest/index.mjs'],
    blocking: true,
    phase: 'pre-build',
    noDrillReason: 'a fixture entry whose written reason is long enough to be a real sentence',
    ...overrides,
  };
}

test('DRILL: a gate with neither a drill nor a written reason is refused', () => {
  const entry = wellFormedEntry();
  delete entry.noDrillReason;
  assert.ok(
    validateManifest([entry]).some((problem) => problem.includes('must declare drillId, drillFor or noDrillReason')),
    'a gate nothing has ever been seen failing may not enter the inventory silently',
  );

  // The positive half, so the refusal is about the missing declaration and not
  // about the fixture shape.
  assert.deepEqual(validateManifest([wellFormedEntry()]), []);
});

test('DRILL: a drill pointer must resolve BOTH ways', () => {
  const dangling = validateManifest([wellFormedEntry({ noDrillReason: undefined, drillId: 'nobody' })]);
  assert.ok(
    dangling.some((problem) => problem.includes('drillId names no manifest entry')),
    'a pointer at nothing is a decorative reference',
  );

  const oneWay = validateManifest([
    wellFormedEntry({ id: 'gate', noDrillReason: undefined, drillId: 'drill' }),
    wellFormedEntry({ id: 'drill', noDrillReason: undefined, drillFor: ['someone-else'] }),
  ]);
  assert.ok(
    oneWay.some((problem) => problem.includes("does not declare drillFor: ['gate']")),
    'a drill that does not name the gate back does not drill it',
  );

  assert.deepEqual(
    validateManifest([
      wellFormedEntry({ id: 'gate', noDrillReason: undefined, drillId: 'drill' }),
      wellFormedEntry({ id: 'drill', noDrillReason: undefined, drillFor: ['gate'] }),
    ]),
    [],
  );
});

test('DRILL: a placeholder is not a written reason', () => {
  assert.ok(
    validateManifest([wellFormedEntry({ noDrillReason: 'n/a' })])
      .some((problem) => problem.includes('must be a written sentence')),
    'an empty excuse is how the drill-first law gets applied selectively',
  );
});

test('DRILL: a pre-build gate whose module graph reaches dist/ is refused', () => {
  // The real shape, not a synthetic one: the slot inventory dynamically
  // imports `dist/server.js`, and the membership gate imports the inventory.
  // Both were declared blocking in a chain that runs before the build.
  const planted = validateManifest([
    wellFormedEntry({ run: ['node', 'scripts/check/tokens/cascade/slots/index.mjs', '--check'] }),
  ]);
  assert.ok(
    planted.some((problem) => problem.includes('pre-build gate reaches dist/')),
    `expected a dist-reachability problem, got: ${JSON.stringify(planted)}`,
  );

  // The same entry is legal once it declares the phase it really belongs to.
  assert.deepEqual(
    validateManifest([
      wellFormedEntry({
        run: ['node', 'scripts/check/tokens/cascade/slots/index.mjs', '--check'],
        phase: 'post-build',
        prerequisites: ['fresh-dist'],
      }),
    ]),
    [],
  );
});

/**
 * The three shapes the previous reachability walk could not see. Each is a
 * REAL entry of this repository that the 2026-09-08 re-audit ran on a checkout
 * without `dist/` and watched fail, while `validateManifest()` reported no
 * problem at all.
 */
test('DRILL: a pre-build gate that READS a dist path through a variable is refused', () => {
  // `const distDir = join(root, 'dist')` … `import(pathToFileURL(join(distDir,
  // relative)).href)`. No import specifier anywhere spells `dist/`.
  const planted = validateManifest([
    wellFormedEntry({ run: ['node', 'scripts/check/tokens/cascade/channels/consumers/index.mjs', '--check'] }),
  ]);
  assert.ok(
    planted.some((problem) => problem.includes('pre-build gate reaches dist/') && problem.includes('path-literal')),
    `expected a path-dataflow problem, got: ${JSON.stringify(planted)}`,
  );
});

test('DRILL: a pre-build gate that READS a dist file off the filesystem is refused', () => {
  // `readFileSync(BUNDLE)` where `BUNDLE` is `dist/bithire.css`.
  const planted = validateManifest([
    wellFormedEntry({ run: ['node', 'scripts/check/boundaries/applications/styles/index.mjs', '--check'] }),
  ]);
  assert.ok(
    planted.some((problem) => problem.includes('pre-build gate reaches dist/')),
    `expected a filesystem-read problem, got: ${JSON.stringify(planted)}`,
  );
});

test('DRILL: a pre-build gate that SPAWNS a dist-reading command is refused', () => {
  const workspace = mkdtempSync(join(tmpdir(), 'gate-manifest-dist-drill-'));
  try {
    const spawner = 'scripts/check/planted-spawner/index.mjs';
    const spawned = 'scripts/check/planted-spawned/index.mjs';
    mkdirSync(join(workspace, dirname(spawner)), { recursive: true });
    mkdirSync(join(workspace, dirname(spawned)), { recursive: true });
    writeFileSync(join(workspace, spawner), [
      "import { spawnSync } from 'node:child_process';",
      `const GATE = '${spawned}';`,
      "spawnSync('node', [GATE]);",
      '',
    ].join('\n'));
    writeFileSync(join(workspace, spawned), [
      "import { readFileSync } from 'node:fs';",
      "readFileSync('dist/server.js');",
      '',
    ].join('\n'));
    writeFileSync(join(workspace, 'package.json'), JSON.stringify({ name: 'planted', scripts: {} }));

    const planted = validateManifest(
      [wellFormedEntry({ run: ['node', spawner] })],
      { packageRoot: workspace },
    );
    assert.ok(
      planted.some((problem) => problem.includes('pre-build gate reaches dist/')),
      `a command a gate spawns is part of what that gate needs: ${JSON.stringify(planted)}`,
    );

    // CONTROL: the same spawner, with the spawned script reading nothing built.
    writeFileSync(join(workspace, spawned), "export const nothing = 1;\n");
    assert.deepEqual(
      validateManifest([wellFormedEntry({ run: ['node', spawner] })], { packageRoot: workspace }),
      [],
      'following a child command must not condemn every gate that spawns one',
    );
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('CONTROL: a dependency\'s own dist/ is not this package\'s build output', () => {
  // `node_modules/vite/dist/node/index.js` is present after `pnpm install` and
  // says nothing about the phase. Reading it as a build dependency reported two
  // gates that run green on a clean checkout.
  const workspace = mkdtempSync(join(tmpdir(), 'gate-manifest-vendor-drill-'));
  try {
    const script = 'scripts/check/planted-vendor/index.mjs';
    mkdirSync(join(workspace, dirname(script)), { recursive: true });
    writeFileSync(join(workspace, script), [
      "import { resolve } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const vitePath = resolve('.', 'node_modules/vite/dist/node/index.js');",
      'await import(pathToFileURL(vitePath).href);',
      '',
    ].join('\n'));
    writeFileSync(join(workspace, 'package.json'), JSON.stringify({ name: 'planted', scripts: {} }));
    assert.deepEqual(
      validateManifest([wellFormedEntry({ run: ['node', script] })], { packageRoot: workspace }),
      [],
    );
  } finally {
    rmSync(workspace, { recursive: true, force: true });
  }
});

test('DRILL: a distExemption is a written, measured sentence and never a spare one', () => {
  const reaching = ['node', 'scripts/check/tokens/cascade/channels/consumers/index.mjs', '--check'];
  assert.ok(
    validateManifest([wellFormedEntry({ run: reaching, distExemption: 'it is fine' })])
      .some((problem) => problem.includes('must be a written, measured sentence')),
    'an exemption without a measurement is how a phase declaration goes back to being a guess',
  );
  assert.deepEqual(
    validateManifest([wellFormedEntry({
      run: reaching,
      distExemption:
        'MEASURED: run with dist/ moved away this entry exits 0, because the door import is lazy and never fires here.',
    })]),
    [],
  );
  assert.ok(
    validateManifest([wellFormedEntry({
      distExemption:
        'MEASURED: run with dist/ moved away this entry exits 0, because the door import is lazy and never fires here.',
    })]).some((problem) => problem.includes('reaches no dist/ output')),
    'an exemption nobody needs is an exemption nobody reviews',
  );
});

test('every pre-build entry either reaches no dist/ output or says why it may', () => {
  // The live inventory, not a plant: this is the state the amendment demands of
  // a clean checkout, and it is the assertion that keeps it true.
  assert.deepEqual(validateManifest(), []);
});

test('DRILL: a declared dist prerequisite cannot hide in the pre-build phase', () => {
  assert.ok(
    validateManifest([wellFormedEntry({ prerequisites: ['fresh-dist'] })])
      .some((problem) => problem.includes('must not require a built dist/')),
    'declaring the input and then running before it exists is the same defect written down',
  );
});

test('DRILL: an undeclared prerequisite name is a malformed manifest, not a skip', () => {
  assert.ok(
    validateManifest([wellFormedEntry({ prerequisites: ['some-corpus-nobody-defined'] })])
      .some((problem) => problem.includes('unknown prerequisite')),
    'an unknown prerequisite would make PREREQ-MISSING unfalsifiable',
  );
});

test('every phase is declared and every post-build gate says why it needs the build', () => {
  for (const gate of CI_GATES) {
    assert.ok(PHASES.includes(gate.phase), `${gate.id}: undeclared phase`);
  }
  assert.ok(CI_GATES.some((gate) => gate.phase === 'post-build'), 'the split must not be decorative');
});
