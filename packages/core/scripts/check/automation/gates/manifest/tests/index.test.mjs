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
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CI_GATES, manifestScriptTargets, validateManifest } from '../index.mjs';
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
  assert.equal(CI_GATES[index - 1]?.id, 'first-party-single-author-render-laws');
  assert.equal(CI_GATES[index + 1]?.id, 'engine-token-audit');
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
    { id: 'ghost', run: ['node', 'scripts/check/automation/does-not-exist/index.mjs'], blocking: true },
  ]);
  assert.ok(
    planted.some((problem) => problem.includes('names a script that does not exist')),
    `expected a missing-path problem, got: ${JSON.stringify(planted)}`,
  );

  // The positive half: the same shape with a real path is accepted, so the
  // refusal above is about existence and not about the argv shape.
  assert.deepEqual(
    validateManifest([
      { id: 'real', run: ['node', 'scripts/check/automation/gates/manifest/index.mjs'], blocking: true },
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
