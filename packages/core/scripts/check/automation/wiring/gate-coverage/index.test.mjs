/**
 * Drills for the wiring-coverage gate.
 *
 * The gate's own failure mode is the one it exists to prevent. It matched
 * wired paths with a literal-path regex, so `test:scripts` -- which is
 * `node --test` over a recursive test glob -- named nothing, and 30 scripts CI
 * already executes read as orphans. The remedy on offer was to add manifest
 * entries for them, which is exactly the decorative reference the gate is
 * supposed to make impossible.
 *
 * These drills run the real gate against synthetic package roots, so a channel
 * is planted rather than borrowed from whatever the tree happens to declare.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE = resolve(HERE, 'index.mjs');
const CORE_ROOT = findPackageRoot(HERE);

/**
 * A minimal package root: `package.json`, a gates manifest, and whichever
 * scripts the case needs. The gate resolves its own location through
 * `repo-root`, so the copy has to sit at the same depth for its relative
 * import of `libraries/repo-root` to resolve.
 */
function plantPackage({ scripts = {}, manifest = 'export const CI_GATES = [];\n', files = {} }) {
  const repo = mkdtempSync(join(tmpdir(), 'ds-wiring-drill-'));
  const core = join(repo, 'packages/core');
  mkdirSync(core, { recursive: true });
  writeFileSync(join(repo, 'pnpm-workspace.yaml'), "packages:\n  - 'packages/*'\n");
  writeFileSync(join(repo, 'package.json'), JSON.stringify({ name: 'workspace-root' }, null, 2));
  // The fixture carries the gate, the manifest and the repo-root library, so
  // each is a production script the fixture must itself wire; otherwise every
  // case would report the harness rather than the planted subject.
  const baseline = {
    'gates:ci': 'node scripts/check/automation/gates/manifest/index.mjs',
    'wiring:check': 'node scripts/check/automation/wiring/gate-coverage/index.mjs',
  };
  writeFileSync(
    join(core, 'package.json'),
    JSON.stringify({ name: '@rottay/design-system', scripts: { ...baseline, ...scripts } }, null, 2),
  );

  const write = (relative, contents) => {
    const absolute = join(core, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, contents);
  };
  write('scripts/check/automation/gates/manifest/index.mjs', manifest);
  for (const [relative, contents] of Object.entries(files)) write(relative, contents);

  // The gate under test, plus the one library it imports, copied to the same
  // depths so its relative specifier resolves inside the fixture.
  write('scripts/check/automation/wiring/gate-coverage/index.mjs', readGate());
  write('scripts/libraries/repo-root/index.mjs', readRepoRootLibrary());
  return { repo, core, gate: join(core, 'scripts/check/automation/wiring/gate-coverage/index.mjs') };
}

let gateSource = null;
function readGate() {
  if (gateSource === null) gateSource = readFile(GATE);
  return gateSource;
}
let repoRootSource = null;
function readRepoRootLibrary() {
  if (repoRootSource === null) repoRootSource = readFile(join(CORE_ROOT, 'scripts/libraries/repo-root/index.mjs'));
  return repoRootSource;
}
function readFile(path) {
  return spawnSync(process.execPath, ['-e', `process.stdout.write(require('fs').readFileSync(${JSON.stringify(path)}, 'utf8'))`], {
    encoding: 'utf8',
  }).stdout;
}

function runGate(gate) {
  const result = spawnSync(process.execPath, [gate], { encoding: 'utf8' });
  return { status: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` };
}

test('DRILL: a script reachable only through the test:scripts glob counts as wired', () => {
  // The decisive case. `owner/index.mjs` is named by NO literal path anywhere;
  // it is reached because the glob matches `owner/index.test.mjs`, which
  // imports it. Before the glob channel, this exact shape produced 30 orphans.
  const planted = plantPackage({
    scripts: { 'test:scripts': 'node --test "scripts/**/*.test.mjs"' },
    files: {
      'scripts/check/owner/index.mjs': 'export const value = 1;\n',
      'scripts/check/owner/index.test.mjs': "import { value } from './index.mjs';\n",
    },
  });
  const result = runGate(planted.gate);
  assert.equal(result.status, 0, `expected the glob channel to wire the owner, got:\n${result.output}`);
  assert.match(result.output, /every one wired through a declared channel/);
});

test('DRILL: an unreferenced script is still reported, so the glob channel is not a blanket pass', () => {
  // The counterfactual for the drill above. If the glob wired the tree rather
  // than what it matches, this would go green too and the gate would be gone.
  const planted = plantPackage({
    scripts: { 'test:scripts': 'node --test "scripts/**/*.test.mjs"' },
    files: {
      'scripts/check/owner/index.mjs': 'export const value = 1;\n',
      'scripts/check/owner/index.test.mjs': "import { value } from './index.mjs';\n",
      'scripts/check/stranger/index.mjs': 'export const stranger = 1;\n',
    },
  });
  const result = runGate(planted.gate);
  assert.equal(result.status, 1);
  assert.match(result.output, /scripts\/check\/stranger\/index\.mjs/);
  assert.doesNotMatch(
    result.output.split('production scripts with no wiring channel:')[1] ?? '',
    /scripts\/check\/owner\/index\.mjs/,
    'the glob-wired owner must not be reported alongside the real orphan',
  );
});

test('DRILL: a glob that matches nothing wires nothing', () => {
  // A stale glob must not launder the tree. `scripts/nowhere/**` matches no
  // file, so the orphan below stays an orphan.
  const planted = plantPackage({
    scripts: { 'test:scripts': 'node --test "scripts/nowhere/**/*.test.mjs"' },
    files: { 'scripts/check/stranger/index.mjs': 'export const stranger = 1;\n' },
  });
  const result = runGate(planted.gate);
  assert.equal(result.status, 1);
  assert.match(result.output, /scripts\/check\/stranger\/index\.mjs/);
});

test('DRILL: the manifest channel still wires on its own', () => {
  // The glob channel is an addition, not a replacement. A script named only by
  // the manifest must still be wired, or the fix would have traded one blind
  // spot for another.
  const planted = plantPackage({
    manifest: "export const CI_GATES = [{ id: 'x', run: ['node', 'scripts/check/named/index.mjs'], blocking: true }];\n",
    files: { 'scripts/check/named/index.mjs': 'export const named = 1;\n' },
  });
  const result = runGate(planted.gate);
  assert.equal(result.status, 0, result.output);
});

test('the vacuity guard is present, and the live census is not vacuous', () => {
  // A census that finds zero production scripts would satisfy "no orphans" for
  // the worst possible reason. The guard cannot be exercised from a fixture --
  // the gate always finds at least itself -- so it is asserted structurally
  // here and by the non-vacuous count in the live run below.
  assert.match(readGate(), /zero production scripts found under scripts\//);
  assert.match(readGate(), /A vacuous pass is not a pass/);
});

test('the live tree is fully wired, and the census is not vacuous', () => {
  const result = runGate(GATE);
  assert.equal(result.status, 0, result.output);
  const census = /OK — (\d+) production scripts/.exec(result.output);
  assert.ok(census, `expected a census count in: ${result.output}`);
  assert.ok(Number(census[1]) > 100, `expected the real census, got ${census[1]}`);
});
