import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';
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
    let needles = [entry.symbol, ...(entry.member ? [entry.member] : []), ...(entry.members ?? [])];
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

test('prop entries name components and props types the package publishes, or ones the map itself retires with a successor', () => {
  const retired = [];
  for (const entry of [...of('prop-removed'), ...of('prop-renamed'), ...of('union-member-removed')]) {
    const names = surface.exportsOf(entry.subpath);
    for (const name of [...entry.components, ...(entry.propsTypes ?? [])]) {
      if (names.has(name)) continue;
      const successor = map.byId.get(`symbol-removed/${entry.subpath}#${name}`);
      assert.ok(successor?.replacement?.symbol, `${entry.id}: ${entry.subpath} does not publish ${name} and no symbol-removed entry moves it`);
      retired.push(name);
    }
  }
  assert.deepEqual([...new Set(retired)].sort(), ['Steps', 'StepsProps', 'Switch', 'SwitchProps']);
});

test('the two report-only classes of the review stay report-only, with the reason stated', () => {
  const glyphs = of('glyph-removed');
  // The 328 catalog glyphs of the review, plus `AlertIcon` (WO-RET-06 W-1), whose role is known: status.warning.
  assert.equal(glyphs.length, 329);
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
  assert.equal(targets['./patterns/charts'], '.');
  assert.equal(targets['./public-entrypoints-manifest'], null);
  assert.equal(targets['./spatial/spec'], null);
});

test('the retired chart facade moves to the package root, which publishes every name it carried', () => {
  const entry = map.byId.get('subpath-removed/./patterns/charts#*');
  assert.equal(entry.mode, 'rewrite');
  assert.deepEqual(entry.replacement, { subpath: '.' });
  const root = surface.exportsOf('.');
  const families = ['AreaChart', 'BarChart', 'BulletChart', 'CalendarHeatMap', 'FunnelChart', 'GanttChart', 'GaugeChart', 'HeatMap',
    'Histogram', 'LineChart', 'NetworkGraph', 'PieChart', 'RadarChart', 'SankeyChart', 'ScatterChart', 'Sparkline', 'TreeMap',
    'WaterfallChart'];
  assert.equal(families.length, 18);
  for (const name of families) {
    assert.ok(root.has(name), `the package root does not publish ${name}`);
    assert.ok(entry.resolves.includes(name), `the entry does not name ${name}`);
  }
  const manifest = map.byId.get('subpath-removed/./public-entrypoints-manifest#*');
  assert.equal(manifest.mode, 'report-only');
  assert.equal(manifest.replacement, null);
  assert.ok(manifest.guidance.length > 20);
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

function declarationIn(file, name) {
  const source = ts.createSourceFile(file, fs.readFileSync(path.join(CORE_ROOT, file), 'utf8'), ts.ScriptTarget.Latest, true);
  const found = source.statements.find((statement) => (ts.isInterfaceDeclaration(statement) || ts.isFunctionDeclaration(statement))
    && statement.name?.text === name);
  assert.ok(found, `${file} does not declare ${name}`);
  return found;
}

test('a proof that silences a site is stated only where the published declaration makes it true', () => {
  const entries = of('member-changed');
  assert.deepEqual(entries.filter((entry) => entry.memberProof !== undefined).map((entry) => [entry.id, entry.memberProof]),
    [['member-changed/.#TenantConfig', 'spelling']]);
  assert.deepEqual(entries.filter((entry) => entry.maxArguments !== undefined).map((entry) => [entry.id, entry.maxArguments]),
    [['member-changed/.#baselineFor', 2]]);

  // `spelling` is sound only for members that are gone: a member the type newly REQUIRES is broken by its absence.
  const config = map.byId.get('member-changed/.#TenantConfig');
  const declared = declarationIn('src/foundation/contracts/composition/tenants/index.ts', 'TenantConfig')
    .members.map((member) => member.name.getText());
  assert.ok(declared.includes('slug') && declared.includes('branding'));
  for (const member of config.members) {
    assert.equal(declared.includes(member), false, `TenantConfig still declares ${member}`);
    assert.ok(config.change.includes(`\`${member}\``), `the change does not name ${member}`);
  }
  assert.match(config.change, /^REMOVED fields/);

  // `maxArguments` is sound only while the published function takes exactly that many parameters.
  const baseline = map.byId.get('member-changed/.#baselineFor');
  const signature = declarationIn(
    'src/infrastructure/compilers/runtime/theme/runtime/ingress/runtime/document-v2/presentation/admission/index.ts', 'baselineFor');
  assert.equal(signature.parameters.length, baseline.maxArguments);
  assert.equal(signature.parameters.some((parameter) => parameter.dotDotDotToken), false);
  assert.match(baseline.change, /^loses the third parameter/);

  for (const entry of [config, baseline]) assert.match(entry.impossible, /is not reported/, entry.id);

  // The accepted file-local limit is disclosed where the proof is stated, in the three shapes the kit stays silent on.
  const notFollowed = config.impossible.slice(config.impossible.indexOf('Not followed:'));
  for (const shape of ['`const config: TenantConfig = legacy`', '`return legacy`', '`mount(legacy)`', "`P['config']`", 'JSX spread attribute']) {
    assert.ok(notFollowed.includes(shape), `the TenantConfig entry does not disclose ${shape}`);
  }
  assert.doesNotMatch(config.impossible, /without an assertion or a spread/);
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
    'prop-removed/.#EngineAwareProps.extensions',
    'prop-renamed/.#BaseMotionProps.delay', 'prop-renamed/.#BaseMotionProps.duration',
    'prop-renamed/.#CountUpProps.delay', 'prop-renamed/.#CountUpProps.duration',
    'prop-renamed/.#StaggerChildrenProps.delayChildren', 'prop-renamed/.#StaggerChildrenProps.staggerDelay',
    'prop-renamed/.#TextRevealProps.delay', 'prop-renamed/.#TextRevealProps.duration',
    'symbol-removed/.#Steps', 'symbol-removed/.#StepsProps',
    'union-member-removed/.#SwitchProps.large', 'union-member-removed/.#SwitchProps.small',
  ]);
  for (const entry of decided) assert.equal(entry.replacement?.values, undefined, `${entry.id}: no value-table workaround`);
  assert.equal(map.byId.has('prop-renamed/.#ChartScaffoldProps.loading'), false);
});

