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
import { cpSync, mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
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
  normalizeCssText,
  pilotPopulation,
  populationLine,
  populationReport,
  readChannels,
  readExclusions,
  skinFamilies,
  stripCssComments,
  withNotApplicable,
} from '../index.mjs';
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
        assert.ok(AXES[axis].stateSelectors.length > 0);
        continue;
      }
      assert.ok(AXES[axis].authored.length > 0, `${axis}: no authored vocabulary`);
      assert.ok(AXES[axis].computed.length > 0, `${axis}: no computed vocabulary`);
    }
  });

  it('(namespaced state) a family\'s own [data-<ns>-state=] rule declares states; the shared attribute keeps its own needle; a skin with no state selector declares none', () => {
    const dir = sandbox();

    mkdirSync(join(dir, SKIN_ROOT, 'drill-domain-state'), { recursive: true });
    writeFileSync(
      join(dir, SKIN_ROOT, 'drill-domain-state/index.css'),
      '.ds-drill-domain-state[data-filter-state=\'active\'] { opacity: 0.9; }\n',
    );
    const domainState = familyAxisDeclarations(dir, catalogIn(dir)).get('drill-domain-state');
    assert.deepEqual(domainState.axes.states.stateSelectors, ['[data-<ns>-state=']);

    mkdirSync(join(dir, SKIN_ROOT, 'drill-shared-state'), { recursive: true });
    writeFileSync(
      join(dir, SKIN_ROOT, 'drill-shared-state/index.css'),
      '.ds-drill-shared-state[data-state=\'selected\'] { opacity: 0.5; }\n',
    );
    const sharedState = familyAxisDeclarations(dir, catalogIn(dir)).get('drill-shared-state');
    assert.deepEqual(sharedState.axes.states.stateSelectors, ['[data-state='],
      'the namespaced matcher must not re-admit the shared attribute');

    mkdirSync(join(dir, SKIN_ROOT, 'drill-no-state'), { recursive: true });
    writeFileSync(
      join(dir, SKIN_ROOT, 'drill-no-state/index.css'),
      '.ds-drill-no-state { opacity: 1; }\n',
    );
    const noState = familyAxisDeclarations(dir, catalogIn(dir)).get('drill-no-state');
    assert.equal(noState.axes.states, undefined, 'a bare absence of any state selector reads as no declaration');
  });
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
  it('admits exactly radio/shape, on the byProperty path only, and validates green on the tree', () => {
    const registry = readExclusions();
    assert.deepEqual(registry.admitted, [{ family: 'radio', axis: 'shape' }]);
    assert.deepEqual(registry.entries.map((entry) => [entry.family, entry.axis, entry.path, entry.review]),
      [['radio', 'shape', 'byProperty', REVIEW]]);
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
    assert.deepEqual(shape.notApplicable.map((entry) => entry.family), ['radio']);
    assert.equal(shape.notApplicableCount, 1);
    for (const entry of report.axes) {
      assert.ok(entry.families.every((family) => !entry.notApplicable.some((withdrawn) => withdrawn.family === family)),
        `${entry.axis}: applicable and not-applicable sets must be disjoint`);
      if (entry.axis !== 'shape') assert.equal(entry.notApplicableCount, 0, `${entry.axis}: no exclusion is reviewed there`);
    }
    assert.deepEqual(report.exclusions.ineffective, []);
    assert.equal(report.exclusions.revision, exclusionsRevision());

    const line = populationLine();
    assert.match(line, /shape 217 \(1 N\/A\)/);
    assert.match(line, /typography 181 \(0 N\/A\)/);
    assert.match(line, /exclusions [0-9a-f]{16} \(1 reviewed\)/);

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
    assert.equal(floor.axes.shape, 217);
    assert.equal(floor.notApplicable.shape, 1);
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
    assert.deepEqual(report.axes.find((entry) => entry.axis === 'shape').notApplicable.map((entry) => entry.family), ['radio']);
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
    assert.deepEqual(before.axes.shape, { properties: ['border-radius'], headChannels: ['--ds-radius-md'], stateSelectors: [], stateChannels: [] });
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
    assert.deepEqual(after.axes.shape, { properties: ['border-radius'], headChannels: [], stateSelectors: [], stateChannels: [] });
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
