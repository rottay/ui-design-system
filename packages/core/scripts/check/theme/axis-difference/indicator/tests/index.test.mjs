import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it } from 'node:test';

import { readProgramIndicatorMeasurement } from '../../../../../../../../scripts/maintain/roadmap/status/index.mjs';
import { AXIS_IDS } from '../../../population/index.mjs';
import { NO_WRITE_FLAG, SCENARIOS, publicationRefusal } from '../../index.mjs';
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
});
