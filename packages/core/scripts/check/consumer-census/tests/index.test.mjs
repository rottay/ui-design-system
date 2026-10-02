#!/usr/bin/env node
/**
 * consumer-census — the drill. Fixture corpora plant a fake package with a
 * published map and fake consumers, and assert the census classifies every
 * class exactly once; CLI runs over the same fixtures assert the gate fails
 * closed (missing root), fails growth BY NAME, passes shrinkage and refuses
 * to write a baseline over an incomplete measurement. The live-tree leg
 * measures the real package and asserts the report is internally consistent
 * and the committed baseline fresh; it skips with a written reason when a
 * required consumer root is absent, because a drill that cannot see its
 * corpus measures nothing.
 */

import { execFileSync } from 'node:child_process';
import {
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

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  classifyConsumerSpecifier,
  compareWithBaseline,
  DEFAULT_CONSUMER_ROOTS,
  measure,
  readBaseline,
  writeBaseline,
} from '../index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const GATE = resolve(HERE, '../index.mjs');

function plant(root, rel, contents) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), contents);
}

/**
 * A fake package and two fake consumers. `used` is consumed statically,
 * re-exported, dynamically imported and required; `unused` is named only in
 * a comment and a string literal; `dyn-only` and `req-only` are reached by
 * exactly one dynamic import / one require each; `roles/*` is a wildcard
 * export. `helper` is imported only by a test file; `grown` is planted later
 * as the unreachable-module growth probe.
 */
function buildFixture() {
  const tmp = mkdtempSync(join(tmpdir(), 'consumer-census-'));
  const pkg = join(tmp, 'pkg');
  plant(pkg, 'package.json', `${JSON.stringify({
    name: '@fixture/ds',
    version: '0.0.0',
    exports: {
      '.': { types: './dist/index.d.ts', import: './dist/index.js' },
      './used': { import: './dist/used.js' },
      './unused': { import: './dist/unused.js' },
      './dyn-only': { import: './dist/dyn-only.js' },
      './req-only': { import: './dist/req-only.js' },
      './roles/*': { import: './dist/roles/*.js' },
    },
  }, null, 2)}\n`);
  plant(pkg, 'src/index.ts', "import { used } from './used';\nexport const root = used;\n");
  plant(pkg, 'src/used/index.ts', "import './style.css';\nexport const used = 1;\n");
  plant(pkg, 'src/used/style.css', '.used { color: red; }\n');
  plant(pkg, 'src/unused/index.ts', 'export const unused = 1;\n');
  plant(pkg, 'src/dyn-only/index.ts', 'export const dynOnly = 1;\n');
  plant(pkg, 'src/req-only/index.ts', 'export const reqOnly = 1;\n');
  plant(pkg, 'src/roles/admin.ts', 'export const admin = 1;\n');
  plant(pkg, 'src/roles/user.ts', 'export const user = 1;\n');
  plant(pkg, 'src/tested/helper/index.ts', 'export const helper = 1;\n');
  plant(pkg, 'src/tested/probe.test.ts', "import { helper } from './helper';\nexport const probe = helper;\n");
  plant(pkg, 'src/orphan.css', '.orphan { color: blue; }\n');
  plant(pkg, 'src/detached/index.ts', 'export const detached = 1;\n');
  // The CSS build entry stylesheets the gate follows for inclusion; empty is
  // enough — they exist, so the corpus is complete and includes nothing.
  for (const seed of [
    'src/foundation/tokens/css/facade/entrypoints/base/index.css',
    'src/foundation/tokens/css/runtime/engines/frozen/index.css',
    'src/foundation/tokens/css/runtime/engines/modern/compiled/index.css',
  ]) plant(pkg, seed, '/* build entry */\n');

  plant(tmp, 'consumer-a/app.ts', [
    "import { root } from '@fixture/ds';",
    "import { used } from '@fixture/ds/used';",
    "export { used as reexported } from '@fixture/ds/used';",
    "const prose = '@fixture/ds/unused named inside an ordinary string literal';",
    '// a comment naming @fixture/ds/unused is not an import either',
    "import '@fixture/ds/gone-sub';",
    'export const a = root;',
  ].join('\n'));
  plant(tmp, 'consumer-a/dyn.ts', "export const load = () => import('@fixture/ds/dyn-only');\n");
  plant(tmp, 'consumer-a/req.js', "const { reqOnly } = require('@fixture/ds/req-only');\nmodule.exports = reqOnly;\n");
  plant(tmp, 'consumer-b/b.ts', "import '@fixture/ds';\n");

  const consumerRoots = [
    { id: 'a', root: join(tmp, 'consumer-a'), required: true },
    { id: 'b', root: join(tmp, 'consumer-b'), required: true },
  ];
  return { tmp, pkg, consumerRoots };
}

