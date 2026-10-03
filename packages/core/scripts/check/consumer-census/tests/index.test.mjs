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
  auditClasses,
  classifyConsumerSpecifier,
  classLawOptions,
  compareWithBaseline,
  consumerApp,
  DEFAULT_CONSUMER_ROOTS,
  measure,
  readBaseline,
  run,
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
 * exactly one dynamic import / one require each; `resolve-only` and
 * `cr-only` by `require.resolve` / `createRequire(...).resolve`;
 * `styles.css` and a `dist/*.css` wildcard are consumed only from a
 * stylesheet `@import` (one of them through `url(...)`); `roles/*` is a
 * wildcard export. `helper` is imported only by a test file; `grown` is
 * planted later as the unreachable-module growth probe.
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
      './resolve-only': { import: './dist/resolve-only.js' },
      './cr-only': { import: './dist/cr-only.js' },
      './styles.css': './dist/styles.css',
      './dist/*.css': './dist/*.css',
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
  plant(tmp, 'consumer-a/app.css', [
    "@import '@fixture/ds/styles.css';",
    '@import url("@fixture/ds/dist/wild.css");',
    '/* @import "@fixture/ds/unused"; a commented-out import must not count */',
    "@import url(@fixture/ds/dist/bare.css);",
    "/* a multi-line",
    '   comment @import "@fixture/ds/req-only"; */',
    "@import '@fixture/ds/dist/style.js';",
    "@import '../styles/animations.css';",
  ].join('\n'));
  plant(tmp, 'consumer-a/dyn.ts', "export const load = () => import('@fixture/ds/dyn-only');\n");
  plant(tmp, 'consumer-a/req.js', [
    "const { createRequire } = require('node:module');",
    "const { reqOnly } = require('@fixture/ds/req-only');",
    "module.exports = reqOnly;",
    "module.exports.resolved = require.resolve('@fixture/ds/resolve-only');",
    "module.exports.resolvedViaCreateRequire = createRequire(__filename).resolve('@fixture/ds/cr-only');",
  ].join('\n'));
  plant(tmp, 'consumer-b/b.ts', "import '@fixture/ds';\n");

  const consumerRoots = [
    { id: 'a', root: join(tmp, 'consumer-a'), required: true },
    { id: 'b', root: join(tmp, 'consumer-b'), required: true },
  ];
  return { tmp, pkg, consumerRoots };
}

