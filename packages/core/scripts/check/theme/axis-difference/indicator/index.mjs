/**
 * Programme indicator 7 (STATUS row 7), read off one full `axis-difference` run and published where
 * `readProgramIndicatorMeasurement` looks. Percentages use the DECLARED population (kit rule 4).
 */

import { createHash } from 'node:crypto';
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

/**
 * THE NON-MOVERS BY NAME (2026-10-03). A count cannot be diffed: 118 -> 118
 * hid two families gained and two lost. Every declared family that did not
 * move is named per cell, and per axis in exactly one class. The classes
 * explain a non-mover; none of them is ever subtracted from the declared
 * denominator, and no status reads them.
 */
export const NON_MOVER_CLASSES = Object.freeze(['unmountable', 'unsettled', 'unobservable', 'unreached', 'measuredNotMoving']);

/** One axis's non-movers, classed in `NON_MOVER_CLASSES` order: the first class that names a family keeps it. */
export function nonMoversByClass(result, axis, nonMovers) {
  const row = result.denominatorReconciliation?.[axis] ?? {};
  // Reach is read on the states axis alone: a family NEITHER half selects a state rule of.
  const neither = axis === 'states' ? (result.nativePseudos?.reach?.neither ?? []).map((entry) => entry.family) : [];
  const named = {
    unmountable: row.unmountableFamilies ?? [],
    unsettled: row.unsettledFamilies ?? [],
    unobservable: (result.unobservable?.[axis] ?? []).map((entry) => entry.family),
    unreached: neither,
  };
  const classes = Object.fromEntries(NON_MOVER_CLASSES.map((kind) => [kind, []]));
  for (const family of nonMovers) {
    const kind = NON_MOVER_CLASSES.find((entry) => named[entry]?.includes(family)) ?? 'measuredNotMoving';
    classes[kind].push(family);
  }
  return classes;
}

/** `at-threshold` needs every (vertical, mode) cell present, evidential and at the bar on the declared denominator. */
export function axisReadings(result, { threshold = INDICATOR_THRESHOLD } = {}) {
  const readings = {};
  for (const axis of AXIS_IDS) {
    const row = result.denominatorReconciliation?.[axis];
    const declared = row?.declared ?? 0;
    const declaredIds = row?.declaredFamilies ?? null;
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
        // Null when the run did not publish the names; never a guessed list.
        nonMoverIds: declaredIds === null || cell.movedIds === undefined
          ? null
          : declaredIds.filter((family) => !cell.movedIds.includes(family)).sort(),
      };
    });
    const measuredCells = cells.filter((cell) => cell.measured);
    // A family is a non-mover of the AXIS when any measured cell leaves it out.
    const nonMovers = measuredCells.length === 0 || measuredCells.some((cell) => cell.nonMoverIds === null)
      ? null
      : [...new Set(measuredCells.flatMap((cell) => cell.nonMoverIds))].sort();
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
      nonMovers,
      nonMoversByClass: nonMovers === null ? null : nonMoversByClass(result, axis, nonMovers),
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
 * What a PUBLISHED reading was taken from, beyond the run itself: a committed
 * tree, a `dist` whose build stamp is a content proof of the sources on disk,
 * and the catalog the commit carries. Judged only when the run may otherwise
 * publish; a `--no-write` measurement never reaches it. Each fact is `null`
 * when it could not be established, and that refuses too.
 *
 * @param {{ dirty: readonly string[] | null, dist: { ok: boolean, failures: readonly string[] } | null,
 *   catalog: { run: string | null, head: string | null } | null }} provenance
 * @returns {string | null}
 */
export function provenanceRefusal({ dirty = null, dist = null, catalog = null } = {}) {
  if (dirty === null) return 'the working tree could not be read from git; a published reading names the commit it was taken on';
  if (dirty.length > 0) {
    return `the working tree has ${dirty.length} uncommitted path(s) under the package (${dirty.slice(0, 3).join(', ')}`
      + `${dirty.length > 3 ? ', ...' : ''}); the indicator would stamp HEAD on a reading of something else`;
  }
  if (dist === null) return 'the dist build stamp could not be checked; decisions compile through dist';
  if (!dist.ok) {
    return `dist is not built from the sources on disk (${dist.failures[0] ?? 'no reason given'}); `
      + 'decisions compile through dist, so the arms would be an older compiler\'s';
  }
  if (catalog === null || catalog.run === null || catalog.head === null) {
    return 'the catalog revision of the commit could not be read; the populations are read at a catalog revision';
  }
  if (catalog.run !== catalog.head) {
    return `the run read catalog ${catalog.run} and the commit carries ${catalog.head}; the populations are not the commit's`;
  }
  return null;
}

