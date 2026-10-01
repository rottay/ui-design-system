import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { readProgramIndicatorMeasurement } from '../../../../../../../../scripts/maintain/roadmap/status/index.mjs';
import { AXIS_IDS } from '../../../population/index.mjs';
import { NO_WRITE_FLAG, SCENARIOS, UNOBSERVABLE_FAMILIES, publicationRefusal } from '../../index.mjs';
import {
  FLEET_THEMES,
  FLEET_VERTICALS,
  INDICATOR_ID,
  INDICATOR_PATH,
  REPRODUCTION_FLAGS,
  axisReadings,
  buildIndicator,
  indicatorRefusal,
  negativeControlsOf,
  negativeTest,
  writeIndicator,
} from '../index.mjs';

const CONTROLS = negativeControlsOf(SCENARIOS);
const DECLARED = { shape: 217, typography: 182, rhythm: 224, depth: 199, states: 156, motion: 204 };
const EFFECTIVE = { shape: 205, typography: 175, rhythm: 209, depth: 187, states: 148, motion: 195 };

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
    assert.equal(indicator.axes.states.declared, 156);
    assert.equal(indicator.axes.states.unobservable, 8);
    assert.deepEqual(indicator.axes.states.unobservableFamilies.map((entry) => entry.family),
      Object.keys(UNOBSERVABLE_FAMILIES.states));
    assert.equal(indicator.axes.states.worstPercentDeclared, 75);
    for (const axis of AXIS_IDS.filter((id) => id !== 'states')) assert.equal(indicator.axes[axis].unobservable, 0, axis);
    assert.match(indicator.basis, /never subtracted/u);
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
});
