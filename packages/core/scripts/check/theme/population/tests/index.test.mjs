/**
 * The drill for the denominator owner.
 *
 * Every percentage this lane publishes is a fraction of these numbers, so the
 * question the suite asks is the one a reader would ask: can the population be
 * made smaller without anybody noticing. Each case plants a real shrinking
 * move -- a family whose skin stops declaring an axis, a whole skin folder
 * deleted, a declaration hidden inside a comment -- into a sandbox copy of the
 * corpus and asserts the floor refuses it.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, mkdirSync, readdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, describe, it } from 'node:test';

import {
  AXES,
  AXIS_IDS,
  SELECTOR_RULE,
  axisChannels,
  catalogRevision,
  checkExclusionRegistry,
  checkPilotPopulation,
  checkPopulationFloor,
  cssRules,
  declaredProperties,
  exclusionsRevision,
  familyAxisDeclarations,
  axisUnobservable,
  isStateDeclaration,
  normalizeCssText,
  pilotPopulation,
  populationLine,
  populationReport,
  privateChannelProducers,
  privateChannelsRead,
  readChannels,
  readExclusions,
  skinFamilies,
  stripCssComments,
  withNotApplicable,
} from '../index.mjs';
import * as population from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const AGNOSTIC_ROOT = 'src/foundation/tokens/css/presentation/components/skin';
const CATALOG = 'src/contracts/theme/runtime/catalog/index.ts';
const FLOOR = join(ROOT, 'scripts/check/theme/population/baseline/index.json');
const ROSTER = 'scripts/check/family-cut/baseline/index.json';
const PILOT_PIN = join(ROOT, 'scripts/check/theme/population/pilot/index.json');
const EXCLUSIONS = join(ROOT, 'scripts/check/theme/population/exclusions/index.json');
const RADIO_SKIN = `${SKIN_ROOT}/radio/index.css`;
const RADIO_GROUP_SKIN = `${AGNOSTIC_ROOT}/radio-group/index.css`;
const REVIEW = 'WO-EVI-05 core review 2026-09-14';
const CHART_REVIEW = 'WO-EVI-02 chart-marks shape exclusion review 2026-09-30 (X1 dossier; Fable ACCEPT-WITH-CHANGES, conditions consolidated by the DT; Codex outside the loop by owner restriction 2026-09-19)';
// Mover: WO-EVI-02 CL104 re-review 2026-10-01 (Fable) -- the chart-line entry is narrowed to its legend-swatch declaration.
const CHART_LINE_REVIEW = `${CHART_REVIEW} | CL104 re-review 2026-10-01 (Fable): the skeleton-bar declaration (\`999px 999px 0 0\`, skin :104) is withdrawn from the entry: chart-foundation :1446 out-specifies it (0,5,0 over 0,2,0) and it paints nothing at dial 0.8/1.0/1.2 (measured); a declaration that paints nothing has no semantic identity. chart-line stays in shape on it, the entry is INEFFECTIVE by name, until the charts cut resolves the shadowing (defect registered under WO-FAM-09)`;
// The one ineffective entry on this tree, published by name (CL104): never emptied, never silenced.
const CHART_LINE_INEFFECTIVE = [{ family: 'chart-line', axis: 'shape', stillDeclares: ['border-radius'], headChannels: [] }];
const TT_REVIEW = 'WO-EVI-02 table-toolbar shape exclusion review 2026-10-01 (X3 dossier; Fable ACCEPT-WITH-CHANGES, conditions consolidated by the DT; Codex outside the loop by owner restriction 2026-09-19)';
const PHYSICAL_CORNERS = ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-left-radius', 'border-bottom-right-radius'];

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

/** A sandbox carrying only what the population walk reads: both skin roots, the catalog and the family-cut roster. */
function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'evi02-population-'));
  sandboxes.push(dir);
  for (const skinRoot of [SKIN_ROOT, AGNOSTIC_ROOT]) {
    mkdirSync(join(dir, skinRoot), { recursive: true });
    cpSync(join(ROOT, skinRoot), join(dir, skinRoot), { recursive: true });
  }
  mkdirSync(join(dir, dirname(ROSTER)), { recursive: true });
  cpSync(join(ROOT, ROSTER), join(dir, ROSTER));
  mkdirSync(join(dir, 'src/contracts/theme/runtime/catalog'), { recursive: true });
  cpSync(join(ROOT, CATALOG), join(dir, CATALOG));
  return dir;
}

const catalogIn = (dir) => join(dir, CATALOG);
const baseRegistry = () => JSON.parse(readFileSync(EXCLUSIONS, 'utf8'));
const writeRegistry = (dir, registry, name = 'exclusions.json') => {
  const path = join(dir, name);
  writeFileSync(path, JSON.stringify(registry, null, 2));
  return path;
};
const radiiOf = (file) => cssRules(readFileSync(file, 'utf8')).flatMap((rule) =>
  rule.declarations
    .filter((declaration) => AXES.shape.authored.includes(declaration.property))
    .map((declaration) => ({ context: rule.atRules, selector: rule.selector, property: declaration.property, value: declaration.value })));
const CIRCLE_RULE = /\.ds-radio\.ds-radio--modern \[data-part='circle'\] \{[^}]*\}/u;
const ROOT_RULE = /\.ds-radio\.ds-radio--modern\[data-part='root'\] \{[^}]*\}/u;

describe('theme population — the denominator is read, not assumed', () => {
  it('publishes a content revision of the catalog it read', () => {
    const revision = catalogRevision();
    assert.match(revision.digest, /^[0-9a-f]{16}$/);
    assert.ok(revision.decisionRows > 0, 'a catalog with no decisions is not a population');
    assert.ok(revision.rowIds.includes('palette.seeds'));
  });

  it('the six axes are the six NON-CHROMATIC ones of kit rule 4', () => {
    assert.deepEqual(AXIS_IDS, ['shape', 'typography', 'rhythm', 'depth', 'states', 'motion']);
    assert.ok(!AXIS_IDS.includes('color'), 'colour is excluded by the rule this file implements');
  });

  it('a commented-out declaration is not a declaration', () => {
    assert.deepEqual([...declaredProperties('a { /* border-radius: 4px; */ color: red; }')], ['color']);
    assert.equal(stripCssComments('/* var(--ds-x) */ b{}').includes('--ds-x'), false);
    assert.deepEqual([...readChannels('a { color: var(--ds-color-primary); }')], ['--ds-color-primary']);
  });

  it('every axis denominator is a real, non-empty subset of the skin corpus', () => {
    const report = populationReport();
    const families = skinFamilies();
    for (const entry of report.axes) {
      assert.ok(entry.denominator > 0, `${entry.axis}: empty denominator`);
      assert.ok(entry.denominator <= families.size, `${entry.axis}: denominator exceeds the corpus`);
      for (const family of entry.families) {
        assert.ok(families.has(family), `${entry.axis}: ${family} is not a skin family`);
      }
    }
  });

  it('the floor passes on the tree it was pinned against', () => {
    const { failures } = checkPopulationFloor();
    assert.deepEqual(failures, [], failures.join('\n'));
  });
});

describe('theme population drills — a shrunken denominator is refused', () => {
  it('MUTANT: a skin that stops declaring an axis leaves that axis denominator', () => {
    const dir = sandbox();
    const before = familyAxisDeclarations(dir, catalogIn(dir));
    const victim = [...before].find(([, record]) => record.axes.shape && record.files.length === 1);
    assert.ok(victim, 'the corpus must carry a single-file family declaring shape');
    const [family, record] = victim;
    const file = join(dir, record.files[0]);
    const source = readFileSync(file, 'utf8');
    writeFileSync(file, source.replace(/border(-[a-z-]*)?radius\s*:/g, 'x-drill-neutralised:'));
    const after = familyAxisDeclarations(dir, catalogIn(dir));
    assert.ok(!after.get(family).axes.shape || after.get(family).axes.shape.properties.length === 0,
      `${family} still declares shape after its radius declarations were neutralised`);
  });

  it('MUTANT: deleting a skin folder shrinks the population and the floor goes red', () => {
    const dir = sandbox();
    const report = populationReport(dir, catalogIn(dir));
    const floor = JSON.parse(readFileSync(FLOOR, 'utf8'));
    const pinned = { ...floor, skinFamilies: report.skinFamilies };
    for (const entry of report.axes) pinned.axes[entry.axis] = entry.denominator;
    const floorPath = join(dir, 'floor.json');
    writeFileSync(floorPath, JSON.stringify(pinned));
    assert.deepEqual(checkPopulationFloor(dir, catalogIn(dir), floorPath).failures, [],
      'the sandbox must be green before the mutation');

    const doomed = report.axes.find((entry) => entry.axis === 'shape').families[0];
    for (const skinRoot of [SKIN_ROOT, AGNOSTIC_ROOT]) rmSync(join(dir, skinRoot, doomed), { recursive: true, force: true });
    const { failures } = checkPopulationFloor(dir, catalogIn(dir), floorPath);
    assert.ok(failures.some((line) => line.includes('is BELOW its floor')),
      `deleting ${doomed} did not trip the floor: ${failures.join(' | ')}`);
  });

  it('MUTANT: commenting a family’s only motion declaration drops it from motion', () => {
    const dir = sandbox();
    const before = familyAxisDeclarations(dir, catalogIn(dir));
    const victim = [...before].find(([, record]) =>
      record.axes.motion && record.files.length === 1
      && record.axes.motion.properties.length > 0 && record.axes.motion.headChannels.length === 0);
    assert.ok(victim, 'the corpus must carry a single-file family declaring motion by property');
    const [family, record] = victim;
    const file = join(dir, record.files[0]);
    const source = readFileSync(file, 'utf8');
    const commented = source.replace(
      /^(\s*)(transition|animation)([-a-z]*)\s*:([^;]*);/gmu,
      (_match, indent, head, tail, value) => `${indent}/* ${head}${tail}:${value}; */`,
    );
    assert.notEqual(commented, source, 'the mutation must actually change the file');
    writeFileSync(file, commented);
    const after = familyAxisDeclarations(dir, catalogIn(dir));
    assert.ok(!after.get(family)?.axes.motion,
      `${family} still declares motion from inside a comment`);
  });

  it('MUTANT: an axis with no pin is refused rather than defaulted', () => {
    const dir = sandbox();
    const report = populationReport(dir, catalogIn(dir));
    const pinned = { skinFamilies: report.skinFamilies, axes: {} };
    for (const entry of report.axes) pinned.axes[entry.axis] = entry.denominator;
    delete pinned.axes.depth;
    const floorPath = join(dir, 'floor.json');
    writeFileSync(floorPath, JSON.stringify(pinned));
    const { failures } = checkPopulationFloor(dir, catalogIn(dir), floorPath);
    assert.ok(failures.some((line) => line.startsWith('depth: no pinned denominator floor')), failures.join(' | '));
  });

  it('MUTANT: a growing denominator is refused too, so the pin cannot drift', () => {
    const dir = sandbox();
    const report = populationReport(dir, catalogIn(dir));
    const pinned = { skinFamilies: report.skinFamilies, axes: {} };
    for (const entry of report.axes) pinned.axes[entry.axis] = entry.denominator;
    pinned.axes.states -= 1;
    const floorPath = join(dir, 'floor.json');
    writeFileSync(floorPath, JSON.stringify(pinned));
    const { failures } = checkPopulationFloor(dir, catalogIn(dir), floorPath);
    assert.ok(failures.some((line) => line.includes('is ABOVE its pin')), failures.join(' | '));
  });

  it('the authored and computed vocabularies are both non-empty for every painted axis', () => {
    for (const axis of AXIS_IDS) {
      if (axis === 'states') {
        assert.ok(AXES[axis].computed.length > 0 && population.KERNEL_STATE_TOKENS.length > 0);
        continue;
      }
      assert.ok(AXES[axis].authored.length > 0, `${axis}: no authored vocabulary`);
      assert.ok(AXES[axis].computed.length > 0, `${axis}: no computed vocabulary`);
    }
  });
  // The namespaced-state drill of f8298d417 is reversed by STATES-K drill D5 below.
});