test('the literal renames of the retired size and alignment spellings are authored member by member', () => {
  const entries = of('union-member-removed');
  const sizes = entries.filter((entry) => entry.prop === 'size');
  assert.equal(sizes.length, 53);
  const table = { small: 'sm', middle: 'md', large: 'lg', default: 'md' };
  const largestDensity = 'union-member-removed/.#DescriptionsProps.default';
  assert.equal(map.byId.get(largestDensity).replacement.member, 'lg');
  for (const entry of sizes.filter((item) => item.id !== largestDensity)) assert.equal(entry.replacement.member, table[entry.member], entry.id);
  const sides = entries.filter((entry) => entry.prop === 'textAlign');
  assert.deepEqual(sides.map((entry) => [entry.member, entry.replacement.member, entry.directional]), [['left', 'start', true], ['right', 'end', true]]);
  const pictograms = entries.filter((entry) => entry.subpath === './pictograms');
  assert.deepEqual(pictograms.map((entry) => [entry.member, entry.replacement, entry.mode]),
    [['candidate-evidence', null, 'report-only'], ['event-moment', null, 'report-only']]);
  assert.equal(entries.length, sizes.length + sides.length + pictograms.length);
});

const LEDGER = 'contracts/package/deprecations/index.json';
/** Rows that name an existing entry which states no notice yet; the list only shrinks, and is empty once their notices land. */
const NOTICE_OWED = [];

