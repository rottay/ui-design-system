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
  classifyDepthShadow,
  focusSignatureProof,
  FOCUS_SIGNATURE_RESETS,
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
// Mover: FAM09-CL re-review 2026-10-02 -- the skeleton-bar declaration re-enters the entry (the dome paints; the shadowing resolved with WO-FAM-09's ruling).
const CHART_LINE_REVIEW = `${CHART_REVIEW} | CL104 re-review 2026-10-01 (Fable): the skeleton-bar declaration (\`999px 999px 0 0\`, skin :104) is withdrawn from the entry: chart-foundation :1446 out-specifies it (0,5,0 over 0,2,0) and it paints nothing at dial 0.8/1.0/1.2 (measured); a declaration that paints nothing has no semantic identity. chart-line stays in shape on it, the entry is INEFFECTIVE by name, until the charts cut resolves the shadowing (defect registered under WO-FAM-09) | FAM09-CL re-review 2026-10-02 (WO-FAM-09's owner-ruled waterfall arm landed and the charts cut resolved the shadowing): the skeleton-bar declaration re-enters the entry — the dome paints at the reviewed commit (the chart-foundation :1446 shadowing is gone, measured both ways in Chromium: restoring the pre-fix selector in memory flips the corners back to the foundation fallback), the consumer law holds by the generic cascade route, forced-colors keeps the corners on all verticals; the INEFFECTIVE publication discharges and chart-line leaves shape N/A on both declarations. K2.8 re-review under the K3/K2.8 quota scheme; Fable's rule on the reason text was delivered by the independent review of 2026-10-03 (review-G2-owed-quota-lots, claude-fable-5-1) and is applied to \`reason\`: the dome's lawful ground is saturation by its own box, and the technical-sharp caveat on \`lawfulShapeOwner\` stays stated for the legend only; no membership or count move`;
// No ineffective entry on this tree: the CL104 publication discharged with FAM09-CL (2026-10-02).
const CHART_LINE_INEFFECTIVE = [];
const TT_REVIEW = 'WO-EVI-02 table-toolbar shape exclusion review 2026-10-01 (X3 dossier; Fable ACCEPT-WITH-CHANGES, conditions consolidated by the DT; Codex outside the loop by owner restriction 2026-09-19)';
const SO_REVIEW = 'WO-EVI-02 W23-POPX delegation dossier 2026-10-04 (writer claude-opus-5-5, patch mode; independent review owed before integration; Codex outside the loop by owner restriction 2026-09-19)';
const SO_SKIN = `${SKIN_ROOT}/shortcuts-overlay/index.css`;
const MODAL_SKIN = `${SKIN_ROOT}/modal/index.css`;
const SO_SOURCE = 'src/components/patterns/navigation/shortcuts-overlay/engines/modern/index.tsx';
// Mover: W23-POPX 2026-10-04 -- shortcuts-overlay/shape is published N/A, delegated to modal (shape 214 -> 213, N/A 4 -> 5).
const SHAPE_NOT_APPLICABLE = ['chart-line', 'chart-pie', 'radio', 'shortcuts-overlay', 'table-toolbar'];
// Mover: EVI02-MOTION 2026-10-08 (owner ruling 2026-10-08 #2) -- status-filter-pills/motion is published N/A, delegated to button (motion 204 -> 203, N/A 0 -> 1).
const SFP_SOURCE = 'src/components/patterns/data/status-filter-pills/index.tsx';
const SFP_REVIEW = 'WO-EVI-02 EVI02-MOTION delegation amendment 2026-10-08 (owner ruling 2026-10-08 #2; delegation debrief session 99d09055 + independent cause review session 26677a24 ACCEPT CAUSE + AMENDMENT SHAPE with C1-C7, adopted by the DT (Kimi); writer claude-opus-5-5, patch mode; independent lot review and the P1 real-browser proof owed before integration; Codex outside the loop by owner restriction 2026-09-19)';
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
  // A delegated entry reads the family's component source for the composition it was reviewed with.
  for (const source of [SO_SOURCE, SFP_SOURCE]) {
    mkdirSync(join(dir, dirname(source)), { recursive: true });
    cpSync(join(ROOT, source), join(dir, source));
  }
  return dir;
}

