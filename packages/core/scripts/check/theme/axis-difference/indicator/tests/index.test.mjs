import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { readProgramIndicatorMeasurement } from '../../../../../../../../scripts/maintain/roadmap/status/index.mjs';
import { AXIS_IDS, AXIS_POPULATION_LAWS } from '../../../population/index.mjs';
import {
  GATE_REFUSAL_HEAD, NO_WRITE_FLAG, SCENARIOS, UNOBSERVABLE_FAMILIES, VERIFY_INDICATOR_FLAG, publicationRefusal, verifyIndicator,
} from '../../index.mjs';
import * as indicatorModule from '../index.mjs';
import {
  FLEET_THEMES,
  FLEET_VERTICALS,
  INDICATOR_FIELDS,
  INDICATOR_ID,
  INDICATOR_OPTIONAL_FIELDS,
  INDICATOR_PATH,
  INPUT_DIGEST_PARTS,
  EFFECTIVE_DEFINITION,
  REPRODUCTION_FLAGS,
  NON_MOVER_CLASSES,
  axisReadings,
  buildIndicator,
  indicatorDeclaredBasisVerdict,
  indicatorFreshnessRefusals,
  indicatorRefusal,
  inputDigestOf,
  inputDigestShapeFailure,
  gateProvenanceRefusal,
  provenanceRefusal,
  negativeControlsOf,
  negativeTest,
  nonMoverFailures,
  nonMoversByClass,
  writeIndicator,
} from '../index.mjs';

const CONTROLS = negativeControlsOf(SCENARIOS);
// states 156/148 -> 155/147 with the STATES-K population law (2026-10-01).
const DECLARED = { shape: 217, typography: 182, rhythm: 224, depth: 199, states: 155, motion: 204 };
const EFFECTIVE = { shape: 205, typography: 175, rhythm: 209, depth: 187, states: 147, motion: 195 };

function fleetResult(moved = {}) {
  const cells = [];
  for (const vertical of FLEET_VERTICALS) {
    for (const theme of FLEET_THEMES) {
      for (const axis of AXIS_IDS) {
        const count = moved[axis] ?? DECLARED[axis];
        cells.push({
          kind: 'positive', scenario: axis, axis, vertical, theme,
          moved: count, denominator: EFFECTIVE[axis], percent: (count / EFFECTIVE[axis]) * 100, evidential: true,
        });
      }
      for (const control of CONTROLS) {
        for (const axis of control.expectZeroOn) {
          cells.push({
            kind: 'negative', scenario: control.id, axis, vertical, theme,
            moved: 0, denominator: EFFECTIVE[axis], percent: 0, evidential: true, movedFamilies: [],
          });
        }
      }
    }
  }
  return {
    revision: { digest: 'fixture' },
    browser: { browserVersion: 'fixture' },
    bundleMode: 'fresh',
    verticals: [...FLEET_VERTICALS],
    themes: [...FLEET_THEMES],
    familiesFiltered: false,
    notApplicable: { shape: 1 },
    unobservable: Object.fromEntries(AXIS_IDS.map((axis) => [axis, Object.entries(UNOBSERVABLE_FAMILIES[axis])
      .map(([family, kind]) => ({ family, class: kind, properties: [] }))])),
    denominatorReconciliation: Object.fromEntries(AXIS_IDS.map((axis) => [axis, {
      declared: DECLARED[axis],
      excludedUnmountable: DECLARED[axis] - EFFECTIVE[axis],
      excludedUnsettled: 0,
      effective: EFFECTIVE[axis],
    }])),
    cells,
  };
}

const cellOf = (result, scenario, axis, where = 'rottay/dark') => result.cells.find(
  (cell) => cell.scenario === scenario && cell.axis === axis && `${cell.vertical}/${cell.theme}` === where,
);

const build = (result) => buildIndicator(result, { negativeControls: CONTROLS, producedAt: '2026-09-29T00:00:00.000Z' });

