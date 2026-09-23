/**
 * The drill for `touch-target-floor`.
 *
 * Every case plants ONE defect into an otherwise-correct in-memory corpus and
 * asserts the leg that owns it refuses. The positive control at the end runs
 * the same corpus undefected, so a leg that has stopped measuring fails here
 * rather than reporting a clean tree. Nothing touches the repository.
 */
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  audit,
  auditDeclaration,
  auditFloorBlock,
  auditReach,
  loadImportGraph,
  readFloorPx,
  readLedger,
  COMPENSATED_EXCLUSIONS,
  FLOOR_SELECTORS,
} from '../index.mjs';
import { buildCascade, collectDeclarations, reachesFloor } from '../reach/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(here, '../../../..');
const FLOOR = 44;

const source = (name, content) => ({ name, content });

/** A minimal correct corpus: the canonical declaration plus one skin read. */
function corpus() {
  return [
    source(
      'src/foundation/tokens/css/foundation/themes/default/index.css',
      ':root { --ds-touch-target-min: 44px; }'
    ),
    source(
      'src/foundation/tokens/css/presentation/components/widget/index.css',
      ':root { --ds-widget-touch-target-min: var(--ds-touch-target-min); }'
    ),
    source(
      'src/foundation/tokens/css/runtime/engines/modern/skin/widget/index.css',
      '@media (pointer: coarse) { .w { min-block-size: var(--ds-widget-touch-target-min, 2.75rem); } }'
    ),
  ];
}

const emptyArtifact = (vertical) => ({
  vertical,
  source: source(`src/foundation/tokens/css/facade/artifacts/${vertical}/index.css`, ':root { --ds-x: 1px; }'),
});
const ARTIFACTS = ['bithire', 'evnto', 'rottay'].map(emptyArtifact);

test('positive control: the undefected corpus passes every leg', () => {
  const sources = corpus();
  const declarations = collectDeclarations([...sources, ...ARTIFACTS.map((entry) => entry.source)]);
  assert.deepEqual(auditDeclaration(declarations, FLOOR), []);
  assert.deepEqual(auditReach(sources, ARTIFACTS, FLOOR, []).problems, []);
  // Non-vacuity: the corpus really was measured.
  assert.equal(auditReach(sources, ARTIFACTS, FLOOR, []).reads, 1);
});

test('drill i: a floor below EXPRESSIVE_A11Y_FLOORS is refused', () => {
  const sources = corpus();
  sources[0] = source(sources[0].name, ':root { --ds-touch-target-min: 40px; }');
  const problems = auditDeclaration(collectDeclarations(sources), FLOOR);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /below the 44px floor/);
});

test('drill ii: a rem spelling of the canonical floor is refused by name', () => {
  const sources = corpus();
  sources[0] = source(sources[0].name, ':root { --ds-touch-target-min: 2.75rem; }');
  const problems = auditDeclaration(collectDeclarations(sources), FLOOR);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /bare physical pixel length/);
  assert.match(problems[0], /41\.25px/);
});

test('drill ii-b: the canonical channel declared twice in authored CSS is refused', () => {
  const sources = corpus();
  sources.push(source('src/foundation/tokens/css/foundation/other/index.css', ':root { --ds-touch-target-min: 44px; }'));
  const problems = auditDeclaration(collectDeclarations(sources), FLOOR);
  assert.ok(problems.some((problem) => /exactly once in authored CSS; found 2/.test(problem)), problems.join('\n'));
});

test('drill iii: a skin reading a channel declared at 32px is refused', () => {
  const sources = corpus();
  sources[1] = source(sources[1].name, ':root { --ds-widget-touch-target-min: 32px; }');
  const { problems } = auditReach(sources, ARTIFACTS, FLOOR, []);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /--ds-widget-touch-target-min does not reach the 44px floor/);
  assert.match(problems[0], /bithire\/evnto\/rottay/);
});

