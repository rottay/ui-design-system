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
  catalogRevision,
  checkPilotPopulation,
  checkPopulationFloor,
  declaredProperties,
  pilotPopulation,
  familyAxisDeclarations,
  populationReport,
  readChannels,
  skinFamilies,
  stripCssComments,
} from '../index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const SKIN_ROOT = 'src/foundation/tokens/css/runtime/engines/modern/skin';
const CATALOG = 'src/contracts/theme/runtime/catalog/index.ts';
const FLOOR = join(ROOT, 'scripts/check/theme/population/baseline/index.json');
const ROSTER = 'scripts/check/family-cut/baseline/index.json';
const PILOT_PIN = join(ROOT, 'scripts/check/theme/population/pilot/index.json');

const sandboxes = [];
after(() => { for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true }); });

/** A sandbox carrying only what the population walk reads: skins, the catalog and the family-cut roster. */
function sandbox() {
  const dir = mkdtempSync(join(tmpdir(), 'evi02-population-'));
  sandboxes.push(dir);
  mkdirSync(join(dir, SKIN_ROOT), { recursive: true });
  cpSync(join(ROOT, SKIN_ROOT), join(dir, SKIN_ROOT), { recursive: true });
  mkdirSync(join(dir, dirname(ROSTER)), { recursive: true });
  cpSync(join(ROOT, ROSTER), join(dir, ROSTER));
  mkdirSync(join(dir, 'src/contracts/theme/runtime/catalog'), { recursive: true });
  cpSync(join(ROOT, CATALOG), join(dir, CATALOG));
  return dir;
}

const catalogIn = (dir) => join(dir, CATALOG);

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
    rmSync(join(dir, SKIN_ROOT, doomed), { recursive: true, force: true });
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