describe('tenant-difference-by-axis indicator', () => {
  it('ships the two kit negative controls with the axes rule 4 quotes', () => {
    assert.deepEqual(CONTROLS, [
      { id: 'palette-only', expectZeroOn: [...AXIS_IDS] },
      { id: 'states-emphasis-only', expectZeroOn: ['shape', 'typography'] },
    ]);
    assert.equal(AXIS_IDS.length, 6);
  });

  it('meets the target only with 6/6 axes at the bar and the negative test green', () => {
    const indicator = build(fleetResult({ shape: 190, typography: 170, rhythm: 200, depth: 180, states: 140, motion: 180 }));
    assert.equal(indicator.met, true);
    assert.equal(indicator.negativeTest.status, 'green');
    assert.match(indicator.value, /^6\/6 axes at >= 80 % of declaring families/u);
    assert.match(indicator.value, /palette-only 0 % on 36\/36, states-emphasis-only 0 % on 12\/12/u);
  });

  it('reads the declared denominator: 156/195 is 80.0 % effective and 76.5 % declared, below the bar', () => {
    const readings = axisReadings(fleetResult({ motion: 156 }));
    assert.equal(readings.motion.status, 'below-threshold');
    assert.equal(readings.motion.worstPercentDeclared, 76.5);
    assert.equal(readings.motion.worstPercentEffective, 80);
    assert.equal(readings.motion.effectiveAtThreshold, true);
  });

  it('a negative control that moved turns the test RED, names the families, and blocks the target', () => {
    const result = fleetResult({ shape: 200, typography: 180, rhythm: 220, depth: 190, states: 150, motion: 200 });
    Object.assign(cellOf(result, 'palette-only', 'depth'), {
      moved: 3, percent: 1.6, movedFamilies: [{ family: 'card', property: 'box-shadow' }],
    });
    const indicator = build(result);
    assert.equal(indicator.negativeTest.status, 'red');
    assert.equal(indicator.met, false);
    assert.deepEqual(indicator.negativeTest.controls['palette-only'].moved[0].families, ['card(box-shadow)']);
    assert.match(indicator.value, /negative test RED — palette-only moved on 1\/36/u);
  });

  it('a non-evidential zero is NOT MEASURED, never green', () => {
    const result = fleetResult();
    Object.assign(cellOf(result, 'states-emphasis-only', 'shape'), { evidential: false, nonEvidentialReason: 'no witness' });
    const negative = negativeTest(result, CONTROLS);
    assert.equal(negative.status, 'not-measured');
    assert.equal(negative.controls['palette-only'].status, 'green');
    assert.deepEqual(negative.controls['states-emphasis-only'].unmeasured, [
      { where: 'rottay/dark shape', reason: 'no witness' },
    ]);
  });

  it('a missing negative cell is NOT MEASURED; a moved one elsewhere still wins as RED', () => {
    const result = fleetResult();
    result.cells = result.cells.filter((cell) => cell !== cellOf(result, 'palette-only', 'motion'));
    assert.equal(negativeTest(result, CONTROLS).status, 'not-measured');
    cellOf(result, 'palette-only', 'shape', 'bithire/light').moved = 1;
    assert.equal(negativeTest(result, CONTROLS).status, 'red');
  });

  it('an axis with a non-evidential positive cell is NOT MEASURED and the headline names it', () => {
    const result = fleetResult();
    Object.assign(cellOf(result, 'depth', 'depth'), { evidential: false });
    const indicator = build(result);
    assert.equal(indicator.axes.depth.status, 'not-measured');
    assert.match(indicator.value, /NOT MEASURED: depth/u);
    assert.equal(indicator.met, false);
  });

  it('publishes only the fleet measurement', () => {
    const full = fleetResult();
    assert.equal(indicatorRefusal(full), null);
    assert.match(indicatorRefusal({ ...full, familiesFiltered: true }), /--families/u);
    assert.match(indicatorRefusal({ ...full, verticals: ['bithire'] }), /verticals/u);
    assert.match(indicatorRefusal({ ...full, themes: ['light'] }), /modes/u);
    for (const flag of REPRODUCTION_FLAGS) {
      assert.match(indicatorRefusal(full, { argv: ['node', 'x', flag] }), new RegExp(flag, 'u'));
    }
    assert.match(indicatorRefusal(full, { instrumentFailures: ['lost arm'] }), /1 failure/u);
    const writeRefusal = publicationRefusal({ argv: [NO_WRITE_FLAG] });
    assert.equal(indicatorRefusal(full, { writeRefusal }), writeRefusal);
  });

  it('is read by STATUS as a measurement naming its gate and run', () => {
    const root = mkdtempSync(join(tmpdir(), 'indicator-7-'));
    try {
      const indicator = build(fleetResult({ motion: 156 }));
      writeIndicator(indicator, root);
      const read = readProgramIndicatorMeasurement(INDICATOR_ID, join(root, 'artifacts/quality/indicators'));
      assert.equal(read.measured, true);
      assert.equal(read.value, indicator.value);
      assert.equal(read.producedAt, '2026-09-29T00:00:00.000Z');
      assert.equal(INDICATOR_PATH, `artifacts/quality/indicators/${INDICATOR_ID}/index.json`);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('REVERSE PIN: every reproduction flag the CLI reads is one the indicator refuses -- --no-focused-stamp included', () => {
    const cli = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../index.mjs'), 'utf8');
    const read = [...new Set([...cli.matchAll(/process\.argv\.includes\('(--[a-z-]+)'\)/gu)].map(([, flag]) => flag))];
    const reproduction = read.filter((flag) => flag !== '--json' && flag !== NO_WRITE_FLAG).sort();
    assert.ok(reproduction.includes('--no-focused-stamp'));
    assert.deepEqual([...REPRODUCTION_FLAGS].sort(), reproduction);
  });

  it('the LIBRARY door refuses --no-focused-stamp on its own, without the CLI threading a writeRefusal', () => {
    assert.equal(indicatorRefusal(fleetResult(), { argv: ['node', 'x', '--no-focused-stamp'] }),
      '--no-focused-stamp reproduces an older reading');
  });

  it('the LIBRARY door refuses --no-pseudo-reads: the pre-lot reading of the pseudo-element read law is not the fleet measurement', () => {
    assert.ok(REPRODUCTION_FLAGS.includes('--no-pseudo-reads'));
    assert.equal(indicatorRefusal(fleetResult(), { argv: ['node', 'x', '--no-pseudo-reads'] }),
      '--no-pseudo-reads reproduces an older reading');
  });

  it('publishes the unobservable count per axis beside the declared denominator, named, and never subtracts it', () => {
    const indicator = build(fleetResult({ states: 117 }));
    assert.equal(indicator.axes.states.declared, 155);
    // 7 -> 9 (re-pinned 2026-10-12): status-filter-pills (464d5cf52, WO-ARC-22 L6) and locale-switcher (0b8730d3a, WO-EXT-DS E-3), both colour-only.
    assert.equal(indicator.axes.states.unobservable, 9);
    assert.deepEqual(indicator.axes.states.unobservableFamilies.map((entry) => entry.family),
      Object.keys(UNOBSERVABLE_FAMILIES.states));
    assert.equal(indicator.axes.states.worstPercentDeclared, 75.5);
    for (const axis of AXIS_IDS.filter((id) => id !== 'states')) assert.equal(indicator.axes[axis].unobservable, 0, axis);
    assert.match(indicator.basis, /never subtracted/u);
  });

  it('STATES-K: the effective crossing is DEFINITIONAL -- 118/147 = 80.3 % effective, 118/155 = 76.1 % declared, the states status stays below the bar', () => {
    const indicator = build(fleetResult({ states: 118 }));
    const states = indicator.axes.states;
    assert.equal(states.status, 'below-threshold');
    assert.equal(states.worstPercentDeclared, 76.1);
    assert.equal(states.worstPercentEffective, 80.3);
    assert.equal(states.effectiveAtThreshold, true);
    assert.equal(states.effectiveDefinition, EFFECTIVE_DEFINITION);
    assert.match(EFFECTIVE_DEFINITION, /mountable and not unsettled/u);
    assert.deepEqual(states.populationLaw, AXIS_POPULATION_LAWS.states);
    assert.equal(states.populationLaw.law, 'STATES-K');
    for (const axis of AXIS_IDS.filter((id) => id !== 'states')) assert.equal(indicator.axes[axis].populationLaw, null, axis);
    assert.match(indicator.basis, /mountable and not unsettled/u);
    assert.match(indicator.value, /effective-denominator reading \d\/6, never the status\)/u);
  });

  it('publishes each control\'s witness per cell IN FULL, and the measured states refusals', () => {
    const result = fleetResult();
    const ids = Array.from({ length: 38 }, (_, index) => `family-${index}`);
    for (const cell of result.cells.filter((entry) => entry.scenario === 'states-emphasis-only')) {
      cell.witness = { kind: 'axis-positive', axis: 'states', control: 'states.emphasis', positive: 'states', moved: 38, denominator: 148, movedIds: ids };
    }
    for (const cell of result.cells.filter((entry) => entry.scenario === 'palette-only')) {
      cell.witness = { kind: 'effective-map', control: 'palette.seeds', channels: 23, differing: 23 };
    }
    result.realRender = { statesRefused: [{ row: 'column-menu', family: 'column-menu', reason: 'measured', statesReach: null }] };
    const indicator = build(result);
    const witnesses = indicator.negativeTest.controls['states-emphasis-only'].witnesses;
    assert.equal(witnesses.length, 6);
    assert.deepEqual(witnesses[0].movedIds, ids);
    assert.equal(indicator.negativeTest.controls['palette-only'].witnesses[0].differing, 23);
    assert.deepEqual(indicator.realRender.statesRefused.map((entry) => entry.row), ['column-menu']);
  });

  it('PUBLICATION is refused on a dirty tree, a dist not built from the sources on disk, or a catalog that is not the commit\'s', () => {
    const clean = { dirty: [], dist: { ok: true, failures: [] }, catalog: { run: 'abc', head: 'abc' } };
    assert.equal(provenanceRefusal(clean), null);
    assert.match(provenanceRefusal({ ...clean, dirty: ['packages/core/src/a.css', 'b', 'c', 'd'] }),
      /^the working tree has 4 uncommitted path\(s\) under the package \(packages\/core\/src\/a\.css, b, c, \.\.\.\); the indicator would stamp HEAD/u);
    assert.match(provenanceRefusal({ ...clean, dist: { ok: false, failures: ['dist is STALE: source changed'] } }),
      /^dist is not built from the sources on disk \(dist is STALE: source changed\)/u);
    assert.match(provenanceRefusal({ ...clean, catalog: { run: 'abc', head: 'def' } }),
      /^the run read catalog abc and the commit carries def/u);
    // A fact that could not be established refuses as well: silence is not provenance.
    assert.match(provenanceRefusal({ ...clean, dirty: null }), /could not be read from git/u);
    assert.match(provenanceRefusal({ ...clean, dist: null }), /build stamp could not be checked/u);
    assert.match(provenanceRefusal({ ...clean, catalog: { run: 'abc', head: null } }), /catalog revision of the commit could not be read/u);
    assert.match(provenanceRefusal(), /could not be read from git/u);
    // The dirty tree is named first: a rebuilt dist over uncommitted skins is still not the commit.
    assert.match(provenanceRefusal({ dirty: ['x'], dist: { ok: false, failures: ['y'] }, catalog: { run: 'a', head: 'b' } }), /^the working tree/u);
  });

  it('A VERDICT is refused on the same two facts, in the same words, and only when a threshold asks for one (audit W19-R33 D2)', () => {
    const proven = { dist: { ok: true, failures: [] }, catalog: { run: 'abc', head: 'abc' } };
    const stale = { ...proven, dist: { ok: false, failures: ['dist is STALE: source changed'] } };
    const foreign = { ...proven, catalog: { run: 'abc', head: 'def' } };
    assert.equal(gateProvenanceRefusal(proven, { threshold: 80 }), null);
    // Word for word what refuses publication: one judgement, two consequences.
    for (const facts of [stale, foreign, { ...proven, dist: null }, { ...proven, catalog: null }, { ...proven, catalog: { run: null, head: 'abc' } }, {}]) {
      const refusal = gateProvenanceRefusal(facts, { threshold: 80 });
      assert.equal(typeof refusal, 'string', JSON.stringify(facts));
      assert.equal(refusal, provenanceRefusal({ dirty: [], ...facts }), JSON.stringify(facts));
    }
    assert.match(gateProvenanceRefusal(stale, { threshold: 80 }), /^dist is not built from the sources on disk \(dist is STALE: source changed\)/u);
    assert.match(gateProvenanceRefusal(foreign, { threshold: 80 }), /^the run read catalog abc and the commit carries def/u);
    assert.match(gateProvenanceRefusal(undefined, { threshold: 80 }), /build stamp could not be checked/u);
    // No threshold, no verdict asked for, nothing refused -- whatever the build is.
    for (const facts of [proven, stale, foreign, {}]) {
      assert.equal(gateProvenanceRefusal(facts), null);
      assert.equal(gateProvenanceRefusal(facts, { threshold: null }), null);
    }
    // The working tree is publication's fact, not the gate's: a gate is run on the tree it gates.
    assert.equal(gateProvenanceRefusal({ ...proven, dirty: ['packages/core/src/a.css'] }, { threshold: 80 }), null);
    assert.match(provenanceRefusal({ ...proven, dirty: ['packages/core/src/a.css'] }), /^the working tree has 1 uncommitted path/u);
    // A threshold of 0 is still a threshold: the question was asked.
    assert.equal(typeof gateProvenanceRefusal(stale, { threshold: 0 }), 'string');
  });

  it('names the width-only states movers the run published, each with its open defect and receiver; none when the run names none', () => {
    assert.deepEqual(build(fleetResult()).statesWidthOnly, []);
    assert.deepEqual(build(fleetResult()).statesWidthOnlyObserved, []);
    assert.deepEqual(build(fleetResult()).statesNonMoverNotes, []);
    const result = fleetResult();
    const entry = { family: 'synthetic-ring', properties: ['outline-width'], defect: 'focus signature not honoured', defectStatus: 'open', receiver: 'WO-X' };
    const note = { family: 'synthetic-carrier', since: 'abc1234', reason: 'moves, outside the instrument\'s reach' };
    result.limits = { states: { widthOnly: [entry], nonMoverNotes: [note] } };
    for (const cell of result.cells.filter((item) => item.kind === 'positive' && item.axis === 'states')) {
      cell.widthOnly = [{ family: 'synthetic-ring', properties: ['outline-width'] }, { family: 'unnamed-ring', properties: ['outline-offset'] }];
    }
    const indicator = build(result);
    assert.deepEqual(indicator.statesWidthOnly, [entry]);
    assert.deepEqual(indicator.statesWidthOnlyObserved, ['synthetic-ring', 'unnamed-ring']);
    assert.deepEqual(indicator.statesNonMoverNotes, [note]);
    // A note names a non-mover; it adds no class and moves no count.
    assert.deepEqual(indicator.axes, build(fleetResult()).axes);
    assert.ok(!NON_MOVER_CLASSES.includes('outOfReach') && NON_MOVER_CLASSES.length === 5);
  });

  // CR-2: the chromatic states reading, a SIBLING of `axes` (owner directive
  // 2026-10-01; shape ruled by the CR-1 review). Its symbols are read off the
  // namespace so a tree without them fails here as a drill.
  const PURE = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color',
    'border-left-color', 'outline-color', 'text-decoration-color', 'fill', 'stroke', 'caret-color', 'column-rule-color'];
  const withChromatic = (result, { moved = 52, restIsolated = 51, chromaticOnly = ['data-table'] } = {}) => {
    const cells = [];
    for (const vertical of FLEET_VERTICALS) {
      for (const theme of FLEET_THEMES) {
        cells.push({
          vertical, theme, scenario: 'states', kind: 'positive', nativeMeasured: true, moved,
          movedIds: Array.from({ length: moved }, (_, index) => (index === 0 ? 'data-table' : `family-${index}`)),
          restIsolated, restIsolatedIds: [], byChannel: { 'background-color': 22, 'box-shadow(colour)': 42 },
          halves: { stamped: 50, native: 43 }, families: {}, nonChromatic: 118, chromaticOnly,
        });
        cells.push({
          vertical, theme, scenario: 'palette-only', kind: 'negative', nativeMeasured: true, moved: 115, movedIds: [],
          restIsolated: 104, restIsolatedIds: [], byChannel: { 'box-shadow(colour)': 64, 'outline-color': 62 },
          halves: { stamped: 115, native: 100 }, families: {}, nonChromatic: 0, chromaticOnly: [],
        });
        cells.push({
          vertical, theme, scenario: 'states-emphasis-only', kind: 'negative', nativeMeasured: true, moved: 22, movedIds: [],
          restIsolated: 22, restIsolatedIds: [], byChannel: { 'background-color': 22 },
          halves: { stamped: 20, native: 12 }, families: {}, nonChromatic: null, chromaticOnly: null,
        });
      }
    }
    return {
      ...result,
      chromaticStates: {
        properties: PURE,
        embedded: ['box-shadow', 'text-shadow', 'background-image'],
        scene: 'the non-chromatic scene: root plus states-tagged parts; a colour-only state rule mounts no part, so this is a lower bound',
        pinnedChromaticOnly: ['data-table'],
        cells,
      },
    };
  };
  const PINNED = ['value', 'met', 'target', 'axes', 'negativeTest'];

  it('CR-2 P2: the artifact is the same with and without the chromatic reading -- value, met, target, axes, negativeTest', () => {
    for (const moved of [undefined, { states: 118 }, { shape: 190, typography: 170, rhythm: 200, depth: 180, states: 140, motion: 180 }]) {
      const bare = build(fleetResult(moved));
      const chromatic = build(withChromatic(fleetResult(moved)));
      for (const key of PINNED) assert.equal(JSON.stringify(chromatic[key]), JSON.stringify(bare[key]), key);
      assert.equal(bare.chromaticStates, undefined);
      assert.deepEqual(Object.keys(chromatic.axes), [...AXIS_IDS]);
      assert.deepEqual(Object.keys(chromatic).filter((key) => !Object.hasOwn(bare, key)), ['chromaticStates']);
    }
    // 118/155 stays the states status's reading; 52/147 never reaches it.
    const indicator = build(withChromatic(fleetResult({ states: 118 })));
    assert.equal(indicator.axes.states.status, 'below-threshold');
    assert.equal(indicator.axes.states.worstPercentDeclared, 76.1);
    assert.doesNotMatch(indicator.value, /chromatic/u, 'the headline carries no chromatic suffix');
  });

  it('CR-2: chromaticStates is a sibling of axes with no status, no threshold, no met -- data-table named and pinned', () => {
    const indicator = build(withChromatic(fleetResult({ states: 118 })));
    const block = indicator.chromaticStates;
    assert.equal(indicator.axes.statesChromatic, undefined);
    for (const key of indicatorModule.CHROMATIC_FORBIDDEN_KEYS) {
      assert.equal(Object.hasOwn(block, key), false, key);
      for (const cell of block.cells) assert.equal(Object.hasOwn(cell, key), false, key);
    }
    assert.deepEqual([...indicatorModule.CHROMATIC_FORBIDDEN_KEYS], ['status', 'threshold', 'met', 'effectiveAtThreshold']);
    assert.equal(block.kind, 'reported-apart');
    assert.equal(block.apartFrom, 'axes.states');
    assert.match(block.law, /^owner directive 2026-10-01: the six axes stay non-chromatic/u);
    assert.deepEqual(block.properties, PURE);
    assert.deepEqual(block.embedded, ['box-shadow', 'text-shadow', 'background-image']);
    assert.match(block.scene, /lower bound/u);
    assert.equal(block.declared, 155);
    assert.equal(block.effective, 147);
    assert.equal(block.cells.length, 6);
    assert.deepEqual(block.cells[0], {
      vertical: 'bithire', theme: 'light', measured: true, moved: 52, restIsolated: 51, percentDeclared: 33.5,
      percentEffective: 35.4, chromaticOnly: ['data-table'], nonChromatic: 118,
      byChannel: { 'background-color': 22, 'box-shadow(colour)': 42 }, halves: { stamped: 50, native: 43 },
      movedIds: block.cells[0].movedIds,
    });
    assert.equal(block.worstPercentDeclared, 33.5);
    assert.equal(block.worstPercentEffective, 35.4);
    assert.deepEqual(block.chromaticOnly, ['data-table']);
    assert.deepEqual(block.chromaticOnlyPinned, ['data-table']);
    assert.deepEqual(block.unreached, Object.entries(UNOBSERVABLE_FAMILIES.states)
      .filter(([, kind]) => kind === 'colour-only').map(([family]) => family));
    assert.deepEqual(block.unreached, ['edit-fields', 'list', 'locale-switcher', 'metrics-chart', 'status-filter-pills', 'table-toolbar']);
    // The controls: 36 + 12 = 48 non-chromatic cells at the law (not 54).
    assert.equal(block.controls['palette-only'].nonChromatic, '0 on 36/36 (the law)');
    assert.equal(block.controls['palette-only'].chromatic, 115);
    assert.match(block.controls['palette-only'].reads, /reference, not a zero: palette is chromatic by construction/u);
    assert.equal(block.controls['states-emphasis-only'].nonChromatic, '0 on 12/12 (the law)');
    assert.equal(block.controls['states-emphasis-only'].chromatic, 22);
    assert.deepEqual(block.controls['states-emphasis-only'].channels, ['background-color']);
    assert.equal(block.line, 'chromatic-states (reported apart, never a status): 52/155 declared (33.5 %), 52/147 effective '
      + '(35.4 %), every cell; rest-isolated 51; chromatic-only: data-table; unreached: 6 colour-only families; '
      + 'palette-only non-chromatic 0 on 36/36 | chromatic 115 (reference)');
    const keys = Object.keys(indicator);
    assert.equal(keys.indexOf('chromaticStates'), keys.indexOf('axes') + 1);
  });

  it('CR-2 MUTANT: a seventh key under axes, or a status on the chromatic block, is refused on the artifact', () => {
    const indicator = build(withChromatic(fleetResult({ states: 118 })));
    assert.deepEqual(indicatorModule.indicatorSeparationFailures(indicator), []);
    const merged = { ...indicator, axes: { ...indicator.axes, statesChromatic: indicator.chromaticStates } };
    assert.match(indicatorModule.indicatorSeparationFailures(merged)[0], /holds the six axes .* and nothing else/u);
    for (const key of ['status', 'threshold', 'met', 'effectiveAtThreshold']) {
      const statused = { ...indicator, chromaticStates: { ...indicator.chromaticStates, [key]: 'at-threshold' } };
      assert.deepEqual(indicatorModule.indicatorSeparationFailures(statused),
        [`chromaticStates carries \`${key}\`; it is reported apart, never a status`]);
      const cells = indicator.chromaticStates.cells.map((cell, index) => (index === 0 ? { ...cell, [key]: true } : cell));
      assert.equal(indicatorModule.indicatorSeparationFailures({ ...indicator, chromaticStates: { ...indicator.chromaticStates, cells } }).length, 1);
    }
  });

  it('CR-2: the leak fingerprint reads in the artifact -- states 119 with data-table counted, and data-table no longer chromatic-only', () => {
    const leaked = build(withChromatic(fleetResult({ states: 119 }), { chromaticOnly: [] }));
    assert.equal(leaked.axes.states.worstPercentDeclared, 76.8);
    assert.deepEqual(leaked.chromaticStates.chromaticOnly, []);
    assert.deepEqual(leaked.chromaticStates.chromaticOnlyPinned, ['data-table']);
    assert.match(leaked.chromaticStates.line, /chromatic-only: none/u);
  });
});

/**
 * THE NON-MOVERS BY NAME (2026-10-03). The artifact published counts; two lots
 * that both read 118 could not be told apart without the raw record. The names
 * are ADDED beside every existing field, and they may never move a status.
 */
describe('tenant-difference-by-axis indicator — the non-movers are published by name', () => {
  // A small named fleet on states: ten declared, one unmountable, one unsettled,
  // one unobservable, one that neither half reaches, one measured and still.
  const DECLARED_IDS = ['approval-inbox', 'button', 'card', 'data-table', 'kbd', 'moderation-gallery', 'profile', 'tag', 'tooltip', 'tree'];
  const MOVERS = ['button', 'data-table', 'tag', 'tooltip', 'tree'];
  const named = ({ movedIn = () => MOVERS, declaredFamilies = DECLARED_IDS } = {}) => {
    const result = fleetResult();
    result.denominatorReconciliation.states = {
      declared: declaredFamilies.length, excludedUnmountable: 1, excludedUnsettled: 1, effective: declaredFamilies.length - 2,
      declaredFamilies: [...declaredFamilies], unmountableFamilies: ['profile'], unsettledFamilies: ['card'],
    };
    result.unobservable.states = [{ family: 'approval-inbox', class: 'colour-only', properties: ['background'] }];
    result.nativePseudos = { reach: { neither: [{ family: 'approval-inbox', why: 'x' }, { family: 'kbd', why: 'native:no-node 5' }] } };
    for (const cell of result.cells.filter((entry) => entry.axis === 'states' && entry.kind === 'positive')) {
      const ids = movedIn(`${cell.vertical}/${cell.theme}`);
      Object.assign(cell, { moved: ids.length, movedIds: [...ids], denominator: declaredFamilies.length - 2 });
    }
    return result;
  };

  it('every cell names declared minus moved, the axis names their union, and the classes partition it', () => {
    const { states } = build(named()).axes;
    assert.deepEqual(states.nonMovers, ['approval-inbox', 'card', 'kbd', 'moderation-gallery', 'profile']);
    for (const cell of states.cells) {
      assert.deepEqual(cell.nonMoverIds, ['approval-inbox', 'card', 'kbd', 'moderation-gallery', 'profile']);
      assert.equal(cell.nonMoverIds.length, cell.declared - cell.moved);
    }
    assert.deepEqual(Object.keys(states.nonMoversByClass), [...NON_MOVER_CLASSES]);
    assert.deepEqual(states.nonMoversByClass, {
      unmountable: ['profile'],
      unsettled: ['card'],
      // Unobservable wins over unreached: the first class that names a family keeps it.
      unobservable: ['approval-inbox'],
      unreached: ['kbd'],
      measuredNotMoving: ['moderation-gallery'],
    });
  });

  it('a family that moves in five cells and not in the sixth IS an axis non-mover, named only in the cell that lost it', () => {
    const { states } = build(named({ movedIn: (where) => (where === 'evnto/dark' ? MOVERS.filter((id) => id !== 'tree') : MOVERS) })).axes;
    assert.ok(states.nonMovers.includes('tree'));
    assert.deepEqual(states.nonMoversByClass.measuredNotMoving, ['moderation-gallery', 'tree']);
    for (const cell of states.cells) {
      assert.equal(cell.nonMoverIds.includes('tree'), cell.vertical === 'evnto' && cell.theme === 'dark', `${cell.vertical}/${cell.theme}`);
    }
  });

  it('ADDED, NOT RENAMED: every field the artifact carried is still there with the same value, and no status reads the names', () => {
    const before = build(fleetResult({ states: 118 }));
    const withNames = named();
    const after = build(withNames);
    for (const axis of AXIS_IDS) {
      for (const key of ['status', 'declared', 'effective', 'effectiveDefinition', 'populationLaw', 'excludedUnmountable', 'excludedUnsettled',
        'notApplicable', 'unobservable', 'unobservableFamilies', 'worstPercentDeclared', 'worstPercentEffective', 'effectiveAtThreshold', 'cells']) {
        assert.ok(Object.hasOwn(after.axes[axis], key), `${axis}.${key}`);
        assert.ok(Object.hasOwn(before.axes[axis], key), `${axis}.${key}`);
      }
      assert.deepEqual(Object.keys(after.axes[axis]).filter((key) => !['nonMovers', 'nonMoversByClass'].includes(key)),
        Object.keys(before.axes[axis]).filter((key) => !['nonMovers', 'nonMoversByClass'].includes(key)));
    }
    // Stripping the names from the run changes nothing the status is built from.
    const stripped = structuredClone(withNames);
    delete stripped.denominatorReconciliation.states.declaredFamilies;
    const bare = build(stripped);
    for (const key of ['value', 'met', 'target', 'negativeTest']) assert.equal(JSON.stringify(bare[key]), JSON.stringify(after[key]), key);
    assert.equal(bare.axes.states.status, after.axes.states.status);
    assert.equal(bare.axes.states.worstPercentDeclared, after.axes.states.worstPercentDeclared);
    // A run that published no names publishes null, never a guessed list.
    assert.equal(bare.axes.states.nonMovers, null);
    assert.equal(bare.axes.states.nonMoversByClass, null);
    for (const cell of bare.axes.states.cells) assert.equal(cell.nonMoverIds, null);
    assert.equal(before.axes.states.nonMovers, null);
  });

  it('REPORTED, NEVER SUBTRACTED: naming a non-mover unobservable, unmountable or unsettled leaves the declared denominator and the percentage alone', () => {
    const { states } = build(named()).axes;
    assert.equal(states.declared, 10);
    assert.equal(states.worstPercentDeclared, 50);
    assert.equal(states.status, 'below-threshold');
    const classed = NON_MOVER_CLASSES.flatMap((kind) => states.nonMoversByClass[kind]);
    assert.equal(classed.length + MOVERS.length, states.declared, 'every declared family is a mover or a named non-mover');
  });

  it('MUTANT: names that disagree with the counts refuse the artifact', () => {
    // A mover the declared list does not hold: the cell would name 5 non-movers for 10 - 6.
    const ghost = named({ movedIn: () => [...MOVERS, 'not-declared'] });
    assert.throws(() => build(ghost), /states bithire\/light: 5 non-mover\(s\) named for 10 declared - 6 moved/u);
    // A declared list shorter than the declared count.
    const short = named();
    short.denominatorReconciliation.states.declaredFamilies = DECLARED_IDS.slice(1);
    assert.throws(() => build(short), /4 non-mover\(s\) named for 10 declared - 5 moved/u);
    // Classes that drop or invent a family.
    const axes = axisReadings(named());
    assert.deepEqual(nonMoverFailures(axes), []);
    axes.states.nonMoversByClass = { ...axes.states.nonMoversByClass, unobservable: [] };
    assert.deepEqual(nonMoverFailures(axes), ['states: the non-mover classes name 4 famil(ies) for 5 non-mover(s)']);
    axes.states.nonMoversByClass = { ...axes.states.nonMoversByClass, unobservable: ['button'] };
    assert.deepEqual(nonMoverFailures(axes), ['states: the non-mover classes name 5 famil(ies) for 5 non-mover(s)']);
  });

  it('reach is read on the states axis alone: another axis never classes a family unreached', () => {
    const result = named();
    assert.deepEqual(nonMoversByClass(result, 'shape', ['kbd']).unreached, []);
    assert.deepEqual(nonMoversByClass(result, 'shape', ['kbd']).measuredNotMoving, ['kbd']);
    assert.deepEqual(nonMoversByClass(result, 'states', ['kbd']).unreached, ['kbd']);
  });
});

describe('tenant-difference-by-axis — the input digest and --verify-indicator (audit W19-R33 P3)', () => {
  const hex = (seed) => seed.repeat(64).slice(0, 64);
  const DIGEST = inputDigestOf({ sourceHash: hex('a'), buildInputFingerprint: hex('b'), instrument: hex('c') });
  const CURRENT = Object.freeze({ catalogRevision: 'fixture', browser: 'fixture', inputDigest: DIGEST });
  const publish = (result = fleetResult(), options = {}) => buildIndicator(result, {
    negativeControls: CONTROLS, producedAt: '2026-10-04T00:00:00.000Z', commit: 'c0ffee', inputDigest: DIGEST, ...options,
  });
  const fresh = (indicator, current = {}) => indicatorFreshnessRefusals(indicator, { ...CURRENT, threshold: 80, ...current });
  /** Runs the mode on a throwaway root holding `content` as the published file (or nothing). */
  const verify = (content, { threshold = 80, facts = { ...CURRENT, reasons: {} } } = {}) => {
    const root = mkdtempSync(join(tmpdir(), 'indicator-7-verify-'));
    try {
      if (content !== undefined) {
        mkdirSync(dirname(join(root, INDICATOR_PATH)), { recursive: true });
        writeFileSync(join(root, INDICATOR_PATH), typeof content === 'string' ? content : `${JSON.stringify(content, null, 2)}\n`);
      }
      return verifyIndicator({ root, threshold, facts });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  };
  const refusedWith = (outcome, pattern) => {
    assert.equal(outcome.exitCode, 1);
    assert.equal(outcome.verdict, null, 'a refusal carries no verdict');
    assert.ok(outcome.errors.some((line) => line.startsWith(`${GATE_REFUSAL_HEAD} — ${VERIFY_INDICATOR_FLAG}: `) && pattern.test(line)),
      `expected a refusal matching ${pattern} in:\n${outcome.errors.join('\n')}`);
    assert.ok(!outcome.errors.some((line) => line.includes('axis-difference FAIL')), 'a refused reading is never judged');
  };

  it('PUBLICATION records the input digest, and the field list is exactly what the writer writes', () => {
    const indicator = publish();
    assert.deepEqual(indicator.inputDigest, DIGEST);
    assert.deepEqual(Object.keys(DIGEST), ['algorithm', 'digest', 'parts']);
    assert.deepEqual(Object.keys(DIGEST.parts), [...INPUT_DIGEST_PARTS]);
    assert.deepEqual(Object.keys(indicator), [...INDICATOR_FIELDS], 'no chromatic reading in this run');
    assert.deepEqual(INDICATOR_OPTIONAL_FIELDS, ['chromaticStates']);
    assert.deepEqual(fresh({ ...indicator, chromaticStates: { kind: 'reported-apart' } }), [], 'the chromatic sibling is a field the writer writes');
    // A writer that is not told the digest records its absence, and that never verifies.
    assert.equal(build(fleetResult()).inputDigest, null);
    assert.match(fresh(build(fleetResult()))[0], /^input digest: the indicator records no input digest$/u);
  });

  it('the digest is its parts and nothing else: one moved part moves it, a part that is no sha256 throws', () => {
    for (const name of INPUT_DIGEST_PARTS) {
      assert.notEqual(inputDigestOf({ ...DIGEST.parts, [name]: hex('d') }).digest, DIGEST.digest, name);
      assert.throws(() => inputDigestOf({ ...DIGEST.parts, [name]: 'short' }), new RegExp(`part \`${name}\` is not a sha256`, 'u'));
    }
    assert.equal(inputDigestShapeFailure(DIGEST), null);
    assert.match(inputDigestShapeFailure({ ...DIGEST, digest: hex('e') }), /its own parts do not reproduce/u);
    assert.match(inputDigestShapeFailure({ ...DIGEST, extra: 1 }), /with the keys algorithm, digest, extra, parts/u);
    assert.match(inputDigestShapeFailure({ ...DIGEST, algorithm: 'md5' }), /under `md5`/u);
    assert.match(inputDigestShapeFailure({ ...DIGEST, parts: { sourceHash: hex('a') } }), /parts are not exactly/u);
    assert.match(inputDigestShapeFailure(DIGEST.digest), /not an object/u);
  });

  it('GREEN: a fresh indicator at the bar is VERIFIED, and the effective reading is printed, never the verdict', () => {
    const outcome = verify(publish());
    assert.deepEqual(outcome.errors, []);
    assert.equal(outcome.exitCode, 0);
    assert.match(outcome.verdict, /^axis-difference VERIFIED — .* every axis is at or above 80 % on the declared basis \(6\/6 at threshold; /u);
    assert.match(outcome.verdict, /effective-denominator reading 6\/6, reported, never the status\); a reading of the indicator, not a measurement$/u);
    assert.equal(outcome.stdout.at(-1), outcome.verdict, 'the VERIFIED line is the last thing printed');
    assert.deepEqual(outcome.stdout.slice(0, -1), outcome.lines);
    assert.match(outcome.lines[0], /no browser launched, nothing measured$/u);
    assert.match(outcome.lines[1], /fresh: threshold 80, catalog fixture, 3 vertical\(s\) x 2 mode\(s\), chromium fixture, input digest /u);
    for (const axis of AXIS_IDS) {
      assert.ok(outcome.lines.some((line) => line.trimStart().startsWith(axis) && /effective .* reported, never the status$/u.test(line)), axis);
    }
  });

  it('RED: a fresh indicator with an axis below the bar on the DECLARED basis exits 1, though its effective reading is at it', () => {
    // 118/155 = 76.1 % declared, 118/147 = 80.3 % effective: the crossing the effective reading alone would make.
    const indicator = publish(fleetResult({ states: 118 }));
    assert.equal(indicator.axes.states.effectiveAtThreshold, true);
    assert.deepEqual(fresh(indicator), [], 'the reading is fresh; it is short');
    const outcome = verify(indicator);
    assert.equal(outcome.exitCode, 1);
    assert.equal(outcome.verdict, null);
    assert.equal(outcome.errors.length, 1);
    assert.match(outcome.errors[0], /^axis-difference FAIL — states: 76\.1 % < 80 % on the declared basis on bithire\/light \(118\/155 declaring families/u);
    assert.deepEqual(outcome.stdout, outcome.lines, 'a failed reading prints its readings and no passing line');
    assert.ok(outcome.lines.some((line) => /states\s+below-threshold\s+declared 118\/155 = 76\.1 % .*effective 80\.3 %/u.test(line)));
  });

  it('REFUSED missing indicator: no file is exit 1, never a skip', () => {
    refusedWith(verify(undefined), /missing indicator: artifacts\/quality\/indicators\/tenant-difference-by-axis\/index\.json does not exist/u);
    refusedWith(verify('{ not json'), /unreadable indicator: .* is not JSON/u);
    refusedWith(verify('[]'), /shape: the indicator is not a JSON object/u);
  });

  it('REFUSED unknown fields: a field the writer does not write, or a missing one', () => {
    refusedWith(verify({ ...publish(), waiver: true }), /unknown fields: waiver — not written by the indicator's writer/u);
    const { browser: _browser, ...withoutBrowser } = publish();
    refusedWith(verify(withoutBrowser), /missing fields: browser$/u);
    refusedWith(verify({ ...publish(), id: 'decisions-lit' }), /id: the file is "decisions-lit", not tenant-difference-by-axis/u);
  });

  it('REFUSED no input digest: a reading published before the field existed is not verifiable', () => {
    const { inputDigest: _digest, ...legacy } = publish();
    refusedWith(verify(legacy), /missing fields: inputDigest — a reading published before the input digest existed cannot be verified; republish it/u);
    refusedWith(verify({ ...publish(), inputDigest: null }), /input digest: the indicator records no input digest/u);
    refusedWith(verify({ ...publish(), inputDigest: { ...DIGEST, digest: hex('f') } }), /input digest: the indicator records an input digest its own parts do not reproduce/u);
  });

  it('REFUSED stale digest: a skin, a build input or the instrument moved since publication, named by part', () => {
    for (const name of INPUT_DIGEST_PARTS) {
      const moved = inputDigestOf({ ...DIGEST.parts, [name]: hex('9') });
      refusedWith(verify(publish(), { facts: { ...CURRENT, inputDigest: moved, reasons: {} } }),
        new RegExp(`stale input digest: the indicator was read from ${DIGEST.digest.slice(0, 16)} and the inputs are now `
          + `${moved.digest.slice(0, 16)} \\(moved: ${name}\\)`, 'u'));
    }
    refusedWith(verify(publish(), { facts: { ...CURRENT, inputDigest: null, reasons: { 'input digest': 'ENOENT src' } } }),
      /input digest: the current inputs could not be digested/u);
  });

  it('REFUSED threshold mismatch: the indicator was published at another bar, or none was requested', () => {
    refusedWith(verify(publish(), { threshold: 70 }), /threshold mismatch: the indicator was published at 80 and 70 was requested/u);
    refusedWith(verify(publish(fleetResult(), { threshold: 70 })), /threshold mismatch: the indicator was published at 70 and 80 was requested/u);
    refusedWith(verify(publish(), { threshold: null }), /threshold: no threshold was requested/u);
    refusedWith(verify(publish(), { threshold: Number.NaN }), /threshold: no threshold was requested/u);
  });

  it('REFUSED old browser: the reading was taken in a Chromium the locked Playwright no longer pins', () => {
    refusedWith(verify(publish(), { facts: { ...CURRENT, browser: '150.0.0.1', reasons: {} } }),
      /old browser: the indicator was read in Chromium "fixture" and the locked Playwright pins 150\.0\.0\.1/u);
    const unread = verify(publish(), { facts: { ...CURRENT, browser: null, reasons: { browser: 'no Playwright install is reachable' } } });
    refusedWith(unread, /browser: the Chromium version the locked Playwright pins could not be read/u);
    assert.ok(unread.lines.includes('  browser: no Playwright install is reachable'), 'the reason is printed beside the refusal');
  });

  it('REFUSED stale catalog: the populations were read at another catalog revision', () => {
    refusedWith(verify(publish(), { facts: { ...CURRENT, catalogRevision: 'moved', reasons: {} } }),
      /stale catalog: the indicator was read at "fixture" and the catalog is now moved/u);
    refusedWith(verify(publish(), { facts: { ...CURRENT, catalogRevision: null, reasons: {} } }), /catalog: the current catalog digest could not be read/u);
  });

  it('REFUSED not the fleet: a vertical or a mode short, extra or repeated', () => {
    refusedWith(verify({ ...publish(), verticals: ['bithire', 'evnto'] }), /verticals: \["bithire","evnto"\] are not the fleet's \(bithire, evnto, rottay\)/u);
    refusedWith(verify({ ...publish(), verticals: ['bithire', 'evnto', 'evnto'] }), /verticals: .* are not the fleet's/u);
    refusedWith(verify({ ...publish(), themes: ['light'] }), /themes: \["light"\] are not the fleet's \(light, dark\)/u);
    refusedWith(verify({ ...publish(), themes: 'light,dark' }), /themes: "light,dark" are not the fleet's/u);
  });

  it('every refusal is named at once, and none of them reads a status', () => {
    const { inputDigest: _digest, ...legacy } = publish(fleetResult({ states: 118 }));
    const refusals = fresh({ ...legacy, verticals: ['rottay'], waiver: 1 }, { threshold: 70, catalogRevision: 'moved', browser: 'new' });
    assert.deepEqual(refusals.map((line) => line.split(':')[0]),
      ['unknown fields', 'missing fields', 'threshold mismatch', 'stale catalog', 'verticals', 'old browser']);
    refusedWith(verify({ ...legacy, waiver: 1 }), /unknown fields: waiver/u);
  });

  it('MUTANT: a hand-edited status or cell does not buy a verdict; the status is re-derived from the cells', () => {
    const short = publish(fleetResult({ states: 118 }));
    const edited = structuredClone(short);
    edited.axes.states.status = 'at-threshold';
    edited.met = true;
    const lied = verify(edited);
    assert.equal(lied.exitCode, 1);
    assert.match(lied.errors[0], /^axis-difference FAIL — states: the indicator records status "at-threshold" and its own cells read below-threshold/u);
    // A cell dropped, unmeasured or duplicated is NOT MEASURED, whatever the status says.
    for (const mutate of [
      (cells) => cells.pop(),
      (cells) => { cells[0].measured = false; },
      (cells) => { cells[1] = structuredClone(cells[0]); },
      (cells) => { cells[0].moved = cells[0].declared + 1; },
    ]) {
      const broken = structuredClone(publish());
      mutate(broken.axes.motion.cells);
      const verdict = indicatorDeclaredBasisVerdict(broken, 80);
      assert.match(verdict.failures[0], /^motion: the indicator records status "at-threshold" and its own cells read not-measured/u);
    }
    const seventh = structuredClone(publish());
    seventh.axes.chromatic = seventh.axes.states;
    assert.match(indicatorDeclaredBasisVerdict(seventh, 80).failures[0], /a verdict needs the six axes .* and nothing else/u);
    // The bar is read as the writer rounds it, so a fresh reading reproduces its own status exactly at the bar.
    const atBar = publish(fleetResult({ states: 124 }));
    assert.equal(atBar.axes.states.worstPercentDeclared, 80);
    assert.deepEqual(indicatorDeclaredBasisVerdict(atBar, 80).failures, []);
  });

  it('a negative test that is not green fails a fresh reading, exactly as it fails the measuring run', () => {
    const moved = fleetResult();
    cellOf(moved, 'palette-only', 'depth').moved = 3;
    const red = verify(publish(moved));
    assert.equal(red.exitCode, 1);
    assert.match(red.errors[0], /^axis-difference FAIL — negative test RED in the published reading/u);
    const unmeasured = fleetResult();
    cellOf(unmeasured, 'palette-only', 'depth').evidential = false;
    assert.match(verify(publish(unmeasured)).errors[0], /negative test NOT-MEASURED in the published reading/u);
  });
});

describe('tenant-difference-by-axis — the review conditions on --verify-indicator (review W23-P3 F1, F2)', () => {
  const hex = (seed) => seed.repeat(64).slice(0, 64);
  const DIGEST = inputDigestOf({ sourceHash: hex('a'), buildInputFingerprint: hex('b'), instrument: hex('c') });
  const publish = () => buildIndicator(fleetResult(), {
    negativeControls: CONTROLS, producedAt: '2026-10-04T00:00:00.000Z', commit: 'c0ffee', inputDigest: DIGEST,
  });
  const current = (browser) => ({ catalogRevision: 'fixture', browser, inputDigest: DIGEST, threshold: 80 });

  it('REFUSED old browser by EXACT equality: a prefix, an extension or an empty string is another Chromium', () => {
    const PINNED = '149.0.7827.55';
    for (const [recorded, pinned] of [
      ['149.0.7827.5', PINNED],
      [PINNED, '149.0.7827.5'],
      ['149.0.7827', PINNED],
      ['', PINNED],
      [` ${PINNED}`, PINNED],
    ]) {
      const refusals = indicatorFreshnessRefusals({ ...publish(), browser: recorded }, current(pinned));
      assert.deepEqual(refusals.map((line) => line.split(':')[0]), ['old browser'], `${JSON.stringify(recorded)} against ${pinned}`);
    }
    // An empty pin is no pin: it is never equal to anything, an empty recording included.
    for (const recorded of ['', PINNED]) {
      const refusals = indicatorFreshnessRefusals({ ...publish(), browser: recorded }, current(''));
      assert.deepEqual(refusals, ['browser: the Chromium version the locked Playwright pins could not be read'], JSON.stringify(recorded));
    }
    assert.deepEqual(indicatorFreshnessRefusals({ ...publish(), browser: PINNED }, current(PINNED)), [], 'the control: the same version');
  });

  it('the inputs did not move under the run: the digest taken before the measurement must be the one at publication', () => {
    const { inputDigestDriftRefusal } = indicatorModule;
    assert.equal(typeof inputDigestDriftRefusal, 'function');
    assert.equal(inputDigestDriftRefusal(DIGEST, inputDigestOf({ ...DIGEST.parts })), null);
    for (const name of INPUT_DIGEST_PARTS) {
      const moved = inputDigestOf({ ...DIGEST.parts, [name]: hex('9') });
      assert.equal(inputDigestDriftRefusal(DIGEST, moved),
        `the inputs moved during the measurement: it began on ${DIGEST.digest.slice(0, 16)} and they are ${moved.digest.slice(0, 16)} `
        + `at publication (moved: ${name}); the reading is of neither`);
    }
    assert.match(inputDigestDriftRefusal(null, DIGEST), /^the input digest taken before the measurement records no input digest; /u);
    assert.match(inputDigestDriftRefusal(DIGEST, null), /^the input digest taken at publication records no input digest; /u);
    assert.match(inputDigestDriftRefusal({ ...DIGEST, digest: hex('f') }, DIGEST), /before the measurement records an input digest its own parts do not reproduce/u);
  });

  describe('PUBLICATION RACE: an input moved between the two reads is never published', () => {
    const fixture = () => {
      const root = mkdtempSync(join(tmpdir(), 'indicator-publication-race-'));
      const write = (path, text) => {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), text);
      };
      write('package.json', JSON.stringify({ name: 'fixture', version: '1.0.0', scripts: {} }));
      write('src/skin/button.css', '.rottay-button { border-radius: var(--ds-radius-md); }\n');
      write('scripts/probe/index.mjs', "import './law/index.mjs';\n");
      write('scripts/probe/law/index.mjs', 'export const LAW = 1;\n');
      return { root, write, entry: join(root, 'scripts/probe/index.mjs') };
    };
    const publishAt = async ({ root, entry }, before, readDigest) => {
      const { publishIndicator, readInputDigest } = await import('../../index.mjs');
      return publishIndicator(fleetResult(), {
        root,
        before,
        readDigest: readDigest ?? (() => readInputDigest({ root, entry })),
        negativeControls: CONTROLS,
        producedAt: '2026-10-04T00:00:00.000Z',
        commit: 'c0ffee',
      });
    };
    const target = (root) => join(root, INDICATOR_PATH);

    for (const [part, path, text] of [
      ['sourceHash', 'src/skin/button.css', '.rottay-button { border-radius: 4px; }\n'],
      ['instrument', 'scripts/probe/law/index.mjs', 'export const LAW = 2;\n'],
    ]) {
      it(`REFUSED: ${path} moved after the first read; exit 1, nothing written, the moved part named`, async () => {
        const { readInputDigest } = await import('../../index.mjs');
        const site = fixture();
        try {
          const before = readInputDigest({ root: site.root, entry: site.entry });
          site.write(path, text);
          const outcome = await publishAt(site, before);
          assert.equal(outcome.exitCode, 1);
          assert.equal(outcome.indicator, null);
          assert.match(outcome.refusal, new RegExp(`^the inputs moved during the measurement: .*\\(moved: [^)]*${part}[^)]*\\); the reading is of neither$`, 'u'));
          assert.equal(existsSync(target(site.root)), false, 'nothing was written');
        } finally {
          rmSync(site.root, { recursive: true, force: true });
        }
      });
    }

    it('REFUSED: no digest before the measurement, or none at publication; nothing written', async () => {
      const { readInputDigest } = await import('../../index.mjs');
      const site = fixture();
      try {
        const unread = await publishAt(site, null);
        assert.equal(unread.exitCode, 1);
        assert.match(unread.refusal, /^the input digest taken before the measurement records no input digest/u);
        const before = readInputDigest({ root: site.root, entry: site.entry });
        const thrown = await publishAt(site, before, () => { throw new Error('ENOENT src'); });
        assert.equal(thrown.exitCode, 1);
        assert.match(thrown.refusal, /^the input digest taken at publication records no input digest; .*\(ENOENT src\)$/u);
        assert.equal(existsSync(target(site.root)), false, 'nothing was written');
      } finally {
        rmSync(site.root, { recursive: true, force: true });
      }
    });

    it('the control: inputs unmoved, the indicator is written and carries the digest both reads agree on', async () => {
      const { readInputDigest } = await import('../../index.mjs');
      const site = fixture();
      try {
        const before = readInputDigest({ root: site.root, entry: site.entry });
        const outcome = await publishAt(site, before);
        assert.equal(outcome.exitCode, 0);
        assert.equal(outcome.refusal, null);
        assert.deepEqual(outcome.indicator.inputDigest, before);
        assert.deepEqual(JSON.parse(readFileSync(target(site.root), 'utf8')).inputDigest, before);
      } finally {
        rmSync(site.root, { recursive: true, force: true });
      }
    });
  });
});
