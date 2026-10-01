/**
 * Programme indicator 7 (STATUS row 7), read off one full `axis-difference` run and published where
 * `readProgramIndicatorMeasurement` looks. Percentages use the DECLARED population (kit rule 4).
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { AXIS_IDS, AXIS_POPULATION_LAWS } from '../../population/index.mjs';

export const INDICATOR_ID = 'tenant-difference-by-axis';
export const INDICATOR_PATH = `artifacts/quality/indicators/${INDICATOR_ID}/index.json`;
export const INDICATOR_GATE = 'axis-difference (`capability-propagation` by axis, WO-EVI-02)';
export const INDICATOR_THRESHOLD = 80;

/**
 * What the EFFECTIVE reading divides by, printed with it. It is a reported
 * reading and never an axis status: the status reads the declared basis (kit
 * rule 4), so a crossing on the effective reading alone -- for instance the one
 * the STATES-K population law makes on states (118/147 = 80.3 % effective,
 * 118/155 = 76.1 % declared) -- is definitional and moves no status.
 */
export const EFFECTIVE_DEFINITION = 'declared families that are mountable and not unsettled (declared minus unmountable minus unsettled); '
  + 'reported, never the status';
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
      effectiveDefinition: EFFECTIVE_DEFINITION,
      populationLaw: AXIS_POPULATION_LAWS[axis] ?? null,
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
    + ` (${at.length > 0 ? at.join(', ') : 'none'}; effective-denominator reading ${effective}/${AXIS_IDS.length}, never the status)`
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

/**
 * THE CHROMATIC STATES READING, reported APART (owner directive 2026-10-01;
 * shape ruled by the CR-1 review): a sibling of `axes`, never under it, with no
 * status, no threshold and no `met`. It reads `result.chromaticStates` and the
 * negative test, and writes nothing either of them is built from, so `value`,
 * `met`, `target`, `axes` and `negativeTest` are the same with or without it.
 */
export const CHROMATIC_LAW = 'owner directive 2026-10-01: the six axes stay non-chromatic; the chromatic states effect is '
  + 'proven and reported apart, never merged into an axis numerator, never a status';
export const CHROMATIC_PAIR = 'the states positive pair (states.emphasis subtle -> strong, states.focus-style ring -> glow)';

/** The keys a reported-apart reading may never carry: any of them is a status in disguise. */
export const CHROMATIC_FORBIDDEN_KEYS = Object.freeze(['status', 'threshold', 'met', 'effectiveAtThreshold']);

const CONTROL_READS = Object.freeze({
  'palette-only': 'reference, not a zero: palette is chromatic by construction',
});

function controlLaw(control) {
  if (control === undefined) return 'not run';
  if (control.status === 'green') return `0 on ${control.measuredAtZero}/${control.expected} (the law)`;
  if (control.status === 'red') return `RED: moved on ${control.moved.length}/${control.expected}`;
  return `not measured on ${control.unmeasured.length}/${control.expected}`;
}

