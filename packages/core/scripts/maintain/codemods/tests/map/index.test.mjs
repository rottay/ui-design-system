import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { packageRoot, repoRoot } from '../../../../libraries/repo-root/index.mjs';
import { CLASSES, DEFAULT_MAP, hasEntry, loadMap, parseEntryId } from '../../index.mjs';
import { createPackageSurface } from '../../resolve/surface/index.mjs';
import { KIT_ROOT } from '../harness/index.mjs';

const CORE_ROOT = packageRoot(KIT_ROOT);
const REPO_ROOT = repoRoot(KIT_ROOT);
const map = loadMap();
const surface = createPackageSurface(CORE_ROOT);
const SYMBOL_CLASSES = ['symbol-removed', 'symbol-removed-no-replacement', 'glyph-removed'];

function of(className) {
  return map.entries.filter((entry) => entry.class === className);
}

function mutant(mutate) {
  const raw = JSON.parse(fs.readFileSync(DEFAULT_MAP, 'utf8'));
  mutate(raw);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'codemods-map-'));
  const file = path.join(directory, 'index.json');
  fs.writeFileSync(file, JSON.stringify(raw));
  try {
    return loadMap(file);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
}

test('the 3.0 map loads, and every id restates its class, subpath, symbol and member', () => {
  assert.equal(map.line, '3.0');
  assert.equal(map.packageName, surface.packageName);
  for (const entry of map.entries) {
    const parsed = parseEntryId(entry.id);
    assert.ok(parsed, entry.id);
    assert.ok(CLASSES.includes(parsed.class), entry.id);
  }
  assert.equal(new Set(map.entries.map((entry) => entry.id)).size, map.entries.length);
});

test('the ids the shared contract names resolve, including the alias for the Stepper seed', () => {
  for (const id of ['symbol-removed/.#TONE_TO_TAG_VARIANT', 'prop-renamed/.#TooltipValue.color', 'prop-removed/.#StepperProps.initial',
    'prop-renamed/.#StepperProps.initial', 'prop-removed/.#GridViewProps.columns', 'prop-removed/.#GalleryViewProps.minColumnWidth',
    'subpath-removed/./icons/bithire#*', 'css-class-renamed/.#AppShell', 'glyph-removed/./icons#PlusIcon']) {
    assert.equal(hasEntry(id), true, id);
  }
  assert.equal(hasEntry('prop-removed/.#StepperProps.current'), false);
  assert.equal(hasEntry('symbol-removed/.#TONE_TO_VARIANT'), false);
});