describe('theme population — the pilot population of WO-EVI-05', () => {
  it('is the WO-FAM-01 roster with the axes each family declares, and matches its publication', () => {
    const pilot = pilotPopulation();
    assert.deepEqual(Object.keys(pilot.families), ['button', 'checkbox', 'radio', 'segmented', 'toggle']);
    const fleet = populationReport();
    for (const [family, axes] of Object.entries(pilot.families)) {
      for (const axis of axes) {
        assert.ok(fleet.axes.find((entry) => entry.axis === axis).families.includes(family), `${family}/${axis} is not a fleet declaration`);
      }
    }
    assert.deepEqual(checkPilotPopulation(ROOT, undefined, PILOT_PIN, { revision: true }).failures, []);
  });

  it('MUTANT: a pilot family whose skin stops declaring an axis no longer matches the publication', () => {
    const dir = sandbox();
    const skin = join(dir, SKIN_ROOT, 'radio/index.css');
    writeFileSync(skin, readFileSync(skin, 'utf8').replace(/transition(-duration)?\s*:[^;]*;/gu, ''));
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN);
    assert.ok(failures.some((line) => line.startsWith('radio: published axes')), failures.join(' | '));
    assert.ok(failures.includes('motion: published pilot denominator 5 != 4'), failures.join(' | '));
  });

  it('MUTANT: a family leaving the cut roster, or a rostered family with no skin, is named', () => {
    const dir = sandbox();
    const rosterPath = join(dir, ROSTER);
    const roster = JSON.parse(readFileSync(rosterPath, 'utf8'));
    delete roster.families.segmented;
    roster.families.phantom = { cut: 'WO-FAM-01' };
    writeFileSync(rosterPath, JSON.stringify(roster));
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN);
    assert.ok(failures.includes('segmented: published in the pilot population and no longer in the WO-FAM-01 roster'));
    assert.ok(failures.includes('phantom: rostered in WO-FAM-01 with no Modern skin, so it declares no axis to measure'));
  });

  it('MUTANT: a publication at another catalog revision is refused only when the revision is asked for', () => {
    const dir = sandbox();
    const pinPath = join(dir, 'pilot.json');
    writeFileSync(pinPath, JSON.stringify({ ...JSON.parse(readFileSync(PILOT_PIN, 'utf8')), catalogRevision: '0000000000000000' }));
    assert.deepEqual(checkPilotPopulation(dir, catalogIn(dir), pinPath).failures, []);
    assert.ok(checkPilotPopulation(dir, catalogIn(dir), pinPath, { revision: true }).failures
      .some((line) => line.startsWith('catalog revision')));
  });
});

