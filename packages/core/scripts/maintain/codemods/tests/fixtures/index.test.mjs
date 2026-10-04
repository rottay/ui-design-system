import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { packageRoot } from '../../../../libraries/repo-root/index.mjs';
import { CLASSES, runCodemods } from '../../index.mjs';
import { createPackageSurface } from '../../resolve/surface/index.mjs';
import { FIXTURES, KIT_ROOT, loadFixtureCases, rowsOf, runCase, snapshot, workingCopy } from '../harness/index.mjs';

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
  const rows = reportOf('subpath-removed/stylesheet').filter((row) => row.file === 'globals/index.css');
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

function withTree(files, body) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'codemods-map-')));
  try {
    for (const [file, text] of Object.entries(files)) fs.writeFileSync(path.join(root, file), text);
    const run = (options = {}) => {
      const result = runCodemods({ operands: [root], cwd: root, surface: createPackageSurface(packageRoot(KIT_ROOT)), ...options });
      return { result, rows: rowsOf(result, root) };
    };
    body(run, () => snapshot(root));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const REWRITE_CAPABLE = ['prop-renamed', 'prop-removed', 'union-member-removed', 'symbol-removed', 'subpath-removed'];

test('`mode: "report-only"` is law in every class that can rewrite: --write reports the site and edits nothing', () => {
  for (const className of REWRITE_CAPABLE) {
    const fixture = CASES.find((item) => item.name === `${className}/report-only`);
    assert.ok(fixture, `${className} has no report-only fixture`);
    assert.deepEqual(snapshot(fixture.expected), snapshot(fixture.input), fixture.name);
    const work = workingCopy(fixture);
    try {
      const { rows } = runCase(fixture, work, { write: true });
      assert.deepEqual(snapshot(work), snapshot(fixture.input), fixture.name);
      assert.ok(rows.length > 0 && rows.every((row) => row.action === 'report' && row.reason === 'report-only'), fixture.name);
    } finally {
      fs.rmSync(work, { recursive: true, force: true });
    }
  }
});

test('the 3.0 entries that need a decision per site are reported at the attribute and never written', () => {
  const source = "import { BarChart, ChartScaffold, CountUp, FadeIn, ScrollReveal } from '@rottay/design-system';\n\n"
    + 'export const nodes = (\n  <>\n    <FadeIn duration={0.32} delay={80}>x</FadeIn>\n    <CountUp value={3} duration="2" />\n'
    + '    <ScrollReveal duration={0.5}>x</ScrollReveal>\n    <ChartScaffold loading />\n    <BarChart loading data={[]} />\n  </>\n);\n';
  withTree({ 'index.tsx': source }, (run, read) => {
    const { rows } = run({ write: true });
    assert.deepEqual(rows.map((row) => [row.line, row.action, row.id, row.reason]), [
      [7, 'rewrite', 'prop-removed/.#ScrollRevealProps.duration', 'attribute-deleted'],
      [8, 'report', 'prop-removed/.#ChartScaffoldProps.loading', 'report-only'],
      [5, 'report', 'prop-renamed/.#BaseMotionProps.duration', 'report-only'],
      [5, 'report', 'prop-renamed/.#BaseMotionProps.delay', 'report-only'],
      [6, 'report', 'prop-renamed/.#CountUpProps.duration', 'report-only'],
    ]);
    assert.equal(read()['index.tsx'], source.replace('<ScrollReveal duration={0.5}>', '<ScrollReveal>'));
  });
});

test('an inline object-literal spread that cannot carry the prop is silent in every prop class; one that can is reported', () => {
  const source = "import { PatternGridView, TooltipValue } from '@rottay/design-system';\n\n"
    + 'export const nodes = (props: { color: string }) => (\n  <>\n'
    + "    <PatternGridView {...({ id: 'a' } as any)} />\n    <PatternGridView {...{ columns: 2 }} />\n"
    + "    <TooltipValue {...{ label: 'a', value: '1' }} />\n    <TooltipValue {...({ color: 'red' })} label=\"b\" value=\"2\" />\n"
    + '    <TooltipValue {...props} label="c" value="3" />\n  </>\n);\n';
  withTree({ 'index.tsx': source }, (run, read) => {
    const { rows } = run({ write: true });
    assert.deepEqual(rows.map((row) => [row.line, row.action, row.id, row.reason]), [
      [6, 'report', 'prop-removed/.#GridViewProps.columns', 'spread'],
      [8, 'report', 'prop-renamed/.#TooltipValue.color', 'spread'],
      [9, 'report', 'prop-renamed/.#TooltipValue.color', 'spread'],
    ]);
    assert.equal(read()['index.tsx'], source);
  });
});

test('a literal spread that states the successor of a renamed prop is reported where the prop is renamed, and silent elsewhere', () => {
  const source = "import { TooltipValue } from '@rottay/design-system';\n\n"
    + 'export const nodes = (\n  <>\n'
    + "    <TooltipValue {...{ swatchColor: 'blue' }} color=\"red\" label=\"a\" value=\"1\" />\n"
    + "    <TooltipValue {...{ swatchColor: 'blue' }} label=\"b\" value=\"2\" />\n"
    + "    <TooltipValue {...{ label: 'c' }} color=\"red\" value=\"3\" />\n  </>\n);\n";
  withTree({ 'index.tsx': source }, (run) => {
    const { rows } = run();
    assert.deepEqual(rows.map((row) => [row.line, row.action, row.id, row.reason]), [
      [5, 'rewrite', 'prop-renamed/.#TooltipValue.color', 'attribute-renamed'],
      [7, 'rewrite', 'prop-renamed/.#TooltipValue.color', 'attribute-renamed'],
      [5, 'report', 'prop-renamed/.#TooltipValue.color', 'spread'],
    ]);
  });
});

test('a name retired on a removed door moves to its recorded successor under its local name, never to a root homonym', () => {
  const fixture = CASES.find((item) => item.name === 'subpath-removed/cross-door');
  const expected = snapshot(fixture.expected);
  assert.match(expected['combined/index.tsx'],
    /^import \{ TreeViewConnector as TreeView, type TreeViewConnectorNode as TreeNode, type TreeViewConnectorProps as TreeViewProps \} from '@rottay\/design-system';$/m);
  assert.match(expected['lone-node/index.ts'], /^import type \{ TreeViewConnectorNode as TreeNode \} from '@rottay\/design-system';$/m);
  assert.match(expected['lone-props/index.ts'], /^import \{ type TreeViewConnectorProps as Props \} from '@rottay\/design-system';$/m);
  assert.match(expected['lone-props/index.ts'], /^export \{ TreeViewConnectorProps as TreeViewProps \} from '@rottay\/design-system';$/m);
  assert.match(expected['control/index.tsx'], /^import \{ AsciiFrame, type AsciiFrameProps \} from '@rottay\/design-system';$/m);
  assert.equal(expected['held/index.tsx'], snapshot(fixture.input)['held/index.tsx']);
  const held = reportOf(fixture.name).filter((row) => row.file === 'held/index.tsx' && row.id === 'subpath-removed/./commercial#*');
  assert.deepEqual(held.map((row) => [row.line, row.action, row.reason]),
    [[1, 'report', 'retired-on-door'], [2, 'report', 'not-exported-at-target'], [3, 'report', 'not-exported-at-target']]);
});

test('the 3.0 map moves the commercial tree import to the connector names, and a second run is a no-op', () => {
  const files = {
    'combined.tsx': "import { TreeView, type TreeNode, type TreeViewProps } from '@rottay/design-system/commercial';\n\n"
      + 'export const node: TreeNode = { label: \'a\' };\nexport const Tree = (props: TreeViewProps) => <TreeView {...props} />;\n',
    'lone.ts': "import type { TreeNode } from '@rottay/design-system/commercial';\n\nexport type Node = TreeNode;\n",
  };
  withTree(files, (run, read) => {
    const first = run({ write: true });
    assert.equal(first.rows.every((row) => row.action === 'rewrite'), true);
    const written = read();
    assert.equal(written['combined.tsx'], files['combined.tsx'].replace(
      "{ TreeView, type TreeNode, type TreeViewProps } from '@rottay/design-system/commercial'",
      "{ TreeViewConnector as TreeView, type TreeViewConnectorNode as TreeNode, type TreeViewConnectorProps as TreeViewProps } from '@rottay/design-system'",
    ));
    assert.equal(written['lone.ts'], "import type { TreeViewConnectorNode as TreeNode } from '@rottay/design-system';\n\nexport type Node = TreeNode;\n");
    const second = run({ write: true });
    assert.deepEqual(second.rows, []);
    assert.deepEqual(read(), written);
  });
});

test('an imported name the module exports locally keeps the module\'s own exported name', () => {
  const fixture = CASES.find((item) => item.name === 'symbol-removed/local-reexport');
  const expected = snapshot(fixture.expected);
  assert.equal(expected['index.ts'], "import type { DensityPosture } from '@rottay/design-system';\n\n"
    + "export type { DensityPosture as DensityKey };\n\nexport const fallback: DensityPosture = 'comfortable';\n");
  assert.equal(expected['barrel/index.ts'], "export type { DensityPosture as DensityKey } from '@rottay/design-system';\n");
  assert.ok(reportOf(fixture.name).every((row) => row.action === 'rewrite' && row.id === 'symbol-removed/.#DensityKey'));
});
