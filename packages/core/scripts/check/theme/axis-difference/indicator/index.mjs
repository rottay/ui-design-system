/**
 * Programme indicator 7 (STATUS row 7), read off one full `axis-difference` run and published where
 * `readProgramIndicatorMeasurement` looks. Percentages use the DECLARED population (kit rule 4).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { AXIS_IDS } from '../../population/index.mjs';

export const INDICATOR_ID = 'tenant-difference-by-axis';
export const INDICATOR_PATH = `artifacts/quality/indicators/${INDICATOR_ID}/index.json`;
export const INDICATOR_GATE = 'axis-difference (`capability-propagation` by axis, WO-EVI-02)';
export const INDICATOR_THRESHOLD = 80;
export const FLEET_VERTICALS = Object.freeze(['bithire', 'evnto', 'rottay']);
export const FLEET_THEMES = Object.freeze(['light', 'dark']);

/** The CLI flags that reproduce an older reading on purpose; none of them is the fleet measurement. */
export const REPRODUCTION_FLAGS = Object.freeze([
  '--no-part-mounts',
  '--collapsed-roots',
  '--no-states-disabled',
  '--no-as-rendered',
  '--no-part-reach',
  '--no-native-pseudos',
  '--no-real-render-mounts',
  '--no-focused-stamp',
  '--no-pseudo-reads',
]);

const percent = (moved, denominator) => (denominator === 0 ? 0 : (moved / denominator) * 100);
const round = (value) => Math.round(value * 10) / 10;

/** The negative controls a scenario list ships, with the axes each must read 0 % on. */
export function negativeControlsOf(scenarios) {
  return scenarios
    .filter((scenario) => scenario.kind === 'negative')
    .map((scenario) => ({ id: scenario.id, expectZeroOn: [...scenario.expectZeroOn] }));
}

function expectedCells(result) {
  return result.verticals.flatMap((vertical) => result.themes.map((theme) => ({ vertical, theme })));
}

/** `at-threshold` needs every (vertical, mode) cell present, evidential and at the bar on the declared denominator. */
export function axisReadings(result, { threshold = INDICATOR_THRESHOLD } = {}) {
  const readings = {};
  for (const axis of AXIS_IDS) {
    const row = result.denominatorReconciliation?.[axis];
    const declared = row?.declared ?? 0;
    const cells = expectedCells(result).map(({ vertical, theme }) => {
      const cell = result.cells.find((entry) => entry.kind === 'positive' && entry.axis === axis
        && entry.vertical === vertical && entry.theme === theme);
      if (cell === undefined) return { vertical, theme, measured: false, reason: 'no positive cell was taken' };
      if (!cell.evidential) {
        return {
          vertical,
          theme,
          measured: false,
          reason: cell.nonEvidentialReason ?? 'its two arms resolve to the same paint',
        };
      }
      return {
        vertical,
        theme,
        measured: true,
        moved: cell.moved,
        declared,
        effective: cell.denominator,
        percentDeclared: round(percent(cell.moved, declared)),
        percentEffective: round(percent(cell.moved, cell.denominator)),
      };
    });
    const measuredCells = cells.filter((cell) => cell.measured);
    const unmeasured = cells.filter((cell) => !cell.measured);
    const worst = (key) => (measuredCells.length === 0
      ? null
      : measuredCells.reduce((low, cell) => (cell[key] < low[key] ? cell : low)));
    const worstDeclared = worst('percentDeclared');
    const worstEffective = worst('percentEffective');
    let status;
    if (declared === 0) status = 'not-measured';
    else if (unmeasured.length > 0) status = 'not-measured';
    else status = worstDeclared.percentDeclared >= threshold ? 'at-threshold' : 'below-threshold';
    readings[axis] = {
      status,
      declared,
      effective: row?.effective ?? null,
      excludedUnmountable: row?.excludedUnmountable ?? null,
      excludedUnsettled: row?.excludedUnsettled ?? null,
      notApplicable: result.notApplicable?.[axis] ?? 0,
      // Reported beside the denominator, NEVER subtracted from it: the
      // declaring families this probe cannot observe, named with their class.
      unobservable: (result.unobservable?.[axis] ?? []).length,
      unobservableFamilies: (result.unobservable?.[axis] ?? []).map((entry) => ({ family: entry.family, class: entry.class })),
      worstPercentDeclared: worstDeclared?.percentDeclared ?? null,
      worstPercentEffective: worstEffective?.percentEffective ?? null,
      effectiveAtThreshold: unmeasured.length === 0 && worstEffective !== null
        && worstEffective.percentEffective >= threshold,
      cells,
    };
  }
  return readings;
}

/**
 * The witness a control stood on, once per (vertical, mode), published IN FULL:
 * the ids of every family the control's own decision moved, never a preview.
 */
function witnessesOf(result, id) {
  const witnesses = [];
  for (const { vertical, theme } of expectedCells(result)) {
    const cell = result.cells.find((entry) => entry.scenario === id && entry.vertical === vertical
      && entry.theme === theme && entry.witness !== null && entry.witness !== undefined);
    if (cell === undefined) continue;
    const { witness } = cell;
    witnesses.push(witness.kind === 'effective-map'
      ? { where: `${vertical}/${theme}`, kind: witness.kind, control: witness.control, differing: witness.differing, channels: witness.channels }
      : {
        where: `${vertical}/${theme}`,
        kind: witness.kind,
        control: witness.control,
        axis: witness.axis,
        moved: witness.moved,
        denominator: witness.denominator,
        movedIds: [...(witness.movedIds ?? [])],
      });
  }
  return witnesses;
}