describe('theme population — the reviewed semantic-identity exclusion of radio/shape (WO-EVI-05)', () => {
  it('admits exactly radio/shape, chart-line/shape, chart-pie/shape and table-toolbar/shape, on the byProperty path only, and validates green on the tree', () => {
    const registry = readExclusions();
    // Movers of the pin (radio only -> + chart-line, chart-pie): WO-EVI-02 X1 dossier + Fable review 2026-09-30;
    // (+ table-toolbar): WO-EVI-02 X3 dossier + Fable review 2026-10-01.
    assert.deepEqual(registry.admitted, [
      { family: 'radio', axis: 'shape' },
      { family: 'chart-line', axis: 'shape' },
      { family: 'chart-pie', axis: 'shape' },
      { family: 'table-toolbar', axis: 'shape' },
    ]);
    assert.deepEqual(registry.entries.map((entry) => [entry.family, entry.axis, entry.path, entry.review]),
      [['radio', 'shape', 'byProperty', REVIEW], ['chart-line', 'shape', 'byProperty', CHART_LINE_REVIEW], ['chart-pie', 'shape', 'byProperty', CHART_REVIEW],
        ['table-toolbar', 'shape', 'byProperty', TT_REVIEW]]);
    assert.deepEqual(checkExclusionRegistry().failures, []);
  });

  it('names the two reviewed declarations verbatim, and they are the only radii the radio skin authors', () => {
    const [entry] = readExclusions().entries;
    assert.equal(entry.skin, RADIO_SKIN);
    assert.deepEqual(radiiOf(join(ROOT, entry.skin)), entry.declarations);
    assert.deepEqual(entry.declarations.map((declaration) => declaration.selector), [
      ".ds-radio.ds-radio--modern [data-part='circle']",
      ".ds-radio.ds-radio--modern [data-part='dot']",
    ]);
    assert.ok(entry.declarations.every((declaration) => declaration.value === 'var(--ds-radius-full)'));
    assert.ok(!axisChannels().get('shape').has('--ds-radius-full'),
      'the exclusion acts on the byProperty path only: --ds-radius-full is not a shape head channel');
  });

  it('withdraws radio from shape as NOT APPLICABLE with its reason, in the declarations, the report, the runner line and the pilot', () => {
    const radio = familyAxisDeclarations().get('radio');
    assert.deepEqual(Object.keys(radio.axes), ['typography', 'rhythm', 'depth', 'states', 'motion']);
    assert.equal(radio.notApplicable.shape.review, REVIEW);
    assert.equal(radio.notApplicable.shape.excludedDeclarations.length, 2);

    const report = populationReport();
    const shape = report.axes.find((entry) => entry.axis === 'shape');
    assert.ok(!shape.families.includes('radio'));
    assert.deepEqual(shape.notApplicable.map((entry) => entry.family), ['chart-pie', 'radio', 'table-toolbar']);
    assert.equal(shape.notApplicableCount, 3);
    for (const entry of report.axes) {
      assert.ok(entry.families.every((family) => !entry.notApplicable.some((withdrawn) => withdrawn.family === family)),
        `${entry.axis}: applicable and not-applicable sets must be disjoint`);
      if (entry.axis !== 'shape') assert.equal(entry.notApplicableCount, 0, `${entry.axis}: no exclusion is reviewed there`);
    }
    // Mover: CL104 -- chart-line is in shape on a shadowed declaration and its entry is published INEFFECTIVE by name.
    assert.deepEqual(report.exclusions.ineffective, CHART_LINE_INEFFECTIVE);
    assert.equal(report.exclusions.revision, exclusionsRevision());

    const line = populationLine();
    assert.match(line, /shape 215 \(3 N\/A\)/);
    assert.match(line, /typography 182 \(0 N\/A\)/);
    assert.match(line, /exclusions [0-9a-f]{16} \(4 reviewed\)/);

    const pilot = pilotPopulation();
    assert.deepEqual(pilot.families.radio, ['typography', 'rhythm', 'depth', 'states', 'motion']);
    assert.deepEqual(Object.keys(pilot.notApplicable), ['radio']);
    assert.deepEqual(Object.keys(pilot.notApplicable.radio), ['shape']);
    assert.equal(pilot.notApplicable.radio.shape.review, REVIEW);
    assert.deepEqual(pilot.denominators, { shape: 4, typography: 5, rhythm: 5, depth: 5, states: 5, motion: 5 });
    assert.deepEqual(pilot.notApplicableCounts, { shape: 1, typography: 0, rhythm: 0, depth: 0, states: 0, motion: 0 });
    assert.deepEqual(withNotApplicable([{ axis: 'shape', moved: 4, denominator: 4 }], pilot),
      [{ axis: 'shape', moved: 4, denominator: 4, notApplicable: 1, declared: 5 }]);
  });

  it('the pilot pin and the fleet floor carry the N/A beside the denominator, record the previous membership, and match the live derivation', () => {
    const pin = JSON.parse(readFileSync(PILOT_PIN, 'utf8'));
    assert.deepEqual(pin.denominators, { shape: 4, typography: 5, rhythm: 5, depth: 5, states: 5, motion: 5 });
    assert.deepEqual(pin.notApplicableCounts, { shape: 1, typography: 0, rhythm: 0, depth: 0, states: 0, motion: 0 });
    assert.equal(pin.notApplicable.radio.shape.review, REVIEW);
    assert.equal(pin.exclusionsRevision, exclusionsRevision());
    assert.equal(pin.provenance.previousPin.denominators.shape, 5);
    assert.deepEqual(pin.provenance.membershipMoves.shape.removed, ['radio']);

    const floor = JSON.parse(readFileSync(FLOOR, 'utf8'));
    // Movers: CL104 re-review 2026-10-01 (Fable) -- chart-line re-enters shape (214 -> 215, N/A 4 -> 3);
    // OVM 2026-10-02 (owner ruling 4 + Fable) -- the overlay-modal-compounds orphans retire (215 -> 214);
    // GLASS-1 (owner ruling 3) -- the glass-card skin enters shape and depth (214 -> 215).
    assert.equal(floor.axes.shape, 215);
    assert.deepEqual(floor.provenance.membershipMoves.orphanRetirement.byAxis,
      Object.fromEntries(['shape', 'depth', 'states'].map((axis) => [axis, { removed: ['overlay-modal-compounds'], added: [] }])));
    assert.equal(floor.notApplicable.shape, 3);
    assert.deepEqual(floor.provenance.membershipMoves.byAxis.shape.removed, ['chart-pie', 'table-toolbar']);
    assert.deepEqual(floor.provenance.membershipMoves.byAxis.shape.reEntered, ['chart-line']);
    assert.equal(floor.exclusionsRevision, exclusionsRevision());
    assert.equal(floor.provenance.previousPin.axes.shape, 215);
    assert.deepEqual(floor.provenance.membershipMoves.previousWave.byAxis.shape, { removed: ['radio'], added: [] });
    assert.deepEqual(floor.provenance.membershipMoves.previousWave.physicalCornerLonghands.newEntrants, []);

    assert.deepEqual(checkPilotPopulation(ROOT, undefined, PILOT_PIN, { revision: true }).failures, []);
    assert.deepEqual(checkPopulationFloor().failures, []);
  });

  it('MUTANT: the previous pin, which counted radio on shape, is refused by name', () => {
    const dir = sandbox();
    const pin = JSON.parse(readFileSync(PILOT_PIN, 'utf8'));
    const stale = {
      ...pin,
      families: { ...pin.families, radio: [...AXIS_IDS] },
      notApplicable: {},
      denominators: { ...pin.denominators, shape: 5 },
      notApplicableCounts: { ...pin.notApplicableCounts, shape: 0 },
    };
    const pinPath = writeRegistry(dir, stale, 'stale-pin.json');
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), pinPath);
    assert.ok(failures.includes('radio: published axes [shape, typography, rhythm, depth, states, motion] != declared [typography, rhythm, depth, states, motion]'), failures.join(' | '));
    assert.ok(failures.some((line) => line.startsWith('radio/shape: withdrawn by a reviewed exclusion')), failures.join(' | '));
    assert.ok(failures.includes('shape: published pilot denominator 5 != 4'), failures.join(' | '));
    assert.ok(failures.includes('shape: published pilot not-applicable count 0 != 1'), failures.join(' | '));
  });

  it('MUTANT: a pin that publishes radio/shape as both applicable and not applicable is refused', () => {
    const dir = sandbox();
    const pin = JSON.parse(readFileSync(PILOT_PIN, 'utf8'));
    const overlapping = { ...pin, families: { ...pin.families, radio: [...AXIS_IDS] } };
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), writeRegistry(dir, overlapping, 'overlap-pin.json'));
    assert.ok(failures.includes('radio/shape: published BOTH applicable and not applicable; the two sets must be disjoint'), failures.join(' | '));
  });

  it('MUTANT (a): a tenant corner planted on the radio ROOT re-enters shape and the published pilot pin refuses it', () => {
    const dir = sandbox();
    const skin = join(dir, RADIO_SKIN);
    const source = readFileSync(skin, 'utf8');
    const planted = source.replace(
      ".ds-radio.ds-radio--modern[data-part='root'] {\n  position: relative;",
      ".ds-radio.ds-radio--modern[data-part='root'] {\n  border-radius: var(--ds-radio-corner, var(--ds-radius-md));\n  position: relative;",
    );
    assert.notEqual(planted, source, 'the mutation must reach the root rule');
    writeFileSync(skin, planted);
    const radio = familyAxisDeclarations(dir, catalogIn(dir)).get('radio');
    assert.deepEqual(radio.axes.shape.properties, ['border-radius']);
    assert.deepEqual(radio.axes.shape.headChannels, ['--ds-radius-md']);
    assert.equal(radio.axes.shape.exclusionEffective, false);
    assert.equal(radio.axes.shape.excludedDeclarations.length, 2, 'the reviewed pair still matches; the root corner is what re-enters');
    assert.deepEqual(radio.notApplicable, {});
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN);
    assert.ok(failures.some((line) => line.startsWith('radio/shape: published NOT APPLICABLE and now declared')), failures.join(' | '));
    assert.ok(failures.includes('radio: published axes [typography, rhythm, depth, states, motion] != declared [shape, typography, rhythm, depth, states, motion]'), failures.join(' | '));
    assert.ok(failures.includes('shape: published pilot denominator 4 != 5'), failures.join(' | '));
    assert.ok(failures.includes('shape: published pilot not-applicable count 1 != 0'), failures.join(' | '));
    assert.ok(populationReport(dir, catalogIn(dir)).exclusions.ineffective.some((entry) => entry.family === 'radio' && entry.axis === 'shape'));
    assert.deepEqual(checkExclusionRegistry(dir).failures, [], 'the registry is not stale: the reviewed declarations are still authored verbatim');
  });

  it('MUTANT (d): fronting the reviewed declaration with a channel, replacing its token or adding !important invalidates the exclusion', () => {
    for (const replacement of [
      'var(--ds-radio-corner, var(--ds-radius-full))',
      'var(--ds-radius-lg)',
      'var(--ds-radius-full) !important',
    ]) {
      const dir = sandbox();
      const skin = join(dir, RADIO_SKIN);
      const source = readFileSync(skin, 'utf8');
      const mutated = source.replace('border-radius: var(--ds-radius-full);', `border-radius: ${replacement};`);
      assert.notEqual(mutated, source);
      writeFileSync(skin, mutated);
      const radio = familyAxisDeclarations(dir, catalogIn(dir)).get('radio');
      assert.ok(radio.axes.shape, `${replacement}: radio must re-enter shape`);
      assert.deepEqual(radio.axes.shape.properties, ['border-radius']);
      assert.equal(radio.axes.shape.excludedDeclarations.length, 1, `${replacement}: only the dot still matches the review`);
      assert.deepEqual(radio.notApplicable, {});
      const { failures } = checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN);
      assert.ok(failures.some((line) => line.startsWith('radio/shape: published NOT APPLICABLE and now declared')), `${replacement}: ${failures.join(' | ')}`);
      assert.ok(failures.some((line) => line.includes('STALE') && line.includes("[data-part='circle']")),
        `${replacement}: the registry must name the stale declaration: ${failures.join(' | ')}`);
    }
  });

  it('MUTANT (e): a second rule with the same selector text and another radius, later in the file, re-enters the family', () => {
    const dir = sandbox();
    const skin = join(dir, RADIO_SKIN);
    writeFileSync(skin, `${readFileSync(skin, 'utf8')}\n.ds-radio.ds-radio--modern [data-part='circle'] {\n  border-radius: var(--ds-radius-md);\n}\n`);
    const radio = familyAxisDeclarations(dir, catalogIn(dir)).get('radio');
    assert.ok(radio.axes.shape, 'radio must re-enter shape');
    assert.deepEqual(radio.axes.shape.properties, ['border-radius']);
    assert.deepEqual(radio.axes.shape.headChannels, ['--ds-radius-md']);
    assert.equal(radio.axes.shape.excludedDeclarations.length, 2, 'the reviewed pair still matches; the third declaration is what re-enters');
    assert.deepEqual(radio.notApplicable, {});
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN);
    assert.ok(failures.some((line) => line.startsWith('radio/shape: published NOT APPLICABLE and now declared')), failures.join(' | '));
    assert.deepEqual(checkExclusionRegistry(dir).failures, [], 'the registry is not stale; the duplicate rule is a declaration of its own');
  });

  it('MUTANT (f): an entry whose selector is not authored in the named file fails, and a selector living only in a comment does not satisfy it', () => {
    const dir = sandbox();
    const registry = baseRegistry();
    registry.entries[0].declarations[0].selector = ".ds-radio.ds-radio--modern [data-part='frame']";
    const path = writeRegistry(dir, registry);
    const named = (failures) => failures.some((line) => line.includes('selector not authored') && line.includes("[data-part='frame']"));
    assert.ok(named(checkExclusionRegistry(dir, path).failures));

    const skin = join(dir, RADIO_SKIN);
    writeFileSync(skin, `${readFileSync(skin, 'utf8')}\n/* .ds-radio.ds-radio--modern [data-part='frame'] { border-radius: var(--ds-radius-full); } */\n`);
    assert.ok(named(checkExclusionRegistry(dir, path).failures), 'F-23: a selector inside a comment is not an authored one');

    const radio = familyAxisDeclarations(dir, catalogIn(dir), path).get('radio');
    assert.ok(radio.axes.shape, 'a stale entry excludes nothing it does not match: the circle radius counts again');
    assert.equal(radio.axes.shape.excludedDeclarations.length, 1);
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN, { exclusionsPath: path });
    assert.ok(failures.some((line) => line.startsWith('exclusion registry: entry 0 (radio/shape): selector not authored')), failures.join(' | '));
    assert.ok(failures.some((line) => line.startsWith('radio/shape: published NOT APPLICABLE and now declared')), failures.join(' | '));
  });

  it('MUTANT (g): an entry for a family that still authors radius on a non-excluded selector has no effect', () => {
    const dir = sandbox();
    const checkboxFile = familyAxisDeclarations(dir, catalogIn(dir)).get('checkbox').files[0];
    const radii = radiiOf(join(dir, checkboxFile));
    assert.ok(radii.length >= 2, 'the drill needs a family with at least two radius declarations');
    const registry = baseRegistry();
    registry.admitted.push({ family: 'checkbox', axis: 'shape' });
    registry.entries.push({
      family: 'checkbox', axis: 'shape', path: 'byProperty', skin: checkboxFile, declarations: [radii[0]], reason: 'drill', review: 'drill',
    });
    const path = writeRegistry(dir, registry);
    assert.deepEqual(checkExclusionRegistry(dir, path).failures, []);
    const checkbox = familyAxisDeclarations(dir, catalogIn(dir), path).get('checkbox');
    assert.ok(checkbox.axes.shape, 'checkbox stays in shape');
    assert.equal(checkbox.axes.shape.exclusionEffective, false);
    assert.equal(checkbox.axes.shape.excludedDeclarations.length, 1);
    assert.deepEqual(checkbox.notApplicable, {});
    const report = populationReport(dir, catalogIn(dir), path);
    assert.ok(report.axes.find((entry) => entry.axis === 'shape').families.includes('checkbox'));
    assert.deepEqual(report.axes.find((entry) => entry.axis === 'shape').notApplicable.map((entry) => entry.family), ['chart-pie', 'radio', 'table-toolbar']);
    assert.ok(report.exclusions.ineffective.some((entry) => entry.family === 'checkbox' && entry.axis === 'shape'));
    assert.deepEqual(checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN, { exclusionsPath: path }).failures, [],
      'an ineffective entry changes no published denominator');
  });

  it('MUTANT: a duplicate entry, an unadmitted pair, a head-channel path and a foreign skin file are each refused by name, on both gates', () => {
    const dir = sandbox();

    const duplicated = baseRegistry();
    duplicated.entries.push(JSON.parse(JSON.stringify(duplicated.entries[0])));
    assert.ok(checkExclusionRegistry(dir, writeRegistry(dir, duplicated, 'dup.json')).failures
      .some((line) => line.includes('duplicate of an earlier entry')));

    const toggleFile = familyAxisDeclarations(dir, catalogIn(dir)).get('toggle').files[0];
    const unadmitted = baseRegistry();
    unadmitted.entries.push({
      family: 'toggle', axis: 'shape', path: 'byProperty', skin: toggleFile,
      declarations: [radiiOf(join(dir, toggleFile))[0]], reason: 'drill', review: 'drill',
    });
    assert.ok(checkExclusionRegistry(dir, writeRegistry(dir, unadmitted, 'unadmitted.json')).failures
      .some((line) => line.includes('toggle/shape is not an admitted exclusion')));

    const headChannel = baseRegistry();
    headChannel.entries[0].path = 'byHeadChannel';
    assert.ok(checkExclusionRegistry(dir, writeRegistry(dir, headChannel, 'head.json')).failures
      .some((line) => line.includes('is not byProperty; a head-channel read is never excluded')));

    const foreign = baseRegistry();
    foreign.entries[0].skin = RADIO_GROUP_SKIN;
    const foreignPath = writeRegistry(dir, foreign, 'foreign.json');
    assert.ok(checkExclusionRegistry(dir, foreignPath).failures.some((line) => line.includes('is not a skin file of radio')));
    assert.ok(checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN, { exclusionsPath: foreignPath }).failures
      .some((line) => line.startsWith('exclusion registry: ') && line.includes('is not a skin file of radio')));
    assert.ok(checkPopulationFloor(dir, catalogIn(dir), FLOOR, foreignPath).failures
      .some((line) => line.startsWith('exclusion registry: ') && line.includes('is not a skin file of radio')));
  });

  it('MUTANT: a registry edit that the pins do not carry is refused by both gates when the revision is asked for', () => {
    const dir = sandbox();
    const reworded = baseRegistry();
    reworded.entries[0].reason = `${reworded.entries[0].reason} (reworded)`;
    const path = writeRegistry(dir, reworded, 'reworded.json');
    assert.deepEqual(checkExclusionRegistry(dir, path).failures, []);
    assert.ok(checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN, { revision: true, exclusionsPath: path }).failures
      .some((line) => line.startsWith('exclusions revision')));
    assert.ok(checkPopulationFloor(dir, catalogIn(dir), FLOOR, path).failures
      .some((line) => line.startsWith('exclusions revision')));
    assert.ok(checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN, { exclusionsPath: path }).failures
      .some((line) => line.startsWith('radio/shape: the published not-applicable reason or review differs')));
  });

  it('(c) radio-group is a separate population family the exclusion never reaches: baseline first, then a severed chain keeps it applicable', () => {
    const dir = sandbox();
    const before = familyAxisDeclarations(dir, catalogIn(dir)).get('radio-group');
    assert.ok(before, 'the sandbox must carry the agnostic skin root that owns radio-group');
    assert.deepEqual(before.files, [RADIO_GROUP_SKIN]);
    assert.deepEqual(before.axes.shape, { properties: ['border-radius'], headChannels: ['--ds-radius-md'] });
    assert.deepEqual(before.notApplicable, {});
    assert.deepEqual(radiiOf(join(dir, RADIO_GROUP_SKIN)), [
      { context: [], selector: ".ds-radio-group.ds-radio-group--button [data-part='option']", property: 'border-radius', value: 'var(--ds-radius-md)' },
    ]);

    const skin = join(dir, RADIO_GROUP_SKIN);
    const source = readFileSync(skin, 'utf8');
    const severed = source.replace('border-radius: var(--ds-radius-md);', 'border-radius: 8px;');
    assert.notEqual(severed, source);
    writeFileSync(skin, severed);
    const after = familyAxisDeclarations(dir, catalogIn(dir)).get('radio-group');
    assert.deepEqual(after.axes.shape, { properties: ['border-radius'], headChannels: [] });
    assert.deepEqual(after.notApplicable, {});
    const shape = populationReport(dir, catalogIn(dir)).axes.find((entry) => entry.axis === 'shape');
    assert.ok(shape.families.includes('radio-group'));
    assert.ok(!shape.notApplicable.some((entry) => entry.family === 'radio-group'));

    const aimed = baseRegistry();
    aimed.entries[0].skin = RADIO_GROUP_SKIN;
    aimed.entries[0].declarations = [
      { context: [], selector: ".ds-radio-group.ds-radio-group--button [data-part='option']", property: 'border-radius', value: 'var(--ds-radius-md)' },
    ];
    assert.ok(checkExclusionRegistry(dir, writeRegistry(dir, aimed, 'aimed.json')).failures
      .some((line) => line.includes('is not a skin file of radio')), 'the entry is keyed by family id and file path');
  });

  it('(B) a physical corner longhand declares shape, and widening the vocabulary moved no denominator', () => {
    const dir = sandbox();
    mkdirSync(join(dir, SKIN_ROOT, 'drill-physical'));
    writeFileSync(join(dir, SKIN_ROOT, 'drill-physical/index.css'), '.ds-drill-physical { border-top-left-radius: 4px; }\n');
    const record = familyAxisDeclarations(dir, catalogIn(dir)).get('drill-physical');
    assert.deepEqual(record.axes.shape.properties, ['border-top-left-radius']);
    assert.ok(PHYSICAL_CORNERS.every((name) => AXES.shape.authored.includes(name)));

    const authoring = {};
    for (const [family, files] of skinFamilies()) {
      const properties = declaredProperties(files.map((file) => readFileSync(file, 'utf8')).join('\n'));
      const physical = PHYSICAL_CORNERS.filter((name) => properties.has(name));
      if (physical.length > 0) authoring[family] = { physical, alsoBorderRadius: properties.has('border-radius') };
    }
    assert.deepEqual(authoring, {
      'card-compounds': { physical: PHYSICAL_CORNERS, alsoBorderRadius: true },
      'detail-header': { physical: ['border-top-left-radius', 'border-top-right-radius'], alsoBorderRadius: true },
    });
    const shape = populationReport().axes.find((entry) => entry.axis === 'shape').families;
    for (const family of Object.keys(authoring)) assert.ok(shape.includes(family), `${family} declares shape`);
    const floor = JSON.parse(readFileSync(FLOOR, 'utf8'));
    assert.deepEqual(Object.keys(floor.provenance.membershipMoves.previousWave.physicalCornerLonghands.familiesAuthoringThem).sort(), Object.keys(authoring).sort());
  });

  it('the rule tokenizer reads the same properties as the joined-text reader, attributes every SELECTOR_RULE selector, and shares the probe\'s literal', () => {
    const probe = readFileSync(join(ROOT, 'scripts/check/theme/axis-difference/index.mjs'), 'utf8');
    assert.ok(probe.includes(`const SELECTOR_RULE = ${SELECTOR_RULE.toString()};`), 'one selector vocabulary, in both instruments');

    let mismatches = 0;
    let unattributed = 0;
    for (const [, files] of skinFamilies()) {
      const css = files.map((file) => readFileSync(file, 'utf8')).join('\n');
      const viaRegex = [...declaredProperties(css)].sort();
      const viaRules = [...new Set(files.flatMap((file) =>
        cssRules(readFileSync(file, 'utf8')).flatMap((rule) => rule.declarations.map((declaration) => declaration.property))))].sort();
      if (JSON.stringify(viaRegex) !== JSON.stringify(viaRules)) mismatches += 1;
      for (const file of files) {
        const source = readFileSync(file, 'utf8');
        const selectors = new Set(cssRules(source).map((rule) => rule.selector));
        for (const match of stripCssComments(source).matchAll(SELECTOR_RULE)) {
          if (!selectors.has(normalizeCssText(match[2]))) unattributed += 1;
        }
      }
    }
    assert.equal(mismatches, 0, 'a family gained or lost a property by the change of reader');
    assert.equal(unattributed, 0, 'a selector the probe can read is a selector the population attributes');

    assert.deepEqual(cssRules('@media   print {\n .a { border-radius: 1px } }')[0].atRules, ['@media print']);
    const rules = cssRules('@media (x) { .a { border-radius: 1px; } }\n.b, .c { color: red; }\n/* .z { border-radius: 9px } */\n.d { content: ";"; padding: 0 }');
    assert.deepEqual(rules, [
      { selector: '.a', atRules: ['@media (x)'], declarations: [{ property: 'border-radius', value: '1px' }] },
      { selector: '.b, .c', atRules: [], declarations: [{ property: 'color', value: 'red' }] },
      { selector: '.d', atRules: [], declarations: [{ property: 'content', value: '";"' }, { property: 'padding', value: '0' }] },
    ]);
  });
});