export function chromaticStatesReading(result, negative) {
  const reading = result.chromaticStates;
  if (reading === undefined) return undefined;
  const row = result.denominatorReconciliation?.states;
  const declared = row?.declared ?? 0;
  const effective = row?.effective ?? null;
  const ofScenario = (scenario, vertical, theme) => reading.cells.find((cell) => cell.scenario === scenario
    && cell.vertical === vertical && cell.theme === theme);
  const cells = expectedCells(result).map(({ vertical, theme }) => {
    const cell = ofScenario('states', vertical, theme);
    if (cell === undefined) return { vertical, theme, measured: false, reason: 'no states pair was read' };
    // The axes' own denominator for this cell, so the two readings divide by the same families.
    const axisCell = result.cells.find((entry) => entry.kind === 'positive' && entry.axis === 'states'
      && entry.vertical === vertical && entry.theme === theme);
    const denominator = axisCell?.denominator ?? effective ?? 0;
    return {
      vertical,
      theme,
      measured: true,
      moved: cell.moved,
      restIsolated: cell.restIsolated,
      percentDeclared: round(percent(cell.moved, declared)),
      percentEffective: round(percent(cell.moved, denominator)),
      chromaticOnly: [...(cell.chromaticOnly ?? [])],
      nonChromatic: cell.nonChromatic,
      byChannel: { ...cell.byChannel },
      halves: { ...cell.halves },
      movedIds: [...cell.movedIds],
    };
  });
  const measured = cells.filter((cell) => cell.measured);
  const worst = measured.length === 0 ? null : measured.reduce((low, cell) => (cell.moved < low.moved ? cell : low));
  const best = measured.length === 0 ? null : measured.reduce((high, cell) => (cell.moved > high.moved ? cell : high));
  const chromaticOnly = [...new Set(measured.flatMap((cell) => cell.chromaticOnly))].sort();
  const unreached = (result.unobservable?.states ?? []).filter((entry) => entry.class === 'colour-only')
    .map((entry) => entry.family);
  const controls = {};
  for (const id of [...new Set(reading.cells.filter((cell) => cell.kind === 'negative').map((cell) => cell.scenario))]) {
    const own = reading.cells.filter((cell) => cell.scenario === id);
    controls[id] = {
      nonChromatic: controlLaw(negative.controls[id]),
      chromatic: Math.max(...own.map((cell) => cell.moved)),
      chromaticByCell: own.map((cell) => ({ where: `${cell.vertical}/${cell.theme}`, moved: cell.moved })),
      channels: [...new Set(own.flatMap((cell) => Object.keys(cell.byChannel)))].sort(),
      reads: CONTROL_READS[id] ?? 'reference, not a zero: a chromatic reading has no 0 % law',
    };
  }
  const every = worst !== null && measured.length === cells.length && worst.moved === best.moved;
  const palette = controls['palette-only'];
  const line = worst === null
    ? 'chromatic-states (reported apart, never a status): NOT MEASURED'
    : `chromatic-states (reported apart, never a status): ${worst.moved}/${declared} declared (${worst.percentDeclared} %), `
      + `${worst.moved}/${effective} effective (${worst.percentEffective} %), `
      + `${every ? 'every cell' : `worst cell (best ${best.moved}; ${cells.length - measured.length} unmeasured)`}; `
      + `rest-isolated ${worst.restIsolated}; chromatic-only: ${chromaticOnly.join(', ') || 'none'}; `
      + `unreached: ${unreached.length} colour-only families`
      + (palette === undefined ? '' : `; palette-only non-chromatic ${palette.nonChromatic.replace(' (the law)', '')} | chromatic ${palette.chromatic} (reference)`);
  return {
    kind: 'reported-apart',
    law: CHROMATIC_LAW,
    apartFrom: 'axes.states',
    pair: CHROMATIC_PAIR,
    properties: [...reading.properties],
    embedded: [...reading.embedded],
    scene: reading.scene,
    declared,
    effective,
    cells,
    worstPercentDeclared: worst?.percentDeclared ?? null,
    worstPercentEffective: worst?.percentEffective ?? null,
    chromaticOnly,
    // Pinned by name in the instrument (`CHROMATIC_ONLY_STATES`) and refused on
    // a full run if it drifts: data-table is a states NON-mover on the six axes,
    // so a merge of this reading would add exactly it to the states numerator.
    chromaticOnlyPinned: [...reading.pinnedChromaticOnly],
    // The worst cell's breakdown; every cell carries its own above.
    byChannel: worst === null ? {} : { ...worst.byChannel },
    halves: worst === null ? {} : { ...worst.halves },
    unreached,
    controls,
    line,
  };
}

/**
 * THE SEPARATION, on the artifact itself: `axes` holds the six axes and
 * nothing else, and the chromatic block carries no status at any depth.
 * `buildIndicator` refuses to return an artifact that fails it.
 */
export function indicatorSeparationFailures(artifact) {
  const failures = [];
  const keys = Object.keys(artifact.axes ?? {});
  if (keys.length !== AXIS_IDS.length || keys.some((key, index) => key !== AXIS_IDS[index])) {
    failures.push(`axes holds ${keys.join(', ')}; it holds the six axes (${AXIS_IDS.join(', ')}) and nothing else`);
  }
  const block = artifact.chromaticStates;
  if (block !== undefined) {
    for (const entry of [block, ...(block.cells ?? [])]) {
      for (const key of CHROMATIC_FORBIDDEN_KEYS) {
        if (Object.hasOwn(entry, key)) failures.push(`chromaticStates carries \`${key}\`; it is reported apart, never a status`);
      }
    }
  }
  return failures;
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
  const chromaticStates = chromaticStatesReading(result, negative);
  const artifact = {
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
      + 'unobservable families are reported per axis beside the denominator and never subtracted from it; '
      + `the effective reading is ${EFFECTIVE_DEFINITION}`,
    axes,
    // A SIBLING of `axes`, never under it: a seventh key there is a merge
    // waiting for an `Object.keys(axes)` consumer.
    ...(chromaticStates === undefined ? {} : { chromaticStates }),
    negativeTest: negative,
    // The real-render rows measured and refused on states, with the reach this
    // run read on each: evidence in the artifact, not only in a receipt.
    realRender: { statesRefused: result.realRender?.statesRefused ?? [] },
  };
  const failures = indicatorSeparationFailures(artifact);
  if (failures.length > 0) throw new Error(`tenant-difference-by-axis: ${failures.join(' | ')}`);
  return artifact;
}

export function writeIndicator(artifact, root) {
  const target = resolve(root, INDICATOR_PATH);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(artifact, null, 2)}\n`);
  return target;
}