function cli(args) {
  try {
    const stdout = execFileSync(process.execPath, [GATE, ...args], { encoding: 'utf8' });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    return { status: error.status ?? 1, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

function consumersFlag(roots) {
  return roots.map((root) => `${root.id}=${root.root}`).join(',');
}

test('specifier classification normalizes and refuses', () => {
  const exportsMap = {
    '.': {}, './used': {}, './roles/*': {}, './styles.css': {},
  };
  const name = '@fixture/ds';
  assert.deepEqual(classifyConsumerSpecifier('@fixture/ds', name, exportsMap), { matched: '.', unmatched: false });
  assert.deepEqual(classifyConsumerSpecifier('@fixture/ds/used', name, exportsMap), { matched: './used', unmatched: false });
  assert.deepEqual(classifyConsumerSpecifier('@fixture/ds/./used', name, exportsMap), { matched: './used', unmatched: false });
  assert.deepEqual(classifyConsumerSpecifier('@fixture/ds/roles/admin', name, exportsMap), { matched: './roles/*', unmatched: false });
  assert.deepEqual(classifyConsumerSpecifier('@fixture/ds/nope', name, exportsMap), { matched: null, unmatched: true });
  assert.deepEqual(classifyConsumerSpecifier('another-package/used', name, exportsMap), { matched: null, unmatched: false });
});

test('fixture census: consumed vs consumerless, comments and strings not counted', (t) => {
  const fixture = buildFixture();
  try {
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.equal(measured.missingRoots.length, 0);
    assert.deepEqual(measured.perSubpathConsumers['.'], ['a', 'b']);
    // static import + re-export land on ./used; the string literal and the
    // comment naming ./unused must NOT, or ./unused would leave the bucket.
    assert.deepEqual(measured.perSubpathConsumers['./used'], ['a']);
    assert.deepEqual(measured.consumerlessSubpaths, ['./roles/*', './unused']);
    assert.deepEqual(Object.keys(measured.unmatchedSpecifiers), ['@fixture/ds/gone-sub']);
    assert.deepEqual(measured.unmatchedSpecifiers['@fixture/ds/gone-sub'], ['a']);
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('fixture census: dynamic import and require counted, wildcard entries reachable', (t) => {
  const fixture = buildFixture();
  try {
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.deepEqual(measured.perSubpathConsumers['./dyn-only'], ['a']);
    assert.deepEqual(measured.perSubpathConsumers['./req-only'], ['a']);
    assert.ok(!measured.unreachableModules.includes('src/roles/admin.ts'));
    assert.ok(!measured.unreachableModules.includes('src/roles/user.ts'));
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('fixture census: unreachable, test-only and styles buckets classify once', (t) => {
  const fixture = buildFixture();
  try {
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.deepEqual(measured.unreachableModules, ['src/detached/index.ts']);
    assert.deepEqual(measured.testOnlyModules, ['src/tested/helper/index.ts']);
    assert.deepEqual(measured.stylesUnreferenced, ['src/orphan.css']);
    assert.ok(!measured.stylesUnreferenced.includes('src/used/style.css'));
    const union = new Set([
      ...measured.unreachableModules,
      ...measured.testOnlyModules,
      ...measured.reachableModules ?? [],
    ]);
    assert.equal(union.size, measured.unreachableModules.length + measured.testOnlyModules.length + (measured.reachableModules?.length ?? 0));
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('a missing required consumer root fails closed in every mode', (t) => {
  const fixture = buildFixture();
  try {
    const roots = [...fixture.consumerRoots, { id: 'gone', root: join(fixture.tmp, 'no-such-root'), required: true }];
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: roots });
    assert.deepEqual(measured.missingRoots.map((root) => root.id), ['gone']);

    const baseline = join(fixture.tmp, 'baseline.json');
    const args = ['--package-root', fixture.pkg, '--consumers', consumersFlag(roots), '--baseline', baseline];
    for (const mode of [[], ['--check'], ['--write']]) {
      const outcome = cli([...mode, ...args]);
      assert.notEqual(outcome.status, 0, `mode ${mode.join(' ') || 'report'} must fail closed`);
      assert.match(outcome.stderr, /\[consumer-root\] required consumer root "gone"/u);
    }
    assert.equal(existsSync(baseline), false, '--write must refuse to leave a baseline behind');
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('growth fails --check by name; shrinkage passes; --write refreshes the anchor', (t) => {
  const fixture = buildFixture();
  try {
    const baseline = join(fixture.tmp, 'baseline.json');
    const args = ['--package-root', fixture.pkg, '--consumers', consumersFlag(fixture.consumerRoots), '--baseline', baseline];
    assert.equal(cli(['--write', ...args]).status, 0);
    const pinned = readBaseline(baseline);
    const initially = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.deepEqual(compareWithBaseline(initially, pinned).findings, []);

    // GROWTH: a new module no entrypoint reaches.
    plant(fixture.pkg, 'src/grown/index.ts', 'export const grown = 1;\n');
    let outcome = cli(['--check', ...args]);
    assert.equal(outcome.status, 1);
    assert.match(outcome.stderr, /\[unreachable-modules\] unreachableModules grew by 1: src\/grown\/index\.ts/u);

    // GROWTH: a new published subpath no consumer imports (digest moves too).
    const manifestPath = join(fixture.pkg, 'package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.exports['./fresh'] = { import: './dist/fresh.js' };
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    plant(fixture.pkg, 'src/fresh/index.ts', 'export const fresh = 1;\n');
    outcome = cli(['--check', ...args]);
    assert.equal(outcome.status, 1);
    assert.match(outcome.stderr, /\[consumerless-subpaths\] consumerlessSubpaths grew by 1: \.\/fresh/u);
    assert.match(outcome.stderr, /\[exports-digest\]/u);

    // --write re-anchors both growths; the gate is green again.
    assert.equal(cli(['--write', ...args]).status, 0);
    assert.equal(cli(['--check', ...args]).status, 0);

    // SHRINKAGE: a new consumer adopts ./unused; the sets shrink and pass.
    plant(fixture.tmp, 'consumer-c/c.ts', "import '@fixture/ds/unused';\n");
    const rootsWithC = [...fixture.consumerRoots, { id: 'c', root: join(fixture.tmp, 'consumer-c'), required: true }];
    outcome = cli(['--check', '--package-root', fixture.pkg, '--consumers', consumersFlag(rootsWithC), '--baseline', baseline]);
    assert.equal(outcome.status, 0, `shrinkage must never fail:\n${outcome.stderr}`);
    assert.match(outcome.stdout, /ratchet opportunity/u);
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('report mode exits 0 and accounts for every subpath exactly once', (t) => {
  const fixture = buildFixture();
  try {
    const outcome = cli(['--package-root', fixture.pkg, '--consumers', consumersFlag(fixture.consumerRoots)]);
    assert.equal(outcome.status, 0, outcome.stderr);
    assert.match(outcome.stdout, /6 published subpaths — 4 consumed, 2 consumerless/u);
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

const missingLiveRoots = DEFAULT_CONSUMER_ROOTS.filter((root) => !existsSync(root.root));

test('live tree: the census is internally consistent and the committed baseline is fresh', { skip: missingLiveRoots.length > 0 ? `required consumer root(s) absent in this environment: ${missingLiveRoots.map((root) => root.id).join(', ')}` : false }, (t) => {
  const measured = measure();
  assert.deepEqual(measured.missingRoots, []);
  // Every published subpath is accounted for exactly once: consumed or consumerless.
  const accounted = new Set([
    ...measured.subpaths.filter((key) => measured.perSubpathConsumers[key].length > 0),
    ...measured.consumerlessSubpaths,
  ]);
  assert.deepEqual([...accounted].sort(), measured.subpaths);
  for (const key of measured.subpaths) {
    assert.ok(Array.isArray(measured.perSubpathConsumers[key]), `per-subpath consumers missing for ${key}`);
  }
  // The module buckets are disjoint and cover the census universe.
  const overlap = measured.unreachableModules.filter((member) => measured.testOnlyModules.includes(member));
  assert.deepEqual(overlap, []);

  // The committed baseline parses and pins exactly what the tree measures:
  // --check exits 0 and names nothing.
  const outcome = cli(['--check']);
  assert.equal(outcome.status, 0, outcome.stderr);
  assert.match(outcome.stdout, /consumer-census: OK/u);
  const baseline = readBaseline();
  assert.equal(baseline.exportsDigest, measured.exportsDigest);
  assert.deepEqual(baseline.consumerlessSubpaths, measured.consumerlessSubpaths);
  assert.deepEqual(baseline.unreachableModules, measured.unreachableModules);
  assert.deepEqual(baseline.testOnlyModules, measured.testOnlyModules);
});