describe('theme population — the reviewed chart-marks exclusions on shape and the producer guard (WO-EVI-02 X1, Fable C1)', () => {
  const CHART_LINE_SKIN = `${AGNOSTIC_ROOT}/chart-line/index.css`;
  const CHART_PIE_SKIN = `${AGNOSTIC_ROOT}/chart-pie/index.css`;
  const CHART_FOUNDATION_SKIN = `${AGNOSTIC_ROOT}/chart-foundation/index.css`;
  const plant = (dir, file, text) => {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), text);
  };
  const append = (dir, file, text) => writeFileSync(join(dir, file), `${readFileSync(join(dir, file), 'utf8')}\n${text}\n`);
  const produced = (failures) => failures.filter((line) => line.includes(': PRODUCED — '));

  it('names the reviewed declarations verbatim: chart-pie\'s are its only radii and withdraw it; chart-line\'s legend cap is excluded but its shadowed skeleton radius keeps it in shape', () => {
    const entries = readExclusions().entries.filter((entry) => entry.family.startsWith('chart-'));
    assert.deepEqual(entries.map((entry) => [entry.family, entry.skin, entry.reviewedAt.commit]),
      [['chart-line', CHART_LINE_SKIN, 'be58473b9'], ['chart-pie', CHART_PIE_SKIN, '2e5419620']]);
    const [line, pie] = entries;

    assert.deepEqual(radiiOf(join(ROOT, pie.skin)), pie.declarations);
    const declaredPie = familyAxisDeclarations().get('chart-pie');
    assert.ok(!declaredPie.axes.shape, 'chart-pie leaves shape');
    assert.equal(declaredPie.notApplicable.shape.review, CHART_REVIEW);

    // Mover: CL104 re-review 2026-10-01 (Fable). The skeleton-bar radius left the entry (chart-foundation :1446
    // out-specifies it; it paints nothing) but the skin still authors it, so chart-line stays in shape on it.
    assert.deepEqual(line.declarations, [{
      context: [], selector: ".ds-chart-line [data-part='legend-swatch']", property: 'border-radius', value: 'var(--_ds-line-marker-radius, 999px)',
    }]);
    assert.deepEqual(radiiOf(join(ROOT, line.skin)), [...line.declarations, {
      context: [], selector: ".ds-chart-line [data-part='skeleton-bar']", property: 'border-radius', value: '999px 999px 0 0',
    }]);
    const declaredLine = familyAxisDeclarations().get('chart-line');
    assert.ok(declaredLine.axes.shape, 'chart-line stays in shape on the shadowed declaration');
    assert.equal(declaredLine.axes.shape.exclusionEffective, false);
    assert.deepEqual(declaredLine.axes.shape.excludedDeclarations,
      line.declarations.map((declaration) => ({ file: CHART_LINE_SKIN, ...declaration, review: CHART_LINE_REVIEW })));
    assert.deepEqual(declaredLine.notApplicable, {});

    assert.ok(!readExclusions().entries.some((entry) => entry.family === 'chart-waterfall'), 'chart-waterfall is not excluded (Fable REJECT)');
    assert.ok(familyAxisDeclarations().get('chart-waterfall').axes.shape, 'chart-waterfall stays in shape and must move');
    assert.deepEqual(populationReport().exclusions.ineffective, CHART_LINE_INEFFECTIVE);
  });

  it('derives the private channels from the reviewed values, and none of them is produced anywhere in src on this tree', () => {
    const reads = Object.fromEntries(readExclusions().entries.map((entry) =>
      [entry.family, [...new Set(entry.declarations.flatMap((declaration) => privateChannelsRead(declaration.value)))]]));
    assert.deepEqual(reads, { radio: [], 'chart-line': ['--_ds-line-marker-radius'], 'chart-pie': ['--_ds-pie-marker-radius'], 'table-toolbar': [] });
    const producers = privateChannelProducers(ROOT, ['--_ds-line-marker-radius', '--_ds-pie-marker-radius']);
    assert.deepEqual(Object.fromEntries(producers), { '--_ds-line-marker-radius': [], '--_ds-pie-marker-radius': [] });
    assert.deepEqual(checkExclusionRegistry().failures, []);
  });

  it('MUTANT (C1-a): a producer planted in the family\'s OWN skin leaves the entry matching, and the guard fails it by site on every gate', () => {
    const dir = sandbox();
    // A literal producer reads no head channel, so nothing else in the population notices it: the entry still
    // matches verbatim and, without the guard, the legend declaration would stay excluded while its marker repaints.
    append(dir, CHART_LINE_SKIN, '.ds-chart-line { --_ds-line-marker-radius: 2px; }');
    // Mover: CL104 -- the legend declaration still matches (excluded) while chart-line stays in shape on its skeleton radius.
    const planted = familyAxisDeclarations(dir, catalogIn(dir)).get('chart-line');
    assert.equal(planted.axes.shape.exclusionEffective, false);
    assert.deepEqual(planted.axes.shape.excludedDeclarations.map((declaration) => declaration.selector), [".ds-chart-line [data-part='legend-swatch']"]);
    const failures = produced(checkExclusionRegistry(dir, EXCLUSIONS).failures);
    assert.equal(failures.length, 1, failures.join(' | '));
    assert.match(failures[0], /^entry 1 \(chart-line\/shape\): PRODUCED — --_ds-line-marker-radius, read by a reviewed declaration of .*chart-line\/index\.css, is produced at .*chart-line\/index\.css:\d+ `/u);
    assert.match(failures[0], /the entry must return to review$/u);
    assert.ok(checkPopulationFloor(dir, catalogIn(dir), FLOOR, EXCLUSIONS).failures
      .some((line) => line.startsWith('exclusion registry: ') && line.includes('PRODUCED — --_ds-line-marker-radius')));
    assert.ok(checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN, { exclusionsPath: EXCLUSIONS }).failures
      .some((line) => line.startsWith('exclusion registry: ') && line.includes('PRODUCED — --_ds-line-marker-radius')));
  });

  it('MUTANT (C1-b): a producer in a FOREIGN file -- chart-foundation, an @property registration, a TS emitter -- fails by name too', () => {
    const dir = sandbox();
    append(dir, CHART_FOUNDATION_SKIN, ".ds-chart[data-chart-marks='technical-sharp'] { --_ds-line-marker-radius: 0; }");
    plant(dir, 'src/foundation/tokens/css/foundation/registry/index.css',
      "@property --_ds-pie-marker-radius { syntax: '<length-percentage>'; inherits: true; initial-value: 4px; }");
    plant(dir, 'src/components/patterns/visualization/charts/emitter/index.ts',
      "export const marks = (radius: string) => ({ ['--_ds-pie-marker-radius']: radius });");
    const failures = produced(checkExclusionRegistry(dir, EXCLUSIONS).failures);
    assert.equal(failures.length, 3, failures.join(' | '));
    assert.ok(failures.some((line) => line.startsWith('entry 1 (chart-line/shape): PRODUCED — --_ds-line-marker-radius')
      && line.includes(`${CHART_FOUNDATION_SKIN}:`)), failures.join(' | '));
    assert.ok(failures.some((line) => line.startsWith('entry 2 (chart-pie/shape): PRODUCED — --_ds-pie-marker-radius')
      && line.includes('src/foundation/tokens/css/foundation/registry/index.css:1')), failures.join(' | '));
    assert.ok(failures.some((line) => line.startsWith('entry 2 (chart-pie/shape): PRODUCED — --_ds-pie-marker-radius')
      && line.includes('src/components/patterns/visualization/charts/emitter/index.ts:1')), failures.join(' | '));
  });

  it('a read, a commented-out producer, a test fixture, a story and a longer channel sharing the prefix are not productions', () => {
    const dir = sandbox();
    append(dir, CHART_FOUNDATION_SKIN, [
      '.ds-chart-line [data-part="marker"] { inline-size: var(--_ds-line-marker-radius, 2px); }',
      '/* .ds-chart-line { --_ds-line-marker-radius: 0; } */',
      '.ds-chart-pie { --_ds-pie-marker-radius-hover: 2px; }',
    ].join('\n'));
    plant(dir, 'src/components/patterns/visualization/charts/tests/marks.test.ts', "const style = { '--_ds-line-marker-radius': '0' };");
    plant(dir, 'src/components/patterns/visualization/charts/marks.stories.tsx', "const style = { '--_ds-pie-marker-radius': '0' };");
    plant(dir, 'src/components/patterns/visualization/charts/reader/index.ts',
      "// style['--_ds-line-marker-radius'] = '0';\nexport const cap = 'var(--_ds-line-marker-radius, 999px)';");
    assert.deepEqual(checkExclusionRegistry(dir, EXCLUSIONS).failures, []);
  });
});

describe('theme population — the reviewed table-toolbar divider exclusion on shape and its half-box premise (WO-EVI-02 X3, Fable G1/G2)', () => {
  const TABLE_TOOLBAR_SKIN = `${AGNOSTIC_ROOT}/table-toolbar/index.css`;
  const DIVIDER = ".ds-structure.ds-table-toolbar .ds-table-toolbar__divider[data-part='divider']";
  const entry = () => readExclusions().entries.find((candidate) => candidate.family === 'table-toolbar');

  it('names the reviewed declaration verbatim, it is the only radius the skin authors, and it withdraws the family', () => {
    const reviewed = entry();
    assert.equal(reviewed.skin, TABLE_TOOLBAR_SKIN);
    assert.equal(reviewed.reviewedAt.commit, '14f368b50');
    assert.deepEqual(radiiOf(join(ROOT, reviewed.skin)), reviewed.declarations);
    assert.deepEqual(reviewed.declarations, [{ context: [], selector: DIVIDER, property: 'border-radius', value: '1px' }]);
    const declared = familyAxisDeclarations().get('table-toolbar');
    assert.ok(!declared.axes.shape, 'table-toolbar leaves shape');
    assert.equal(declared.notApplicable.shape.review, TT_REVIEW);
    assert.ok(!readExclusions().entries.some((candidate) => candidate.family === 'bottom-tab-bar'),
      'bottom-tab-bar is not excluded (Fable G4: its focus ring reads --ds-radius-md, a head channel)');
  });

  it('G1: the reviewed rule authors inline-size 2px beside border-radius 1px, and the selector\'s at-rule variants declare no shape longhand and no inline-size', () => {
    const rules = cssRules(readFileSync(join(ROOT, TABLE_TOOLBAR_SKIN), 'utf8')).filter((rule) => rule.selector === DIVIDER);
    const premise = 'the table-toolbar exclusion rests on 1px being half the 2px stroke; a box change returns the entry to review';
    assert.deepEqual(rules.map((rule) => rule.atRules), [[], ['@container ds-table-toolbar (max-width: 40rem)'], ['@media (forced-colors: active)']], premise);
    const [reviewed, ...variants] = rules;
    const valueOf = (rule, property) => rule.declarations.filter((declaration) => declaration.property === property).map((declaration) => declaration.value);
    assert.deepEqual(valueOf(reviewed, 'inline-size'), ['2px'], premise);
    assert.deepEqual(valueOf(reviewed, 'border-radius'), ['1px'], premise);
    for (const variant of variants) {
      assert.ok(!variant.declarations.some((declaration) => AXES.shape.authored.includes(declaration.property) || declaration.property === 'inline-size'),
        `${variant.atRules.join(' ')}: ${premise}`);
    }
  });
});

describe('theme population — the reviewed exclusion is bound to the rule context it was read in', () => {
  it('names the top-level context of both reviewed declarations, and the skin authors them there', () => {
    const [entry] = readExclusions().entries;
    assert.ok(entry.declarations.every((declaration) => Array.isArray(declaration.context) && declaration.context.length === 0));
    assert.deepEqual(radiiOf(join(ROOT, entry.skin)).map((declaration) => declaration.context), [[], []]);
    assert.deepEqual(checkExclusionRegistry().failures, []);
  });

  it('MUTANT (A1): the reviewed circle rule moved inside @media print stops matching — radio re-enters shape, the pin refuses it and the registry is stale by context', () => {
    const dir = sandbox();
    const skin = join(dir, RADIO_SKIN);
    const source = readFileSync(skin, 'utf8');
    const moved = source.replace(CIRCLE_RULE, (rule) => `@media print {\n${rule}\n}`);
    assert.notEqual(moved, source, 'the mutation must reach the circle rule');
    writeFileSync(skin, moved);
    const radio = familyAxisDeclarations(dir, catalogIn(dir)).get('radio');
    assert.ok(radio.axes.shape, 'radio must re-enter shape');
    assert.deepEqual(radio.axes.shape.properties, ['border-radius']);
    assert.equal(radio.axes.shape.excludedDeclarations.length, 1, 'only the dot still matches the review');
    assert.deepEqual(radio.notApplicable, {});
    const { failures } = checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN);
    assert.ok(failures.includes('shape: published pilot denominator 4 != 5'), failures.join(' | '));
    assert.ok(failures.some((line) => line.startsWith('radio/shape: published NOT APPLICABLE and now declared')), failures.join(' | '));
    assert.ok(failures.some((line) => line.includes('STALE') && line.includes("[data-part='circle']") && line.includes('authored under [@media print]')),
      `the registry names the drifted context: ${failures.join(' | ')}`);
    assert.ok(checkPopulationFloor(dir, catalogIn(dir), FLOOR).failures.some((line) => line.includes('STALE')));
  });

  it('MUTANT (A2): another rule of the same skin moved under an at-rule changes nothing — identical top-level context keeps matching', () => {
    const dir = sandbox();
    const skin = join(dir, RADIO_SKIN);
    const source = readFileSync(skin, 'utf8');
    const moved = source.replace(ROOT_RULE, (rule) => `@media print {\n${rule}\n}`);
    assert.notEqual(moved, source);
    writeFileSync(skin, moved);
    const radio = familyAxisDeclarations(dir, catalogIn(dir)).get('radio');
    assert.deepEqual(Object.keys(radio.axes), ['typography', 'rhythm', 'depth', 'states', 'motion']);
    assert.equal(radio.notApplicable.shape.excludedDeclarations.length, 2);
    assert.deepEqual(checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN).failures, []);
    assert.deepEqual(checkExclusionRegistry(dir).failures, []);
  });

  it('MUTANT (A3): a registry entry that reviews the circle under @media print while the skin authors it top-level is stale, and excludes nothing', () => {
    const dir = sandbox();
    const registry = baseRegistry();
    registry.entries[0].declarations[0].context = ['@media print'];
    const path = writeRegistry(dir, registry);
    const { failures } = checkExclusionRegistry(dir, path);
    assert.ok(failures.some((line) => line.includes('STALE') && line.includes('[@media print]') && line.includes('authored under []')), failures.join(' | '));
    const radio = familyAxisDeclarations(dir, catalogIn(dir), path).get('radio');
    assert.ok(radio.axes.shape, 'the circle radius counts again');
    assert.equal(radio.axes.shape.excludedDeclarations.length, 1);
  });

  it('MUTANT (A4): a reviewed declaration without a context is refused by the registry check and matches nothing', () => {
    const dir = sandbox();
    const registry = baseRegistry();
    delete registry.entries[0].declarations[0].context;
    const path = writeRegistry(dir, registry);
    assert.ok(checkExclusionRegistry(dir, path).failures.some((line) => line.includes('names no at-rule context')));
    const radio = familyAxisDeclarations(dir, catalogIn(dir), path).get('radio');
    assert.ok(radio.axes.shape, 'a context-less declaration excludes nothing');
    assert.equal(radio.axes.shape.excludedDeclarations.length, 1);
  });
});

describe('theme population — per-rule state evidence and the unobservable count (S5, Fable exclusion review A2 + A4)', () => {
  const plant = (dir, family, css) => {
    mkdirSync(join(dir, SKIN_ROOT, family), { recursive: true });
    writeFileSync(join(dir, SKIN_ROOT, family, 'index.css'), css);
    return familyAxisDeclarations(dir, catalogIn(dir)).get(family);
  };

  it('MUTANT (A2-7): a state needle only inside a value or a string does not declare states', () => {
    const dir = sandbox();
    const record = plant(dir, 'drill-needle-value', ".ds-drill-needle-value::after { content: ':hover [data-state='; opacity: 1; }\n");
    assert.equal(record.axes.states, undefined, JSON.stringify(record.axes.states));
  });

  it('MUTANT (A2-8): an empty state rule -- the needle, zero declarations -- does not declare states', () => {
    const dir = sandbox();
    const record = plant(dir, 'drill-empty-state', '.ds-drill-empty-state:hover { }\n.ds-drill-empty-state { opacity: 1; }\n');
    assert.equal(record.axes.states, undefined, JSON.stringify(record.axes.states));
  });

  it('(A2) a kernel gate in a rule selector under an at-rule declares, and the evidence cites the rule: file, context, selector, gates', () => {
    const dir = sandbox();
    const record = plant(dir, 'drill-state-media', '@media (hover: hover) { .ds-drill-state-media:hover { opacity: 0.8; } }\n');
    assert.deepEqual(record.axes.states.stateGates, [':hover']);
    assert.deepEqual(record.axes.states.stateRules, [{
      file: `${SKIN_ROOT}/drill-state-media/index.css`,
      context: ['@media (hover: hover)'],
      selector: '.ds-drill-state-media:hover',
      gates: [':hover'],
    }]);
  });

  it('(A2) every family that declares states by K1 on this tree cites at least one rule, and every cited rule carries its gate', () => {
    let cited = 0;
    for (const [family, record] of familyAxisDeclarations(ROOT)) {
      const states = record.axes.states;
      if (states === undefined || states.stateGates.length === 0) continue;
      assert.ok(states.stateRules.length > 0, family);
      for (const rule of states.stateRules) {
        assert.ok(Array.isArray(rule.context) && rule.gates.length > 0, `${family}: ${rule.selector}`);
        for (const gate of rule.gates) assert.ok(rule.selector.includes(gate.replace(/\]$/u, '')), `${family}: ${rule.selector}`);
      }
      cited += 1;
    }
    assert.ok(cited > 100, `only ${cited} families cite a state rule`);
  });

  it('PIN (A4): 8 declaring states families are unobservable on this tree -- 5 colour-only + 3 no-vocabulary -- reported beside the denominator and not subtracted', () => {
    // Movers of the pin (8 -> 9, STATES-K 2026-10-01): record-facts and
    // scope-switcher leave with the population; edit-fields, table-toolbar
    // (colour-only) and form-builder (cursor) enter with it. 9 -> 8 (OVM
    // 2026-10-02): overlay-modal-compounds leaves with its retired orphan rules.
    const report = populationReport();
    const states = report.axes.find((entry) => entry.axis === 'states');
    assert.equal(states.denominator, 154);
    assert.equal(states.unobservableCount, 8);
    assert.deepEqual(states.unobservable.map((entry) => `${entry.family}:${entry.class}`), [
      'button-group:no-vocabulary', 'edit-fields:colour-only', 'form-builder:no-vocabulary', 'list:colour-only',
      'metrics-chart:colour-only', 'metrics-rows:no-vocabulary', 'operational-ledger:colour-only',
      'table-toolbar:colour-only',
    ]);
    for (const entry of states.unobservable) assert.ok(states.families.includes(entry.family), entry.family);
    for (const entry of report.axes.filter((axis) => axis.axis !== 'states')) assert.equal(entry.unobservableCount, 0, entry.axis);
  });

  it('MUTANT (A4): a family that gains `transform` under :hover leaves the unobservable set; a colour-only entrant joins it; the denominator moves only by the entrant', () => {
    const dir = sandbox();
    const before = axisUnobservable(dir, catalogIn(dir)).get('states').map((entry) => entry.family);
    assert.ok(before.includes('button-group'));
    const skin = join(dir, AGNOSTIC_ROOT, 'button-group');
    const files = readdirSyncRecursive(skin);
    writeFileSync(files[0], `${readFileSync(files[0], 'utf8')}\n.ds-button-group:hover { transform: translateY(-1px); }\n`);
    plant(dir, 'drill-colour-state', '.ds-drill-colour-state:hover { background-color: var(--ds-surface-inset); }\n');
    const after = axisUnobservable(dir, catalogIn(dir)).get('states');
    assert.ok(!after.some((entry) => entry.family === 'button-group'));
    assert.deepEqual(after.find((entry) => entry.family === 'drill-colour-state'),
      { family: 'drill-colour-state', class: 'colour-only', properties: ['background-color'] });
    const states = populationReport(dir, catalogIn(dir)).axes.find((entry) => entry.axis === 'states');
    assert.equal(states.denominator, 155, 'unobservable is reported, never subtracted');
  });

  it('a state declaration is one in a K1 rule; a state-suffixed channel name, a domain value and an at-rule prelude are not', () => {
    const [hovered] = cssRules('.a:hover { color: red; }');
    assert.equal(isStateDeclaration(hovered), true);
    const [channel] = cssRules('.a { --x: var(--ds-a-hover, red); }');
    assert.equal(isStateDeclaration(channel), false);
    const [domain] = cssRules(".a[data-state='empty'] { color: red; }");
    assert.equal(isStateDeclaration(domain), false);
    const [twin] = cssRules('.a, .a:focus-within { color: red; }');
    assert.equal(isStateDeclaration(twin), false);
  });
});

/**
 * STATES-K, the states population law (owner directive 2026-10-01; Fable
 * review 2026-10-01, ACCEPT-WITH-CHANGES). Twelve drills, each red against the
 * pre-amendment rule (the needle list `:hover`, `:active`, `:focus-visible`,
 * `[data-state=`, the namespaced door and the channel-suffix door).
 */
describe('theme population — STATES-K: a family declares states iff kernel-gated paint (K1) or a states head channel (K2)', () => {
  // The states mover set of indicator 15 (fleet run d7b25dfd7, 2026-10-01T08:42Z): the families whose
  // computed style moved on the states positive cell, identical in all six cells (bithire/evnto/rottay x
  // light/dark), re-derived by Fable (ST-A review 2026-10-01). Every one must be a member after STATES-K.
  const MOVERS = Object.freeze([
    'activity-cards', 'activity-compact', 'activity-log', 'activity-ticker', 'activity-timeline', 'alert', 'anchor',
    'app-shell', 'approval-inbox', 'approval-workflow', 'ascii-diagram', 'auto-complete', 'avatar', 'back-top', 'badge',
    'bottom-tab-bar', 'breadcrumb', 'breadcrumb-compounds', 'button', 'calendar', 'carousel', 'cascader', 'checkbox',
    'code-block', 'collapse', 'collection-workspace', 'collection-workspace-render-dispatch', 'color-picker',
    'column-menu', 'column-settings', 'command-palette', 'context-menu', 'dashboard-header', 'data-table-interactions',
    'data-table-mobile', 'data-terminal-card', 'date-picker', 'detail-panel', 'drawer', 'drawer-compounds', 'dropdown',
    'edit-header', 'file-manager', 'float-button', 'form', 'form-field', 'form-sections', 'gallery-view',
    'header-hero-shared', 'hover-card', 'image', 'input-number', 'invoice-template', 'layout', 'link', 'list-toolbar',
    'live-feed', 'locale-switcher', 'markdown-view', 'mentions', 'menu', 'menu-compounds', 'modal', 'modal-compounds',
    'moderation-gallery', 'notifier', 'otp-input', 'page-shell', 'pagination', 'password-input',
    'pattern-calendar-view', 'pattern-kanban-board', 'pattern-map-view', 'pattern-timeline', 'popover', 'pricing-table',
    'qrcode', 'radio', 'radio-group', 'rate', 'record', 'saved-views', 'saved-views-menu', 'scheduler-surface',
    'scroll-area', 'search', 'segmented', 'select', 'select-compounds', 'sheet', 'shift-matrix', 'slider', 'splitter',
    'stats-grid', 'stats-header', 'status-filter-pills', 'stepper', 'table', 'tabs', 'tag', 'tag-input',
    'tenant-preview', 'textarea', 'time-picker', 'toggle', 'tooltip', 'tour', 'transfer', 'tree', 'tree-select',
    'tree-view-connector', 'typography', 'upload', 'user-profile-card', 'virtual-list', 'voice-input-button',
    'workbench-header', 'workspace-switcher',
  ]);
  const LEAVERS = ['active-filters-bar', 'branding-preview-sandbox', 'detail', 'record-facts', 'scope-switcher'];
  const ENTRANTS = ['edit-fields', 'form-builder', 'surface-states', 'table-toolbar'];
  const gatesOf = (selector) => population.stateRuleGates(selector);
  /** Plants one family per selector in one sandbox and returns family -> its states evidence (or undefined). */
  const plantAll = (cases) => {
    const dir = sandbox();
    const names = cases.map((_, index) => `drill-k-${index}`);
    cases.forEach(([css], index) => {
      mkdirSync(join(dir, SKIN_ROOT, names[index]), { recursive: true });
      writeFileSync(join(dir, SKIN_ROOT, names[index], 'index.css'), `${css}\n`);
    });
    const declarations = familyAxisDeclarations(dir, catalogIn(dir));
    return cases.map(([css, expected], index) => ({ css, expected, states: declarations.get(names[index]).axes.states }));
  };

  it('D0: ONE kernel vocabulary, owned here: the five tokens serializeState writes, `selected` not among them', () => {
    assert.deepEqual([...population.KERNEL_STATE_TOKENS], ['disabled', 'hovered', 'pressed', 'focused', 'focus-visible']);
    const kernel = readFileSync(join(ROOT, 'src/foundation/behavior/kernel/anatomy/index.ts'), 'utf8');
    const flags = /STATE_FLAG_ORDER[^=]*=\s*\[([^\]]*)\]/u.exec(kernel)[1].match(/'([A-Za-z]+)'/gu)
      .map((flag) => flag.slice(1, -1).replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`));
    assert.deepEqual([...population.KERNEL_STATE_TOKENS], flags, 'read against the kernel, in its order');
    assert.deepEqual(population.STATE_STAMP_ATTRIBUTES, { disabled: { 'data-disabled': 'true' } });
    assert.deepEqual([...population.KERNEL_PSEUDO_CLASSES], [':hover', ':active', ':focus', ':focus-within', ':focus-visible']);
    assert.equal(population.stampWrites('data-state', '~=', 'selected'), false);
    assert.equal(population.stampWrites('data-state', '~=', 'focus-visible'), true);
  });

  it('D1: every native kernel pseudo-class declares, each cited by its gate', () => {
    for (const { css, expected, states } of plantAll([
      ['.x:hover { opacity: 0.5; }', [':hover']],
      ['.x:active { opacity: 0.5; }', [':active']],
      ['.x:focus { opacity: 0.5; }', [':focus']],
      ['.x:focus-within { opacity: 0.5; }', [':focus-within']],
      ['.x:focus-visible { opacity: 0.5; }', [':focus-visible']],
    ])) {
      assert.ok(states, `${css} must declare states`);
      assert.deepEqual(states.stateGates, expected, css);
    }
  });

  it('D1: the kernel attribute and the disabled-prop attribute declare, bare or on a written value', () => {
    for (const { css, expected, states } of plantAll([
      [".x[data-state~='hovered'] { opacity: 0.5; }", ['[data-state]']],
      [".x[data-state='focused'] { opacity: 0.5; }", ['[data-state]']],
      ['.x[data-state] { opacity: 0.5; }', ['[data-state]']],
      ['.x[data-disabled] { opacity: 0.5; }', ['[data-disabled]']],
      [".x[data-disabled='true'] { opacity: 0.5; }", ['[data-disabled]']],
    ])) {
      assert.ok(states, `${css} must declare states`);
      assert.deepEqual(states.stateGates, expected, css);
    }
  });

  it('D1: a gate on an ancestor compound or inside :has() declares', () => {
    for (const { css, expected, states } of plantAll([
      [":is([data-state~='pressed'], :active) .x { opacity: 0.5; }", [':active', '[data-state]']],
      ['.x:has(+ .y:focus-within) { opacity: 0.5; }', [':focus-within']],
    ])) {
      assert.ok(states, `${css} must declare states`);
      assert.deepEqual(states.stateGates, expected, css);
    }
  });

  it('D2: a domain value, `selected`, a namespaced state, data-active, :disabled, :checked, aria-* and data-disabled=false declare nothing', () => {
    for (const { css, states } of plantAll([
      [".x[data-state='error'] { opacity: 0.5; }"],
      [".x[data-state~='selected'] { opacity: 0.5; }"],
      [".x[data-filter-state='draft'] { opacity: 0.5; }"],
      [".x[data-active='true'] { opacity: 0.5; }"],
      ['.x:disabled { opacity: 0.5; }'],
      ['.x:checked { opacity: 0.5; }'],
      [".x[aria-selected='true'] { opacity: 0.5; }"],
      [".x[data-disabled='false'] { opacity: 0.5; }"],
    ])) {
      assert.equal(states, undefined, `${css} declared ${JSON.stringify(states)}`);
    }
  });

  it('D2: a gate only inside :not(), an empty state rule, a gate in a comment or in a declaration value declare nothing', () => {
    for (const { css, states } of plantAll([
      ['.x:not(:hover) { opacity: 0.5; }'],
      ['.x:hover { }\n.x { opacity: 1; }'],
      ['/* .x:hover { opacity: 0.5; } */\n.x { opacity: 1; }'],
      [".x::after { content: ':hover [data-state~=hovered]'; opacity: 1; }"],
    ])) {
      assert.equal(states, undefined, `${css} declared ${JSON.stringify(states)}`);
    }
  });

  it('D3: the channel-suffix door is retired; a states head channel still declares through K2, cited', () => {
    const [suffix, head] = plantAll([
      ['.x { --y: var(--ds-x-hover); }'],
      ['.x { outline-width: var(--ds-focus-ring-width); }'],
    ]);
    assert.equal(suffix.states, undefined, JSON.stringify(suffix.states));
    assert.ok(head.states);
    assert.deepEqual(head.states.headChannels, ['--ds-focus-ring-width']);
    assert.deepEqual(head.states.stateRules, []);
  });

  it('D4: a branch whose gate-stripped twin is in the same rule declares nothing; a real gate survives a :not() beside it', () => {
    const [twin, alone, negated] = plantAll([
      ['.x, .x:focus-within { inline-size: 100%; }'],
      ['.x:focus-within { inline-size: 100%; }', [':focus-within']],
      [".x:not([data-state~='disabled']):hover { opacity: 0.5; }", [':hover']],
    ]);
    assert.equal(twin.states, undefined, JSON.stringify(twin.states));
    assert.deepEqual(alone.states.stateGates, alone.expected);
    assert.deepEqual(negated.states.stateGates, negated.expected);
    assert.deepEqual(gatesOf('.x, .x:focus-within'), []);
    assert.deepEqual(gatesOf(".x:not([data-state~='disabled']):hover"), [':hover']);
  });

  it('D5: the namespaced door of e8c78c576 is reversed; the shared attribute declares only on a kernel token', () => {
    const [namespaced, selected, hovered] = plantAll([
      [".ds-drill-domain-state[data-filter-state='active'] { opacity: 0.9; }"],
      [".ds-drill-shared-state[data-state='selected'] { opacity: 0.5; }"],
      [".ds-drill-shared-state[data-state~='hovered'] { opacity: 0.5; }", ['[data-state]']],
    ]);
    assert.equal(namespaced.states, undefined, 'a domain state on its own attribute is not interaction state');
    assert.equal(selected.states, undefined, 'the kernel writes no `selected`');
    assert.deepEqual(hovered.states.stateGates, hovered.expected);
  });

  it('D6: on this tree the states population is 154 -- five leavers, four entrants, every indicator-15 mover a member, the other axes unmoved', () => {
    const report = populationReport();
    const byAxis = Object.fromEntries(report.axes.map((entry) => [entry.axis, entry]));
    const states = byAxis.states.families;
    // 277 -> 278 (GLASS-1): the glass-card skin enters the corpus, shape and depth.
    assert.equal(report.skinFamilies, 278);
    // 155 -> 154 (OVM 2026-10-02): overlay-modal-compounds leaves states, shape and depth with its orphan rules.
    assert.equal(byAxis.states.denominator, 154);
    for (const family of LEAVERS) assert.ok(!states.includes(family), `${family} must leave states`);
    for (const family of ENTRANTS) assert.ok(states.includes(family), `${family} must enter states`);
    assert.equal(MOVERS.length, 118);
    assert.deepEqual(MOVERS.filter((family) => !states.includes(family)), [], 'a mover may never leave the population');
    assert.deepEqual(Object.fromEntries(['shape', 'typography', 'rhythm', 'depth', 'motion'].map((axis) => [axis, byAxis[axis].denominator])),
      { shape: 215, typography: 182, rhythm: 224, depth: 199, motion: 204 });
    assert.deepEqual(Object.fromEntries(report.axes.map((entry) => [entry.axis, entry.notApplicableCount])),
      { shape: 3, typography: 0, rhythm: 0, depth: 0, states: 0, motion: 0 });
    // The two ruled-out alternatives, measured: the twin clause keeps out
    // exactly filter-panel (a reviewed delegation, its selector paint-free),
    // and counting a gate inside :not() would admit nobody.
    const keptOutBy = { twin: new Set(), negation: new Set() };
    for (const [family, record] of familyAxisDeclarations()) {
      if (record.axes.states) continue;
      for (const file of record.files) {
        for (const rule of cssRules(readFileSync(join(ROOT, file), 'utf8'))) {
          if (rule.declarations.length === 0 || rule.selector.startsWith('@')) continue;
          for (const branch of population.stateBranches(rule.selector)) {
            if (branch.gates.length > 0 && branch.redundant) keptOutBy.twin.add(family);
            if (branch.gates.length === 0 && branch.negatedGates.length > 0) keptOutBy.negation.add(family);
          }
        }
      }
    }
    assert.deepEqual([...keptOutBy.twin], ['filter-panel']);
    assert.deepEqual([...keptOutBy.negation], []);
  });

  it('D7: the floor holds at 154; the pre-amendment pin (156) is refused BELOW, a pin at 153 ABOVE', () => {
    assert.deepEqual(checkPopulationFloor().failures, []);
    const floor = JSON.parse(readFileSync(FLOOR, 'utf8'));
    assert.equal(floor.axes.states, 154);
    const dir = mkdtempSync(join(tmpdir(), 'evi02-states-k-'));
    sandboxes.push(dir);
    const at = (states) => {
      const path = join(dir, `floor-${states}.json`);
      writeFileSync(path, JSON.stringify({ ...floor, axes: { ...floor.axes, states } }));
      return checkPopulationFloor(ROOT, undefined, path).failures;
    };
    assert.ok(at(156).some((line) => line.startsWith('states: denominator 154 is BELOW its floor 156')), at(156).join(' | '));
    assert.ok(at(153).some((line) => line.startsWith('states: denominator 154 is ABOVE its pin 153')), at(153).join(' | '));
  });

  it('D8: 8 declaring states families are unobservable -- surface-states is not one (opacity is read) -- and none is subtracted', () => {
    const states = populationReport().axes.find((entry) => entry.axis === 'states');
    assert.deepEqual(states.unobservable.map((entry) => `${entry.family}:${entry.class}`), [
      'button-group:no-vocabulary', 'edit-fields:colour-only', 'form-builder:no-vocabulary', 'list:colour-only',
      'metrics-chart:colour-only', 'metrics-rows:no-vocabulary', 'operational-ledger:colour-only',
      'table-toolbar:colour-only',
    ]);
    assert.ok(!states.unobservable.some((entry) => entry.family === 'surface-states'));
    for (const entry of states.unobservable) assert.ok(states.families.includes(entry.family), entry.family);
  });
});

function readdirSyncRecursive(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory()
    ? readdirSyncRecursive(join(dir, entry.name))
    : entry.name.endsWith('.css') ? [join(dir, entry.name)] : []));
}

