import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CLASSES, runCodemods } from '../index.mjs';
import { FIXTURES, loadFixtureCases, rowsOf, runCase, snapshot, workingCopy } from './harness/index.mjs';

const CASES = loadFixtureCases();
const UNTOUCHED = new Set(['homonym', 'lookalike']);

test('every change class ships fixtures, and every class has a homonym case', () => {
  for (const className of CLASSES) {
    const cases = CASES.filter((fixture) => fixture.className === className).map((fixture) => fixture.caseName);
    assert.ok(cases.length > 0, `${className} has no fixture under ${FIXTURES}`);
    assert.ok(cases.includes('homonym'), `${className} has no homonym fixture`);
  }
});

for (const fixture of CASES) {
  test(`${fixture.name}: dry-run writes nothing and reports the expected findings`, () => {
    const work = workingCopy(fixture);
    try {
      const before = snapshot(work);
      const { result, rows } = runCase(fixture, work);
      assert.equal(result.mode, 'dry-run');
      assert.deepEqual(snapshot(work), before);
      assert.deepEqual(rows, JSON.parse(fs.readFileSync(fixture.report, 'utf8')));
    } finally {
      fs.rmSync(work, { recursive: true, force: true });
    }
  });

  test(`${fixture.name}: --write produces the expected tree and a second run is byte-identical`, () => {
    const work = workingCopy(fixture);
    try {
      const planned = runCase(fixture, work).rows.filter((row) => row.action === 'rewrite');
      const first = runCase(fixture, work, { write: true });
      const written = snapshot(work);
      assert.deepEqual(written, snapshot(fixture.expected));
      assert.deepEqual(first.rows.filter((row) => row.action === 'rewrite'), planned);
      const second = runCase(fixture, work, { write: true });
      assert.deepEqual(snapshot(work), written);
      assert.equal(second.result.summary.totals.rewrite, 0);
      assert.equal(second.result.summary.files.changed, 0);
    } finally {
      fs.rmSync(work, { recursive: true, force: true });
    }
  });

  if (UNTOUCHED.has(fixture.caseName)) {
    test(`${fixture.name}: nothing that is not the design system is edited or reported`, () => {
      assert.deepEqual(snapshot(fixture.expected), snapshot(fixture.input));
      assert.deepEqual(JSON.parse(fs.readFileSync(fixture.report, 'utf8')), []);
    });
  }
}

test('report-only classes never plan a rewrite, whatever the fixture', () => {
  for (const fixture of CASES) {
    if (!['css-class-renamed', 'css-custom-property-renamed', 'glyph-removed', 'member-changed',
      'symbol-removed-no-replacement', 'resolver'].includes(fixture.className)) continue;
    assert.deepEqual(snapshot(fixture.expected), snapshot(fixture.input), fixture.name);
    const rows = JSON.parse(fs.readFileSync(fixture.report, 'utf8'));
    assert.ok(rows.every((row) => row.action === 'report'), fixture.name);
  }
});

test('unproven usages are reported and left byte-identical', () => {
  for (const fixture of CASES.filter((item) => item.caseName === 'unproven' || item.caseName === 'wrapper')) {
    assert.deepEqual(snapshot(fixture.expected), snapshot(fixture.input), fixture.name);
    const rows = JSON.parse(fs.readFileSync(fixture.report, 'utf8'));
    assert.ok(rows.length > 0 && rows.every((row) => row.action === 'report'), fixture.name);
  }
});

function reportOf(name) {
  return JSON.parse(fs.readFileSync(CASES.find((item) => item.name === name).report, 'utf8'));
}

test('a stylesheet that imports a retired or unpublished door is reported, never skipped', () => {
  const rows = reportOf('subpath-removed/stylesheet').filter((row) => row.file === 'globals.css');
  assert.deepEqual(rows.map((row) => [row.line, row.id, row.reason]), [
    [2, 'subpath-removed/./dist/platform.css#*', 'stylesheet-import'],
    [4, 'subpath-removed/./tokens/legacy.css#*', 'unmapped-unpublished-subpath'],
  ]);
});