test('drill v: an artifact redeclaring a family touch channel below the floor is refused', () => {
  const sources = corpus();
  const artifacts = ARTIFACTS.map(({ vertical, source: file }) =>
    vertical === 'bithire'
      ? { vertical, source: source(file.name, ':root { --ds-widget-touch-target-min: 2.75rem; }') }
      : { vertical, source: file }
  );
  const { problems } = auditReach(sources, artifacts, FLOOR, []);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /--ds-widget-touch-target-min does not reach/);
  // Named per vertical, so a one-tenant regression cannot hide behind two clean ones.
  assert.match(problems[0], /in bithire —/);
});

test('drill v-b: an artifact redeclaring the CANONICAL channel is refused', () => {
  const sources = corpus();
  const artifacts = [
    { vertical: 'bithire', source: source(ARTIFACTS[0].source.name, ':root { --ds-touch-target-min: 2.75rem; }') },
  ];
  const declarations = collectDeclarations([...sources, ...artifacts.map((entry) => entry.source)]);
  const problems = auditDeclaration(declarations, FLOOR);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /redeclares --ds-touch-target-min/);
});

test('drill vi (WO-INV-03 Lot B): a sibling file no longer absolves a wrong declaration', () => {
  // `--ds-button-touch-target-min` is declared unconditionally with the floor
  // AND under `(pointer: coarse)`; only the coarse site governs a coarse pointer.
  const sources = [
    source(
      'src/foundation/tokens/css/foundation/themes/default/index.css',
      ':root { --ds-touch-target-min: 44px; }'
    ),
    source(
      'src/foundation/tokens/css/presentation/components/button/index.css',
      ':root { --ds-button-touch-target-min: max(44px, 2.75rem); }'
    ),
    source(
      'src/foundation/tokens/css/foundation/responsive/button/index.css',
      '@media (hover: none), (pointer: coarse) { :root { --ds-button-touch-target-min: 2.75rem; } }'
    ),
    source(
      'src/foundation/tokens/css/runtime/engines/modern/skin/button/index.css',
      '@media (pointer: coarse) { .b { min-block-size: var(--ds-button-touch-target-min); } }'
    ),
  ];
  const { problems } = auditReach(sources, ARTIFACTS, FLOOR, []);
  assert.equal(problems.length, 1, 'the coarse-context declaration must be judged on its own');
  assert.match(problems[0], /--ds-button-touch-target-min does not reach/);

  // Arm B: repair the coarse site the way Lot B repaired the real file. The
  // same corpus, the same sibling, the same follower — now green.
  sources[2] = source(
    sources[2].name,
    '@media (hover: none), (pointer: coarse) { :root { --ds-button-touch-target-min: max(44px, 2.75rem); } }'
  );
  assert.deepEqual(auditReach(sources, ARTIFACTS, FLOOR, []).problems, []);
});

test('drill vi-b: a declared channel is not absolved by its own read-site fallback', () => {
  const cascade = buildCascade(
    collectDeclarations([source('a.css', ':root { --ds-c-touch-target: 2.75rem; --ds-touch-target-min: 44px; }')])
  );
  // The fallback arm is unreachable while the channel is declared.
  assert.equal(reachesFloor('var(--ds-c-touch-target, 44px)', cascade, FLOOR).reached, false);
  // ...and it IS consulted when nothing declares the channel.
  assert.equal(reachesFloor('var(--ds-absent-touch-target, 44px)', cascade, FLOOR).reached, true);
});

test('drill vi-c: a fine-pointer or print declaration cannot satisfy the coarse floor', () => {
  const cascade = buildCascade(
    collectDeclarations([
      source(
        'a.css',
        '@media (pointer: fine) { :root { --ds-c-touch-target: 44px; } } @media (pointer: coarse) { :root { --ds-c-touch-target: 2rem; } }'
      ),
    ])
  );
  assert.equal(reachesFloor('var(--ds-c-touch-target)', cascade, FLOOR).reached, false);
});

