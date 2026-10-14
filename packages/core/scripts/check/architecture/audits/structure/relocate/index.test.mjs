import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { compareStructureBaseline } from '../index.mjs';
import { STRUCTURE_LAWS, compareStructureLaws, lawDefinitions } from '../laws/index.mjs';
import { tightenStructureBaseline } from '../tighten/index.mjs';
import { PATH_KEYED_CLASSES, baselineKeys, parseRenameMap, relocateStructureBaseline, treeView } from './index.mjs';

const SRC = 'packages/core/src/';
const BIG = 'components/old/big/index.ts';
const BIG_NEW = 'components/fresh/big/index.ts';
const WRAP = 'components/old/wrap';
const WRAP_NEW = 'components/fresh/wrap';
const DEP = 'components/dep/index.ts';
const FINDING = `sibling-owner-dependency:${BIG}->${DEP}`;
const FINDING_NEW = `sibling-owner-dependency:${BIG_NEW}->${DEP}`;
const bigText = `import { dep } from '../../dep/index.ts';\n${'export const line = 1;\n'.repeat(900)}`;

function tree(contents) {
  const files = Object.keys(contents).sort();
  return treeView(files, (path) => contents[path] ?? null);
}

const beforeContents = {
  [`${SRC}${BIG}`]: bigText,
  [`${SRC}${WRAP}/inner/index.ts`]: 'export const inner = 1;\n',
  [`${SRC}${DEP}`]: 'export const dep = 1;\n',
  [`${SRC}index.ts`]: "export * from './components/dep/index.ts';\n",
};

function moved(overrides = {}) {
  const contents = { ...beforeContents };
  delete contents[`${SRC}${BIG}`];
  delete contents[`${SRC}${WRAP}/inner/index.ts`];
  return { ...contents, [`${SRC}${BIG_NEW}`]: bigText, [`${SRC}${WRAP_NEW}/inner/index.ts`]: 'export const inner = 1;\n', ...overrides };
}

function baseline() {
  return {
    schemaVersion: 1,
    policy: { mode: 'finding-identity-subset-ratchet' },
    snapshot: {
      inventory: { totalFiles: 4, ignoredByKind: { test: 0 }, rootEntrypoints: ['index.ts'], findingsByRule: { 'sibling-owner-dependency': 1 }, findingsByTopLevelScope: { components: 1 } },
      findings: { 'sibling-owner-dependency': [FINDING] },
    },
    laws: {
      definitions: lawDefinitions(),
      members: { ...Object.fromEntries(STRUCTURE_LAWS.map((law) => [law, []])), 'authored-line-count': [`${SRC}${BIG}`], 'single-child-folder': [WRAP] },
    },
  };
}

function live({ lineCount = [`${SRC}${BIG_NEW}`], singleChild = [WRAP_NEW], findings = [FINDING_NEW], repeated = [] } = {}) {
  return {
    result: { findings: findings.map((id) => ({ rule: id.split(':')[0], id, path: id.split(':')[1].split('->')[0] })), inventory: {} },
    laws: {
      definitions: lawDefinitions(),
      members: { ...Object.fromEntries(STRUCTURE_LAWS.map((law) => [law, []])), 'authored-line-count': lineCount, 'single-child-folder': singleChild, 'repeated-path-word': repeated },
    },
  };
}

const MAP = { [`${SRC}${BIG}`]: `${SRC}${BIG_NEW}`, [`${SRC}${WRAP}`]: `${SRC}${WRAP_NEW}` };

function run({ map = MAP, mapText = JSON.stringify(map), after = moved(), measured = live(), stored = baseline(), specifierEdits = false } = {}) {
  return relocateStructureBaseline({ baseline: stored, mapText, ...measured, before: tree(beforeContents), after: tree(after), specifierEdits });
}

const refusals = (produced) => produced.refused.join('\n');

test('positive: a bijective map re-keys every class it touches, values unchanged, and the gate is green', () => {
  const stored = baseline();
  const produced = run({ stored });
  assert.deepEqual(produced.refused, []);
  const next = produced.baseline;
  assert.deepEqual(next.laws.members['authored-line-count'], [`${SRC}${BIG_NEW}`]);
  assert.deepEqual(next.laws.members['single-child-folder'], [WRAP_NEW]);
  assert.deepEqual(next.snapshot.findings['sibling-owner-dependency'], [FINDING_NEW], 'rule and direction are preserved');
  assert.deepEqual(next.snapshot.inventory, stored.snapshot.inventory, 'counts carried byte-identical');
  assert.deepEqual(next.laws.definitions, stored.laws.definitions);
  assert.deepEqual(next.policy, stored.policy);
  assert.deepEqual(produced.content.map(({ status }) => status), ['same-byte', 'same-byte']);
  assert.equal(produced.rekeyed.length, 3);

  const { result, laws } = live();
  assert.equal(compareStructureLaws(laws, next.laws).passed, true);
  const findings = compareStructureBaseline(result, next);
  assert.deepEqual([findings.added, findings.resolved], [[], []]);
});