test('every entry cites a pending changeset that names what it retires', () => {
  for (const entry of map.entries) {
    const file = path.join(REPO_ROOT, entry.changeset);
    assert.ok(fs.existsSync(file), `${entry.id}: ${entry.changeset} does not exist`);
    const text = fs.readFileSync(file, 'utf8');
    let needles = entry.member ? [entry.symbol, entry.member] : [entry.symbol];
    if (entry.class === 'subpath-removed') needles = [entry.subpath.replace(/^\.\/dist\//, 'dist/')];
    else if (entry.class === 'css-class-renamed') needles = Object.keys(entry.classes).slice(0, 1);
    else if (entry.symbol === '*') needles = ['--ds-commercial-'];
    else if (!surface.isPublished(entry.subpath)) needles = [entry.subpath];
    for (const needle of needles) assert.ok(text.includes(needle), `${entry.id}: ${entry.changeset} does not name ${needle}`);
  }
});

test('every entry carries its census and either what the kit resolves or why it cannot', () => {
  for (const entry of map.entries) {
    assert.ok(entry.census.length > 20, entry.id);
    if (entry.mode === 'rewrite') assert.ok(entry.resolves.length > 20, entry.id);
    else assert.ok(entry.impossible.length > 20, entry.id);
  }
});

test('no substitution points at a private module: every replacement is published by this checkout', () => {
  for (const entry of map.entries) {
    if (!entry.replacement) continue;
    const subpath = entry.replacement.subpath ?? entry.subpath;
    assert.ok(surface.isPublished(subpath), `${entry.id}: ${subpath} is not a published subpath`);
    if (entry.class === 'symbol-removed') {
      const names = surface.exportsOf(subpath);
      assert.ok(names, `${entry.id}: the exports of ${subpath} are not readable`);
      assert.ok(names.has(entry.replacement.symbol), `${entry.id}: ${subpath} does not publish ${entry.replacement.symbol}`);
    }
  }
});

test('`TONE_TO_VARIANT` is published at the package root and the four bridges are not', () => {
  const root = surface.exportsOf('.');
  assert.ok(root.has('TONE_TO_VARIANT'));
  for (const entry of of('symbol-removed').filter((item) => item.symbol.startsWith('TONE_TO_'))) {
    assert.deepEqual(entry.replacement, { subpath: '.', symbol: 'TONE_TO_VARIANT' });
    assert.equal(root.has(entry.symbol), false, entry.symbol);
  }
  assert.deepEqual(of('symbol-removed').filter((item) => item.symbol.startsWith('TONE_TO_')).map((item) => item.symbol).sort(),
    ['TONE_TO_AVATAR_VARIANT', 'TONE_TO_BADGE_VARIANT', 'TONE_TO_CALLOUT_VARIANT', 'TONE_TO_TAG_VARIANT']);
});

test('what the map calls retired is retired: symbols are unpublished, subpaths are gone', () => {
  for (const entry of map.entries) {
    if (SYMBOL_CLASSES.includes(entry.class) && !entry.member && surface.isPublished(entry.subpath)) {
      const names = surface.exportsOf(entry.subpath);
      assert.ok(names, entry.id);
      assert.equal(names.has(entry.symbol), false, `${entry.id}: ${entry.symbol} is still published`);
    }
    if (entry.class === 'subpath-removed') {
      assert.equal(surface.published.includes(entry.subpath), false, `${entry.id}: still published`);
    }
  }
});

test('prop entries name components and props types the package publishes', () => {
  for (const entry of [...of('prop-removed'), ...of('prop-renamed'), ...of('union-member-removed')]) {
    const names = surface.exportsOf(entry.subpath);
    for (const name of [...entry.components, ...(entry.propsTypes ?? [])]) {
      assert.ok(names.has(name), `${entry.id}: ${entry.subpath} does not publish ${name}`);
    }
  }
});

test('the two report-only classes of the review stay report-only, with the reason stated', () => {
  const glyphs = of('glyph-removed');
  assert.equal(glyphs.length, 328);
  assert.match(glyphs[0].note, /OPEN obligation: a 328-row glyph -> candidate-role table is owed/);
  for (const entry of [...glyphs, ...of('css-class-renamed'), ...of('symbol-removed-no-replacement'),
    ...of('css-custom-property-renamed'), ...of('member-changed')]) {
    assert.equal(entry.mode, 'report-only', entry.id);
    assert.equal(entry.resolves, undefined, entry.id);
  }
  const classes = of('css-class-renamed').flatMap((entry) => Object.keys(entry.classes));
  assert.equal(classes.length, 24);
});

test('a retired subpath is re-pointed only where a changeset names the substitute', () => {
  const targets = Object.fromEntries(of('subpath-removed').map((entry) => [entry.subpath, entry.replacement?.subpath ?? null]));
  assert.equal(targets['./icons/bithire'], './icons/presets/bithire');
  assert.equal(targets['./icons/full'], './icons');
  assert.equal(targets['./icons/corpus'], './icons');
  assert.equal(targets['./styles'], './styles.css');
  assert.equal(targets['./styles/default'], './styles/rottay');
  assert.equal(targets['./primitives/button'], '.');
  assert.equal(targets['./dist/platform.css'], './styles/rottay');
  assert.equal(targets['./styles/platform'], './styles/rottay');
  assert.equal(targets['./effects'], null);
  assert.equal(targets['./spatial/spec'], null);
});

test('the commercial channel table is authored name by name, each successor a channel this checkout declares', () => {
  const entry = map.byId.get('css-custom-property-renamed/./commercial.css#*');
  assert.equal(Object.keys(entry.properties).length, 26);
  assert.equal(entry.evidence.commit, 'dcadb8474');
  const sheets = [];
  const visit = (directory) => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, item.name);
      if (item.isDirectory()) visit(target);
      else if (item.name.endsWith('.css')) sheets.push(fs.readFileSync(target, 'utf8'));
    }
  };
  visit(path.join(CORE_ROOT, 'src/foundation/tokens/css'));
  const css = sheets.join('\n');
  for (const [retired, successor] of Object.entries(entry.properties)) {
    assert.match(retired, /^--ds-commercial-/);
    assert.ok(css.includes(`${successor}:`), `${successor} is not declared by the package`);
    assert.equal(css.includes(`${retired}:`), false, `${retired} is still declared`);
  }
});

