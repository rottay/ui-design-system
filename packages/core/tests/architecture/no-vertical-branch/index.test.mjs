/**
 * Drill for the `no-vertical-branch` gate: the gate's two suites are run
 * twice through `mutant.config.ts`, once untouched and once with a branch on a
 * vertical planted in the chrome emitter.
 *
 * The drill names the leg that bites. The structural legs read the sources
 * from disk and the mutant is never written there, so they stay green under
 * it by construction; what turns red is the behavioural leg, and it must be
 * that one and no other.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(HERE, '../../..');
const CONFIG = 'tests/architecture/no-vertical-branch/mutant.config.ts';

const BRANCH_SUITE = 'src/infrastructure/compilers/runtime/theme/runtime/lowering/tests/no-vertical-branch.test.ts';
const SLUG_SUITE = 'src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/tests/slug-neutral-values.test.ts';

const BITING_LEG = 'produces identical channels for one theme under every tenant slug';
const BRANCH_SUITE_LEGS = [
  BITING_LEG,
  'swapping two verticals swaps their output exactly',
  'names no vertical in the compiler source',
  'hands the chrome emitter a context that carries no identity',
];
const PLANTS = ['context-field', 'branch', 'caller'];

const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');

function childEnvironment(mutant) {
  const env = { ...process.env, DS_VERTICAL_BRANCH_MUTANT: mutant, NO_COLOR: '1', FORCE_COLOR: '0' };
  delete env.NODE_TEST_CONTEXT;
  return env;
}

function runGate(mutant) {
  const scratch = mkdtempSync(join(tmpdir(), 'no-vertical-branch-'));
  const report = join(scratch, 'report.json');
  const env = childEnvironment(mutant);
  try {
    const child = spawnSync(
      'pnpm',
      [
        'exec', 'vitest', 'run', '--config', CONFIG, BRANCH_SUITE, SLUG_SUITE,
        '--reporter=verbose', '--reporter=json', `--outputFile.json=${report}`,
      ],
      { cwd: PACKAGE_ROOT, env, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    assert.equal(child.error, undefined, `vitest could not be spawned: ${child.error?.message}`);
    const output = `${child.stdout}\n${child.stderr}`.replace(ANSI, '');
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(report, 'utf8'));
    } catch (error) {
      assert.fail(`the ${mutant} run wrote no report (${error.message}):\n${output}`);
    }
    const tests = parsed.testResults.flatMap((file) =>
      file.assertionResults.map((result) => ({
        suite: file.name,
        title: result.title,
        status: result.status,
      })),
    );
    return { status: child.status, output, tests };
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function planted(output) {
  return [...output.matchAll(/^\[no-vertical-branch-mutant\] planted (\S+)$/gm)].map((match) => match[1]);
}

function titles(tests, status) {
  return tests.filter((entry) => entry.status === status).map((entry) => entry.title);
}

let clean;
let mutated;

test('GREEN without the mutant: every leg of the gate passes and nothing is planted', () => {
  clean = runGate('none');
  assert.equal(clean.status, 0, clean.output);
  assert.deepEqual(planted(clean.output), []);
  assert.deepEqual(titles(clean.tests, 'failed'), []);
  assert.deepEqual(clean.tests.filter((entry) => entry.status !== 'passed'), []);

  const branchSuite = clean.tests.filter((entry) => entry.suite.endsWith(BRANCH_SUITE)).map((entry) => entry.title);
  assert.deepEqual(branchSuite, BRANCH_SUITE_LEGS);
  assert.ok(clean.tests.some((entry) => entry.suite.endsWith(SLUG_SUITE)), 'the slug-neutral suite did not run');
});

test('RED with the mutant: all three plants land and the gate fails', () => {
  mutated = runGate('branch');
  assert.deepEqual(planted(mutated.output).sort(), [...PLANTS].sort());
  assert.notEqual(mutated.status, 0, `a planted per-vertical branch passed the gate:\n${mutated.output}`);
});

test('the leg that bites is the behavioural one, and only that one', () => {
  assert.ok(clean && mutated, 'both runs are needed to name the leg');
  assert.deepEqual(titles(mutated.tests, 'failed'), [BITING_LEG]);

  const failed = mutated.tests.find((entry) => entry.status === 'failed');
  assert.ok(failed.suite.endsWith(BRANCH_SUITE), `the failure sits in ${failed.suite}`);

  assert.equal(mutated.tests.length, clean.tests.length);
  assert.deepEqual(
    titles(mutated.tests, 'passed').sort(),
    clean.tests.map((entry) => entry.title).filter((title) => title !== BITING_LEG).sort(),
  );
});

test('the failure names the channel the planted branch wrote', () => {
  assert.ok(mutated, 'the mutant run is needed');
  assert.match(mutated.output, /^-\s+"--ds-sidebar-bg": "var\(--ds-color-neutral-900\)",$/m);
  assert.match(mutated.output, /^\+\s+"--ds-sidebar-bg": "#0C0C0E",$/m);
});

test('an unknown mutant mode is refused rather than run un-planted', () => {
  const refused = spawnSync(
    'pnpm',
    ['exec', 'vitest', 'run', '--config', CONFIG, BRANCH_SUITE],
    { cwd: PACKAGE_ROOT, env: childEnvironment('id'), encoding: 'utf8' },
  );
  assert.notEqual(refused.status, 0);
  assert.match(`${refused.stdout}\n${refused.stderr}`, /DS_VERTICAL_BRANCH_MUTANT must be one of none \| branch; got id/);
});