const catalogIn = (dir) => join(dir, CATALOG);
const baseRegistry = () => JSON.parse(readFileSync(EXCLUSIONS, 'utf8'));
const writeRegistry = (dir, registry, name = 'exclusions.json') => {
  const path = join(dir, name);
  writeFileSync(path, JSON.stringify(registry, null, 2));
  return path;
};
const radiiOf = (file, entry = null) => cssRules(readFileSync(file, 'utf8')).flatMap((rule) => {
  const reviewed = entry?.declarations.find((declaration) =>
    Object.values(population.reviewedSelectorForms(declaration.selector, entry.family)).includes(rule.selector));
  return rule.declarations
    .filter((declaration) => AXES.shape.authored.includes(declaration.property))
    .map((declaration) => ({ context: rule.atRules, selector: reviewed?.selector ?? rule.selector, property: declaration.property, value: declaration.value }));
});
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
  it('admits exactly radio/shape, chart-line/shape, chart-pie/shape, table-toolbar/shape (byProperty) and shortcuts-overlay/shape (delegated), and validates green on the tree', () => {
    const registry = readExclusions();
    // Movers of the pin (radio only -> + chart-line, chart-pie): WO-EVI-02 X1 dossier + Fable review 2026-09-30;
    // (+ table-toolbar): WO-EVI-02 X3 dossier + Fable review 2026-10-01.
    assert.deepEqual(registry.admitted, [
      { family: 'radio', axis: 'shape' },
      { family: 'chart-line', axis: 'shape' },
      { family: 'chart-pie', axis: 'shape' },
      { family: 'table-toolbar', axis: 'shape' },
      { family: 'shortcuts-overlay', axis: 'shape' },
      { family: 'status-filter-pills', axis: 'motion' },
    ]);
    assert.deepEqual(registry.entries.map((entry) => [entry.family, entry.axis, entry.path, entry.review]),
      [['radio', 'shape', 'byProperty', REVIEW], ['chart-line', 'shape', 'byProperty', CHART_LINE_REVIEW], ['chart-pie', 'shape', 'byProperty', CHART_REVIEW],
        ['table-toolbar', 'shape', 'byProperty', TT_REVIEW], ['shortcuts-overlay', 'shape', 'delegated', SO_REVIEW],
        ['status-filter-pills', 'motion', 'delegated', SFP_REVIEW]]);
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
    assert.deepEqual(shape.notApplicable.map((entry) => entry.family), SHAPE_NOT_APPLICABLE);
    assert.equal(shape.notApplicableCount, 5);
    for (const entry of report.axes) {
      assert.ok(entry.families.every((family) => !entry.notApplicable.some((withdrawn) => withdrawn.family === family)),
        `${entry.axis}: applicable and not-applicable sets must be disjoint`);
      // Mover: EVI02-MOTION 2026-10-08 -- motion carries exactly the status-filter-pills delegation.
      if (entry.axis === 'motion') assert.deepEqual(entry.notApplicable.map((withdrawn) => withdrawn.family), ['status-filter-pills']);
      else if (entry.axis !== 'shape') assert.equal(entry.notApplicableCount, 0, `${entry.axis}: no exclusion is reviewed there`);
    }
    // Mover: CL104 -- chart-line is in shape on a shadowed declaration and its entry is published INEFFECTIVE by name.
    assert.deepEqual(report.exclusions.ineffective, CHART_LINE_INEFFECTIVE);
    assert.equal(report.exclusions.revision, exclusionsRevision());

    const line = populationLine();
    // Mover: 65f9f8b80 (ARC-12 E6 prerequisite, re-pinned by HK-POP 2026-10-12): active-filters-bar enters shape on a reset (`border-radius: 0`), 213 -> 214.
    assert.match(line, /shape 214 \(5 N\/A\)/);
    assert.match(line, /typography 184 \(0 N\/A\)/);
    assert.match(line, /exclusions [0-9a-f]{16} \(6 reviewed\)/);

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
    // GLASS-1 (owner ruling 3) -- the glass-card skin enters shape and depth (214 -> 215);
    // FAM09-CL 2026-10-02 -- the skeleton-bar dome re-enters the chart-line exclusion (215 -> 214, N/A 3 -> 4);
    // OWNSO 9789b3469 + W23-POPX 2026-10-04 -- shortcuts-overlay's dialog corner retires into Modal, delegated (214 -> 213, N/A 4 -> 5);
    // 65f9f8b80 (ARC-12 E6 prerequisite, re-pinned by HK-POP 2026-10-12): active-filters-bar enters shape on a reset (213 -> 214).
    assert.equal(floor.axes.shape, 214);
    assert.deepEqual(floor.provenance.membershipMoves.orphanRetirement.byAxis,
      Object.fromEntries(['shape', 'depth', 'states'].map((axis) => [axis, { removed: ['overlay-modal-compounds'], added: [] }])));
    assert.equal(floor.notApplicable.shape, 5);
    assert.deepEqual(floor.provenance.membershipMoves.shortcutsOverlayDelegation.byAxis.shape, { added: [], removed: ['shortcuts-overlay'] });
    assert.deepEqual([floor.provenance.membershipMoves.shortcutsOverlayDelegation.shapeFloorLowering.pinned,
      floor.provenance.membershipMoves.shortcutsOverlayDelegation.shapeFloorLowering.repinned], [214, 213]);
    assert.deepEqual(floor.provenance.membershipMoves.byAxis.shape.removed, ['chart-line', 'chart-pie', 'table-toolbar']);
    assert.deepEqual(floor.provenance.membershipMoves.byAxis.shape.reEntered, []);
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
    assert.deepEqual(report.axes.find((entry) => entry.axis === 'shape').notApplicable.map((entry) => entry.family), SHAPE_NOT_APPLICABLE);
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
      .some((line) => line.includes('is neither byProperty nor delegated; a head-channel read is never excluded')));

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

  it('names the reviewed declarations verbatim: chart-pie\'s are its only radii and withdraw it; chart-line\'s legend cap and skeleton dome are both excluded and withdraw it (FAM09-CL)', () => {
    const entries = readExclusions().entries.filter((entry) => entry.family.startsWith('chart-'));
    assert.deepEqual(entries.map((entry) => [entry.family, entry.skin, entry.reviewedAt.commit]),
      [['chart-line', CHART_LINE_SKIN, '366993b06'], ['chart-pie', CHART_PIE_SKIN, '2e5419620']]);
    const [line, pie] = entries;

    assert.deepEqual(radiiOf(join(ROOT, pie.skin)), pie.declarations);
    const declaredPie = familyAxisDeclarations().get('chart-pie');
    assert.ok(!declaredPie.axes.shape, 'chart-pie leaves shape');
    assert.equal(declaredPie.notApplicable.shape.review, CHART_REVIEW);

    // Mover: FAM09-CL re-review 2026-10-02 -- the skeleton-bar radius re-entered the entry (the dome paints;
    // the chart-foundation shadowing resolved with WO-FAM-09's ruling), so chart-line leaves shape on both.
    assert.deepEqual(line.declarations, [{
      context: [], selector: ".ds-chart-line [data-part='legend-swatch']", property: 'border-radius', value: 'var(--_ds-line-marker-radius, 999px)',
    }, {
      context: [], selector: ".ds-chart-line [data-part='skeleton-bar']", property: 'border-radius', value: '999px 999px 0 0',
    }]);
    assert.deepEqual(radiiOf(join(ROOT, line.skin)), line.declarations);
    const declaredLine = familyAxisDeclarations().get('chart-line');
    assert.ok(!declaredLine.axes.shape, 'chart-line leaves shape');
    assert.equal(declaredLine.notApplicable.shape.review, CHART_LINE_REVIEW);

    assert.ok(!readExclusions().entries.some((entry) => entry.family === 'chart-waterfall'), 'chart-waterfall is not excluded (Fable REJECT)');
    assert.ok(familyAxisDeclarations().get('chart-waterfall').axes.shape, 'chart-waterfall stays in shape and must move');
    assert.deepEqual(populationReport().exclusions.ineffective, CHART_LINE_INEFFECTIVE);
  });

  it('derives the private channels from the reviewed values, and none of them is produced anywhere in src on this tree', () => {
    const reads = Object.fromEntries(readExclusions().entries.map((entry) =>
      [entry.family, [...new Set((entry.declarations ?? []).flatMap((declaration) => privateChannelsRead(declaration.value)))]]));
    assert.deepEqual(reads, {
      radio: [], 'chart-line': ['--_ds-line-marker-radius'], 'chart-pie': ['--_ds-pie-marker-radius'], 'table-toolbar': [], 'shortcuts-overlay': [],
      'status-filter-pills': [],
    });
    const producers = privateChannelProducers(ROOT, ['--_ds-line-marker-radius', '--_ds-pie-marker-radius']);
    assert.deepEqual(Object.fromEntries(producers), { '--_ds-line-marker-radius': [], '--_ds-pie-marker-radius': [] });
    assert.deepEqual(checkExclusionRegistry().failures, []);
  });

  it('MUTANT (C1-a): a producer planted in the family\'s OWN skin leaves the entry matching, and the guard fails it by site on every gate', () => {
    const dir = sandbox();
    // A literal producer reads no head channel, so nothing else in the population notices it: the entry still
    // matches verbatim and, without the guard, the legend declaration would stay excluded while its marker repaints.
    append(dir, CHART_LINE_SKIN, '.ds-chart-line { --_ds-line-marker-radius: 2px; }');
    // Mover: FAM09-CL -- both declarations match (excluded); the planted producer changes no membership, only the guard notices.
    const planted = familyAxisDeclarations(dir, catalogIn(dir)).get('chart-line');
    assert.ok(!planted.axes.shape, 'chart-line stays out of shape: the entry still matches verbatim');
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
    assert.deepEqual(radiiOf(join(ROOT, reviewed.skin), reviewed), reviewed.declarations);
    assert.deepEqual(reviewed.declarations, [{ context: [], selector: DIVIDER, property: 'border-radius', value: '1px' }]);
    const declared = familyAxisDeclarations().get('table-toolbar');
    assert.ok(!declared.axes.shape, 'table-toolbar leaves shape');
    assert.equal(declared.notApplicable.shape.review, TT_REVIEW);
    assert.ok(!readExclusions().entries.some((candidate) => candidate.family === 'bottom-tab-bar'),
      'bottom-tab-bar is not excluded (Fable G4: its focus ring reads --ds-radius-md, a head channel)');
  });

  it('G1: the reviewed rule authors inline-size 2px beside border-radius 1px, and the selector\'s at-rule variants declare no shape longhand and no inline-size', () => {
    const forms = Object.values(population.reviewedSelectorForms(DIVIDER, 'table-toolbar'));
    const rules = cssRules(readFileSync(join(ROOT, TABLE_TOOLBAR_SKIN), 'utf8')).filter((rule) => forms.includes(rule.selector));
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

describe('theme population — the reviewed declaration keeps its identity across the carrier class door (PM-P14)', () => {
  const TT = `${AGNOSTIC_ROOT}/table-toolbar/index.css`;
  const S = ".ds-structure.ds-table-toolbar .ds-table-toolbar__divider[data-part='divider']";
  const C = '.ds-structure.ds-table-toolbar .ds-table-toolbar__divider.ds-table-toolbar__divider';
  const CONTEXTS = [[], ['@container ds-table-toolbar (max-width: 40rem)'], ['@media (forced-colors: active)']];
  const ALL_CONTEXTS = '[], [@container ds-table-toolbar (max-width: 40rem)], [@media (forced-colors: active)]';
  const DIVIDER_RULE = /^([ \t]*)\.ds-structure\.ds-table-toolbar \.ds-table-toolbar__divider\[data-part='divider'\] \{/gmu;
  const formsOf = (selector, family = 'table-toolbar') => population.reviewedSelectorForms(selector, family);
  const entryIndex = () => readExclusions().entries.findIndex((entry) => entry.family === 'table-toolbar');
  const label = () => `entry ${entryIndex()} (table-toolbar/shape): `;
  const notAuthored = (selector = S) => `${label()}selector not authored in ${TT} (comments removed): ${selector}`;
  const stale = (contexts) => `${label()}STALE — ${TT} no longer authors [] ${S} { border-radius: 1px } verbatim (the selector is authored `
    + `under ${contexts}); the family has re-entered shape and the entry must be re-reviewed or removed`;
  const measure = (dir) => ({
    floor: checkPopulationFloor(dir, catalogIn(dir)).failures,
    pilot: checkPilotPopulation(dir, catalogIn(dir), PILOT_PIN).failures,
    registry: checkExclusionRegistry(dir).failures,
    shape: populationReport(dir, catalogIn(dir)).axes.find((entry) => entry.axis === 'shape'),
    record: familyAxisDeclarations(dir, catalogIn(dir)).get('table-toolbar'),
  });
  let head;
  const headOf = () => (head ??= measure(sandbox()));
  const delta = (after, before) => {
    const rest = [...after];
    for (const line of before) {
      const at = rest.indexOf(line);
      assert.ok(at >= 0, `a line of the paired HEAD sandbox is gone: ${line}`);
      rest.splice(at, 1);
    }
    return rest.sort();
  };
  const reentered = () => {
    const floor = JSON.parse(readFileSync(FLOOR, 'utf8'));
    const base = headOf();
    assert.ok(!base.floor.some((line) => line.startsWith('shape:')), 'the paired HEAD sandbox reads shape at its pin');
    return [
      `shape: denominator ${base.shape.denominator + 1} is ABOVE its pin ${floor.axes.shape} — raise the pin in this commit so `
        + 'the published population and the floor keep naming the same set',
      `shape: ${base.shape.notApplicableCount - 1} famil(ies) not applicable != pinned ${floor.notApplicable.shape} — a reviewed `
        + 'exclusion is published beside the denominator it subtracts from; re-pin both in the same commit with the review',
    ];
  };
  const arm = (prelude, edit = null, setup = () => {}) => {
    const dir = sandbox();
    const file = join(dir, TT);
    let count = 0;
    const armed = readFileSync(file, 'utf8').replace(DIVIDER_RULE, (_match, indent) => {
      count += 1;
      return `${indent}${prelude(indent)} {`;
    });
    assert.equal(count, 3, 'the three reviewed divider rules are armed');
    const edited = edit === null ? armed : edit(armed);
    if (edit !== null) assert.notEqual(edited, armed, 'the mutation must reach the armed skin');
    writeFileSync(file, edited);
    setup(dir);
    return { dir, measured: measure(dir) };
  };
  const pair = (indent) => `${S},\n${indent}${C}`;
  const premiseOf = (dir) => {
    const forms = Object.values(formsOf(S));
    const rules = cssRules(readFileSync(join(dir, TT), 'utf8')).filter((rule) => forms.includes(rule.selector));
    const valueOf = (rule, property) => rule.declarations.filter((declaration) => declaration.property === property).map((declaration) => declaration.value);
    return {
      contexts: rules.map((rule) => rule.atRules),
      width: valueOf(rules[0], 'inline-size'),
      radius: valueOf(rules[0], 'border-radius'),
      variantsClean: rules.slice(1).every((rule) => !rule.declarations.some((declaration) =>
        AXES.shape.authored.includes(declaration.property) || declaration.property === 'inline-size')),
    };
  };
  const kept = ({ dir, measured }, selector) => {
    const base = headOf();
    const entry = readExclusions().entries[entryIndex()];
    assert.deepEqual(measured.registry, base.registry);
    assert.deepEqual(measured.floor, base.floor);
    assert.deepEqual(measured.pilot, base.pilot);
    assert.deepEqual([measured.shape.denominator, measured.shape.notApplicable], [base.shape.denominator, base.shape.notApplicable]);
    assert.equal(measured.record.axes.shape, undefined);
    assert.equal(measured.record.notApplicable.shape.review, TT_REVIEW);
    assert.deepEqual(measured.record.notApplicable.shape.excludedDeclarations.map((declaration) => [declaration.selector, declaration.context, declaration.value]),
      [[selector, [], '1px']]);
    assert.deepEqual(radiiOf(join(dir, TT), entry), entry.declarations);
    assert.deepEqual(premiseOf(dir), { contexts: CONTEXTS, width: ['2px'], radius: ['1px'], variantsClean: true });
  };
  const refused = (measured, registryLine) => {
    const base = headOf();
    assert.deepEqual(delta(measured.registry, base.registry), [registryLine]);
    assert.deepEqual(delta(measured.pilot, base.pilot), [`exclusion registry: ${registryLine}`]);
    assert.deepEqual(delta(measured.floor, base.floor), [`exclusion registry: ${registryLine}`, ...reentered()].sort());
    assert.deepEqual(measured.record.axes.shape?.properties, ['border-radius']);
    assert.deepEqual(measured.record.notApplicable, {});
  };
  const unchangedGates = (measured) => {
    const base = headOf();
    assert.deepEqual([delta(measured.registry, base.registry), delta(measured.floor, base.floor), delta(measured.pilot, base.pilot)], [[], [], []]);
  };

  it('M01 HEAD identity: every reviewed byProperty declaration is authored only as its own selector and table-toolbar stays withdrawn from shape', () => {
    for (const entry of readExclusions().entries.filter((candidate) => candidate.path === 'byProperty')) {
      const selectors = cssRules(readFileSync(join(ROOT, entry.skin), 'utf8')).map((rule) => rule.selector);
      for (const reviewed of entry.declarations) {
        const forms = formsOf(reviewed.selector, entry.family);
        assert.equal(forms.part, reviewed.selector);
        assert.ok(selectors.includes(forms.part), forms.part);
        assert.ok(forms.pair !== null && !selectors.includes(forms.pair) && !selectors.includes(forms.classOnly), `${forms.part}: no carrier form on HEAD`);
      }
    }
    const declared = familyAxisDeclarations().get('table-toolbar');
    assert.equal(declared.axes.shape, undefined);
    assert.deepEqual(declared.notApplicable.shape.excludedDeclarations.map((declaration) => [declaration.selector, declaration.context, declaration.value]),
      [[S, [], '1px']]);
    assert.ok(populationReport().axes.find((entry) => entry.axis === 'shape').notApplicable.some((entry) => entry.family === 'table-toolbar'));
  });

  it('M02 form derivation: the seven reviewed selectors derive their exact carrier forms; every unsupported grammar derives none and its probe-style pair is not excluded', () => {
    const CURRENT = [
      [".ds-radio.ds-radio--modern [data-part='circle']", 'radio', '.ds-radio.ds-radio--modern .ds-radio__circle'],
      [".ds-radio.ds-radio--modern [data-part='dot']", 'radio', '.ds-radio.ds-radio--modern .ds-radio__dot'],
      [".ds-chart-line [data-part='legend-swatch']", 'chart-line', '.ds-chart-line .ds-chart-line__legend-swatch'],
      [".ds-chart-line [data-part='skeleton-bar']", 'chart-line', '.ds-chart-line .ds-chart-line__skeleton-bar'],
      [".ds-chart-pie [data-part='legend-swatch']", 'chart-pie', '.ds-chart-pie .ds-chart-pie__legend-swatch'],
      [".ds-chart-pie [data-part='skeleton']::before", 'chart-pie', '.ds-chart-pie .ds-chart-pie__skeleton::before'],
      [S, 'table-toolbar', C],
    ];
    for (const [selector, family, classOnly] of CURRENT) {
      assert.deepEqual(formsOf(selector, family), { part: selector, pair: `${selector}, ${classOnly}`, classOnly }, selector);
    }
    const reviewedTexts = readExclusions().entries.flatMap((entry) => (entry.declarations ?? []).map((declaration) => declaration.selector));
    assert.deepEqual([...reviewedTexts].sort(), CURRENT.map(([selector]) => selector).sort(), 'the seven reviewed selectors of the registry');
    assert.deepEqual(formsOf('.ds-table-toolbar [data-part="a"]').classOnly, '.ds-table-toolbar .ds-table-toolbar__a');
    const NEGATIVES = [
      ['mixed exact + unquoted', ".ds-table-toolbar [data-part='a'] [data-part=b]", '.ds-table-toolbar .ds-table-toolbar__a [data-part=b]'],
      ['unquoted', '.ds-table-toolbar [data-part=a]', null],
      ['operator ~=', ".ds-table-toolbar [data-part~='a']", null],
      ['functional :not part', ".ds-table-toolbar:not([data-part='x']) [data-part='a']", '.ds-table-toolbar:not(.ds-table-toolbar__x) .ds-table-toolbar__a'],
      ['functional :is list', ".ds-table-toolbar :is([data-part='a'], [data-part='b'])", '.ds-table-toolbar :is(.ds-table-toolbar__a, .ds-table-toolbar__b)'],
      ['top-level list', ".ds-table-toolbar [data-part='a'], .ds-table-toolbar [data-part='b']", '.ds-table-toolbar .ds-table-toolbar__a, .ds-table-toolbar .ds-table-toolbar__b'],
      ['block only inside attribute value', "[data-x='.ds-table-toolbar'] [data-part='a']", "[data-x='.ds-table-toolbar'] .ds-table-toolbar__a"],
      ['block only inside :not', ":not(.ds-table-toolbar) [data-part='a']", ':not(.ds-table-toolbar) .ds-table-toolbar__a'],
      ['BEM-only (no block token)', ".ds-table-toolbar__x [data-part='a']", null],
      ['prefix collision', ".ds-table-toolbar-x [data-part='a']", null],
      ['escaped part value', ".ds-table-toolbar [data-part='a\\:b']", '.ds-table-toolbar .ds-table-toolbar__a\\:b'],
      ['part value with space', ".ds-table-toolbar [data-part='a b']", '.ds-table-toolbar .ds-table-toolbar__a b'],
      ['part value starting with digit', ".ds-table-toolbar [data-part='1a']", '.ds-table-toolbar .ds-table-toolbar__1a'],
      ['other attribute in compound', ".ds-table-toolbar [data-part='a'][data-state='x']", ".ds-table-toolbar .ds-table-toolbar__a[data-state='x']"],
      ['spaces inside attribute', ".ds-table-toolbar [data-part = 'a']", null],
      ['no part token', '.ds-table-toolbar .ds-table-toolbar__a', null],
    ];
    for (const [name, selector] of NEGATIVES) {
      assert.deepEqual(formsOf(selector), { part: normalizeCssText(selector), pair: null, classOnly: null }, name);
    }
    const authorable = NEGATIVES.filter(([, , probe]) => probe !== null);
    assert.equal(authorable.length, 10);
    const dir = sandbox();
    writeFileSync(join(dir, TT), `${readFileSync(join(dir, TT), 'utf8')}\n${authorable
      .map(([, selector, probe]) => `${selector}, ${probe} { border-radius: 3px; }`).join('\n')}\n`);
    const registry = baseRegistry();
    registry.entries[entryIndex()].declarations.push(...authorable.map(([, selector]) => ({ context: [], selector, property: 'border-radius', value: '3px' })));
    const path = writeRegistry(dir, registry);
    assert.deepEqual(delta(checkExclusionRegistry(dir, path).failures, headOf().registry),
      authorable.map(([, selector]) => notAuthored(selector)).sort());
    const record = familyAxisDeclarations(dir, catalogIn(dir), path).get('table-toolbar');
    assert.deepEqual(record.axes.shape?.properties, ['border-radius']);
    assert.equal(record.axes.shape.excludedDeclarations.length, 1, 'only the reviewed divider matches');
  });

  it('M03 armed pair: the three reviewed rules authored as "S, C" keep the exclusion, the G1/G2 premise and every gate line of the paired HEAD sandbox', () => {
    kept(arm(pair), `${S}, ${C}`);
  });

  it('M04 class-only strip control: the three reviewed rules authored as the class twin alone keep the exclusion and the premise', () => {
    kept(arm(() => C), C);
  });

  it('M05 non-vacuity: no armed rule is the reviewed text, so the forms alone keep the exclusion; one changed character in the class member re-enters the family', () => {
    const { dir, measured } = arm(pair);
    assert.ok(!cssRules(readFileSync(join(dir, TT), 'utf8')).some((rule) => rule.selector === S), 'a verbatim key can match nothing');
    assert.equal(measured.record.notApplicable.shape.review, TT_REVIEW);
    refused(arm((indent) => `${S},\n${indent}${C.replace(/__divider$/u, '__dividers')}`).measured, notAuthored());
  });

  it('M06 wrong radius: the armed reviewed rule painting 2px re-enters shape and the entry is STALE', () => {
    const { measured } = arm(pair, (css) => css.replace(`${S},\n${C} {\n  inline-size: 2px;\n  block-size: 28px;\n  flex-shrink: 0;\n  margin-inline: 4px;\n  border-radius: 1px;`,
      `${S},\n${C} {\n  inline-size: 2px;\n  block-size: 28px;\n  flex-shrink: 0;\n  margin-inline: 4px;\n  border-radius: 2px;`));
    refused(measured, stale(ALL_CONTEXTS));
  });

  it('M07 wrong width: the armed reviewed rule at inline-size 4px breaks the G1 premise while the verbatim law stays blind to it', () => {
    const armed = arm(pair, (css) => css.replace(`${S},\n${C} {\n  inline-size: 2px;`, `${S},\n${C} {\n  inline-size: 4px;`));
    assert.deepEqual(premiseOf(armed.dir).width, ['4px']);
    unchangedGates(armed.measured);
  });

  it('M08 missing rule: removing the armed @container variant breaks the G1 context list', () => {
    const armed = arm(pair, (css) => css.replace(`  ${S},\n  ${C} {\n    display: none;\n  }\n`, ''));
    assert.deepEqual(premiseOf(armed.dir).contexts, [[], ['@media (forced-colors: active)']]);
    unchangedGates(armed.measured);
  });

  it('M09 at-rule change: the armed reviewed rule moved under @media print is STALE by context and re-enters shape', () => {
    const { measured } = arm(pair, (css) => css.replace(/^\.ds-structure\.ds-table-toolbar \.ds-table-toolbar__divider\[data-part='divider'\],\n[^{]*\{[^}]*\}/mu,
      (rule) => `@media print {\n${rule}\n}`));
    refused(measured, stale('[@media print], [@container ds-table-toolbar (max-width: 40rem)], [@media (forced-colors: active)]'));
  });

  it('M10 variant gains shape or width: a radius in the armed forced-colors variant re-enters shape; an inline-size there breaks G1 alone', () => {
    const variant = `  ${S},\n  ${C} {\n    background: ButtonText;`;
    const radius = arm(pair, (css) => css.replace(variant, `  ${S},\n  ${C} {\n    border-radius: 0;\n    background: ButtonText;`));
    assert.equal(premiseOf(radius.dir).variantsClean, false);
    const base = headOf();
    assert.deepEqual([delta(radius.measured.registry, base.registry), delta(radius.measured.pilot, base.pilot)], [[], []]);
    assert.deepEqual(delta(radius.measured.floor, base.floor), reentered().sort());
    assert.deepEqual(radius.measured.record.axes.shape.properties, ['border-radius']);
    assert.equal(radius.measured.record.axes.shape.excludedDeclarations.length, 1);
    const width = arm(pair, (css) => css.replace(variant, `  ${S},\n  ${C} {\n    inline-size: 3px;\n    background: ButtonText;`));
    assert.equal(premiseOf(width.dir).variantsClean, false);
    unchangedGates(width.measured);
  });

  it('M11 widened member: a class member without the repeated hook, or with a looser ancestor, is refused', () => {
    for (const member of ['.ds-structure.ds-table-toolbar .ds-table-toolbar__divider', '.ds-structure .ds-table-toolbar__divider.ds-table-toolbar__divider']) {
      refused(arm((indent) => `${S},\n${indent}${member}`).measured, notAuthored());
    }
  });

  it('M12 foreign block: a class member on another family\'s block is refused', () => {
    refused(arm((indent) => `${S},\n${indent}.ds-structure.ds-table-toolbar .ds-table-toolbar__divider.ds-list-toolbar__divider`).measured, notAuthored());
  });

  it('M13 wrong part: a class member naming another part is refused', () => {
    refused(arm((indent) => `${S},\n${indent}.ds-structure.ds-table-toolbar .ds-table-toolbar__divider.ds-table-toolbar__spacer`).measured, notAuthored());
  });

  it('M14 extra member: a third member beside the pair is refused', () => {
    refused(arm((indent) => `${S},\n${indent}${C},\n${indent}.ds-drill-extra`).measured, notAuthored());
  });

  it('M15 duplicate member: a doubled reviewed member or a doubled class member is refused', () => {
    for (const prelude of [(indent) => `${S},\n${indent}${S}`, (indent) => `${S},\n${indent}${C},\n${indent}${C}`]) {
      refused(arm(prelude).measured, notAuthored());
    }
  });

  it('M16 duplicate rule: a second armed top-level rule breaks the G1 context list at 1px and re-enters shape at 2px', () => {
    const twin = (value) => (css) => `${css}\n${S},\n${C} {\n  inline-size: 2px;\n  border-radius: ${value};\n}\n`;
    const same = arm(pair, twin('1px'));
    assert.deepEqual(premiseOf(same.dir).contexts, [...CONTEXTS, []]);
    unchangedGates(same.measured);
    const other = arm(pair, twin('2px'));
    const base = headOf();
    assert.deepEqual([delta(other.measured.registry, base.registry), delta(other.measured.pilot, base.pilot)], [[], []]);
    assert.deepEqual(delta(other.measured.floor, base.floor), reentered().sort());
    assert.deepEqual(other.measured.record.axes.shape.properties, ['border-radius']);
  });

  it('M17 order control: the class member before the reviewed member is refused', () => {
    refused(arm((indent) => `${C},\n${indent}${S}`).measured, notAuthored());
  });

  it('M18 unowned: the armed pair authored in another family\'s skin is that family\'s own shape position, while table-toolbar stays withdrawn', () => {
    const { dir, measured } = arm(pair, null, (root) => {
      mkdirSync(join(root, AGNOSTIC_ROOT, 'drill-unowned'), { recursive: true });
      writeFileSync(join(root, AGNOSTIC_ROOT, 'drill-unowned/index.css'), `${S},\n${C} {\n  inline-size: 2px;\n  border-radius: 1px;\n}\n`);
    });
    const unowned = familyAxisDeclarations(dir, catalogIn(dir)).get('drill-unowned');
    assert.deepEqual(unowned.axes.shape, { properties: ['border-radius'], headChannels: [] });
    assert.deepEqual(unowned.notApplicable, {});
    assert.equal(measured.record.notApplicable.shape.review, TT_REVIEW);
    assert.deepEqual(delta(measured.registry, headOf().registry), []);
  });
});

describe('theme population — a delegated shape surface: shortcuts-overlay paints shape through Modal (WO-EVI-02 W23-POPX)', () => {
  const SO_RETIRED = {
    commit: '9789b3469',
    skin: SO_SKIN,
    context: [],
    selector: ".ds-pattern-shortcuts-overlay.ds-engine-modern [data-part='dialog']",
    property: 'border-radius',
    value: 'var(--ds-shortcuts-overlay-dialog-radius, var(--ds-radius-xl))',
  };
  const WITNESS = ['--ds-modal-bg', '--ds-modal-body-color', '--ds-modal-color', '--ds-modal-enter-curve',
    '--ds-modal-enter-duration', '--ds-modal-max-inline-size', '--ds-modal-shadow'];
  const soIndex = () => baseRegistry().entries.findIndex((entry) => entry.family === 'shortcuts-overlay');
  const soLabel = () => `entry ${soIndex()} (shortcuts-overlay/shape): `;
  const append = (dir, file, text) => writeFileSync(join(dir, file), `${readFileSync(join(dir, file), 'utf8')}\n${text}\n`);
  const rewrite = (dir, file, from, to) => {
    const source = readFileSync(join(dir, file), 'utf8');
    const next = source.replaceAll(from, to);
    assert.notEqual(next, source, `the mutation must reach ${file}`);
    writeFileSync(join(dir, file), next);
  };
  const shapeOf = (dir, path = EXCLUSIONS) => populationReport(dir, catalogIn(dir), path).axes.find((entry) => entry.axis === 'shape');
  const has = (failures, text) => assert.ok(failures.some((line) => line.includes(text)), `missing "${text}" in: ${failures.join(' | ')}`);

  it('on this tree: the family authors no shape, is published N/A delegated to modal with a derived witness, and modal is unmoved', () => {
    const entry = readExclusions().entries[soIndex()];
    assert.deepEqual([entry.path, entry.delegate, entry.skin, entry.declarations], ['delegated', 'modal', SO_SKIN, undefined]);
    assert.deepEqual(entry.retired, SO_RETIRED);
    assert.deepEqual(radiiOf(join(ROOT, SO_SKIN)), [], 'the skin authors no shape longhand: the retired corner is gone');
    const css = readFileSync(join(ROOT, SO_SKIN), 'utf8');
    assert.deepEqual([...readChannels(css)].filter((channel) => axisChannels().get('shape').has(channel)), [], 'and reads no shape head channel');
    const declared = familyAxisDeclarations();
    const so = declared.get('shortcuts-overlay');
    assert.deepEqual(Object.keys(so.axes), ['typography', 'rhythm', 'depth', 'motion']);
    assert.deepEqual(so.notApplicable.shape, {
      reason: entry.reason, review: SO_REVIEW, excludedDeclarations: [], delegatedTo: 'modal', witness: WITNESS,
    });
    // The exclusion is on the family's authored position only: modal keeps its own membership and evidence.
    assert.deepEqual(declared.get('modal').axes.shape, { properties: ['border-radius'], headChannels: ['--ds-radius-md'] });
    assert.deepEqual(declared.get('modal').notApplicable, {});
    for (const cover of entry.covers) {
      assert.equal(cover.skin, MODAL_SKIN);
      assert.ok(radiiOf(join(ROOT, MODAL_SKIN)).some((radius) => radius.selector === cover.selector && radius.value === cover.value
        && radius.context.length === 0), `${cover.selector} is authored verbatim`);
    }
    assert.deepEqual(entry.composedIn, { source: SO_SOURCE, carries: ["import Modal from '../../../../../primitives/feedback/modal/engines/modern';", 'radius="xl"'] });
    const shape = shapeOf(ROOT);
    assert.ok(shape.families.includes('modal') && !shape.families.includes('shortcuts-overlay'));
    assert.equal(shape.notApplicable.find((withdrawn) => withdrawn.family === 'shortcuts-overlay').delegatedTo, 'modal');
    assert.deepEqual(populationReport().exclusions.ineffective, CHART_LINE_INEFFECTIVE);
    assert.deepEqual(checkExclusionRegistry().failures, []);
  });

  it('MUTANT (R1): a shape longhand planted in the skin re-enters shape by itself; the entry is published ineffective, fails STALE, and the floor refuses', () => {
    const dir = sandbox();
    append(dir, SO_SKIN, ".ds-pattern-shortcuts-overlay.ds-engine-modern [data-part='content'] { border-radius: var(--ds-radius-xl); }");
    const so = familyAxisDeclarations(dir, catalogIn(dir)).get('shortcuts-overlay');
    assert.deepEqual(so.axes.shape, { properties: ['border-radius'], headChannels: [], delegationEffective: false });
    assert.deepEqual(so.notApplicable, {});
    const shape = shapeOf(dir);
    assert.ok(shape.families.includes('shortcuts-overlay'));
    assert.deepEqual(shape.notApplicable.map((entry) => entry.family), SHAPE_NOT_APPLICABLE.filter((family) => family !== 'shortcuts-overlay'));
    assert.ok(populationReport(dir, catalogIn(dir)).exclusions.ineffective.some((entry) => entry.family === 'shortcuts-overlay' && entry.axis === 'shape'));
    has(checkExclusionRegistry(dir).failures, `${soLabel()}STALE — shortcuts-overlay declares shape again (properties [border-radius], head channels [])`);
    const floor = checkPopulationFloor(dir, catalogIn(dir)).failures;
    // Mover: 65f9f8b80 (ARC-12 E6 prerequisite, re-pinned by HK-POP 2026-10-12): active-filters-bar enters shape, so the pin is 214 and the re-declaring sandbox reads one above it.
    has(floor, 'shape: denominator 215 is ABOVE its pin 214');
    has(floor, 'shape: 4 famil(ies) not applicable != pinned 5');
  });

  it('MUTANT (R2): reading a shape head channel (tuning Modal\'s corner through --ds-modal-radius) re-enters shape the same way', () => {
    const dir = sandbox();
    append(dir, SO_SKIN, '.ds-pattern-shortcuts-overlay.ds-engine-modern { --ds-modal-radius: var(--ds-radius-md); }');
    const so = familyAxisDeclarations(dir, catalogIn(dir)).get('shortcuts-overlay');
    assert.deepEqual(so.axes.shape, { properties: [], headChannels: ['--ds-radius-md'], delegationEffective: false });
    assert.deepEqual(so.notApplicable, {});
    has(checkExclusionRegistry(dir).failures, `${soLabel()}STALE — shortcuts-overlay declares shape again (properties [], head channels [--ds-radius-md])`);
  });

  it('MUTANT (R3): when the delegate stops declaring shape, the delegation lapses (the family is in neither set) and the registry fails', () => {
    const dir = sandbox();
    const skin = join(dir, MODAL_SKIN);
    writeFileSync(skin, readFileSync(skin, 'utf8').replace(/border(-[a-z-]*)?radius\s*:/gu, 'x-drill-neutralised:').replaceAll('--ds-radius-md', '--ds-drill-md'));
    const declared = familyAxisDeclarations(dir, catalogIn(dir));
    assert.equal(declared.get('modal').axes.shape, undefined);
    assert.equal(declared.get('shortcuts-overlay').axes.shape, undefined);
    assert.deepEqual(declared.get('shortcuts-overlay').notApplicable, {});
    const failures = checkExclusionRegistry(dir).failures;
    has(failures, `${soLabel()}modal does not declare shape in its own right; nothing measured covers shortcuts-overlay's paint`);
    has(failures, `${soLabel()}STALE — ${MODAL_SKIN} no longer authors the covering`);
  });

  it('MUTANT (R4): a covering declaration of the delegate that changes value fails the registry, membership unchanged', () => {
    const dir = sandbox();
    rewrite(dir, MODAL_SKIN, "[data-radius='xl'] {\n  border-radius: var(--ds-radius-xl);", "[data-radius='xl'] {\n  border-radius: var(--ds-radius-lg);");
    assert.equal(familyAxisDeclarations(dir, catalogIn(dir)).get('shortcuts-overlay').notApplicable.shape.delegatedTo, 'modal');
    const failures = checkExclusionRegistry(dir).failures;
    assert.equal(failures.length, 1, failures.join(' | '));
    has(failures, `${soLabel()}STALE — ${MODAL_SKIN} no longer authors the covering [] .ds-modal.ds-modal--modern[data-part='root'] > [data-part='surface'][data-radius='xl'] { border-radius: var(--ds-radius-xl) } verbatim`);
  });

  it('MUTANT (R5): a skin that no longer writes any --ds-modal-* channel modal reads witnesses no composition: the delegation lapses and the registry fails', () => {
    const dir = sandbox();
    rewrite(dir, SO_SKIN, '--ds-modal-', '--ds-drill-modal-');
    const so = familyAxisDeclarations(dir, catalogIn(dir)).get('shortcuts-overlay');
    assert.equal(so.axes.shape, undefined);
    assert.deepEqual(so.notApplicable, {});
    has(checkExclusionRegistry(dir).failures, `${soLabel()}shortcuts-overlay's skin writes no --ds-modal-* channel that modal's skin reads; no composition is witnessed`);
  });

  it('MUTANT (R6): the component no longer picking the covering rung, or importing Modal only inside a comment, fails the registry by fragment', () => {
    const dir = sandbox();
    rewrite(dir, SO_SOURCE, 'radius="xl"', 'radius="lg"');
    has(checkExclusionRegistry(dir).failures, `${soLabel()}STALE — ${SO_SOURCE} no longer carries \`radius="xl"\``);
    const commented = sandbox();
    const IMPORT = "import Modal from '../../../../../primitives/feedback/modal/engines/modern';";
    rewrite(commented, SO_SOURCE, IMPORT, `// ${IMPORT}`);
    const failures = checkExclusionRegistry(commented).failures;
    assert.equal(failures.length, 1, failures.join(' | '));
    has(failures, `${soLabel()}STALE — ${SO_SOURCE} no longer carries \`${IMPORT}\``);
  });

  it('MUTANT (R7): a delegated entry is no blanket exemption -- on a family that declares shape it withdraws nothing, is published ineffective and fails STALE', () => {
    const dir = sandbox();
    const registry = baseRegistry();
    registry.admitted.push({ family: 'checkbox', axis: 'shape' });
    const checkboxFile = familyAxisDeclarations(dir, catalogIn(dir)).get('checkbox').files[0];
    registry.entries.push({ ...JSON.parse(JSON.stringify(registry.entries[soIndex()])), family: 'checkbox', skin: checkboxFile });
    const path = writeRegistry(dir, registry);
    const checkbox = familyAxisDeclarations(dir, catalogIn(dir), path).get('checkbox');
    assert.ok(checkbox.axes.shape, 'checkbox stays in shape');
    assert.equal(checkbox.axes.shape.delegationEffective, false);
    assert.deepEqual(checkbox.notApplicable, {});
    assert.ok(shapeOf(dir, path).families.includes('checkbox'));
    assert.ok(populationReport(dir, catalogIn(dir), path).exclusions.ineffective.some((entry) => entry.family === 'checkbox'));
    // The plant is appended after the six reviewed entries (EVI02-MOTION 2026-10-08 added the sixth).
    has(checkExclusionRegistry(dir, path).failures, 'entry 6 (checkbox/shape): STALE — checkbox declares shape again');
  });

  it('MUTANT (R8): every malformed delegated entry is refused by name, on the registry and through the floor gate', () => {
    const dir = sandbox();
    const cases = [
      [(entry) => { entry.declarations = [SO_RETIRED]; }, 'a delegated entry excludes no declaration'],
      [(entry) => { entry.delegate = 'shortcuts-overlay'; }, 'delegate shortcuts-overlay is not another skin family'],
      [(entry) => { entry.delegate = 'phantom'; }, 'delegate phantom is not another skin family'],
      [(entry) => { delete entry.retired; }, '`retired` must name the commit'],
      [(entry) => { entry.retired.property = 'padding'; }, 'the retired padding is not an authored longhand of shape'],
      [(entry) => { entry.covers = []; }, 'names no covering declaration of modal'],
      [(entry) => { entry.covers[0].skin = SO_SKIN; }, `${SO_SKIN} is not a skin file of modal`],
      [(entry) => { delete entry.covers[0].context; }, 'a covering declaration must name its skin, at-rule context'],
      [(entry) => { delete entry.composedIn; }, '`composedIn` must name'],
      [(entry) => { entry.composedIn.carries = []; }, '`composedIn` must name'],
      [(entry) => { delete entry.reviewedAt; }, 'reviewedAt.commit is empty'],
      [(entry) => { entry.path = 'delegate'; }, 'path delegate is neither byProperty nor delegated'],
    ];
    cases.forEach(([mutate, expected], at) => {
      const registry = baseRegistry();
      mutate(registry.entries[soIndex()]);
      const path = writeRegistry(dir, registry, `delegated-${at}.json`);
      has(checkExclusionRegistry(dir, path).failures, `${soLabel()}${expected}`);
      has(checkPopulationFloor(dir, catalogIn(dir), FLOOR, path).failures, `exclusion registry: ${soLabel()}${expected}`);
    });

    const unadmitted = baseRegistry();
    unadmitted.admitted = unadmitted.admitted.filter((pair) => pair.family !== 'shortcuts-overlay');
    has(checkExclusionRegistry(dir, writeRegistry(dir, unadmitted, 'delegated-unadmitted.json')).failures,
      `${soLabel()}shortcuts-overlay/shape is not an admitted exclusion`);

    const paired = baseRegistry();
    paired.entries.push({ ...JSON.parse(JSON.stringify(paired.entries[0])), family: 'shortcuts-overlay', skin: SO_SKIN, declarations: [SO_RETIRED] });
    has(checkExclusionRegistry(dir, writeRegistry(dir, paired, 'delegated-paired.json')).failures,
      `${soLabel()}a delegated entry is the only entry of its pair; shortcuts-overlay/shape carries 1 more`);
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

  it('PIN (A4): 9 declaring states families are unobservable on this tree -- 6 colour-only + 3 no-vocabulary -- reported beside the denominator and not subtracted', () => {
    // Movers of the pin (8 -> 9, STATES-K 2026-10-01): record-facts and
    // scope-switcher leave with the population; edit-fields, table-toolbar
    // (colour-only) and form-builder (cursor) enter with it. 9 -> 8 (OVM
    // 2026-10-02): overlay-modal-compounds leaves with its retired orphan rules.
    // The denominator 154 -> 152 (2026-10-04) moves nothing here: hover-card
    // and tooltip were observable.
    // 8 -> 7 (2026-10-04): operational-ledger leaves; its scroll region now
    // wears the tenant focus signature, a non-chromatic states rule.
    // 7 -> 9 (re-pinned by HK-POP 2026-10-12, both colour-only): status-filter-pills
    // enters at 464d5cf52 (WO-ARC-22 L6, the pills drain onto Button) and
    // locale-switcher at 0b8730d3a (WO-EXT-DS E-3, it composes the canonical Select).
    const report = populationReport();
    const states = report.axes.find((entry) => entry.axis === 'states');
    assert.equal(states.denominator, 152);
    assert.equal(states.unobservableCount, 9);
    assert.deepEqual(states.unobservable.map((entry) => `${entry.family}:${entry.class}`), [
      'button-group:no-vocabulary', 'edit-fields:colour-only', 'form-builder:no-vocabulary', 'list:colour-only',
      'locale-switcher:colour-only', 'metrics-chart:colour-only', 'metrics-rows:no-vocabulary',
      'status-filter-pills:colour-only', 'table-toolbar:colour-only',
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
    // The tree's 152 plus the planted entrant.
    assert.equal(states.denominator, 153, 'unobservable is reported, never subtracted');
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
  // Two names left this list on 2026-10-04 with the paint that made them movers (RETIRED_MOVERS below):
  // a product retirement under owner ruling R32 Q6, not a definition change.
  const MOVERS = Object.freeze([
    'activity-cards', 'activity-compact', 'activity-log', 'activity-ticker', 'activity-timeline', 'alert', 'anchor',
    'app-shell', 'approval-inbox', 'approval-workflow', 'ascii-diagram', 'auto-complete', 'avatar', 'back-top', 'badge',
    'bottom-tab-bar', 'breadcrumb', 'breadcrumb-compounds', 'button', 'calendar', 'carousel', 'cascader', 'checkbox',
    'code-block', 'collapse', 'collection-workspace', 'collection-workspace-render-dispatch', 'color-picker',
    'column-menu', 'column-settings', 'command-palette', 'context-menu', 'dashboard-header', 'data-table-interactions',
    'data-table-mobile', 'data-terminal-card', 'date-picker', 'detail-panel', 'drawer', 'drawer-compounds', 'dropdown',
    'edit-header', 'file-manager', 'float-button', 'form', 'form-field', 'form-sections', 'gallery-view',
    'header-hero-shared', 'image', 'input-number', 'invoice-template', 'layout', 'link', 'list-toolbar',
    'live-feed', 'locale-switcher', 'markdown-view', 'mentions', 'menu', 'menu-compounds', 'modal', 'modal-compounds',
    'moderation-gallery', 'notifier', 'otp-input', 'page-shell', 'pagination', 'password-input',
    'pattern-calendar-view', 'pattern-kanban-board', 'pattern-map-view', 'pattern-timeline', 'popover', 'pricing-table',
    'qrcode', 'radio', 'radio-group', 'rate', 'record', 'saved-views', 'saved-views-menu', 'scheduler-surface',
    'scroll-area', 'search', 'segmented', 'select', 'select-compounds', 'sheet', 'shift-matrix', 'slider', 'splitter',
    'stats-grid', 'stats-header', 'status-filter-pills', 'stepper', 'table', 'tabs', 'tag', 'tag-input',
    'tenant-preview', 'textarea', 'time-picker', 'toggle', 'tour', 'transfer', 'tree', 'tree-select',
    'tree-view-connector', 'typography', 'upload', 'user-profile-card', 'virtual-list', 'voice-input-button',
    'workbench-header', 'workspace-switcher',
  ]);
  // hover-card and tooltip moved on the width and offset of a transparent outline stated on a node that is
  // never a tab stop. Owner ruling R32 Q6 (2026-10-04): "No inventar interactividad para conservar
  // créditos: cuando una familia no deba pintar foco propio, corregir autoridad/medición según su comportamiento
  // real y publicar el resultado, aunque baje el numerador." The rule, its forced-colors twin, the hook and the
  // stamp retire; neither skin keeps a kernel-gated rule or a states head-channel read.
  const RETIRED_MOVERS = Object.freeze(['hover-card', 'tooltip']);
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

  it('D6: on this tree the states population is 152 -- five leavers, four entrants, every indicator-15 mover that still paints a state a member, the two retired movers out by name, the other axes unmoved', () => {
    const report = populationReport();
    const byAxis = Object.fromEntries(report.axes.map((entry) => [entry.axis, entry]));
    const states = byAxis.states.families;
    // 277 -> 278 (GLASS-1): the glass-card skin enters the corpus, shape and depth.
    assert.equal(report.skinFamilies, 278);
    // 155 -> 154 (OVM 2026-10-02): overlay-modal-compounds leaves states, shape and depth with its orphan rules.
    // 154 -> 152 (2026-10-04, owner ruling R32 Q6): hover-card and tooltip retire their only kernel-gated rule.
    assert.equal(byAxis.states.denominator, 152);
    for (const family of LEAVERS) assert.ok(!states.includes(family), `${family} must leave states`);
    for (const family of ENTRANTS) assert.ok(states.includes(family), `${family} must enter states`);
    assert.equal(MOVERS.length, 116);
    assert.deepEqual(MOVERS.filter((family) => !states.includes(family)), [], 'a mover may never leave the population');
    // The two retired movers leave by the law itself, never by a list: no kernel-gated rule, no states head channel,
    // every other axis they declared kept, and the pin names both with the owner's reason.
    const declarations = familyAxisDeclarations();
    const headChannels = population.axisChannels().get('states');
    for (const family of RETIRED_MOVERS) {
      assert.ok(!MOVERS.includes(family) && !states.includes(family), `${family}: retired with its state paint`);
      const record = declarations.get(family);
      assert.equal(record.axes.states, undefined, `${family}: declares states`);
      const css = record.files.map((file) => readFileSync(join(ROOT, file), 'utf8')).join('\n');
      assert.deepEqual(population.stateRuleEvidence(record.files.map((file) => ({ file, rules: cssRules(readFileSync(join(ROOT, file), 'utf8')) }))), [], `${family}: K1`);
      assert.deepEqual([...population.readChannels(css)].filter((channel) => headChannels.has(channel)), [], `${family}: K2`);
    }
    assert.deepEqual(Object.keys(declarations.get('tooltip').axes), ['shape', 'typography', 'rhythm', 'depth', 'motion']);
    assert.deepEqual(Object.keys(declarations.get('hover-card').axes), ['shape', 'rhythm', 'depth', 'motion']);
    const retirement = JSON.parse(readFileSync(FLOOR, 'utf8')).provenance.membershipMoves.overlayFocusRetirement;
    assert.deepEqual([retirement.statesFloorLowering.pinned, retirement.statesFloorLowering.repinned], [154, 152]);
    assert.deepEqual(Object.keys(retirement.statesFloorLowering.leavers), RETIRED_MOVERS);
    assert.deepEqual(retirement.statesFloorLowering.entrants, []);
    assert.deepEqual(retirement.byAxis.states, { added: [], removed: RETIRED_MOVERS });
    for (const axis of AXIS_IDS.filter((id) => id !== 'states')) assert.deepEqual(retirement.byAxis[axis], { added: [], removed: [] }, axis);
    assert.match(retirement.statesFloorLowering.ownerFacingNote, /R32 Q6.*No inventar interactividad para conservar cr\u00e9ditos.*aunque baje el numerador/u);
    assert.match(retirement.law, /^STATES-K, text unchanged/u);
    assert.deepEqual(Object.fromEntries(['shape', 'typography', 'rhythm', 'depth', 'motion'].map((axis) => [axis, byAxis[axis].denominator])),
      // depth 199 -> 204 -> 199 (2026-10-03): the focus-signature sweep's five entrants, and the law that reads them out (D9, FS drills).
      // typography 182 -> 184, rhythm 224 -> 226 (2026-10-04, OWN-8 chart chrome): chart-bullet, chart-treemap,
      // chart-area enter on the scale-token reads their drained skins gained; no leaver, no corpus move.
      // shape 214 -> 213, N/A 4 -> 5 (OWNSO 9789b3469 + W23-POPX): shortcuts-overlay's shape is delegated to modal.
      // motion 204 -> 203, N/A 0 -> 1 (WO-ARC-22 L6 464d5cf52 + EVI02-MOTION, owner ruling 2026-10-08 #2): status-filter-pills' motion is delegated to button.
      // shape 213 -> 214, depth 199 -> 200 (65f9f8b80 (ARC-12 E6 prerequisite, re-pinned by HK-POP 2026-10-12): active-filters-bar enters both on resets; no leaver, no corpus move).
      { shape: 214, typography: 184, rhythm: 226, depth: 200, motion: 203 });
    assert.deepEqual(Object.fromEntries(report.axes.map((entry) => [entry.axis, entry.notApplicableCount])),
      { shape: 5, typography: 0, rhythm: 0, depth: 0, states: 0, motion: 1 });
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

  it('D7: the floor holds at 152; the pre-amendment pin (156) and the pre-retirement pin (154) are refused BELOW, a pin at 151 ABOVE', () => {
    assert.deepEqual(checkPopulationFloor().failures, []);
    const floor = JSON.parse(readFileSync(FLOOR, 'utf8'));
    assert.equal(floor.axes.states, 152);
    const dir = mkdtempSync(join(tmpdir(), 'evi02-states-k-'));
    sandboxes.push(dir);
    const at = (states) => {
      const path = join(dir, `floor-${states}.json`);
      writeFileSync(path, JSON.stringify({ ...floor, axes: { ...floor.axes, states } }));
      return checkPopulationFloor(ROOT, undefined, path).failures;
    };
    assert.ok(at(156).some((line) => line.startsWith('states: denominator 152 is BELOW its floor 156')), at(156).join(' | '));
    assert.ok(at(154).some((line) => line.startsWith('states: denominator 152 is BELOW its floor 154')), at(154).join(' | '));
    assert.ok(at(151).some((line) => line.startsWith('states: denominator 152 is ABOVE its pin 151')), at(151).join(' | '));
  });

  it('D9: depth is 200 under the focus-signature law (199 by the law, then one named entrant) -- five leave by name, the unproven alias stays, the depth law moves no states member, the floor refuses both directions', () => {
    const report = populationReport();
    const byAxis = Object.fromEntries(report.axes.map((entry) => [entry.axis, entry]));
    const LEFT = ['link', 'scroll-area', 'search', 'typography', 'virtual-list'];
    // Mover: 65f9f8b80 (ARC-12 E6 prerequisite, re-pinned by HK-POP 2026-10-12): active-filters-bar enters depth on resets (`border: 0`, `box-shadow: none`), 199 -> 200; the focus-signature law itself moves nothing.
    assert.equal(byAxis.depth.denominator, 200);
    for (const family of LEFT) assert.ok(!byAxis.depth.families.includes(family), `${family}: a focus-only shadow does not declare depth`);
    assert.deepEqual(byAxis.depth.focusSignatureOnly.map((entry) => entry.family).sort(), LEFT);
    // The conservative arm, published by name: in depth through a var()-only shadow no producer proves.
    assert.ok(byAxis.depth.families.includes('breadcrumb-compounds'));
    assert.deepEqual(byAxis.depth.unprovenShadowAliases.map((entry) => entry.family), ['breadcrumb-compounds', 'tooltip-compounds']);
    // breadcrumb: its one literal producer writes the signature; what stops the proof is the reader's own limit, said as such.
    assert.match(byAxis.depth.unprovenShadowAliases[0].reasons[0],
      /^--ds-breadcrumb-focus-ring: unprovable to this reader: \d+ compiler site\(s\) write `vars\[<non-literal key>\]` .*its literal producer\(s\): .*chrome\/breadcrumb\/index\.ts:\d+ = var\(--ds-focus-ring\)$/u);
    // tooltip-compounds: an elevation alias, read as one -- never an unproven focus alias.
    assert.match(byAxis.depth.unprovenShadowAliases[1].reasons[0], /^--ds-tooltip-shadow: .* writes `var\(--ds-shadow-md\)`: --ds-shadow-md: /u);
    // States keeps its own law (152 since the overlay focus retirement of 2026-10-04, which is not the depth
    // law's doing), and every family the depth law touched is still a member.
    assert.equal(byAxis.states.denominator, 152);
    for (const family of [...LEFT, 'breadcrumb-compounds']) assert.ok(byAxis.states.families.includes(family), `${family} is a states member`);
    // The law is depth's alone: it withdraws nothing and publishes nothing on any other axis.
    for (const axis of AXIS_IDS.filter((id) => id !== 'depth')) {
      assert.deepEqual([byAxis[axis].focusSignatureOnly, byAxis[axis].unprovenShadowAliases], [[], []], axis);
    }
    assert.equal(byAxis.depth.notApplicableCount, 0, 'the law is a definition, never a reviewed exclusion');
    const floor = JSON.parse(readFileSync(FLOOR, 'utf8'));
    // Mover: 65f9f8b80 (ARC-12 E6 prerequisite, re-pinned by HK-POP 2026-10-12): active-filters-bar enters depth (199 -> 200).
    assert.equal(floor.axes.depth, 200);
    assert.equal(floor.catalogRevision, catalogRevision().digest);
    const move = floor.provenance.membershipMoves.depthFocusSignatureLaw;
    assert.deepEqual(move.byAxis.depth, { added: [], removed: LEFT });
    for (const axis of ['shape', 'typography', 'rhythm', 'states', 'motion']) assert.deepEqual(move.byAxis[axis], { added: [], removed: [] }, axis);
    assert.deepEqual([move.depthFloorLowering.pinned, move.depthFloorLowering.repinned], [204, 199]);
    assert.deepEqual(Object.keys(move.depthFloorLowering.leavers), LEFT);
    assert.deepEqual(Object.keys(move.depthFloorLowering.stayConservatively), ['breadcrumb-compounds', 'tooltip-compounds']);
    // The pinned reasons are the rule's own, word for word.
    for (const entry of byAxis.depth.unprovenShadowAliases) {
      assert.deepEqual(move.depthFloorLowering.stayConservatively[entry.family].reasons, entry.reasons, entry.family);
    }
    assert.equal(move.depthFloorLowering.stayConservatively['tooltip-compounds'].kind, 'an elevation alias, in depth under any proof');
    // The owner's sentence is quoted in its own words; the English beside it is marked as a translation.
    const note = move.depthFloorLowering.ownerFacingNote;
    assert.ok(note.includes('quoted verbatim: "Este mensaje autoriza la corrección semántica de población depth propuesta, NO un denominador predeterminado. '
      + 'Una sombra exclusivamente de foco no debe declarar profundidad. Una mezcla con elevación/material sí. '
      + 'Aliases ambiguos permanecen conservadoramente incluidos: el nombre o fallback por sí solos no demuestran la semántica del productor.'), note);
    assert.ok(note.includes('No introducir exclusiones por familia para alcanzar el porcentaje." -- translation, not the owner\'s text: "'), note);
    assert.ok(note.includes('2026-10-03 (R25)') && !note.includes('INCLUDED'));
    assert.deepEqual(move.outOfScope.shape.families, ['anchor', 'virtual-list']);
    assert.equal(move.knownLimits.length, 2);
    // The earlier growth stays on the record: 199 -> 204 by the sweep, then the law.
    assert.deepEqual(floor.provenance.membershipMoves.focusSignatureSweep.depth, { pinned: 199, repinned: 204 });
    const dir = mkdtempSync(join(tmpdir(), 'evi02-depth-focus-'));
    sandboxes.push(dir);
    const at = (depth) => {
      const path = join(dir, `floor-${depth}.json`);
      writeFileSync(path, JSON.stringify({ ...floor, axes: { ...floor.axes, depth } }));
      return checkPopulationFloor(ROOT, undefined, path).failures;
    };
    // Mover: 65f9f8b80 (ARC-12 E6 prerequisite, re-pinned by HK-POP 2026-10-12): active-filters-bar enters depth, so the live denominator both directions are read against is 200.
    assert.ok(at(204).some((line) => line.startsWith('depth: denominator 200 is BELOW its floor 204')), at(204).join(' | '));
    assert.ok(at(199).some((line) => line.startsWith('depth: denominator 200 is ABOVE its pin 199')), at(199).join(' | '));
  });

  // Movers of the roster (7 -> 9): status-filter-pills 464d5cf52 (WO-ARC-22 L6), locale-switcher 0b8730d3a (WO-EXT-DS E-3).
  it('D8: 9 declaring states families are unobservable -- surface-states is not one (opacity is read) -- and none is subtracted', () => {
    const states = populationReport().axes.find((entry) => entry.axis === 'states');
    assert.deepEqual(states.unobservable.map((entry) => `${entry.family}:${entry.class}`), [
      'button-group:no-vocabulary', 'edit-fields:colour-only', 'form-builder:no-vocabulary', 'list:colour-only',
      'locale-switcher:colour-only', 'metrics-chart:colour-only', 'metrics-rows:no-vocabulary',
      'status-filter-pills:colour-only', 'table-toolbar:colour-only',
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

/**
 * THE FOCUS-SIGNATURE LAW OF DEPTH (owner authorization 2026-10-03), drilled on
 * synthetic families with synthetic producers, both directions. A sandbox with
 * no compiler source proves nothing, so every case states its producers.
 */
describe('theme population — FS: a shadow that is exclusively the focus signature does not declare depth', () => {
  const DERIVATION = 'src/infrastructure/compilers/runtime/theme/runtime/lowering/runtime/derivation';
  const SIGNATURE = 'var(--ds-focus-ring)';
  const tree = ({ skins, compiler = {}, states = 'vars["--ds-focus-ring"] = focus.shadow;' }) => {
    const dir = sandbox();
    for (const [family, css] of Object.entries(skins)) {
      mkdirSync(join(dir, SKIN_ROOT, family), { recursive: true });
      writeFileSync(join(dir, SKIN_ROOT, family, 'index.css'), css);
    }
    const sources = { 'states/index.ts': states, ...compiler };
    for (const [file, text] of Object.entries(sources)) {
      if (text === null) continue;
      mkdirSync(join(dir, DERIVATION, dirname(file)), { recursive: true });
      writeFileSync(join(dir, DERIVATION, file), `export function derive(vars, focus, chrome) {\n  ${text}\n}\n`);
    }
    const declarations = familyAxisDeclarations(dir, catalogIn(dir));
    return { dir, declarations, depth: (family) => declarations.get(family).axes.depth, record: (family) => declarations.get(family) };
  };
  const gated = (value, selector = '.fs:focus-visible') => `${selector} { box-shadow: ${value}; }`;

  it('NEGATIVE: the signature alone is not depth -- under a focus gate, on an ::after carrier, with its `none` twin, and at rest', () => {
    const { depth, record } = tree({
      skins: {
        'fs-gated': gated(SIGNATURE),
        'fs-stamped': gated(SIGNATURE, ".fs[data-state~='focus-visible']"),
        'fs-carrier': gated(SIGNATURE, '.fs:focus-visible::after'),
        'fs-twin': `${gated(SIGNATURE)}\n@media (forced-colors: active) { .fs:focus-visible { box-shadow: none; } }`,
        'fs-rest': `.fs { box-shadow: ${SIGNATURE}; }`,
        'fs-important': gated(`${SIGNATURE} !important`),
      },
    });
    for (const family of ['fs-gated', 'fs-stamped', 'fs-carrier', 'fs-twin', 'fs-rest', 'fs-important']) {
      assert.equal(depth(family), undefined, `${family} must not declare depth`);
      assert.ok(record(family).focusSignatureOnly.depth.length > 0, `${family} is published as focus-only`);
    }
    assert.equal(record('fs-twin').focusSignatureOnly.depth.length, 2);
    // At rest too: what makes it a focus shadow is the producer of the channel it reads, not the selector it sits under.
    assert.equal(record('fs-rest').axes.states?.headChannels.includes('--ds-focus-ring'), true, 'it still declares states by K2');
    assert.ok(record('fs-gated').axes.states, 'the gated rule still declares states by K1');
  });

  it('POSITIVE: a mixture with elevation or material, a recipe, a border, or a resting `none` declares depth', () => {
    const { depth } = tree({
      skins: {
        'fs-mix': gated(`${SIGNATURE}, var(--ds-elevation-1)`),
        'fs-mix-carrier': gated(`${SIGNATURE}, var(--ds-elevation-2)`, '.fs:focus-visible::after'),
        'fs-recipe': gated('0 0 0 var(--ds-focus-ring-width) currentColor'),
        'fs-recipe-mix': gated(`${SIGNATURE}, 0 1px 2px rgba(0, 0, 0, 0.2)`),
        'fs-border': `${gated(SIGNATURE)}\n.fs { border-width: 1px; }`,
        'fs-rest-none': `${gated(SIGNATURE)}\n.fs { box-shadow: none; }`,
        'fs-rest-elevation': `${gated(SIGNATURE)}\n.fs { box-shadow: var(--ds-elevation-1); }`,
        'fs-head-channel': `${gated(SIGNATURE)}\n.fs { outline-width: var(--ds-edge-standard-width); }`,
        'fs-hover-none': '.fs:hover { box-shadow: none; }',
        // A gated reset with NO signature beside it resets something else: a container dropping its elevation while focus is inside.
        'fs-reset-alone': '.fs:focus-visible { box-shadow: none; }',
        'fs-within-reset': '.fs:focus-within { box-shadow: none; }',
        // One ungated branch makes the reset apply at rest.
        'fs-mixed-branch': `${gated(SIGNATURE)}\n.fs:focus-visible, .fs-other { box-shadow: none; }`,
        // A gate that survives only inside :not() is no gate.
        'fs-negated-gate': `${gated(SIGNATURE)}\n.fs:not(:focus-visible) { box-shadow: none; }`,
      },
    });
    for (const family of ['fs-reset-alone', 'fs-within-reset', 'fs-mixed-branch', 'fs-negated-gate']) {
      assert.deepEqual(depth(family)?.properties, ['box-shadow'], `${family}: the reset is a position on depth`);
    }
    for (const family of ['fs-mix', 'fs-mix-carrier', 'fs-recipe', 'fs-recipe-mix', 'fs-rest-none', 'fs-rest-elevation', 'fs-hover-none']) {
      assert.deepEqual(depth(family)?.properties, ['box-shadow'], `${family} must declare depth`);
    }
    assert.deepEqual(depth('fs-border').properties, ['border-width']);
    assert.deepEqual(depth('fs-head-channel'), { properties: [], headChannels: ['--ds-edge-standard-width'] });
    // A mixture reads a depth head channel: it declares depth twice over, by the property and by K2.
    assert.deepEqual(depth('fs-mix').headChannels, ['--ds-elevation-1']);
    assert.equal(depth('fs-mix').onlyThroughUnprovenAliases, undefined);
    // A reset is exclusively focus only under a FOCUS gate: at rest, or under hover, `none` is a position on depth.
    assert.equal(depth('fs-rest-none').onlyThroughUnprovenAliases, undefined);
  });

  it('ALIASES are judged on the producer side: states-only producers prove one; unknown, open, mixed or authored-literal producers do not', () => {
    const alias = (name, fallback = '') => gated(`var(--ds-fs-${name}${fallback})`);
    const { depth, record, dir } = tree({
      skins: {
        'fs-proven': alias('proven'),
        'fs-chained': alias('chained'),
        'fs-proven-fallback': alias('proven', `, ${SIGNATURE}`),
        'fs-unknown': alias('unknown'),
        'fs-unknown-fallback': alias('unknown', `, ${SIGNATURE}`),
        'fs-literal-fallback': gated('var(--ds-focus-ring, 0 0 0 2px blue)'),
        'fs-open': alias('open'),
        'fs-material': alias('material'),
        'fs-two-producers': alias('two'),
        'fs-authored-proven': `${alias('authored-proven')}\n:root { --ds-fs-authored-proven: ${SIGNATURE}; }`,
        'fs-authored-literal': `${alias('authored-literal')}\n:root { --ds-fs-authored-literal: 0 0 0 2px blue; }`,
        'fs-cycle': alias('cycle-a'),
      },
      compiler: {
        'chrome/fs/index.ts': [
          'vars["--ds-fs-proven"] = "var(--ds-focus-ring)";',
          'vars["--ds-fs-chained"] = "var(--ds-fs-proven)";',
          'vars["--ds-fs-open"] = chrome.focusRing;',
          'vars["--ds-fs-material"] = "var(--ds-focus-ring), var(--ds-elevation-2)";',
          'vars["--ds-fs-two"] = "var(--ds-focus-ring)";',
          'if (chrome.strong) vars["--ds-fs-two"] = "0 0 0 3px red";',
          'vars["--ds-fs-cycle-a"] = "var(--ds-fs-cycle-b)";',
          'vars["--ds-fs-cycle-b"] = "var(--ds-fs-cycle-a)";',
        ].join('\n  '),
      },
    });
    for (const family of ['fs-proven', 'fs-chained', 'fs-proven-fallback', 'fs-authored-proven']) {
      assert.equal(depth(family), undefined, `${family}: every producer writes the signature alone`);
      assert.ok(record(family).focusSignatureOnly.depth.length > 0, family);
    }
    const reasonOf = (family) => depth(family)?.onlyThroughUnprovenAliases?.[0]?.reason ?? `${family} is not in depth through an unproven alias`;
    assert.match(reasonOf('fs-unknown'), /^--ds-fs-unknown: no producer found/u);
    assert.match(reasonOf('fs-unknown-fallback'), /^--ds-fs-unknown: no producer found/u, 'a fallback to the signature proves nothing about the head');
    assert.match(reasonOf('fs-literal-fallback'), /^the fallback of --ds-focus-ring is not exclusively focus/u);
    assert.match(reasonOf('fs-open'), /^--ds-fs-open: .* writes it from a value that is not a string literal$/u);
    assert.match(reasonOf('fs-material'), /^--ds-fs-material: .*--ds-elevation-2: /u);
    assert.match(reasonOf('fs-two-producers'), /^--ds-fs-two: .* writes `0 0 0 3px red`/u);
    assert.match(reasonOf('fs-authored-literal'), /^--ds-fs-authored-literal: .* writes `0 0 0 2px blue`/u);
    assert.match(reasonOf('fs-cycle'), /^--ds-fs-cycle-a: /u);
    const proof = focusSignatureProof(dir, catalogIn(dir));
    assert.equal(proof.judge('--ds-focus-ring').proven, true);
    assert.equal(proof.judge('--ds-fs-proven').proven, true);
    assert.equal(proof.judge('--ds-fs-chained').proven, true);
  });

  it('THE ROOT is proven by its producer, never by its name: no states emission, or an emission outside the states derivation, proves nothing', () => {
    const skins = { 'fs-gated': gated(SIGNATURE) };
    assert.equal(tree({ skins }).depth('fs-gated'), undefined, 'the control: the states derivation alone emits the signature');
    const absent = tree({ skins, states: null });
    assert.match(absent.depth('fs-gated').onlyThroughUnprovenAliases[0].reason, /^--ds-focus-ring: no producer found/u);
    const foreign = tree({ skins, compiler: { 'materials/index.ts': 'vars["--ds-focus-ring"] = "0 4px 12px black";' } });
    assert.match(foreign.depth('fs-gated').onlyThroughUnprovenAliases[0].reason, /^--ds-focus-ring: /u,
      'a second emitter outside the states derivation unmakes the root, and the channel is then judged as any alias');
    assert.equal(focusSignatureProof(foreign.dir, catalogIn(foreign.dir)).roots.has('--ds-focus-ring'), false);
    // ONLY the focus-style row: another states-row channel the same derivation emits (states.emphasis) is not the signature.
    const emphasis = tree({
      skins: { 'fs-emphasis': gated('var(--ds-state-press-scale)') },
      states: 'vars["--ds-focus-ring"] = focus.shadow;\n  vars["--ds-state-press-scale"] = "0.97";',
    });
    assert.equal(focusSignatureProof(emphasis.dir, catalogIn(emphasis.dir)).roots.has('--ds-state-press-scale'), false);
    assert.deepEqual([...focusSignatureProof(emphasis.dir, catalogIn(emphasis.dir)).roots], ['--ds-focus-ring']);
    assert.match(emphasis.depth('fs-emphasis').onlyThroughUnprovenAliases[0].reason, /^--ds-state-press-scale: .* writes `0\.97`/u);
    // A depth head channel renamed to look like the signature is still not one: the catalog row decides, not the spelling.
    const lookalike = tree({ skins: { 'fs-lookalike': gated('var(--ds-fs-focus-ring)') } });
    assert.match(lookalike.depth('fs-lookalike').onlyThroughUnprovenAliases[0].reason, /^--ds-fs-focus-ring: no producer found/u);
  });

  it('A KEYED EMISSION that may write the alias leaves it unproven; a template key that cannot match does not', () => {
    const skins = { 'fs-proven': gated('var(--ds-fs-proven)') };
    const base = 'vars["--ds-fs-proven"] = "var(--ds-focus-ring)";';
    assert.equal(tree({ skins, compiler: { 'chrome/fs/index.ts': `${base}\n  vars[\`--ds-other-\${chrome.name}\`] = chrome.value;` } }).depth('fs-proven'), undefined);
    const template = tree({ skins, compiler: { 'chrome/fs/index.ts': `${base}\n  vars[\`--ds-fs-\${chrome.name}\`] = chrome.value;` } });
    assert.match(template.depth('fs-proven').onlyThroughUnprovenAliases[0].reason, /^--ds-fs-proven: unprovable to this reader: 1 compiler site\(s\) write `vars\[<non-literal key>\]`/u);
    const open = tree({ skins, compiler: { 'chrome/fs/index.ts': `${base}\n  vars[chrome.channel] = chrome.value;` } });
    assert.match(open.depth('fs-proven').onlyThroughUnprovenAliases[0].reason, /^--ds-fs-proven: unprovable to this reader: .*\(first: vars\[chrome\.channel\] at .*its literal producer\(s\): .* = var\(--ds-focus-ring\)$/u);
    // The root is not an alias: its proof is the states derivation, and a keyed forwarder does not unmake it.
    assert.equal(tree({ skins: { 'fs-gated': gated(SIGNATURE) }, compiler: { 'chrome/fs/index.ts': 'vars[chrome.channel] = chrome.value;' } }).depth('fs-gated'), undefined);
  });

  it('THE RULE NAMES NO FAMILY: it takes a rule, a declaration and the proof, and its source and data carry no skin family id', () => {
    assert.equal(classifyDepthShadow.length, 3);
    assert.deepEqual([...FOCUS_SIGNATURE_RESETS], ['none', 'initial', 'unset', 'revert', 'revert-layer']);
    const sources = [classifyDepthShadow, focusSignatureProof].map((fn) => fn.toString()).join('\n');
    assert.ok(!/\bfamil(?:y|ies)\b/u.test(sources), 'the rule may not read a family');
    // Nor a selector: a class, a BEM block or a part named in the rule or in the walk that applies it would be
    // an exclusion by another spelling -- one a membership test only sees if it happens to move a family.
    const walk = `${sources}\n${familyAxisDeclarations.toString()}`;
    assert.ok(!/(?:^|[^-\w])(?:ds|rottay|rt)-[a-z]|data-part|\.[a-z][\w-]*__/u.test(walk), 'the rule or its walk names a class, a block or a part');
    assert.equal(population.FOCUS_SIGNATURE_ROW, 'states.focus-style');
    for (const family of skinFamilies(ROOT).keys()) {
      for (const quote of ["'", '"', '`']) {
        assert.ok(!sources.includes(`${quote}${family}${quote}`), `the rule names the family ${family}`);
      }
      assert.ok(!FOCUS_SIGNATURE_RESETS.includes(family));
    }
    // And the registry of reviewed exclusions gained no depth entry: the percentage is reached by no per-family subtraction.
    assert.deepEqual(baseRegistry().entries.filter((entry) => entry.axis === 'depth'), []);
    // The same family under two names reads the same: only the declarations decide.
    const { depth } = tree({ skins: { link: gated(`${SIGNATURE}, var(--ds-elevation-1)`), 'fs-anything': gated(SIGNATURE) } });
    assert.deepEqual(depth('link')?.properties, ['box-shadow'], 'a family the law read out on the tree is IN the moment its shadow mixes elevation');
    assert.equal(depth('fs-anything'), undefined);
  });

  it('ON THE TREE: the proof agrees with the producers library, and every family it reads out reads the root itself', () => {
    const proof = focusSignatureProof();
    assert.deepEqual([...proof.roots], ['--ds-focus-ring', '--ds-focus-ring-width', '--ds-focus-ring-offset'], 'the focus-style row alone');
    assert.ok(!proof.roots.has('--ds-material-card-focus-ring'), 'a states-row channel the materials deriver emits is not a root');
    assert.ok(proof.keyedEmissions > 0, 'this tree has keyed emissions; while it does, no alias is provable');
    for (const [family, record] of familyAxisDeclarations()) {
      for (const cited of record.focusSignatureOnly.depth ?? []) {
        const value = normalizeCssText(cited.value.replace(/!important\s*$/u, ''));
        assert.ok(FOCUS_SIGNATURE_RESETS.includes(value) || value === SIGNATURE, `${family}: ${cited.selector} { box-shadow: ${cited.value} }`);
      }
    }
  });
});