test('channels retired with no successor say so instead of naming one', () => {
  const retired = of('css-custom-property-renamed').filter((entry) => entry.symbol !== '*');
  const tables = Object.assign({}, ...retired.map((entry) => entry.properties ?? {}));
  assert.equal(tables['--ds-text-inverse'], '--ds-color-text-on-primary');
  assert.equal(tables['--ds-surface-shadow-hover'], null);
  assert.equal(Object.keys(tables).filter((name) => name.startsWith('--ds-switch-')).length, 14);
  assert.equal(Object.keys(tables).filter((name) => name.startsWith('--ds-color-accent-')).length, 10);
});

test('member-level breaks name an export the package still publishes, what changed and what to do', () => {
  const entries = of('member-changed');
  for (const entry of entries) {
    assert.ok(surface.exportsOf(entry.subpath).has(entry.symbol), `${entry.id}: ${entry.symbol} is not published on ${entry.subpath}`);
    assert.ok(entry.change.length > 20 && entry.guidance.length > 10, entry.id);
  }
  for (const id of ['member-changed/.#TenantCapabilityDeclaration.brandThemePath', 'member-changed/.#TenantConfig',
    'member-changed/.#TenantCreationConfig.engine', 'member-changed/.#RuntimeVisualPayloadCensus',
    'member-changed/.#PatternBrandStudioProps', 'member-changed/.#BrandPalette', 'member-changed/.#BrandSwitchChrome.labelColor',
    'member-changed/.#BrandSurfaceChrome.shadowHover']) {
    assert.ok(map.byId.has(id), id);
  }
  assert.deepEqual(map.byId.get('member-changed/.#TenantConfig').members, ['brandTheme', 'tokenOverrides', 'personality', 'appearance', 'engine']);
});

test('the commercial component with no root successor is an explicit report-only entry', () => {
  const entry = map.byId.get('symbol-removed-no-replacement/./commercial#ProductWindow');
  assert.equal(entry.replacement, null);
  assert.equal(surface.exportsOf('.').has('ProductWindow'), false);
  assert.equal(map.byId.has('symbol-removed-no-replacement/./commercial#TreeView'), false);
});

test('the commercial tree names move to the connector, never to the root homonyms of `PatternTreeView`', () => {
  const root = surface.exportsOf('.');
  const successors = { TreeView: 'TreeViewConnector', TreeNode: 'TreeViewConnectorNode', TreeViewProps: 'TreeViewConnectorProps' };
  for (const [symbol, successor] of Object.entries(successors)) {
    const entry = map.byId.get(`symbol-removed/./commercial#${symbol}`);
    assert.deepEqual(entry.replacement, { subpath: '.', symbol: successor });
    assert.equal(entry.mode, 'rewrite');
    assert.ok(root.has(successor), successor);
  }
  assert.equal(root.has('TreeView'), false);
  assert.equal(map.byId.get('subpath-removed/./commercial#*').replacement.subpath, '.');
});