/**
 * THE GATE'S OWN PROVENANCE (owner ruling R33; audit W19-R33 D2). A run that
 * is asked for a VERDICT -- `--threshold` -- judges the declared population
 * against a build, so the two facts that tie the reading to that build must be
 * proven or there is no verdict: `dist` is built from the sources on disk, and
 * the catalog the populations were read at is the commit's. They are the same
 * two facts, judged by the same function and refused in the same words, that
 * already refuse publication; here they fail the run instead of withholding a
 * file, and `--no-write` does not excuse them.
 *
 * The working tree at large is deliberately NOT judged: a gate is run on the
 * tree it gates, uncommitted or not, and a rebuilt `dist` over it is a proven
 * reading of that tree. A dirty tree still refuses PUBLICATION, as before.
 * ONE uncommitted path does refuse the gate: the catalog. Its fact is read
 * against HEAD's blob, so an edited, uncommitted catalog -- or a checkout git
 * cannot read (no `.git`, no `git` on PATH) -- is refused in the catalog's
 * words. The verdict on a catalog edit is taken after its commit.
 *
 * Without a threshold nothing is asked of the run and nothing is refused.
 *
 * @param {{ dist?: { ok: boolean, failures: readonly string[] } | null,
 *   catalog?: { run: string | null, head: string | null } | null }} provenance
 * @param {{ threshold?: number | null }} [options]
 * @returns {string | null}
 */