test('no-op: an empty map writes nothing and returns the stored baseline', () => {
  const stored = baseline();
  const produced = run({ map: {}, stored });
  assert.equal(produced.noop, true);
  assert.deepEqual(produced.refused, []);
  assert.equal(produced.baseline, stored);
});

test('idempotence: a second application of the same map matches nothing and is refused; the inverse map round-trips', () => {
  const first = run();
  const again = relocateStructureBaseline({ baseline: first.baseline, mapText: JSON.stringify(MAP), ...live(), before: tree(moved()), after: tree(moved()) });
  assert.match(refusals(again), /map entry matches no baseline key/u);
  assert.equal(again.baseline, first.baseline);

  const inverse = Object.fromEntries(Object.entries(MAP).map(([from, to]) => [to, from]));
  const back = relocateStructureBaseline({
    baseline: first.baseline,
    mapText: JSON.stringify(inverse),
    ...live({ lineCount: [`${SRC}${BIG}`], singleChild: [WRAP], findings: [FINDING] }),
    before: tree(moved()),
    after: tree(beforeContents),
  });
  assert.deepEqual(back.refused, []);
  assert.deepEqual(back.baseline, baseline());
});

test('refused: a non-bijective map (duplicate target, duplicate source, identity, contradictory nesting)', () => {
  const twoToOne = run({ map: { ...MAP, [`${SRC}${DEP}`]: `${SRC}${BIG_NEW}` } });
  assert.match(refusals(twoToOne), /non-bijective map: 2 sources map to/u);

  const duplicateSource = `{ "${SRC}${BIG}": "${SRC}${BIG_NEW}", "${SRC}${BIG}": "${SRC}components/x/index.ts", "${SRC}${WRAP}": "${SRC}${WRAP_NEW}" }`;
  assert.match(refusals(run({ mapText: duplicateSource })), /source listed more than once/u);

  assert.match(refusals(run({ map: { ...MAP, [`${SRC}${DEP}`]: `${SRC}${DEP}` } })), /identity entry/u);

  const nested = { [`${SRC}components/old`]: `${SRC}components/fresh`, [`${SRC}${BIG}`]: `${SRC}components/elsewhere/big/index.ts` };
  assert.match(parseRenameMap(JSON.stringify(nested)).refused.join('\n'), /inconsistent nested entry/u);
});

test('refused: a map entry that matches no baseline key', () => {
  const produced = run({ map: { ...MAP, [`${SRC}components/unpinned/index.ts`]: `${SRC}components/pinned-never/index.ts` } });
  assert.match(refusals(produced), /map entry matches no baseline key: packages\/core\/src\/components\/unpinned/u);
});

test('refused: a baseline path that left the live tree without a map entry (omission)', () => {
  const produced = run({ map: { [`${SRC}${BIG}`]: `${SRC}${BIG_NEW}` } });
  assert.match(refusals(produced), /unmapped baseline path: laws\.members\.single-child-folder components\/old\/wrap/u);
});

test('refused: a value-changing request — a value in the map, a line count that moved, a pin that is no longer live at its target', () => {
  const valued = run({ map: { ...MAP, [`${SRC}${BIG}`]: { to: `${SRC}${BIG_NEW}`, lines: 700 } } });
  assert.match(refusals(valued), /a map carries no value, count or rule/u);

  const shrunk = run({ after: moved({ [`${SRC}${BIG_NEW}`]: bigText.split('\n').slice(0, 700).join('\n') }) });
  assert.match(refusals(shrunk), /content change: .*line count 901 -> 700/u);

  const notLive = run({ measured: live({ singleChild: [] }) });
  assert.match(refusals(notLive), /value change: single-child-folder pin re-keyed to components\/fresh\/wrap is not a live member there/u);

  const scoped = run({ map: { ...MAP, [`${SRC}${BIG}`]: `${SRC}runtime/big/index.ts` }, after: { ...moved(), [`${SRC}runtime/big/index.ts`]: bigText } });
  assert.match(refusals(scoped), /value change: .* from scope components to runtime/u);

  const outsideRoot = run({ map: { ...MAP, [`${SRC}${WRAP}`]: 'packages/showroom/src/wrap' } });
  assert.match(refusals(outsideRoot), /class change: packages\/showroom\/src\/wrap leaves the laws\.members\.single-child-folder root/u);
});