test('drill vi-d: min() is refused even when it carries a satisfying literal', () => {
  const cascade = buildCascade(collectDeclarations([source('a.css', ':root { --ds-c-touch-target: 44px; }')]));
  assert.equal(reachesFloor('min(44px, 2.75rem)', cascade, FLOOR).reached, false);
  assert.equal(reachesFloor('max(44px, 2.75rem)', cascade, FLOOR).reached, true);
});

const entrypoint = () =>
  readFileSync(resolve(CORE_ROOT, 'src/foundation/tokens/css/facade/entrypoints/base/index.css'), 'utf8');

/** Every compensating skin, as the real tree ships them. */
function realCompensatingSkins() {
  return Object.values(COMPENSATED_EXCLUSIONS).map(({ skin }) => {
    const name = `src/foundation/tokens/css/runtime/engines/modern/skin/${skin}/index.css`;
    return source(name, readFileSync(resolve(CORE_ROOT, name), 'utf8'));
  });
}

/** The real cascade, from the entrypoint's own import graph. */
let cascadeCache = null;
function realCascade() {
  cascadeCache ??= buildCascade(
    collectDeclarations(loadImportGraph(resolve(CORE_ROOT, 'src/foundation/tokens/css/facade/entrypoints/base/index.css')))
  );
  return cascadeCache;
}

test('positive control: the real floor block and its four compensating skins pass', () => {
  assert.deepEqual(auditFloorBlock(entrypoint(), realCompensatingSkins(), realCascade(), FLOOR), []);
});

test('drill iv: an uncompensated exclusion is refused', () => {
  // `[role="switch"]` stays excluded from the shared roster, and the Toggle
  // skin that owes it its own floor stops declaring one.
  const skins = realCompensatingSkins().map((file) =>
    file.name.includes('/toggle/') ? source(file.name, '.t { color: red; }') : file
  );
  const problems = auditFloorBlock(entrypoint(), skins, realCascade(), FLOOR);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /\[role="switch"\] is excluded from the shared floor/);
  assert.match(problems[0], /uncompensated/);
});

test('drill iv-b: a compensating floor that does not reach 44px is refused', () => {
  const skins = realCompensatingSkins().map((file) =>
    file.name.includes('/toggle/')
      ? source(file.name, '@media (pointer: coarse) { .t { min-block-size: var(--ds-toggle-touch-target-min, 2rem); } }')
      : file
  );
  const problems = auditFloorBlock(entrypoint(), skins, buildCascade([]), FLOOR);
  assert.ok(problems.some((problem) => /compensating floor .* does not reach 44px/.test(problem)), problems.join('\n'));
});

test('drill iv-c: a SEVENTH exclusion with no compensation is refused', () => {
  const css = entrypoint().replace(
    '[role="option"] / [role="row"]',
    '[role="treeitem"] — invented;\n *   [role="option"] / [role="row"]'
  );
  const problems = auditFloorBlock(css, realCompensatingSkins(), realCascade(), FLOOR);
  assert.ok(problems.some((problem) => /\[role="treeitem"\], which this contract does not know/.test(problem)), problems.join('\n'));
});

test('drill: layering the floor block is refused', () => {
  const css = entrypoint().replace('@media (pointer: coarse) {', '@layer rottay-tokens {\n@media (pointer: coarse) {');
  const problems = auditFloorBlock(css, realCompensatingSkins(), realCascade(), FLOOR);
  assert.ok(problems.some((problem) => /sits inside an @layer/.test(problem)), problems.join('\n'));
});

test('drill: dropping a Classic row from the roster is refused (engine scope unchanged)', () => {
  const css = entrypoint().replace('  .ant-btn,\n', '');
  const problems = auditFloorBlock(css, realCompensatingSkins(), realCascade(), FLOOR);
  assert.ok(problems.some((problem) => /no longer selects \.ant-btn/.test(problem)), problems.join('\n'));
  // The roster is a real contract, not an empty list.
  assert.ok(FLOOR_SELECTORS.length >= 18);
});

