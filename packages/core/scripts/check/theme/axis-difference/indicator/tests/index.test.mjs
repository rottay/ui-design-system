import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { readProgramIndicatorMeasurement } from '../../../../../../../../scripts/maintain/roadmap/status/index.mjs';
import { AXIS_IDS, AXIS_POPULATION_LAWS } from '../../../population/index.mjs';
import { NO_WRITE_FLAG, SCENARIOS, UNOBSERVABLE_FAMILIES, publicationRefusal } from '../../index.mjs';
import * as indicatorModule from '../index.mjs';
import {
  FLEET_THEMES,
  FLEET_VERTICALS,
  INDICATOR_ID,
  INDICATOR_PATH,
  EFFECTIVE_DEFINITION,
  REPRODUCTION_FLAGS,
  axisReadings,
  buildIndicator,
  indicatorRefusal,
  negativeControlsOf,
  negativeTest,
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
    assert.deepEqual(block.unreached, ['edit-fields', 'list', 'metrics-chart', 'operational-ledger', 'overlay-modal-compounds', 'table-toolbar']);
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