test('refused: a content change; a specifier-only delta passes only with --specifier-edits', () => {
  const edited = run({ after: moved({ [`${SRC}${BIG_NEW}`]: bigText.replace('line = 1', 'line = 2') }) });
  assert.match(refusals(edited), /content change: .*content changed in packages\/core\/src\/components\/fresh\/big\/index\.ts/u);

  const repointed = moved({ [`${SRC}${BIG_NEW}`]: bigText.replace('../../dep/index.ts', '../../dep/index.ts?raw') });
  assert.match(refusals(run({ after: repointed })), /module specifiers edited; only --specifier-edits/u);
  const admitted = run({ after: repointed, specifierEdits: true });
  assert.deepEqual(admitted.refused, []);
  assert.deepEqual(admitted.content.map(({ status }) => status), ['specifier-only', 'same-byte']);

  const subtree = run({ after: moved({ [`${SRC}${WRAP_NEW}/inner/extra/index.ts`]: 'export {};\n' }) });
  assert.match(refusals(subtree), /subtree differs \(missing 0: -; extra 1/u);
});

test('refused: semantic growth — the live tree holds a member or finding the re-keyed baseline never held', () => {
  const grown = run({ measured: live({ singleChild: [WRAP_NEW, 'components/fresh'] }) });
  assert.match(refusals(grown), /semantic growth: single-child-folder gains live member components\/fresh/u);
  const newFinding = run({ measured: live({ findings: [FINDING_NEW, `sibling-owner-dependency:${DEP}->${BIG_NEW}`] }) });
  assert.match(refusals(newFinding), /semantic growth: live finding sibling-owner-dependency:components\/dep/u);
});

test('refused: a copy instead of a move, a target colliding with an existing unmapped path, a missing source or target', () => {
  const copy = run({ after: { ...moved(), [`${SRC}${BIG}`]: bigText } });
  assert.match(refusals(copy), /source still present in the live tree \(a copy, not a move\)/u);

  const collision = run({ map: { ...MAP, [`${SRC}${BIG}`]: `${SRC}${DEP}` } });
  assert.match(refusals(collision), /target collides with an existing unmapped path: packages\/core\/src\/components\/dep\/index\.ts/u);

  const missing = run({ after: (({ [`${SRC}${BIG_NEW}`]: _, ...rest }) => rest)(moved()) });
  assert.match(refusals(missing), /target absent from the live tree/u);
});

test('atomic: every refusal returns the stored object and leaves it unmutated', () => {
  const stored = baseline();
  const snapshot = structuredClone(stored);
  const produced = run({ stored, measured: live({ singleChild: [] }) });
  assert.notEqual(produced.refused.length, 0);
  assert.equal(produced.baseline, stored);
  assert.deepEqual(stored, snapshot);
});

test('the real baseline holds only the enumerated path-keyed classes plus carried fields, and the door keys every one', () => {
  const real = JSON.parse(readFileSync(new URL('../baseline/index.json', import.meta.url), 'utf8'));
  assert.deepEqual(Object.keys(real).sort(), ['laws', 'policy', 'schemaVersion', 'snapshot']);
  assert.deepEqual(Object.keys(real.snapshot).sort(), ['findings', 'inventory']);
  assert.deepEqual(Object.keys(real.laws).sort(), ['definitions', 'members']);
  assert.deepEqual(Object.keys(real.laws.members).sort(), [...STRUCTURE_LAWS].sort());
  const pathValued = Object.entries(real.snapshot.inventory).filter(([, value]) => Array.isArray(value)).map(([key]) => key);
  assert.deepEqual(pathValued, ['rootEntrypoints'], 'a new path-valued inventory field must join PATH_KEYED_CLASSES');
  const keys = baselineKeys(real);
  const expected = STRUCTURE_LAWS.reduce((sum, law) => sum + real.laws.members[law].length, 0)
    + Object.values(real.snapshot.findings).flat().length
    + real.snapshot.inventory.rootEntrypoints.length;
  assert.equal(keys.length, expected);
  assert.deepEqual(new Set(PATH_KEYED_CLASSES.map(({ name }) => name)).size, PATH_KEYED_CLASSES.length);
});

const RPW = 'repeated-path-word';
const NESTED = `${WRAP}/inner/reduced-motion`;
const NESTED_NEW = `${WRAP_NEW}/inner/preference`;
const ZETA = 'components/Zeta';
const nestedText = 'export const reduced = 1;\n';
const w8cBefore = () => ({ ...beforeContents, [`${SRC}${NESTED}/index.ts`]: nestedText, [`${SRC}${ZETA}/only/index.ts`]: 'export {};\n' });
const w8cAfter = (overrides = {}) => ({ ...moved(), [`${SRC}${NESTED_NEW}/index.ts`]: nestedText, [`${SRC}${ZETA}/only/index.ts`]: 'export {};\n', ...overrides });

/** The W-8c shapes: an owner pin that left the tree (a), a repeated-path-word copy sharing a renamed single-child key (b), a folder with a nested rename (c). */
function w8cBaseline(extraRepeated = []) {
  const stored = baseline();
  stored.laws.members['single-child-folder'] = [ZETA, WRAP];
  stored.laws.members[RPW] = ['components/old', WRAP, ...extraRepeated].sort();
  return stored;
}
const W8C_MAP = {
  rename: MAP,
  within: { [`${SRC}${NESTED}`]: `${SRC}${NESTED_NEW}` },
  drop: { [RPW]: ['components/old', WRAP] },
};
const w8cLive = (options = {}) => live({ singleChild: [ZETA, WRAP_NEW], ...options });

function runW8c({ map = W8C_MAP, mapText = JSON.stringify(map), after = w8cAfter(), measured = w8cLive(), stored = w8cBaseline() } = {}) {
  return relocateStructureBaseline({ baseline: stored, mapText, ...measured, before: tree(w8cBefore()), after: tree(after) });
}

test('W-8c positive: re-key, folder witnessed modulo its within rename, witnessed drops; the gate is green and tighten refuses nothing', () => {
  const stored = w8cBaseline();
  const produced = runW8c({ stored });
  assert.deepEqual(produced.refused, []);
  const next = produced.baseline;
  assert.deepEqual(next.laws.members[RPW], [], 'both repeated-path-word pins dropped, none re-keyed');
  assert.deepEqual(next.laws.members['single-child-folder'], [ZETA, WRAP_NEW], 'code-unit order, as tighten pins it');
  assert.deepEqual(next.laws.members['authored-line-count'], [`${SRC}${BIG_NEW}`]);
  assert.deepEqual(next.snapshot, { ...stored.snapshot, findings: { 'sibling-owner-dependency': [FINDING_NEW] } });
  assert.deepEqual(produced.dropped, [{ class: `laws.members.${RPW}`, key: 'components/old' }, { class: `laws.members.${RPW}`, key: WRAP }]);
  const statuses = Object.fromEntries(produced.content.map(({ from, status }) => [from, status]));
  assert.equal(statuses[`${SRC}${WRAP}`], 'same-byte modulo within inner/reduced-motion -> inner/preference');
  assert.equal(statuses[`${SRC}${NESTED}`], `same-byte (within ${SRC}${WRAP})`);

  const { result, laws } = w8cLive();
  assert.equal(compareStructureLaws(laws, next.laws).passed, true);
  assert.equal(next.laws.members[RPW].length, laws.members[RPW].length, 'the measurement agrees with every drop');
  const tightened = tightenStructureBaseline({ result, laws, baseline: next });
  assert.deepEqual(tightened.refused, []);
  assert.deepEqual(tightened.removed.findings, []);
  assert.deepEqual(Object.values(tightened.removed.laws).flat(), []);
});

test('W-8c without the extension refuses exactly as H1 did: omission (a), value change (b), subtree (c)', () => {
  const bare = runW8c({ map: MAP });
  assert.match(refusals(bare), /unmapped baseline path: laws\.members\.repeated-path-word components\/old /u);
  assert.match(refusals(bare), /value change: repeated-path-word pin re-keyed to components\/fresh\/wrap is not a live member there/u);
  assert.match(refusals(bare), /content change: .*subtree differs \(missing 1: \/inner\/reduced-motion\/index\.ts; extra 1: \/inner\/preference\/index\.ts\)/u);
  const partialDrop = runW8c({ map: { ...W8C_MAP, drop: { [RPW]: [WRAP] } } });
  assert.match(refusals(partialDrop), /unmapped baseline path: laws\.members\.repeated-path-word components\/old /u, 'a drop not listed is not inferred');
});

test('refused drop: a pin still live at its target or at its old key', () => {
  const atTarget = runW8c({ measured: w8cLive({ repeated: [WRAP_NEW] }) });
  assert.match(refusals(atTarget), /drop of a pin still live at its target: repeated-path-word holds components\/old\/wrap -> components\/fresh\/wrap/u);
  const atKey = runW8c({ measured: w8cLive({ repeated: ['components/old'] }) });
  assert.match(refusals(atKey), /drop of a live pin: repeated-path-word still holds components\/old/u);
});

test('refused drop: a key no pin holds, a non-law class, a path still in the tree, no measurement', () => {
  const nothing = runW8c({ map: { ...W8C_MAP, drop: { [RPW]: ['components/old', WRAP, 'components/never'] } } });
  assert.match(refusals(nothing), /drop names no pin: repeated-path-word components\/never is not held by the baseline/u);
  const finding = runW8c({ map: { ...W8C_MAP, drop: { ...W8C_MAP.drop, 'snapshot.findings': [FINDING] } } });
  assert.match(refusals(finding), /malformed drop: snapshot\.findings is not a structure law/u);
  const inPlace = runW8c({ stored: w8cBaseline(['components/dep']), map: { ...W8C_MAP, drop: { [RPW]: ['components/dep', 'components/old', WRAP] } } });
  assert.match(refusals(inPlace), /drop unwitnessed: repeated-path-word components\/dep is still in the live tree/u);
  const blind = relocateStructureBaseline({ baseline: w8cBaseline(), mapText: JSON.stringify(W8C_MAP), before: tree(w8cBefore()), after: tree(w8cAfter()) });
  assert.match(refusals(blind), /drop unwitnessed: no live law measurement/u);
});

test('refused: a folder that differs by anything the within entries do not witness', () => {
  const extra = runW8c({ after: w8cAfter({ [`${SRC}${WRAP_NEW}/inner/stray/index.ts`]: 'export {};\n' }) });
  assert.match(refusals(extra), /content change: packages\/core\/src\/components\/old\/wrap -> .*subtree differs \(missing 0: -; extra 1: \/inner\/stray\/index\.ts\)/u);
  const edited = runW8c({ after: w8cAfter({ [`${SRC}${NESTED_NEW}/index.ts`]: 'export const reduced = 2;\n' }) });
  assert.match(refusals(edited), /content change: packages\/core\/src\/components\/old\/wrap\/inner\/reduced-motion -> .*content changed/u);
  const astray = runW8c({ map: { ...W8C_MAP, within: { [`${SRC}${NESTED}`]: `${SRC}components/elsewhere/preference` } } });
  assert.match(refusals(astray), /within entry leaves its renamed folder/u);
  const orphan = runW8c({ map: { ...W8C_MAP, within: { ...W8C_MAP.within, [`${SRC}components/dep`]: `${SRC}components/dependency` } } });
  assert.match(refusals(orphan), /within entry outside every renamed folder: packages\/core\/src\/components\/dep/u);
  const keyed = runW8c({ map: { ...W8C_MAP, within: { [`${SRC}${BIG}`]: `${SRC}${BIG_NEW}` } } });
  assert.match(refusals(keyed), /within entry keys a pin: packages\/core\/src\/components\/old\/big\/index\.ts belongs in rename/u);
});

test('refused: conservation — a drop while the live law still grows', () => {
  const grown = runW8c({ measured: w8cLive({ repeated: ['components/fresh'] }) });
  assert.match(refusals(grown), /semantic growth: repeated-path-word gains live member components\/fresh/u);
});

test('refused: a sectioned map carrying a value, an unknown section, or re-keying only dropped pins', () => {
  const valued = runW8c({ map: { ...W8C_MAP, drop: { [RPW]: [{ key: WRAP, count: 0 }] } } });
  assert.match(refusals(valued), /malformed drop: repeated-path-word must list the exact pin keys/u);
  const valuedRename = runW8c({ map: { ...W8C_MAP, rename: { ...MAP, [`${SRC}${BIG}`]: { to: `${SRC}${BIG_NEW}`, lines: 901 } } } });
  assert.match(refusals(valuedRename), /a map carries no value, count or rule/u);
  assert.match(refusals(runW8c({ map: { ...W8C_MAP, keep: {} } })), /unknown section keep/u);
  const stored = w8cBaseline();
  stored.laws.members['single-child-folder'] = [ZETA];
  const onlyDropped = runW8c({ stored, measured: w8cLive({ singleChild: [ZETA] }) });
  assert.match(refusals(onlyDropped), /map entry re-keys nothing: every pin at packages\/core\/src\/components\/old\/wrap is dropped/u);
});