test('a notice is admitted on a report-only member-changed entry only, and its shape is checked', () => {
  const ID = 'member-changed/.#Callout';
  const noticed = (alter = () => {}) => mutant((raw) => {
    const entry = raw.entries.find((item) => item.id === ID);
    entry.notice = { removeIn: '4.0' };
    entry.change = 'not removed in 3.0: `Callout` stays published and deprecated.';
    entry.guidance = 'The 4.0 line removes `Callout`; write `Alert` before it.';
    alter(entry, raw);
  });
  assert.deepEqual(noticed().byId.get(ID).notice, { removeIn: '4.0' });
  assert.deepEqual(noticed((entry) => { entry.change = 'not narrowed in 3.0. The interface keeps every field.'; }).byId.get(ID).notice, { removeIn: '4.0' });
  assert.deepEqual(noticed((entry) => { entry.notice = { removeIn: '3.1' }; entry.guidance = 'Asked by 3.1.'; }).byId.get(ID).notice, { removeIn: '3.1' });
  for (const notice of [null, 'removeIn 4.0', ['4.0'], {}, { removeIn: '4.0', line: '3.0' }, { line: '4.0' }]) {
    assert.throws(() => noticed((entry) => { entry.notice = notice; }), /`notice` is exactly `\{ removeIn \}`/, JSON.stringify(notice));
  }
  for (const removeIn of ['4', '4.0.0', 'next', 4, '']) {
    assert.throws(() => noticed((entry) => { entry.notice = { removeIn }; }), /`notice\.removeIn` must be a release line/, String(removeIn));
  }
  for (const removeIn of ['3.0', '2.9', '03.0']) {
    assert.throws(() => noticed((entry) => { entry.notice = { removeIn }; }), /is not later than the 3\.0 line: a removal in this line is not a notice/, removeIn);
  }
  assert.throws(() => noticed((entry, raw) => { raw.line = 'next'; }), /needs the release line of the map/);
  for (const change of ['`Callout` loses its `variant` prop.', 'removed in 3.0: `Callout`.', 'not removed in 3.01: `Callout` stays.', 'not removed in 13.0']) {
    assert.throws(() => noticed((entry) => { entry.change = change; }), /the `change` of a notice opens with `not removed in 3\.0`/, change);
  }
  for (const guidance of ['Write `Alert` instead of `Callout`.', 'The 14.0 line removes it.', 'The 4.01 line removes it.']) {
    assert.throws(() => noticed((entry) => { entry.guidance = guidance; }), /the `guidance` of a notice names the 4\.0 line/, guidance);
  }
  const first = (raw, className) => raw.entries.find((entry) => entry.class === className);
  for (const className of ['prop-renamed', 'prop-removed', 'symbol-removed', 'symbol-removed-no-replacement', 'glyph-removed', 'subpath-removed']) {
    assert.throws(() => mutant((raw) => { first(raw, className).notice = { removeIn: '4.0' }; }),
      /`notice` is stated by a report-only member-changed entry only/, className);
  }
});

test('notice entries and the ledger rows that survive 3.0 correspond in both directions', () => {
  const ledger = JSON.parse(fs.readFileSync(path.join(CORE_ROOT, LEDGER), 'utf8'));
  const surviving = ledger.rows.filter((row) => row.class !== 'debt' && ledger.compatReceivers.includes(row.receiver));
  const named = new Map();
  const owed = [];
  for (const row of surviving) {
    const entry = row.codemod === null ? null : map.byId.get(row.codemod);
    if (!entry) continue;
    if (entry.notice === undefined) { owed.push(entry.id); continue; }
    assert.deepEqual([entry.class, entry.mode], ['member-changed', 'report-only'], `${row.anchor}: ${entry.id}`);
    assert.equal(entry.notice.removeIn, row.removeIn, `${row.anchor}: ${entry.id} and the row disagree on the line of the removal`);
    named.set(entry.id, row.anchor);
  }
  const notices = map.entries.filter((entry) => entry.notice !== undefined);
  assert.equal(notices.length, 33, 'the 31 entries of the RET-01 ledger lot plus the Callout and BrandMotion precedents');
  for (const entry of notices) {
    assert.ok(named.has(entry.id), `${entry.id}: a notice no surviving row of ${LEDGER} names`);
    assert.ok(surface.exportsOf(entry.subpath).has(entry.symbol), `${entry.id}: a notice is about an export that stays published`);
  }
  assert.equal(notices.length, named.size);
  for (const id of owed) assert.ok(NOTICE_OWED.includes(id), `${id}: a surviving row names an entry that states no notice`);
  for (const id of NOTICE_OWED) assert.ok(map.byId.has(id), `${id}: drop it from NOTICE_OWED with its entry`);
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
  const byId = (raw, id) => raw.entries.find((entry) => entry.id === id);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#TenantConfig').memberProof = 'import'; }), /`memberProof` is `spelling` or absent/);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#TenantConfig').members = []; }), /`members` must be a non-empty list/);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#TenantConfig').members = ['engine', 'not a name']; }), /`members` must be a non-empty list/);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#TenantConfig').members = undefined; }), /`memberProof` needs the `member` or `members`/);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#TenantConfig').maxArguments = 2; }), /state one proof/);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#baselineFor').maxArguments = -1; }), /`maxArguments` must be a non-negative integer/);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#baselineFor').maxArguments = '2'; }), /`maxArguments` must be a non-negative integer/);
  assert.throws(() => mutant((raw) => { byId(raw, 'member-changed/.#baselineFor').members = ['source']; }), /`maxArguments` is about a call/);
  assert.throws(() => mutant((raw) => { first(raw, 'prop-removed').memberProof = 'spelling'; }), /proofs of a member-changed entry only/);
  assert.throws(() => mutant((raw) => { first(raw, 'symbol-removed').maxArguments = 1; }), /proofs of a member-changed entry only/);
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