test('the entries that need a decision per site are report-only, whatever their class can rewrite', () => {
  const decided = map.entries.filter((entry) => entry.mode === 'report-only'
    && ['prop-renamed', 'prop-removed', 'union-member-removed', 'symbol-removed', 'subpath-removed'].includes(entry.class)
    && entry.replacement !== null);
  assert.deepEqual(decided.map((entry) => entry.id).sort(), [
    'prop-removed/.#ChartScaffoldProps.loading', 'prop-removed/.#DataTablePatternProps.mobileBreakpoint',
    'prop-renamed/.#BaseMotionProps.delay', 'prop-renamed/.#BaseMotionProps.duration',
    'prop-renamed/.#CountUpProps.delay', 'prop-renamed/.#CountUpProps.duration',
    'prop-renamed/.#StaggerChildrenProps.delayChildren', 'prop-renamed/.#StaggerChildrenProps.staggerDelay',
    'prop-renamed/.#TextRevealProps.delay', 'prop-renamed/.#TextRevealProps.duration',
    'union-member-removed/.#SwitchProps.large', 'union-member-removed/.#SwitchProps.small',
  ]);
  for (const entry of decided) assert.equal(entry.replacement?.values, undefined, `${entry.id}: no value-table workaround`);
  assert.equal(map.byId.has('prop-renamed/.#ChartScaffoldProps.loading'), false);
});

test('the literal renames of the retired size and alignment spellings are authored member by member', () => {
  const entries = of('union-member-removed');
  const sizes = entries.filter((entry) => entry.prop === 'size');
  assert.equal(sizes.length, 39);
  for (const entry of sizes) assert.equal(entry.replacement.member, { small: 'sm', middle: 'md', large: 'lg', default: 'md' }[entry.member], entry.id);
  const sides = entries.filter((entry) => entry.prop === 'textAlign');
  assert.deepEqual(sides.map((entry) => [entry.member, entry.replacement.member, entry.directional]), [['left', 'start', true], ['right', 'end', true]]);
  assert.equal(entries.length, sizes.length + sides.length);
});

test('the loader refuses a malformed map', () => {
  const first = (raw, className) => raw.entries.find((entry) => entry.class === className);
  assert.throws(() => mutant((raw) => { first(raw, 'symbol-removed').id = 'symbol-removed/.#SOMETHING_ELSE'; }), /does not restate/);
  assert.throws(() => mutant((raw) => { first(raw, 'symbol-removed').id = 'TONE_TO_TAG_VARIANT'; }), /is not `<class>/);
  assert.throws(() => mutant((raw) => { raw.entries.push({ ...raw.entries[0] }); }), /duplicate id/);
  assert.throws(() => mutant((raw) => {
    first(raw, 'symbol-removed').replacement = { subpath: 'src/foundation/contracts/kernel', symbol: 'TONE_TO_VARIANT' };
  }), /is not a package subpath/);
  assert.throws(() => mutant((raw) => { first(raw, 'symbol-removed').replacement = null; }), /needs `replacement/);
  assert.throws(() => mutant((raw) => {
    const entry = first(raw, 'glyph-removed');
    entry.mode = 'rewrite';
    entry.resolves = 'pretend a role map exists and rewrite the glyph import';
    entry.impossible = undefined;
    raw.groups.glyphs.impossible = undefined;
  }), /is report-only/);
  assert.throws(() => mutant((raw) => {
    first(raw, 'symbol-removed-no-replacement').replacement = { subpath: '.', symbol: 'Invented' };
  }), /states no replacement/);
  assert.throws(() => mutant((raw) => { first(raw, 'prop-removed').census = ''; }), /`census` must be/);
  assert.throws(() => mutant((raw) => { first(raw, 'prop-removed').class = 'prop-vanished'; }), /unknown class/);
  assert.throws(() => mutant((raw) => { first(raw, 'prop-renamed').resolves = undefined; }), /exactly one of/);
  assert.throws(() => mutant((raw) => { first(raw, 'member-changed').replacement = { member: 'guessed' }; }), /states no replacement/);
  assert.throws(() => mutant((raw) => { first(raw, 'member-changed').change = ''; }), /`change` must be/);
  assert.throws(() => mutant((raw) => {
    const entry = first(raw, 'css-custom-property-renamed');
    entry.properties = {};
    entry.prefixes = {};
  }), /needs a `properties` or `prefixes` table/);
  assert.throws(() => mutant((raw) => { first(raw, 'css-custom-property-renamed').properties = { 'ds-commercial-ink': null }; }), /is not a custom property name/);
  assert.throws(() => mutant((raw) => {
    const entry = first(raw, 'css-custom-property-renamed');
    entry.mode = 'rewrite';
    entry.resolves = 'pretend the property can be resolved and rewrite every spelling';
    entry.impossible = undefined;
  }), /is report-only/);
});