export function gateProvenanceRefusal({ dist = null, catalog = null } = {}, { threshold = null } = {}) {
  if (threshold === null) return null;
  return provenanceRefusal({ dirty: [], dist, catalog });
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
    // a full run if it drifts: a family named here is a states NON-mover on the
    // six axes, so a merge of this reading would add exactly it to the numerator.
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

/**
 * THE NAMES AGREE WITH THE COUNTS, or the artifact is not built: a cell's
 * non-mover list is exactly `declared - moved` long, and the per-axis classes
 * partition the axis list -- every family once, none invented.
 */
export function nonMoverFailures(axes) {
  const failures = [];
  for (const [axis, reading] of Object.entries(axes)) {
    for (const cell of reading.cells.filter((entry) => entry.measured && entry.nonMoverIds !== null)) {
      const where = `${axis} ${cell.vertical}/${cell.theme}`;
      if (cell.nonMoverIds.length !== cell.declared - cell.moved) {
        failures.push(`${where}: ${cell.nonMoverIds.length} non-mover(s) named for ${cell.declared} declared - ${cell.moved} moved`);
      }
    }
    if (reading.nonMovers === null) continue;
    const classed = NON_MOVER_CLASSES.flatMap((kind) => reading.nonMoversByClass[kind]);
    if (classed.length !== reading.nonMovers.length || new Set(classed).size !== classed.length
      || classed.some((family) => !reading.nonMovers.includes(family))) {
      failures.push(`${axis}: the non-mover classes name ${classed.length} famil(ies) for ${reading.nonMovers.length} non-mover(s)`);
    }
  }
  return failures;
}

export function buildIndicator(result, {
  negativeControls,
  producedAt,
  commit = null,
  threshold = INDICATOR_THRESHOLD,
  inputDigest = null,
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
    // What the reading was taken from, so `--verify-indicator` can tell a
    // reading of this tree from a reading of another one. `null` never verifies.
    inputDigest,
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
    // The states movers counted through a width alone, pinned by name, each
    // with its open defect and receiver; and what the measured cells read.
    statesWidthOnly: (result.limits?.states?.widthOnly ?? []).map((entry) => ({ ...entry, properties: [...(entry.properties ?? [])] })),
    statesWidthOnlyObserved: [...new Set((result.cells ?? [])
      .filter((cell) => cell.kind === 'positive' && cell.axis === 'states')
      .flatMap((cell) => (cell.widthOnly ?? []).map((entry) => entry.family)))].sort(),
    // States non-movers whose paint follows the tenant outside the scene's reach: a note, never a class.
    statesNonMoverNotes: (result.limits?.states?.nonMoverNotes ?? []).map((note) => ({ ...note })),
  };
  const failures = [...indicatorSeparationFailures(artifact), ...nonMoverFailures(axes)];
  if (failures.length > 0) throw new Error(`tenant-difference-by-axis: ${failures.join(' | ')}`);
  return artifact;
}

/**
 * THE INPUT DIGEST (audit W19-R33 P3): the one fact a published reading lacked.
 * A reading names its catalog, its browser and its commit, and none of the
 * three says whether a skin, a derivator or the instrument itself moved since.
 * The digest is taken over three named parts, recorded at publication and
 * recomputed by `--verify-indicator`:
 *
 *   sourceHash             every shipped file under `src/` -- the skins, the
 *                          compiler sources and the catalog the arms compile
 *                          through -- by the build stamp's own hash;
 *   buildInputFingerprint  the stamp's content proof of everything else that
 *                          steers `dist`: lockfile, package and build config;
 *   instrument             the probe's own module graph and the data files
 *                          beside it.
 *
 * The parts are kept beside the digest so a stale reading says WHICH of them
 * moved. The digest is derived from them and from nothing else; a recorded
 * digest its own parts do not reproduce is refused as malformed.
 */
export const INPUT_DIGEST_ALGORITHM = 'sha256';
export const INPUT_DIGEST_PARTS = Object.freeze(['sourceHash', 'buildInputFingerprint', 'instrument']);
const HEX_64 = /^[0-9a-f]{64}$/u;

/** The digest of the named parts, in `INPUT_DIGEST_PARTS` order. Throws on a part that is not a sha256. */
export function inputDigestOf(parts) {
  for (const name of INPUT_DIGEST_PARTS) {
    if (typeof parts?.[name] !== 'string' || !HEX_64.test(parts[name])) {
      throw new Error(`tenant-difference-by-axis: input digest part \`${name}\` is not a sha256 hex digest`);
    }
  }
  const ordered = Object.fromEntries(INPUT_DIGEST_PARTS.map((name) => [name, parts[name]]));
  return {
    algorithm: INPUT_DIGEST_ALGORITHM,
    digest: createHash(INPUT_DIGEST_ALGORITHM)
      .update(INPUT_DIGEST_PARTS.map((name) => `${name}\0${ordered[name]}`).join('\n'))
      .digest('hex'),
    parts: ordered,
  };
}

/** Why a value is not an input digest this module wrote, or `null`. */
export function inputDigestShapeFailure(value) {
  if (value === null || value === undefined) return 'records no input digest';
  if (typeof value !== 'object' || Array.isArray(value)) return 'records an input digest that is not an object';
  const keys = Object.keys(value).sort();
  if (keys.join(',') !== 'algorithm,digest,parts') return `records an input digest with the keys ${keys.join(', ') || '(none)'}`;
  if (value.algorithm !== INPUT_DIGEST_ALGORITHM) return `records an input digest under \`${String(value.algorithm)}\``;
  const partKeys = typeof value.parts === 'object' && value.parts !== null && !Array.isArray(value.parts)
    ? Object.keys(value.parts).sort()
    : null;
  if (partKeys === null || partKeys.join(',') !== [...INPUT_DIGEST_PARTS].sort().join(',')) {
    return `records an input digest whose parts are not exactly ${INPUT_DIGEST_PARTS.join(', ')}`;
  }
  let derived;
  try {
    derived = inputDigestOf(value.parts);
  } catch {
    return 'records an input digest with a part that is not a sha256 hex digest';
  }
  if (derived.digest !== value.digest) return 'records an input digest its own parts do not reproduce';
  return null;
}

/**
 * THE INPUTS DID NOT MOVE UNDER THE RUN (review W23-P3 F1). The measurement
 * reads its inputs minutes before publication; a digest taken only at
 * publication would stamp a commit landed in between onto a reading of the
 * inputs before it, and that reading would then verify as fresh. `before` is
 * read ahead of the measurement, `after` at publication; `null` only when both
 * are the same well-formed digest, the refusal otherwise.
 */
export function inputDigestDriftRefusal(before, after) {
  for (const [when, value] of [['before the measurement', before], ['at publication', after]]) {
    const malformed = inputDigestShapeFailure(value);
    if (malformed !== null) return `the input digest taken ${when} ${malformed}; a published reading names the inputs it read`;
  }
  if (before.digest === after.digest) return null;
  const moved = INPUT_DIGEST_PARTS.filter((name) => before.parts[name] !== after.parts[name]);
  return `the inputs moved during the measurement: it began on ${before.digest.slice(0, 16)} and they are ${after.digest.slice(0, 16)} `
    + `at publication (moved: ${moved.join(', ')}); the reading is of neither`;
}

/**
 * EVERY TOP-LEVEL FIELD `buildIndicator` WRITES, and the one it writes only on
 * a run that carries the chromatic reading. `--verify-indicator` refuses a
 * file with a field outside the two lists or without one of the first: a
 * reading in a shape this module did not write is not this module's reading.
 */
export const INDICATOR_FIELDS = Object.freeze([
  'id', 'gate', 'producedAt', 'value', 'target', 'met', 'commit', 'catalogRevision', 'browser', 'bundleMode',
  'inputDigest', 'verticals', 'themes', 'threshold', 'basis', 'axes', 'negativeTest', 'realRender',
  'statesWidthOnly', 'statesWidthOnlyObserved', 'statesNonMoverNotes',
]);
export const INDICATOR_OPTIONAL_FIELDS = Object.freeze(['chromaticStates']);

const sameSet = (left, right) => Array.isArray(left) && left.length === right.length
  && new Set(left).size === left.length && left.every((entry) => right.includes(entry));
const spelled = (value) => (value === undefined ? 'nothing' : JSON.stringify(value));

/**
 * MAY A PUBLISHED READING STAND IN FOR A MEASUREMENT OF THIS TREE. Every
 * reason it may not, by name; empty only when the shape is the one this module
 * writes AND the reading was taken at the requested threshold, on the current
 * catalog, on the fleet, in the Chromium the locked Playwright pins and from
 * the inputs on disk. A current fact that could not be established is `null`,
 * and `null` refuses: nothing here is ever skipped.
 *
 * @param {unknown} indicator the parsed artifact
 * @param {{ threshold: number | null, catalogRevision: string | null, browser: string | null,
 *   inputDigest: { digest: string, parts: Record<string, string> } | null }} current
 * @returns {string[]}
 */
export function indicatorFreshnessRefusals(indicator, { threshold = null, catalogRevision = null, browser = null, inputDigest = null } = {}) {
  if (typeof indicator !== 'object' || indicator === null || Array.isArray(indicator)) {
    return ['shape: the indicator is not a JSON object'];
  }
  const refusals = [];
  const known = [...INDICATOR_FIELDS, ...INDICATOR_OPTIONAL_FIELDS];
  const unknown = Object.keys(indicator).filter((key) => !known.includes(key));
  if (unknown.length > 0) refusals.push(`unknown fields: ${unknown.join(', ')} — not written by the indicator's writer`);
  const missing = INDICATOR_FIELDS.filter((key) => !Object.hasOwn(indicator, key));
  if (missing.length > 0) {
    refusals.push(`missing fields: ${missing.join(', ')}${missing.includes('inputDigest')
      ? ' — a reading published before the input digest existed cannot be verified; republish it' : ''}`);
  }
  if (indicator.id !== INDICATOR_ID) refusals.push(`id: the file is ${spelled(indicator.id)}, not ${INDICATOR_ID}`);

  if (typeof threshold !== 'number' || !Number.isFinite(threshold)) {
    refusals.push('threshold: no threshold was requested, so there is nothing to verify the reading against');
  } else if (indicator.threshold !== threshold) {
    refusals.push(`threshold mismatch: the indicator was published at ${spelled(indicator.threshold)} and ${threshold} was requested`);
  }

  if (catalogRevision === null) {
    refusals.push('catalog: the current catalog digest could not be read');
  } else if (indicator.catalogRevision !== catalogRevision) {
    refusals.push(`stale catalog: the indicator was read at ${spelled(indicator.catalogRevision)} and the catalog is now ${catalogRevision}`);
  }

  if (!sameSet(indicator.verticals, FLEET_VERTICALS)) {
    refusals.push(`verticals: ${spelled(indicator.verticals)} are not the fleet's (${FLEET_VERTICALS.join(', ')})`);
  }
  if (!sameSet(indicator.themes, FLEET_THEMES)) {
    refusals.push(`themes: ${spelled(indicator.themes)} are not the fleet's (${FLEET_THEMES.join(', ')})`);
  }

  // Exact equality, and an empty pin is no pin: `149.0.7827.5` is not `149.0.7827.55`, and `''` equals nothing.
  if (typeof browser !== 'string' || browser === '') {
    refusals.push('browser: the Chromium version the locked Playwright pins could not be read');
  } else if (indicator.browser !== browser) {
    refusals.push(`old browser: the indicator was read in Chromium ${spelled(indicator.browser)} and the locked Playwright pins ${browser}`);
  }

  if (Object.hasOwn(indicator, 'inputDigest')) {
    const malformed = inputDigestShapeFailure(indicator.inputDigest);
    if (malformed !== null) {
      refusals.push(`input digest: the indicator ${malformed}`);
    } else if (inputDigest === null) {
      refusals.push('input digest: the current inputs could not be digested');
    } else if (indicator.inputDigest.digest !== inputDigest.digest) {
      const moved = INPUT_DIGEST_PARTS.filter((name) => indicator.inputDigest.parts[name] !== inputDigest.parts?.[name]);
      refusals.push(
        `stale input digest: the indicator was read from ${indicator.inputDigest.digest.slice(0, 16)} and the inputs are now `
        + `${inputDigest.digest.slice(0, 16)} (moved: ${moved.join(', ') || 'unnamed'})`,
      );
    }
  }
  return refusals;
}

/**
 * THE VERDICT OF A FRESH READING: its declared-basis status, axis by axis.
 * The status is RE-DERIVED from the published cells -- every fleet
 * (vertical, mode) cell measured, the worst `moved / declared` at the bar --
 * and a recorded status the cells do not reproduce is a failure of its own, so
 * a hand-edited `status` or `met` buys nothing. The effective reading is
 * carried in `lines` to be printed and is read by nothing here. A negative
 * test that is not green fails, exactly as it fails the measuring run.
 *
 * @returns {{ failures: string[], lines: string[], atThreshold: number, effectiveAtThreshold: number }}
 */
export function indicatorDeclaredBasisVerdict(indicator, threshold) {
  const failures = [];
  const lines = [];
  const axes = typeof indicator?.axes === 'object' && indicator.axes !== null ? indicator.axes : {};
  const keys = Object.keys(axes);
  if (keys.length !== AXIS_IDS.length || keys.some((key, index) => key !== AXIS_IDS[index])) {
    failures.push(`axes holds ${keys.join(', ') || 'nothing'}; a verdict needs the six axes (${AXIS_IDS.join(', ')}) and nothing else`);
    return { failures, lines, atThreshold: 0, effectiveAtThreshold: 0 };
  }
  let atThreshold = 0;
  let effectiveAtThreshold = 0;
  for (const axis of AXIS_IDS) {
    const reading = axes[axis] ?? {};
    const declared = reading.declared;
    const cells = Array.isArray(reading.cells) ? reading.cells : [];
    const fleet = FLEET_VERTICALS.flatMap((vertical) => FLEET_THEMES.map((theme) => ({ vertical, theme })));
    const own = fleet.map(({ vertical, theme }) => cells.filter((cell) => cell?.vertical === vertical && cell?.theme === theme));
    const sound = Number.isInteger(declared) && declared > 0 && cells.length === fleet.length
      && own.every((matches) => matches.length === 1 && matches[0].measured === true
        && Number.isInteger(matches[0].moved) && matches[0].moved >= 0 && matches[0].moved <= declared
        && matches[0].declared === declared);
    let derived = 'not-measured';
    let worst = null;
    if (sound) {
      worst = own.map((matches) => matches[0]).reduce((low, cell) => (cell.moved < low.moved ? cell : low));
      // Rounded as the writer rounds it: the status the cells reproduce is the writer's own.
      derived = round(percent(worst.moved, declared)) >= threshold ? 'at-threshold' : 'below-threshold';
    }
    if (reading.status !== derived) {
      failures.push(`${axis}: the indicator records status ${spelled(reading.status)} and its own cells read ${derived}; the file is not one reading`);
    } else if (derived === 'below-threshold') {
      failures.push(
        `${axis}: ${round(percent(worst.moved, declared)).toFixed(1)} % < ${threshold} % on the declared basis on ${worst.vertical}/${worst.theme} `
        + `(${worst.moved}/${declared} declaring families; the effective reading is reported, never the status)`,
      );
    } else if (derived === 'not-measured') {
      failures.push(`${axis}: not measured on every fleet (vertical, mode) cell; the declared-basis status needs every cell evidential`);
    } else {
      atThreshold += 1;
    }
    if (reading.effectiveAtThreshold === true) effectiveAtThreshold += 1;
    lines.push(
      `${axis.padEnd(11)} ${derived.padEnd(15)} declared ${worst === null ? 'n/a' : `${worst.moved}/${declared} = ${round(percent(worst.moved, declared)).toFixed(1)} %`}`
      + ` (worst cell${worst === null ? '' : ` ${worst.vertical}/${worst.theme}`}); effective ${spelled(reading.worstPercentEffective)} % — reported, never the status`,
    );
  }
  const negative = indicator?.negativeTest?.status;
  if (negative !== 'green') {
    failures.push(`negative test ${typeof negative === 'string' ? negative.toUpperCase() : spelled(negative)} in the published reading; `
      + 'a threshold verdict needs it green, exactly as the measuring run does');
  }
  lines.push(`negative test ${typeof negative === 'string' ? negative.toUpperCase() : spelled(negative)}`);
  return { failures, lines, atThreshold, effectiveAtThreshold };
}

export function writeIndicator(artifact, root) {
  const target = resolve(root, INDICATOR_PATH);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(artifact, null, 2)}\n`);
  return target;
}