test('the floor value is read from EXPRESSIVE_A11Y_FLOORS, and a rotted extraction throws', () => {
  assert.equal(
    readFloorPx(readFileSync(resolve(CORE_ROOT, 'src/foundation/tokens/ts/presentation/expressive-profiles/index.ts'), 'utf8')),
    44
  );
  assert.throws(() => readFloorPx('export const NOTHING = 1;'), /extraction rotted/);
});

test('the ledger is decrease-only: a row that has gone green fails as stale', () => {
  const sources = corpus();
  const { problems } = auditReach(sources, ARTIFACTS, FLOOR, [{ channel: '--ds-widget-touch-target-min' }]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /still carries --ds-widget-touch-target-min, which now reaches the floor/);
});

test('the Q11 ledger is retired: the file is gone and reads as zero rows', () => {
  assert.equal(existsSync(resolve(here, '../ledger/index.json')), false);
  assert.deepEqual(readLedger(), { rows: [], problems: [] });
});

test('a ledger with a placeholder statement or a row without a reason is refused', () => {
  const dir = mkdtempSync(join(tmpdir(), 'touch-ledger-'));
  const path = join(dir, 'index.json');
  writeFileSync(path, JSON.stringify({
    purpose: 'tbd', owner: 'tbd', provenance: 'tbd', retire: 'tbd',
    rows: [{ channel: '--ds-widget-touch-target', class: 'artifact-emitted', owner: 'x', reason: '' }],
  }));
  const { problems } = readLedger(path);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(problems.filter((problem) => /must be a written statement/.test(problem)).length, 4, problems.join('\n'));
  assert.ok(problems.some((problem) => /--ds-widget-touch-target is missing `reason`/.test(problem)), problems.join('\n'));
});

test('drill: a re-created ledger is refused as a new exemption, even over a genuinely red channel', () => {
  const channel = '--ds-toolbar-touch-target';
  // Red for real: bithire's artifact row rewritten to the bare rem it carried before the repair.
  const rewriteArtifact = (vertical, file) =>
    vertical === 'bithire'
      ? { ...file, content: file.content.replace(`${channel}: var(--ds-touch-target-min, 44px);`, `${channel}: 2.75rem;`) }
      : file;
  const red = audit({ rewriteArtifact });
  const reach = new Map(red.legs).get('(b) reach');
  assert.equal(reach.length, 1, reach.join('\n'));
  assert.match(reach[0], /--ds-toolbar-touch-target does not reach the 44px floor in bithire/);

  const dir = mkdtempSync(join(tmpdir(), 'touch-ledger-'));
  const ledgerPath = join(dir, 'index.json');
  writeFileSync(ledgerPath, JSON.stringify({
    purpose: 'A fresh exemption for a channel that genuinely misses the floor.',
    owner: 'nobody — this ledger was retired at zero rows',
    provenance: 'planted by the touch-target-floor drill, never committed',
    retire: 'never: the ledger is gone and recreating it is the defect',
    rows: [{ channel, class: 'artifact-emitted', value: '2.75rem', owner: 'x', reason: 'a fresh row over a red channel' }],
  }));
  const report = audit({ ledgerPath, rewriteArtifact });
  rmSync(dir, { recursive: true, force: true });
  const legs = new Map(report.legs);
  // The row really does silence the red channel on the reach leg...
  assert.deepEqual(legs.get('(b) reach'), []);
  // ...so the retirement refusal is the only thing standing between it and a green gate.
  assert.equal(legs.get('ledger shape').length, 1, legs.get('ledger shape').join('\n'));
  assert.match(legs.get('ledger shape')[0], /a new row is a new exemption/);
});

test('the real tree passes every leg of the contract', () => {
  const report = audit();
  for (const [leg, problems] of report.legs) assert.deepEqual(problems, [], `${leg}: ${problems.join('\n')}`);
  // Non-vacuity floors: a walker that stopped walking reports a clean tree.
  assert.ok(report.sources >= 400, `only ${report.sources} files in the import graph`);
  assert.ok(report.reads >= 100, `only ${report.reads} skin touch reads discovered`);
  assert.equal(report.floorPx, 44);
});