/** A missing or non-evidential cell is NOT MEASURED, never a 0 %: `green` needs every cell measured at zero. */
export function negativeTest(result, negativeControls) {
  const controls = {};
  for (const control of negativeControls) {
    const moved = [];
    const unmeasured = [];
    let measured = 0;
    for (const { vertical, theme } of expectedCells(result)) {
      for (const axis of control.expectZeroOn) {
        const where = `${vertical}/${theme} ${axis}`;
        const cell = result.cells.find((entry) => entry.scenario === control.id && entry.axis === axis
          && entry.vertical === vertical && entry.theme === theme);
        if (cell === undefined) {
          unmeasured.push({ where, reason: 'no cell was taken' });
        } else if (cell.moved > 0) {
          moved.push({
            where,
            moved: cell.moved,
            denominator: cell.denominator,
            families: (cell.movedFamilies ?? []).map((entry) => `${entry.family}(${entry.property})`),
          });
        } else if (!cell.evidential) {
          unmeasured.push({ where, reason: cell.nonEvidentialReason ?? 'its two arms resolve to the same paint' });
        } else {
          measured += 1;
        }
      }
    }
    const expected = expectedCells(result).length * control.expectZeroOn.length;
    const status = moved.length > 0 ? 'red' : unmeasured.length > 0 ? 'not-measured' : 'green';
    controls[control.id] = {
      status, expectZeroOn: control.expectZeroOn, measuredAtZero: measured, expected, moved, unmeasured,
      witnesses: witnessesOf(result, control.id),
    };
  }
  const statuses = Object.values(controls).map((control) => control.status);
  let status = 'green';
  if (statuses.includes('red')) status = 'red';
  else if (negativeControls.length === 0 || statuses.includes('not-measured')) status = 'not-measured';
  return { status, controls };
}

/** The one-line reading STATUS publishes, derived from the two readings above and nothing else. */
export function headline(axes, negative, { threshold = INDICATOR_THRESHOLD } = {}) {
  const at = AXIS_IDS.filter((axis) => axes[axis].status === 'at-threshold');
  const effective = AXIS_IDS.filter((axis) => axes[axis].effectiveAtThreshold).length;
  const unmeasured = AXIS_IDS.filter((axis) => axes[axis].status === 'not-measured');
  const controls = Object.entries(negative.controls)
    .map(([id, control]) => `${id} ${control.status === 'green'
      ? `0 % on ${control.measuredAtZero}/${control.expected}`
      : control.status === 'red'
        ? `moved on ${control.moved.length}/${control.expected}`
        : `not measured on ${control.unmeasured.length}/${control.expected}`}`)
    .join(', ');
  return `${at.length}/${AXIS_IDS.length} axes at >= ${threshold} % of declaring families`
    + ` (${at.length > 0 ? at.join(', ') : 'none'}; effective-denominator reading ${effective}/${AXIS_IDS.length})`
    + (unmeasured.length > 0 ? `; NOT MEASURED: ${unmeasured.join(', ')}` : '')
    + `; negative test ${negative.status.toUpperCase()} — ${controls}`;
}

/** Only the fleet measurement publishes: every vertical, mode and family, today's scene, no instrument failure. */
export function indicatorRefusal(result, { argv = [], instrumentFailures = [], writeRefusal = null } = {}) {
  if (writeRefusal !== null) return writeRefusal;
  if (result.familiesFiltered === true) return 'a --families run measures a subset, not the fleet';
  const same = (left, right) => left.length === right.length && left.every((entry) => right.includes(entry));
  if (!same(result.verticals, FLEET_VERTICALS)) return `verticals ${result.verticals.join(',')} are not the fleet's`;
  if (!same(result.themes, FLEET_THEMES)) return `modes ${result.themes.join(',')} are not the fleet's`;
  const flag = REPRODUCTION_FLAGS.find((entry) => argv.includes(entry));
  if (flag !== undefined) return `${flag} reproduces an older reading`;
  if (instrumentFailures.length > 0) {
    return `the instrument reported ${instrumentFailures.length} failure(s) of its own; its reading is not a measurement`;
  }
  return null;
}

export function buildIndicator(result, {
  negativeControls,
  producedAt,
  commit = null,
  threshold = INDICATOR_THRESHOLD,
}) {
  const axes = axisReadings(result, { threshold });
  const negative = negativeTest(result, negativeControls);
  const at = AXIS_IDS.filter((axis) => axes[axis].status === 'at-threshold').length;
  return {
    id: INDICATOR_ID,
    gate: INDICATOR_GATE,
    producedAt,
    value: headline(axes, negative, { threshold }),
    target: `${AXIS_IDS.length}/${AXIS_IDS.length} axes at >= ${threshold} % and the negative test green`,
    met: at === AXIS_IDS.length && negative.status === 'green',
    commit,
    catalogRevision: result.revision?.digest ?? null,
    browser: result.browser?.browserVersion ?? null,
    bundleMode: result.bundleMode ?? null,
    verticals: result.verticals,
    themes: result.themes,
    threshold,
    basis: 'declared population of check/theme/population; unmountable and unsettled families count as non-movers; '
      + 'unobservable families are reported per axis beside the denominator and never subtracted from it',
    axes,
    negativeTest: negative,
    // The real-render rows measured and refused on states, with the reach this
    // run read on each: evidence in the artifact, not only in a receipt.
    realRender: { statesRefused: result.realRender?.statesRefused ?? [] },
  };
}

export function writeIndicator(artifact, root) {
  const target = resolve(root, INDICATOR_PATH);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(artifact, null, 2)}\n`);
  return target;
}