function cli(args) {
  try {
    const stdout = execFileSync(process.execPath, [GATE, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { status: 0, stdout, stderr: '' };
  } catch (error) {
    return { status: error.status ?? 1, stdout: error.stdout ?? '', stderr: error.stderr ?? '' };
  }
}

/** The same entry the CLI calls, in process: the law drills run it dozens of times. */
function gate(args) {
  const stdout = [];
  const stderr = [];
  const status = run({ argv: args, out: (line) => stdout.push(line), err: (line) => stderr.push(line) });
  return { status, stdout: stdout.join('\n'), stderr: stderr.join('\n') };
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
    assert.deepEqual(Object.keys(measured.unmatchedSpecifiers), ['@fixture/ds/dist/style.js', '@fixture/ds/gone-sub']);
    assert.deepEqual(measured.unmatchedSpecifiers['@fixture/ds/gone-sub'], ['a']);
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('fixture census: CSS @import counts, commented-out and non-wildcard do not', (t) => {
  const fixture = buildFixture();
  try {
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    // String form and both url(...) forms land on the exact key and the wildcard.
    assert.deepEqual(measured.perSubpathConsumers['./styles.css'], ['a']);
    assert.deepEqual(measured.perSubpathConsumers['./dist/*.css'], ['a']);
    // The commented-out import of ./unused must NOT count: it stays consumerless.
    assert.ok(measured.consumerlessSubpaths.includes('./unused'));
    // The wildcard does not swallow non-.css specifiers: they are reported unmatched.
    assert.deepEqual(measured.unmatchedSpecifiers['@fixture/ds/dist/style.js'], ['a']);
    // A relative CSS import names no package and reaches no bucket.
    assert.ok(!Object.keys(measured.unmatchedSpecifiers).includes('../styles/animations.css'));
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('fixture census: require.resolve and createRequire(...).resolve counted', (t) => {
  const fixture = buildFixture();
  try {
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.deepEqual(measured.perSubpathConsumers['./resolve-only'], ['a']);
    assert.deepEqual(measured.perSubpathConsumers['./cr-only'], ['a']);
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
    assert.match(outcome.stdout, /10 published subpaths — 8 consumed, 2 consumerless/u);
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

// ── named classes and door attributions ─────────────────────────────────────

const LAW_ATTRIBUTIONS = 'scripts/check/consumer-census/attributions/index.json';
const LAW_CONTRACT = 'docs/consumer-contract/index.md';
const STORY = 'src/widgets/card/Card.stories.tsx';
const KIT_TEST = 'src/widgets/card/tests/card.test.ts';
const LAB_DATA = 'src/foundation/presets/candidates/acme/index.ts';
const LAB_TEST = 'src/foundation/presets/candidates/acme/tests/index.test.ts';
const DECLARATION = 'src/foundation/packs/manifest/index.ts';

function contractTable(rows) {
  return [
    '# contract',
    '<!-- consumer-contract:published:start -->',
    '| Subpath | Disposition | Retire-by | app | showroom |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map(([subpath, disposition, workOrder]) => `| \`${subpath}\` | ${disposition} | ${workOrder ?? '—'} | 0 | 0 |`),
    '<!-- consumer-contract:published:end -->',
    '',
  ].join('\n');
}

const LAW_CONTRACT_ROWS = [
  ['.', 'guaranteed'],
  ['./config-only', 'guaranteed'],
  ['./test-req', 'guaranteed'],
  ['./quiet', 'guaranteed'],
  ['./lab-door', 'lab', 'WO-OPEN-01'],
  ['./retiring', 'retire-by', 'WO-OPEN-02'],
];

function lawAttributions() {
  return {
    schemaVersion: 1,
    residueReceiver: 'WO-OPEN-03',
    modules: [
      {
        path: 'src/story-kit/index.tsx',
        class: 'story-support',
        readers: [{ file: STORY, kind: 'story-import' }],
        reason: 'story scaffolding',
        receiver: 'WO-OPEN-01',
      },
      {
        path: 'src/registry/index.ts',
        class: 'tooling-path-read',
        readers: [{ file: 'scripts/gates/reader/index.mjs', kind: 'path-read' }],
        reason: 'read by path by a gate',
        receiver: 'WO-OPEN-01',
      },
      {
        path: 'src/test-kit/index.ts',
        class: 'test-support',
        readers: [{ file: KIT_TEST, kind: 'test-import' }],
        reason: 'render harness',
        receiver: 'WO-OPEN-01',
      },
      {
        path: 'src/drift/parse/index.ts',
        class: 'drift-test-reader',
        readers: [{ file: 'src/drift/tests/index.test.ts', kind: 'test-import' }],
        reason: 'parser the drift test re-derives a mirror with',
        receiver: null,
        owner: 'src/drift/tests/index.test.ts',
        document: 'docs/mirror.md',
      },
      {
        path: 'src/foundation/presets/candidates/acme/index.ts',
        class: 'lab-data',
        readers: [{ file: LAB_TEST, kind: 'test-import' }],
        reason: 'candidate data',
        receiver: 'WO-OPEN-02',
      },
    ],
    doors: [
      {
        subpath: './quiet',
        class: 'structural-admission',
        evidence: [
          { root: 'app', file: 'package.json', line: 4, needle: '"check:quiet": "node scripts/honesty.mjs"' },
          { root: 'app', file: 'scripts/honesty.mjs', line: 3, needle: 'resolve(packageDirectory, "supplier-contract.json")' },
          { root: 'core', file: DECLARATION, line: 1, needle: "cssSubpath: '@fixture/ds/quiet'" },
        ],
        reason: 'the application configuration requires it',
        receiver: null,
      },
    ],
  };
}

/**
 * A package under the class law: one module per class with the reader that
 * proves it, one door per admission route (import by config, import by
 * test, attribution, `lab`, `retire-by`), a gate manifest, a contract table
 * and a registry with open and closed work orders.
 */
function buildLawFixture() {
  const tmp = mkdtempSync(join(tmpdir(), 'consumer-census-law-'));
  const pkg = join(tmp, 'pkg');
  const app = join(tmp, 'app');
  const door = (name) => ({ import: `./dist/${name}/index.js` });
  plant(pkg, 'package.json', `${JSON.stringify({
    name: '@fixture/ds',
    version: '0.0.0',
    files: ['dist/**/*.js'],
    exports: {
      '.': { import: './dist/index.js' },
      './config-only': door('config-only'),
      './test-req': door('test-req'),
      './quiet': door('quiet'),
      './lab-door': door('lab-door'),
      './retiring': door('retiring'),
    },
  }, null, 2)}\n`);
  plant(pkg, 'src/index.ts', 'export const root = 1;\n');
  plant(pkg, 'src/config-only/index.ts', 'export const configOnly = 1;\n');
  plant(pkg, 'src/test-req/index.ts', 'export const testReq = 1;\n');
  plant(pkg, 'src/quiet/index.ts', "export { PACKS } from '../foundation/packs/manifest';\n");
  plant(pkg, DECLARATION, "export const PACKS = { quiet: { cssSubpath: '@fixture/ds/quiet' } };\n");
  plant(pkg, 'docs/mirror.md', '# mirror\n');
  plant(pkg, 'src/lab-door/index.ts', 'export const labDoor = 1;\n');
  plant(pkg, 'src/retiring/index.ts', 'export const retiring = 1;\n');
  plant(pkg, 'src/story-kit/index.tsx', 'export const kit = 1;\n');
  plant(pkg, STORY, "import { kit } from '../../story-kit';\nexport default { title: 'Card', kit };\n");
  plant(pkg, 'src/registry/index.ts', "export const FAMILIES = ['a'] as const;\n");
  plant(pkg, 'src/test-kit/index.ts', 'export const render = 1;\n');
  plant(pkg, KIT_TEST, "import { render } from '../../../test-kit';\nexport const probe = render;\n");
  plant(pkg, 'src/drift/parse/index.ts', 'export const parse = 1;\n');
  plant(pkg, 'src/drift/tests/index.test.ts', [
    "import { parse } from '../parse';",
    "const DOCUMENT_PATH = resolve(PACKAGE_ROOT, 'docs/mirror.md');",
    'export const probe = parse(DOCUMENT_PATH);',
    '',
  ].join('\n'));
  plant(pkg, LAB_DATA, 'export const data = 1;\n');
  plant(pkg, LAB_TEST, "import { data } from '..';\nexport const probe = data;\n");
  for (const seed of [
    'src/foundation/tokens/css/facade/entrypoints/base/index.css',
    'src/foundation/tokens/css/runtime/engines/frozen/index.css',
    'src/foundation/tokens/css/runtime/engines/modern/compiled/index.css',
  ]) plant(pkg, seed, '/* build entry */\n');
  plant(pkg, 'scripts/gates/reader/index.mjs', [
    "const CONTRACT_ROOT = 'src/registry';",
    'export const REGISTRY_SOURCE = `${CONTRACT_ROOT}/index.ts`;',
    '',
  ].join('\n'));
  plant(pkg, 'scripts/gates/index.mjs', "import { REGISTRY_SOURCE } from './reader/index.mjs';\nexport const source = REGISTRY_SOURCE;\n");
  plant(pkg, 'scripts/gates/unwired/index.mjs', "export const REGISTRY_SOURCE = 'src/registry/index.ts';\n");
  plant(pkg, 'scripts/check/automation/gates/manifest/index.mjs', [
    'export const CI_GATES = [',
    "  { id: 'gate-drill', run: ['node', '--test', 'scripts/gates/unwired/index.mjs'], blocking: true },",
    "  { id: 'gate', run: ['node', 'scripts/gates/index.mjs'], blocking: true },",
    '];',
    '',
  ].join('\n'));
  plant(pkg, LAW_CONTRACT, contractTable(LAW_CONTRACT_ROWS));
  plant(pkg, LAW_ATTRIBUTIONS, `${JSON.stringify(lawAttributions(), null, 2)}\n`);

  plant(app, 'package.json', [
    '{',
    '  "name": "app",',
    '  "scripts": {',
    '    "check:quiet": "node scripts/honesty.mjs"',
    '  }',
    '}',
    '',
  ].join('\n'));
  plant(app, 'src/app.ts', "import { root } from '@fixture/ds';\nexport const a = root;\n");
  plant(app, 'eslint.config.mjs', "import { configOnly } from '@fixture/ds/config-only';\nexport default [configOnly];\n");
  plant(app, 'tests/unit.test.js', "const { testReq } = require('@fixture/ds/test-req');\nmodule.exports = testReq;\n");
  plant(app, 'scripts/honesty.mjs', [
    'const DS_PACKAGE = "@fixture/ds";',
    'const packageDirectory = resolve(appRoot, "node_modules", ...DS_PACKAGE.split("/"));',
    'export const contract = resolve(packageDirectory, "supplier-contract.json");',
    'export const hooks = join(appRoot, "node_modules/@fixture/ds/hooks-manifest.json");',
    'export const shipped = join(appRoot, "node_modules/@fixture/ds/dist/index.js");',
    '',
  ].join('\n'));

  const registry = join(tmp, 'registry.json');
  writeFileSync(registry, `${JSON.stringify({
    workOrders: [
      { id: 'WO-OPEN-01', status: 'todo' },
      { id: 'WO-OPEN-02', status: 'in-progress' },
      { id: 'WO-OPEN-03', status: 'todo' },
      { id: 'WO-DONE-01', status: 'done' },
    ],
  }, null, 2)}\n`);

  const baseline = join(tmp, 'baseline.json');
  const consumerRoots = [consumerApp('app', app)];
  const args = ['--package-root', pkg, '--consumer-apps', `app=${app}`, '--baseline', baseline, '--registry', registry];
  const attributionsPath = join(pkg, LAW_ATTRIBUTIONS);
  return {
    tmp,
    pkg,
    app,
    args,
    baseline,
    registry,
    consumerRoots,
    attributionsPath,
    check: (...extra) => gate(['--check', ...args, ...extra]),
    write: () => gate(['--write', ...args]),
    attribute: (mutate) => {
      const document = JSON.parse(readFileSync(attributionsPath, 'utf8'));
      mutate(document);
      writeFileSync(attributionsPath, `${JSON.stringify(document, null, 2)}\n`);
    },
    contract: (rows) => plant(pkg, LAW_CONTRACT, contractTable(rows)),
  };
}

/** Builds the fixture, pins its baseline, proves it green, then hands it to `drill`. */
function withLawFixture(drill) {
  const fixture = buildLawFixture();
  try {
    assert.equal(fixture.write().status, 0);
    const green = fixture.check();
    assert.equal(green.status, 0, `the unmutated law fixture must be green:\n${green.stderr}`);
    drill(fixture, green);
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
}

function assertRed(outcome, pattern) {
  assert.equal(outcome.status, 1, `expected a red gate:\n${outcome.stdout}`);
  assert.match(outcome.stderr, pattern);
}

test('class law P1: every class is proven by its reader and the tree is green', () => {
  withLawFixture((fixture, green) => {
    const spawned = cli(['--check', ...fixture.args]);
    assert.deepEqual([spawned.status, spawned.stdout.trim()], [green.status, green.stdout.trim()]);
    assert.equal(cli(['--check', ...fixture.args, '--assume-done=WO-OPEN-01']).status, 1);
    assert.match(green.stdout, /0 unreachable outside named classes; 5 module\(s\) in a proven class; 0 test-only outside classes; 1 door\(s\) attributed; 2 consumerless door\(s\) held by an open disposition/u);
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.deepEqual(measured.unreachableModules, ['src/registry/index.ts', 'src/story-kit/index.tsx']);
    const { findings, report } = auditClasses({
      measured,
      packageRoot: fixture.pkg,
      consumerRoots: fixture.consumerRoots,
      ...classLawOptions(['--registry', fixture.registry], fixture.pkg),
    });
    assert.deepEqual(findings, []);
    assert.deepEqual(report.moduleClasses.map((row) => [row.class, row.readers, row.discovered]), [
      ['story-support', 1, 1],
      ['tooling-path-read', 1, 1],
      ['test-support', 1, 1],
      ['drift-test-reader', 1, 1],
      ['lab-data', 1, 1],
    ]);
  });
});

test('class law: --write leaves the attribution document byte-identical', () => {
  withLawFixture((fixture) => {
    const before = readFileSync(fixture.attributionsPath);
    plant(fixture.pkg, 'src/orphan/index.ts', 'export const orphan = 1;\n');
    assert.equal(fixture.write().status, 0);
    assert.ok(before.equals(readFileSync(fixture.attributionsPath)), '--write must not rewrite the attributions');
    assert.deepEqual(Object.keys(JSON.parse(readFileSync(fixture.baseline, 'utf8'))).sort(), [
      'consumerlessSubpaths', 'exportsDigest', 'measured', 'policy', 'purpose', 'schemaVersion',
      'stylesUnreferenced', 'testOnlyModules', 'unreachableModules',
    ]);
  });
});

test('class law N1: a genuine orphan is red by name, and --write cannot launder it', () => {
  withLawFixture((fixture) => {
    plant(fixture.pkg, 'src/orphan/index.ts', 'export const orphan = 1;\n');
    assertRed(fixture.check(), /\[module-class\] unreachable module outside every named class: src\/orphan\/index\.ts/u);
    assert.equal(fixture.write().status, 0);
    const pinned = fixture.check();
    assertRed(pinned, /\[module-class\] unreachable module outside every named class: src\/orphan\/index\.ts/u);
    assert.doesNotMatch(pinned.stderr, /grew by/u);
    assert.match(pinned.stdout, /1 unreachable outside named classes/u);
  });
});

test('class law N2: a story that no longer imports the module voids the row', () => {
  withLawFixture((fixture) => {
    plant(fixture.pkg, STORY, "// import { kit } from '../../story-kit';\nexport default { title: 'Card' };\n");
    const outcome = fixture.check();
    assertRed(outcome, /\[module-class\] src\/story-kit\/index\.tsx: reader src\/widgets\/card\/Card\.stories\.tsx no longer imports src\/story-kit\/index\.tsx/u);
    assert.match(outcome.stderr, /unreachable module outside every named class: src\/story-kit\/index\.tsx/u);
  });
});

test('class law N3: a missing reader voids the row', () => {
  withLawFixture((fixture) => {
    rmSync(join(fixture.pkg, STORY));
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: reader src\/widgets\/card\/Card\.stories\.tsx no longer exists/u);
  });
});

test('class law N4: a class is proven only by its own kind of reader', () => {
  withLawFixture((fixture) => {
    plant(fixture.pkg, KIT_TEST, "import { render } from '../../../test-kit';\nimport { kit } from '../../../story-kit';\nexport const probe = [render, kit];\n");
    fixture.attribute((document) => {
      document.modules[0].readers = [{ file: KIT_TEST, kind: 'story-import' }];
    });
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: reader src\/widgets\/card\/tests\/card\.test\.ts is not a story file/u);
    fixture.attribute((document) => {
      document.modules[0].readers = [{ file: KIT_TEST, kind: 'test-import' }];
    });
    assertRed(fixture.check(), /declares kind "test-import"; this class is proven only by story-import/u);
    fixture.attribute((document) => {
      document.modules[0].readers = [{ file: STORY, kind: 'story-import' }];
      document.modules[2].readers = [{ file: 'src/index.ts', kind: 'test-import' }];
    });
    assertRed(fixture.check(), /src\/test-kit\/index\.ts: reader src\/index\.ts is not a test file/u);
  });
});

test('class law N5: a path read by a script no gate runs proves nothing', () => {
  withLawFixture((fixture) => {
    fixture.attribute((document) => {
      document.modules[1].readers = [{ file: 'scripts/gates/unwired/index.mjs', kind: 'path-read' }];
    });
    assertRed(fixture.check(), /src\/registry\/index\.ts: reader scripts\/gates\/unwired\/index\.mjs is not run by any gate-manifest entry/u);
    fixture.attribute((document) => {
      document.modules[1].readers = [{ file: 'scripts/gates/reader/index.mjs', kind: 'path-read' }];
    });
    assert.equal(fixture.check().status, 0);
    plant(fixture.pkg, 'scripts/gates/index.mjs', 'export const source = null;\n');
    assertRed(fixture.check(), /reader scripts\/gates\/reader\/index\.mjs is not run by any gate-manifest entry/u);
    plant(fixture.pkg, 'scripts/gates/index.mjs', "import './reader/index.mjs';\n");
    plant(fixture.pkg, 'scripts/gates/reader/index.mjs', "// reads src/registry/index.ts\nexport const REGISTRY_SOURCE = 'src/elsewhere/index.ts';\n");
    assertRed(fixture.check(), /reader scripts\/gates\/reader\/index\.mjs no longer names src\/registry\/index\.ts in a string/u);
  });
});

test('class law N6: a row for a reachable module is stale', () => {
  withLawFixture((fixture) => {
    plant(fixture.pkg, 'src/index.ts', "export { kit } from './story-kit';\nexport const root = 1;\n");
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: the module is reachable from an export entrypoint: the row is stale/u);
  });
});

test('class law N7: a receiver that is done, assumed done or unknown voids the row', () => {
  withLawFixture((fixture) => {
    assertRed(fixture.check('--assume-done=WO-OPEN-02'), /src\/foundation\/presets\/candidates\/acme\/index\.ts: receiver "WO-OPEN-02" is assumed done \(--assume-done\)/u);
    fixture.attribute((document) => {
      document.modules[0].receiver = 'WO-DONE-01';
    });
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: receiver "WO-DONE-01" is done/u);
    fixture.attribute((document) => {
      document.modules[0].receiver = 'WO-NONE-99';
    });
    assertRed(fixture.check(), /receiver "WO-NONE-99" is not in the roadmap registry/u);
    fixture.attribute((document) => {
      document.modules[0].receiver = null;
    });
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: receiver null is not a work-order id/u);
    fixture.attribute((document) => {
      document.modules[0].receiver = 'WO-OPEN-01';
      document.modules[3].receiver = 'WO-OPEN-01';
    });
    assertRed(fixture.check(), /src\/drift\/parse\/index\.ts: a drift-test-reader row carries receiver null and an owner test/u);
  });
});

test('class law P2: a module retired together with its row stays green', () => {
  withLawFixture((fixture) => {
    rmSync(join(fixture.pkg, 'src/story-kit'), { recursive: true });
    plant(fixture.pkg, STORY, "export default { title: 'Card' };\n");
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: the module no longer exists: delete the row with it/u);
    fixture.attribute((document) => {
      document.modules.shift();
    });
    const outcome = fixture.check();
    assert.equal(outcome.status, 0, outcome.stderr);
    assert.match(outcome.stdout, /ratchet opportunity — unreachableModules: 1 resolved/u);
  });
});

test('class law: an unattributed test-only module is owed to the residue receiver', () => {
  withLawFixture((fixture) => {
    plant(fixture.pkg, 'src/dead/index.ts', 'export const dead = 1;\n');
    plant(fixture.pkg, 'src/dead/tests/index.test.ts', "import { dead } from '..';\nexport const probe = dead;\n");
    assertRed(fixture.check(), /\[test-only-modules\] testOnlyModules grew by 1: src\/dead\/index\.ts/u);
    assert.equal(fixture.write().status, 0);
    const open = fixture.check();
    assert.equal(open.status, 0, open.stderr);
    assert.match(open.stdout, /1 test-only outside classes/u);
    assertRed(fixture.check('--assume-done=WO-OPEN-03'), /test-only module\(s\) outside every named class: src\/dead\/index\.ts — the residue receiver "WO-OPEN-03" is assumed done/u);
    fixture.attribute((document) => {
      delete document.residueReceiver;
    });
    assertRed(fixture.check(), /src\/dead\/index\.ts — the residue receiver null is not a work-order id/u);
  });
});

test('class law: schema refusals — glob, duplicate, unknown key, unknown class, missing document', () => {
  withLawFixture((fixture) => {
    fixture.attribute((document) => {
      document.modules.push({ ...document.modules[0] });
    });
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: duplicate row/u);
    fixture.attribute((document) => {
      document.modules.pop();
      document.modules[0].path = 'src/story-kit/*';
    });
    assertRed(fixture.check(), /path must be an exact relative path \(no glob\)/u);
    fixture.attribute((document) => {
      document.modules[0].path = 'src/story-kit/index.tsx';
      document.modules[0].note = 'x';
    });
    assertRed(fixture.check(), /src\/story-kit\/index\.tsx: unknown key\(s\): note/u);
    fixture.attribute((document) => {
      delete document.modules[0].note;
      document.modules[0].class = 'misc';
    });
    assertRed(fixture.check(), /class "misc" is not one of story-support, tooling-path-read, test-support, drift-test-reader, lab-data/u);
    rmSync(fixture.attributionsPath);
    assertRed(fixture.check('--attributions', fixture.attributionsPath), /\[attributions\] the attribution document is missing/u);
  });
});

test('door law P1/P2: a config import and a require() in tests are measured, by kind', () => {
  withLawFixture((fixture) => {
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.deepEqual(measured.perSubpathConsumerKinds['./config-only'], { app: ['config-import'] });
    assert.deepEqual(measured.perSubpathConsumerKinds['./test-req'], { app: ['test-import'] });
    assert.deepEqual(measured.perSubpathConsumerKinds['.'], { app: ['src-import'] });
    assert.deepEqual(measured.consumerlessSubpaths, ['./lab-door', './quiet', './retiring']);
    const report = cli(fixture.args);
    assert.equal(report.status, 0, report.stderr);
    assert.match(report.stdout, /\.\/config-only -> app \[config-import\]/u);
    assert.match(report.stdout, /\.\/lab-door — lab WO-OPEN-01/u);
    assert.match(report.stdout, /\.\/retiring — retire-by WO-OPEN-02/u);
    assert.match(report.stdout, /\.\/quiet — structural-admission, 3 evidence line\(s\) verified/u);
  });
});

function addStringyDoor(fixture) {
  const manifestPath = join(fixture.pkg, 'package.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.exports['./stringy'] = { import: './dist/stringy/index.js' };
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  plant(fixture.pkg, 'src/stringy/index.ts', 'export const stringy = 1;\n');
  fixture.contract([...LAW_CONTRACT_ROWS, ['./stringy', 'guaranteed']]);
}

test('door law N1: a door named only inside a string or a comment has no consumer', () => {
  withLawFixture((fixture) => {
    addStringyDoor(fixture);
    plant(fixture.app, 'next.config.ts', [
      "// import '@fixture/ds/stringy';",
      "export default { alias: { '@fixture/ds/stringy': 'x' }, note: '@fixture/ds/stringy' };",
      '',
    ].join('\n'));
    assert.equal(fixture.write().status, 0);
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.ok(measured.consumerlessSubpaths.includes('./stringy'));
    assertRed(fixture.check(), /\[door-disposition\] \.\/stringy: guaranteed, yet no import consumer and no verified attribution/u);
    plant(fixture.app, 'next.config.ts', "import '@fixture/ds/stringy';\nexport default {};\n");
    assert.equal(fixture.check().status, 0);
  });
});

test('door law N2: a guaranteed consumerless door with no attribution is red by name', () => {
  withLawFixture((fixture) => {
    fixture.attribute((document) => {
      document.doors = [];
    });
    assertRed(fixture.check(), /\[door-disposition\] \.\/quiet: guaranteed, yet no import consumer and no verified attribution/u);
    fixture.contract(LAW_CONTRACT_ROWS.filter(([subpath]) => subpath !== './quiet'));
    assertRed(fixture.check(), /\.\/quiet: no import consumer, no verified attribution and no row in the consumer contract/u);
  });
});

test('door law N3: evidence under the package scripts tree is refused', () => {
  withLawFixture((fixture) => {
    fixture.attribute((document) => {
      document.doors[0].evidence = [{ root: 'core', file: 'scripts/gates/reader/index.mjs', line: 1, needle: "CONTRACT_ROOT = 'src/registry'" }];
    });
    const outcome = fixture.check();
    assertRed(outcome, /\[door-attribution\] \.\/quiet: evidence core:scripts\/gates\/reader\/index\.mjs:1 — evidence under the package's own scripts\/ is refused/u);
    assert.match(outcome.stderr, /\.\/quiet: guaranteed, yet no import consumer and no verified attribution/u);
    fixture.attribute((document) => {
      document.doors[0].evidence = [{ root: 'core', file: KIT_TEST, line: 1, needle: "import { render } from '../../../test-kit'" }];
    });
    assertRed(fixture.check(), /package evidence is admitted only from a manifest\/ or roster\/ index module under src\/foundation\//u);
    fixture.attribute((document) => {
      document.doors[0].evidence = [{ root: 'elsewhere', file: 'package.json', line: 1, needle: 'anything at all' }];
    });
    assertRed(fixture.check(), /root must be "core" or a consumer root \(app\)/u);
  });
});

test('door law N4: a retire-by or lab disposition must name an open work order', () => {
  withLawFixture((fixture) => {
    assertRed(fixture.check('--assume-done=WO-OPEN-02'), /\[door-disposition\] \.\/retiring: retire-by "WO-OPEN-02" is assumed done \(--assume-done\)/u);
    assertRed(fixture.check('--assume-done', 'WO-OPEN-01'), /\[door-disposition\] \.\/lab-door: lab "WO-OPEN-01" is assumed done/u);
    const rows = (changes) => LAW_CONTRACT_ROWS.map((row) => changes[row[0]] ?? row);
    fixture.contract(rows({ './retiring': ['./retiring', 'retire-by', 'WO-DONE-01'] }));
    assertRed(fixture.check(), /\.\/retiring: retire-by "WO-DONE-01" is done — a disposition must name an open work order/u);
    fixture.contract(rows({ './lab-door': ['./lab-door', 'lab', 'WO-DONE-01'] }));
    assertRed(fixture.check(), /\.\/lab-door: lab "WO-DONE-01" is done/u);
    fixture.contract(rows({ './lab-door': ['./lab-door', 'lab'] }));
    assertRed(fixture.check(), /\.\/lab-door: lab "—" is not a work-order id/u);
    fixture.contract(rows({ './lab-door': ['./lab-door', 'experimental', 'WO-OPEN-01'] }));
    assertRed(fixture.check(), /\.\/lab-door: disposition "experimental" is not one of guaranteed, retire-by, lab/u);
    // A consumed door is held to the same rule: a closed work order adjudicates nothing.
    fixture.contract(rows({ './config-only': ['./config-only', 'retire-by', 'WO-DONE-01'] }));
    assertRed(fixture.check(), /\.\/config-only: retire-by "WO-DONE-01" is done/u);
    rmSync(fixture.registry);
    fixture.contract(LAW_CONTRACT_ROWS);
    assertRed(fixture.check(), /\[registry\] the roadmap registry is missing/u);
  });
});

test('door law N5: evidence whose file, line or needle is gone voids the attribution', () => {
  withLawFixture((fixture) => {
    const manifestPath = join(fixture.app, 'package.json');
    const original = readFileSync(manifestPath, 'utf8');
    writeFileSync(manifestPath, original.replace('node scripts/honesty.mjs', 'echo skipped'));
    const gone = fixture.check();
    assertRed(gone, /\[door-attribution\] \.\/quiet: evidence app:package\.json:4 — the line no longer carries .* \(it is gone from the file\)/u);
    assert.match(gone.stderr, /\.\/quiet: guaranteed, yet no import consumer and no verified attribution/u);

    writeFileSync(manifestPath, original.replace('  "scripts": {', '  "private": true,\n  "scripts": {'));
    assertRed(fixture.check(), /evidence app:package\.json:4 — the line no longer carries .* \(it now reads on line 5; re-cite it\)/u);

    writeFileSync(manifestPath, '{}\n');
    assertRed(fixture.check(), /evidence app:package\.json:4 — the evidence line no longer exists \(the file has 2 lines\)/u);

    rmSync(manifestPath);
    assertRed(fixture.check(), /evidence app:package\.json:4 — the evidence file no longer exists/u);
    writeFileSync(manifestPath, original);
    assert.equal(fixture.check().status, 0);

    const script = join(fixture.app, 'scripts/honesty.mjs');
    writeFileSync(script, readFileSync(script, 'utf8').replace('export const contract = resolve', '// export const contract = resolve'));
    assertRed(fixture.check(), /evidence app:scripts\/honesty\.mjs:3 — the needle sits inside a comment, which certifies nothing/u);
  });
});

test('door law: an attribution for a measured or unpublished door is stale', () => {
  withLawFixture((fixture) => {
    plant(fixture.app, 'src/quiet.ts', "import '@fixture/ds/quiet';\n");
    assertRed(fixture.check(), /\[door-attribution\] \.\/quiet: the door has a measured import consumer \(app\): an attribution is only for what cannot be measured/u);
    rmSync(join(fixture.app, 'src/quiet.ts'));
    fixture.attribute((document) => {
      document.doors.push({ ...document.doors[0], subpath: './gone' });
    });
    assertRed(fixture.check(), /\.\/gone: the subpath is not published: delete the row with the door/u);
    fixture.attribute((document) => {
      document.doors.pop();
      document.doors[0].class = 'bin';
    });
    assertRed(fixture.check(), /\.\/quiet: class "bin" is not one of structural-admission, resource-boundary/u);
    fixture.attribute((document) => {
      document.doors[0].class = 'resource-boundary';
      document.doors[0].receiver = 'WO-DONE-01';
    });
    assertRed(fixture.check(), /\.\/quiet: receiver "WO-DONE-01" is done/u);
  });
});

test('door law N6: reads of the installed package by path are reported, never counted', () => {
  withLawFixture((fixture) => {
    const measured = measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots });
    assert.deepEqual(measured.installedPathReads, [
      { root: 'app', file: 'scripts/honesty.mjs', line: 3, path: 'supplier-contract.json', breaksOnUpgrade: true },
      { root: 'app', file: 'scripts/honesty.mjs', line: 4, path: 'hooks-manifest.json', breaksOnUpgrade: true },
      { root: 'app', file: 'scripts/honesty.mjs', line: 5, path: 'dist/index.js', breaksOnUpgrade: false },
    ]);
    assert.ok(measured.consumerlessSubpaths.includes('./quiet'), 'a path read is not an import');
    const report = cli(fixture.args);
    assert.match(report.stdout, /installed-path reads — 3 \(2 name a path the package no longer ships\)/u);
    assert.match(report.stdout, /app:scripts\/honesty\.mjs:3 supplier-contract\.json — breaksOnUpgrade/u);
    // The same literal in a file that never names the package is not a read of it.
    plant(fixture.app, 'scripts/other.mjs', 'export const local = resolve(here, "supplier-contract.json");\n');
    assert.equal(measure({ packageRoot: fixture.pkg, consumerRoots: fixture.consumerRoots }).installedPathReads.length, 3);
  });
});

test('class law scope: a package root with no attribution document says the law is not applied', () => {
  const fixture = buildFixture();
  try {
    const outcome = cli(['--package-root', fixture.pkg, '--consumers', consumersFlag(fixture.consumerRoots)]);
    assert.equal(outcome.status, 0, outcome.stderr);
    assert.match(outcome.stdout, /named classes — NOT APPLIED/u);
    assert.equal(classLawOptions([], fixture.pkg).active, false);
    assert.equal(classLawOptions([], resolve(HERE, '../../../..')).active, true);
  } finally {
    rmSync(fixture.tmp, { recursive: true, force: true });
  }
});

test('class law: relabelling test support as a drift reader or as lab data is red', () => {
  withLawFixture((fixture) => {
    // The attack: drop the receiver by calling a harness a drift reader owned by its own test.
    fixture.attribute((document) => {
      Object.assign(document.modules[2], { class: 'drift-test-reader', receiver: null, owner: KIT_TEST, document: 'docs/mirror.md' });
    });
    assertRed(fixture.check(), /src\/test-kit\/index\.ts: owner src\/widgets\/card\/tests\/card\.test\.ts is not the tests\/index\.test\.\* beside a contract\/ or parse\/ folder of the module \(the module sits in neither\): this is test support and owes a receiver/u);

    // A module that does sit in a parse/ folder still needs the document its test re-derives.
    fixture.attribute((document) => {
      Object.assign(document.modules[2], { class: 'test-support', receiver: 'WO-OPEN-01' });
      delete document.modules[2].owner;
      delete document.modules[2].document;
      delete document.modules[3].document;
    });
    assertRed(fixture.check(), /src\/drift\/parse\/index\.ts: document undefined must name the existing document the owner test re-derives/u);
    fixture.attribute((document) => {
      document.modules[3].document = 'package.json';
    });
    assertRed(fixture.check(), /src\/drift\/parse\/index\.ts: owner src\/drift\/tests\/index\.test\.ts does not read package\.json: no string in the test names it/u);
    fixture.attribute((document) => {
      document.modules[3].document = 'docs/mirror.md';
    });
    assert.equal(fixture.check().status, 0);
    plant(fixture.pkg, 'src/drift/tests/index.test.ts', "import { parse } from '../parse';\n// docs/mirror.md\nexport const probe = parse;\n");
    assertRed(fixture.check(), /does not read docs\/mirror\.md: no string in the test names it/u);

    // The other attack: move a receiver to a friendlier work order by calling the harness lab data.
    plant(fixture.pkg, 'src/drift/tests/index.test.ts', "import { parse } from '../parse';\nexport const probe = parse('docs/mirror.md');\n");
    fixture.attribute((document) => {
      document.modules[2].class = 'lab-data';
    });
    assertRed(fixture.check(), /src\/test-kit\/index\.ts: class lab-data names a module under src\/foundation\/presets\/candidates\/, and this one is not/u);
    fixture.attribute((document) => {
      document.modules[2].class = 'test-support';
      document.modules[2].document = 'docs/mirror.md';
    });
    assertRed(fixture.check(), /src\/test-kit\/index\.ts: owner and document belong to drift-test-reader rows only/u);
  });
});

test('door law: a literal planted in src does not admit a door', () => {
  withLawFixture((fixture) => {
    addStringyDoor(fixture);
    assert.equal(fixture.write().status, 0);
    const attribute = (file, needle) => fixture.attribute((document) => {
      document.doors.push({
        subpath: './stringy',
        class: 'structural-admission',
        evidence: [{ root: 'core', file, line: 1, needle }],
        reason: 'planted',
        receiver: null,
      });
    });
    const withdraw = () => fixture.attribute((document) => {
      document.doors.pop();
    });

    // Anywhere in authored src: refused by location.
    plant(fixture.pkg, 'src/stringy/index.ts', "export const x = '@fixture/ds/stringy';\n");
    attribute('src/stringy/index.ts', "export const x = '@fixture/ds/stringy'");
    const planted = fixture.check();
    assertRed(planted, /\.\/stringy: evidence core:src\/stringy\/index\.ts:1 — package evidence is admitted only from a manifest\/ or roster\/ index module under src\/foundation\//u);
    assert.match(planted.stderr, /\.\/stringy: guaranteed, yet no import consumer and no verified attribution/u);
    withdraw();

    // A manifest-shaped module nothing imports exists only to carry the literal.
    plant(fixture.pkg, 'src/foundation/decoy/manifest/index.ts', "export const x = '@fixture/ds/stringy';\n");
    attribute('src/foundation/decoy/manifest/index.ts', "export const x = '@fixture/ds/stringy'");
    assertRed(fixture.check(), /\.\/stringy: evidence core:src\/foundation\/decoy\/manifest\/index\.ts:1 — the declaring module is not reachable from an export entrypoint/u);
    withdraw();
    rmSync(join(fixture.pkg, 'src/foundation/decoy'), { recursive: true });

    // A real manifest line that does not name this door's specifier declares another door.
    attribute(DECLARATION, "cssSubpath: '@fixture/ds/quiet'");
    assertRed(fixture.check(), /\.\/stringy: no package evidence names the door's specifier @fixture\/ds\/stringy/u);
    withdraw();

    // The same door declared in the reachable manifest is admitted.
    plant(fixture.pkg, DECLARATION, "export const PACKS = { quiet: { cssSubpath: '@fixture/ds/quiet' }, stringy: { cssSubpath: '@fixture/ds/stringy' } };\n");
    attribute(DECLARATION, "cssSubpath: '@fixture/ds/stringy'");
    const admitted = fixture.check();
    assert.equal(admitted.status, 0, admitted.stderr);
  });
});

test('class law scope: the live package refuses a substituted document, contract, registry or manifest', () => {
  const scratch = mkdtempSync(join(tmpdir(), 'consumer-census-substitute-'));
  try {
    const permissive = join(scratch, 'attributions.json');
    writeFileSync(permissive, `${JSON.stringify({ schemaVersion: 1, modules: [], doors: [] })}\n`);
    for (const flag of ['attributions', 'contract', 'registry', 'gate-manifest']) {
      for (const mode of [[], ['--check'], ['--write', '--baseline', join(scratch, 'baseline.json')]]) {
        const outcome = gate([...mode, `--${flag}=${permissive}`]);
        assert.equal(outcome.status, 1, `--${flag} must be refused on the live root in mode ${mode[0] ?? 'report'}`);
        assert.match(outcome.stderr, new RegExp(`--${flag} cannot replace the authorities of this package`, 'u'));
      }
    }
    assert.equal(existsSync(join(scratch, 'baseline.json')), false);
    assert.deepEqual(classLawOptions(['--attributions', permissive], resolve(HERE, '../../../..')).substituted, ['attributions']);
    assert.deepEqual(classLawOptions(['--attributions', permissive], scratch).substituted, []);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

const missingLiveRoots = DEFAULT_CONSUMER_ROOTS.filter((root) => !existsSync(root.root));

test('live tree: every attribution row is proven and the attribution document survives a --write', { skip: missingLiveRoots.length > 0 ? `required consumer root(s) absent in this environment: ${missingLiveRoots.map((root) => root.id).join(', ')}` : false }, () => {
  const packageRoot = resolve(HERE, '../../../..');
  const measured = measure();
  const { findings, report } = auditClasses({
    measured,
    packageRoot,
    consumerRoots: DEFAULT_CONSUMER_ROOTS,
    ...classLawOptions([], packageRoot),
  });
  const rowFindings = findings.filter((finding) => finding.leg === 'module-class' || finding.leg === 'door-attribution'
    || finding.leg === 'attributions' || finding.leg === 'registry' || finding.leg === 'contract');
  assert.deepEqual(rowFindings, []);
  assert.deepEqual(measured.unreachableModules.filter((path) => !report.moduleClasses.some((row) => row.path === path)), []);
  const document = JSON.parse(readFileSync(resolve(HERE, '../attributions/index.json'), 'utf8'));
  assert.equal(report.moduleClasses.length, document.modules.length);
  assert.equal(report.doorAttributions.length, document.doors.length);

  const scratch = mkdtempSync(join(tmpdir(), 'consumer-census-live-'));
  try {
    const before = readFileSync(resolve(HERE, '../attributions/index.json'));
    assert.equal(cli(['--write', '--baseline', join(scratch, 'baseline.json')]).status, 0);
    assert.ok(before.equals(readFileSync(resolve(HERE, '../attributions/index.json'))));
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});

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

  // Stylesheet and resolve-based consumption is measured: the vertical skins
  // load through CSS @import and the platform CSS through the wildcard.
  assert.ok(measured.perSubpathConsumers['./styles/bithire'].includes('app-bithire'), `./styles/bithire consumers: ${measured.perSubpathConsumers['./styles/bithire']}`);
  assert.ok(measured.perSubpathConsumers['./styles/evnto'].includes('app-evnto'), `./styles/evnto consumers: ${measured.perSubpathConsumers['./styles/evnto']}`);
  assert.ok(measured.perSubpathConsumers['./dist/*.css'].includes('app-platform'), `./dist/*.css consumers: ${measured.perSubpathConsumers['./dist/*.css']}`);

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