test('a replacement name that a consumer barrel shadows is reported, not bound to the local homonym', () => {
  const fixture = CASES.find((item) => item.name === 'symbol-removed/shadowed');
  const rows = reportOf(fixture.name).filter((row) => row.id === 'symbol-removed/.#BrandTheme');
  assert.deepEqual(rows.map((row) => [row.action, row.reason]), [['report', 'replacement-shadowed'], ['report', 'replacement-shadowed']]);
  assert.match(snapshot(fixture.expected)['index.ts'], /import \{ BrandTheme, serializeFlatTheme \} from '\.\/barrel';/);
});

test('a retired name never verifies a re-point: a glyph the target door dropped blocks the move', () => {
  const rows = reportOf('subpath-removed/chained').filter((row) => row.id === 'subpath-removed/./icons/full#*');
  assert.deepEqual(rows.map((row) => [row.action, row.reason]), [['report', 'not-exported-at-target']]);
});

test('the package name mapped to a local folder is consumer code: reported once, nothing edited', () => {
  const fixture = CASES.find((item) => item.name === 'resolver/aliased');
  assert.deepEqual(reportOf(fixture.name).map((row) => [row.id, row.reason]), [['resolver/.#PackageAlias', 'package-aliased-locally']]);
  assert.deepEqual(snapshot(fixture.expected), snapshot(fixture.input));
});

test('an unresolvable consumer specifier is reported once per file; assets and bare packages are not', () => {
  assert.deepEqual(reportOf('resolver/unresolved').map((row) => [row.line, row.reason]), [[1, 'unresolved-specifier']]);
});

test('only operand-root build folders are skipped: a nested `coverage` source folder is scanned', () => {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'codemods-tree-')));
  const source = "import { TooltipValue } from '@rottay/design-system';\n\nexport const node = <TooltipValue color=\"red\" />;\n";
  const files = ['permissions/coverage/index.tsx', 'features/dist/index.tsx', 'dist/index.tsx', 'coverage/index.tsx',
    'features/node_modules/kit/index.tsx'];
  try {
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      fs.writeFileSync(path.join(root, file), source);
    }
    const result = runCodemods({ operands: [root], cwd: root, write: true });
    assert.deepEqual(rowsOf(result, root).map((row) => row.file), ['features/dist/index.tsx', 'permissions/coverage/index.tsx']);
    const after = snapshot(root);
    assert.match(after['permissions/coverage/index.tsx'], /swatchColor="red"/);
    for (const skipped of ['dist/index.tsx', 'coverage/index.tsx', 'features/node_modules/kit/index.tsx']) {
      assert.equal(after[skipped], source, skipped);
    }
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('a physical to logical side is rewritten only under --assume-ltr', () => {
  const fixture = CASES.find((item) => item.name === 'union-member-removed/direct');
  const work = workingCopy(fixture);
  try {
    const guarded = runCase(fixture, work).rows.filter((row) => row.id.endsWith('TooltipPlacement.left'));
    assert.deepEqual(guarded.map((row) => [row.action, row.reason]), [['report', 'direction-semantics']]);
    const assumed = runCase(fixture, work, { write: true, assumeLtr: true });
    const row = assumed.rows.find((item) => item.id.endsWith('TooltipPlacement.left'));
    assert.deepEqual([row.action, row.reason], ['rewrite', 'literal-rewritten']);
    assert.match(snapshot(work)['index.tsx'], /<Tooltip placement="inline-start" title="f">/);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
});

test('--class and --only limit the plan to the named class or entry', () => {
  const fixture = CASES.find((item) => item.name === 'subpath-removed/chained');
  const work = workingCopy(fixture);
  try {
    const byClass = runCase(fixture, work, { classes: ['glyph-removed'] }).rows;
    assert.deepEqual(byClass, []);
    const only = runCase(fixture, work, { only: ['subpath-removed/./primitives/tag#*'] }).rows;
    assert.deepEqual(only.map((row) => [row.id, row.action]), [['subpath-removed/./primitives/tag#*', 'rewrite']]);
  } finally {
    fs.rmSync(work, { recursive: true, force: true });
  }
});
