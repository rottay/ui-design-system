/**
 * The drill for the by-axis probe.
 *
 * Two halves, because the probe has two ways of lying.
 *
 * The OFFLINE half plants a defect in each verdict the gate can reach -- a
 * negative control that moved, a pair the instrument lost, a new inert pair, a
 * newly unsettled family, a family that stopped mounting, an axis under a
 * threshold -- and asserts each is named. It also asserts the attribution law
 * directly: a colour change inside a `box-shadow` is a difference on COLOUR,
 * and counting it would have put the rule's own first negative control at 1.6 %
 * on depth for a reason that has nothing to do with depth.
 *
 * FOUR of those verdicts exist because the probe got them WRONG. It applied
 * `artifact.variables` and nothing else, so a mode-routed palette read as an
 * empty delta and the run declared a live decision inert; it marked both
 * negative controls green while the states positive read 0 %, which is a
 * control that costs nothing; it then read that same witness run-globally and
 * across two catalog rows at once, so one working cell would have certified the
 * eleven vacuous ones and a move of `states.focus-style` would have certified
 * the `states.emphasis` control; and it credited a palette cell for compiling
 * NON-EMPTY maps rather than DIFFERENT ones, so a pair whose two arms are the
 * same document read as evidence. Each now has cases that fail if the behaviour
 * comes back.
 *
 * The BROWSER half is the one no unit test can replace. It drives a NULL pair
 * -- two identical documents -- through the same Chromium, the same bundle and
 * the same comparison as a real one, and requires 0 % on every axis; then it
 * drives a real pair through the same path and requires more than 0 %. An
 * instrument that reports a difference between a document and itself is
 * reporting noise, and every percentage it publishes would be that noise plus
 * whatever else it found. The same NULL pair is driven through the palette
 * CONTROL, where the honest verdict is the opposite one: 0 % between a document
 * and itself is not a control passing, it is a control with nothing to read.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  ALTERNATIVE_LIMIT,
  COMPILER_MODULE,
  allProperties,
  INERT_PAIRS,
  SCENARIOS,
  STATES_AXIS_LIMITS,
  STATES_DEPENDENT_CONTROL,
  STATE_STAMP_ATTRIBUTES,
  STATE_STAMP_ATTRIBUTE_NAMES,
  NO_WRITE_FLAG,
  NO_WRITE_ENV,
  disabledVocabularyCensus,
  publicationRefusal,
  UNMOUNTABLE_FAMILIES,
  UNSETTLED_FAMILIES,
  WITNESSED_CONTROLS,
  AS_RENDERED_ROOT_STAMPS,
  asRenderedReport,
  asRenderedRosterFailures,
  differsOnAxis,
  effectiveVariables,
  evaluate,
  familyElement,
  familyElementPart,
  familyElements,
  familyOwnsBlock,
  hasOnlyStructuralHas,
  KERNEL_STATE_TOKENS,
  logicalEdgeLonghands,
  withAsRenderedStamps,
  withoutStructuralHas,
  REAL_RENDER_AXES,
  REAL_RENDER_KEY,
  REAL_RENDER_MOUNTS,
  literalWitness,
  markupTokens,
  realRenderMountList,
  realRenderQualification,
  realRenderReport,
  realRenderRosterFailures,
  isSingleElement,
  VACUITY_PERMITTED_CONTROLS,
  NEGATIVE_CONTROLS,
  STATE_VARIANTS,
  effectiveMapDifference,
  resolvedDifference,
  rootReport,
  inertReason,
  axisByProperty,
  compoundKey,
  compoundPieces,
  denominatorLine,
  evaluatePilot,
  expandAlternatives,
  familyAxisParts,
  familyParts,
  measureCell,
  partMountReport,
  partTreeHtml,
  projectPartChain,
  selectorList,
  unmountablePartCandidates,
  partInvariantFailures,
  pairScenarios,
  pilotReadings,
  sceneHtml,
  markVacuousControls,
  namedCells,
  run,
  selectorParts,
  stripColour,
  witnessReading,
  FORCED_PSEUDO_CLASSES,
  NATIVE_PSEUDO_FORCING,
  NATIVE_PSEUDO_VARIANTS,
  calibrateNativeForcing,
  familyForcedPseudoHazards,
  forcedPseudoHazards,
  measureNativeHalf,
  mergeDepthPasses,
  readsStatesAxis,
  stateRuleProbes,
  statesHalves,
  statesReachReport,
  withoutForcedPseudos,
  REAL_RENDER_STATES_REFUSALS,
  UNOBSERVABLE_FAMILIES,
  unobservableDrift,
} from '../index.mjs';
import { AXIS_IDS, AXES, axisControls, axisPopulations, axisUnobservable, cssRules, groupControls, skinFamilies } from '../../population/index.mjs';
import { launchBrowser, resolvePlaywright } from '../../../tokens/cascade/probe/runtime/browser/index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';
import { REPRODUCTION_FLAGS } from '../indicator/index.mjs';
// S1's symbols are read off the namespace, so a drill against a tree without
// them fails as a drill rather than as a module that will not link.
import * as probe from '../index.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = findPackageRoot(HERE);
const HAS_DIST = existsSync(join(ROOT, COMPILER_MODULE));

/**
 * The browser half runs where a browser exists and SAYS SO where it does not.
 *
 * A skip with a written reason is a different thing from a silent pass: the
 * offline half above is complete on its own and runs everywhere, and the reason
 * below names exactly what is missing rather than leaving a reader to wonder
 * why the interesting case did not appear.
 */
const browserReason = (() => {
  if (!HAS_DIST) return `${COMPILER_MODULE} is absent; run pnpm build`;
  try {
    resolvePlaywright();
    return false;
  } catch (error) {
    return `no Chromium reachable: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`;
  }
})();

/** One cell of the shape the evaluator reads, so a case only changes what it is about. */
const cell = (over = {}) => ({
  vertical: 'bithire',
  theme: 'light',
  scenario: 'shape',
  kind: 'positive',
  axis: 'shape',
  compiledA: 5,
  compiledB: 5,
  appliedA: 5,
  appliedB: 5,
  channels: 5,
  differing: 5,
  resolvedDiffering: 5,
  evidential: true,
  denominator: 100,
  moved: 90,
  percent: 90,
  movedFamilies: [],
  ...over,
});

/**
 * One cell of the witnessed control, and one witness reading for it.
 *
 * They are separate because the cases below vary them separately: the standing
 * of a cell now depends on the positive measured in ITS vertical and mode AND
 * on what the control's own row moved THERE, and a helper that fused the two
 * could not plant a case where only one of them holds.
 */
const control = (over = {}) => cell({
  kind: 'negative',
  scenario: STATES_DEPENDENT_CONTROL,
  moved: 0,
  percent: 0,
  ...over,
});

const witness = (over = {}) => {
  const moved = over.moved ?? 0;
  const ids = Array.from({ length: moved }, (_, index) => `witness-${index}`);
  return {
    kind: 'axis-positive',
    axis: 'states',
    control: 'states.emphasis',
    positive: 'states',
    moved,
    denominator: 148,
    // Published in full, as `witnessReading` does.
    movedFamilies: ids.map((family) => ({ family, property: 'opacity' })),
    movedIds: ids,
    ...over,
  };
};

/** The live unobservable set in the shape `run` publishes it, read off the pin. */
const pinnedUnobservable = () => Object.fromEntries(Object.entries(UNOBSERVABLE_FAMILIES)
  .map(([axis, families]) => [axis, Object.entries(families).map(([family, kind]) => ({ family, class: kind, properties: [] }))]));

/**
 * The OTHER witness shape: what the palette control's own pair compiled to.
 *
 * Its standing does not depend on a positive at all -- the pair already differs
 * in exactly one catalog row -- so the only question is whether the two arms
 * reach the page as different documents.
 */
const mapWitness = (over = {}) => ({
  kind: 'effective-map',
  control: 'palette.seeds',
  channels: 23,
  differing: 23,
  differingChannels: [],
  ...over,
});

/** A palette-only cell that carries a real witness, so a case only changes what it is about. */
const paletteControl = (over = {}) => cell({
  kind: 'negative',
  scenario: 'palette-only',
  axis: 'shape',
  moved: 0,
  percent: 0,
  witness: mapWitness(),
  ...over,
});

const result = (cells, over = {}) => ({
  cells,
  refusals: [],
  familiesFiltered: false,
  unobservable: pinnedUnobservable(),
  families: {
    mountable: 10,
    unmountable: [...UNMOUNTABLE_FAMILIES],
    pinnedUnmountable: [...UNMOUNTABLE_FAMILIES],
    excludedUnsettled: [...UNSETTLED_FAMILIES],
    observedUnsettled: [],
    newlyUnsettled: [],
  },
  ...over,
});

/**
 * A pair the OWNER would have declared inert, injected rather than read off the
 * shipped list.
 *
 * `INERT_PAIRS` is empty on this tree and the gate is the reason it may stay
 * that way, so a drill that plants its mutants by reading `INERT_PAIRS[0]`
 * would evaporate the day the list is correct — which is exactly the day the
 * verdict most needs to be reachable.
 */
const DECLARED_INERT = Object.freeze([
  { vertical: 'evnto', scenario: 'palette-only', note: 'a planted declaration, so the verdict stays reachable' },
]);

const reading = (values) => ({ base: { probe: values }, states: {} });

describe('axis-difference — the scenarios are the rule', () => {
  it('the six positive axes are the six non-chromatic ones, one scenario each', () => {
    const positives = SCENARIOS.filter((scenario) => scenario.kind === 'positive');
    assert.deepEqual(positives.map((scenario) => scenario.axis).sort(), [...AXIS_IDS].sort());
  });

  it('BOTH negative controls of kit rule 4 exist, with the axes the rule names', () => {
    const palette = SCENARIOS.find((scenario) => scenario.id === 'palette-only');
    const emphasis = SCENARIOS.find((scenario) => scenario.id === 'states-emphasis-only');
    assert.ok(palette, 'the palette-only control is mandatory');
    assert.ok(emphasis, 'the states.emphasis-only control is mandatory');
    assert.deepEqual([...palette.expectZeroOn].sort(), [...AXIS_IDS].sort());
    assert.deepEqual([...emphasis.expectZeroOn].sort(), ['shape', 'typography']);
    assert.deepEqual(Object.keys(emphasis.a), ['states.emphasis']);
    assert.deepEqual(Object.keys(emphasis.b), ['states.emphasis']);
  });

  it('each pair differs in exactly one group of the kit', () => {
    for (const scenario of SCENARIOS) {
      assert.deepEqual(
        Object.keys(scenario.a).sort(),
        Object.keys(scenario.b).sort(),
        `${scenario.id}: the two documents must author the same rows`,
      );
      for (const id of Object.keys(scenario.a)) {
        assert.notDeepEqual(scenario.a[id], scenario.b[id], `${scenario.id}: ${id} does not differ`);
      }
    }
  });
});

describe('axis-difference — attribution, which is what makes a percentage mean something', () => {
  it('a colour inside a box-shadow is a COLOUR difference, not a depth one', () => {
    const before = reading({ 'box-shadow': 'oklab(0.536 -0.03 -0.11 / 0.05) 0px 12px 28px 0px' });
    const after = reading({ 'box-shadow': 'oklab(0.515 -0.03 -0.12 / 0.05) 0px 12px 28px 0px' });
    assert.equal(differsOnAxis('depth', before, after, 'probe'), null);
  });

  it('the SAME comparison still sees a real depth move', () => {
    const before = reading({ 'box-shadow': 'oklab(0.536 -0.03 -0.11 / 0.05) 0px 12px 28px 0px' });
    const after = reading({ 'box-shadow': 'oklab(0.536 -0.03 -0.11 / 0.05) 0px 2px 4px 0px' });
    assert.equal(differsOnAxis('depth', before, after, 'probe'), 'box-shadow');
  });

  it('stripColour covers every form a computed value carries one in', () => {
    for (const value of ['#1a2b3c', 'rgb(1, 2, 3)', 'rgba(1,2,3,.5)', 'oklab(0.5 0 0 / 1)',
      'oklch(0.5 0.1 30)', 'color(srgb 0 0 1)', 'color-mix(in srgb, red 10%, blue)', 'hsl(1 2% 3%)']) {
      assert.equal(stripColour(`0px 1px ${value}`), '0px 1px <colour>', `not stripped: ${value}`);
    }
  });

  it('the states axis reads the STATE readings, not the resting paint', () => {
    const before = { base: { probe: { 'border-top-left-radius': '4px' } }, states: { hovered: { probe: { 'border-top-left-radius': '4px' } } } };
    const after = { base: { probe: { 'border-top-left-radius': '9px' } }, states: { hovered: { probe: { 'border-top-left-radius': '4px' } } } };
    assert.equal(differsOnAxis('states', before, after, 'probe'), null, 'a resting change is not a states change');
    assert.equal(differsOnAxis('shape', before, after, 'probe'), 'border-top-left-radius');
  });
});

describe('axis-difference — the artifact is applied AS IT SHIPS', () => {
  it('a mode block overlays the base block, and only for the mode being measured', () => {
    const artifact = {
      variables: { '--ds-a': '1', '--ds-b': '2' },
      modeDeltas: [
        { mode: 'light', variables: { '--ds-b': 'light', '--ds-c': '3' } },
        { mode: 'dark', variables: { '--ds-b': 'dark' } },
      ],
    };
    assert.deepEqual(effectiveVariables(artifact, 'light'), { '--ds-a': '1', '--ds-b': 'light', '--ds-c': '3' });
    assert.deepEqual(effectiveVariables(artifact, 'dark'), { '--ds-a': '1', '--ds-b': 'dark' });
  });

  it('THE DEFECT: a mode-routed palette is not an empty artifact', () => {
    // A document that selects the vertical's non-default mode ships its palette
    // in that mode's block, and the base block can be empty by construction.
    // Reading `variables` alone read that as a decision that moves no channel.
    const routed = { variables: {}, modeDeltas: [{ mode: 'light', variables: { '--ds-color-primary': '#1F4FA8' } }] };
    assert.equal(Object.keys(routed.variables).length, 0);
    assert.equal(Object.keys(effectiveVariables(routed, 'light')).length, 1);
    assert.equal(Object.keys(effectiveVariables(routed, 'dark')).length, 0);
  });

  it('an artifact with no mode block is its base block, unchanged', () => {
    const flat = { variables: { '--ds-a': '1' }, modeDeltas: [] };
    assert.deepEqual(effectiveVariables(flat, 'light'), { '--ds-a': '1' });
  });
});

describe('axis-difference — a pair is inert when its arms PAINT the same, not when a map is empty', () => {
  const BASELINE = { '--ds-rhythm-scale': '0.85', '--ds-density-mode-factor': '0.85' };

  it('a channel an arm does not carry resolves to the scene, so an empty arm still paints', () => {
    // bithire's rhythm pair, exactly: arm A authors the vertical's own
    // compact/tight values and subtracts to nothing; arm B compiles both.
    const reading = resolvedDifference({}, { '--ds-rhythm-scale': '1.2', '--ds-density-mode-factor': '1.15' }, BASELINE);
    assert.equal(reading.channels, 2);
    assert.equal(reading.differing, 2);
    assert.deepEqual(reading.differingChannels, ['--ds-density-mode-factor', '--ds-rhythm-scale']);
  });

  it('an arm that RESTATES the value the other arm omits is inert, and the map comparator misses it', () => {
    // The honest direction the map difference cannot read: both arms paint
    // 0.85, one by authoring it and one by leaving it to the bundle.
    const explicit = { '--ds-rhythm-scale': '0.85' };
    assert.equal(resolvedDifference(explicit, {}, BASELINE).differing, 0);
    assert.equal(effectiveMapDifference(explicit, {}).differing, 1, 'which is why the map count is not the rule');
  });

  it('two arms that disagree on a shared channel are differing however the baseline reads', () => {
    assert.equal(resolvedDifference({ '--ds-rhythm-scale': '0.8' }, { '--ds-rhythm-scale': '1.2' }, BASELINE).differing, 1);
    assert.equal(resolvedDifference({ '--ds-rhythm-scale': '0.8' }, { '--ds-rhythm-scale': '0.8' }, BASELINE).differing, 0);
  });

  it('a channel the bundle never declares resolves to nothing, and an arm that sets it still moves', () => {
    assert.equal(resolvedDifference({}, { '--ds-unknown': '4px' }, BASELINE).differing, 1);
    assert.equal(resolvedDifference({}, {}, BASELINE).differing, 0);
  });

  it('THE ALIAS COUNTEREXAMPLE: a var() this reader cannot close is INDETERMINATE, never differing', () => {
    // The audit's durable probe, as data:
    // docs-engineering/archive/audits/2026-09-19-ds-4267a2904-davila/axis-alias-probe.json
    // — chromium 149.0.7827.55, scene `--ds-state-disabled-opacity: 0.5`, arm B
    // assigning `var(--ds-alias-opacity)` which is ALSO 0.5. The page painted
    // `opacity: 0.5` in both arms; the instrument reported 1 differing channel
    // and handed the pair its standing on a string.
    const probe = resolvedDifference(
      {},
      { '--ds-state-disabled-opacity': 'var(--ds-alias-opacity)' },
      { '--ds-state-disabled-opacity': '0.5' },
    );
    assert.equal(probe.differing, 0, 'a lexical alias is not evidence of a different paint');
    assert.deepEqual(probe.differingChannels, []);
    assert.equal(probe.unresolved, 1, 'and it is not silently equal either — it is unreadable, and says so');
    assert.deepEqual(probe.unresolvedChannels, ['--ds-state-disabled-opacity']);
    assert.equal(probe.source, 'offline');
  });

  it('an alias this reader CAN close reads as what it closes to — equal stays 0, POSITIVE CONTROL still moves', () => {
    const alias = (value) => ({ '--ds-alias': value, '--ds-state-disabled-opacity': 'var(--ds-alias)' });
    const scene = { '--ds-state-disabled-opacity': '0.5' };

    // The same 0.5 the scene already paints, reached through an alias: the
    // channel that CONSUMES it is not a difference, and only the alias the
    // arm newly declares is.
    const equal = resolvedDifference({}, alias('0.5'), scene);
    assert.deepEqual(equal.differingChannels, ['--ds-alias']);
    assert.equal(equal.unresolved, 0);

    // POSITIVE CONTROL, same shape, different value: the consumer moves too,
    // so the repair cannot be passing by refusing to see anything.
    const different = resolvedDifference({}, alias('0.75'), scene);
    assert.deepEqual(different.differingChannels, ['--ds-alias', '--ds-state-disabled-opacity']);
    assert.equal(different.unresolved, 0);
  });

  it('a fallback closes the reference, and a cycle closes nothing', () => {
    assert.equal(resolvedDifference({ '--ds-x': '4px' }, { '--ds-x': 'var(--ds-missing, 4px)' }, {}).differing, 0);
    // A name declared EMPTY is guaranteed-invalid to the cascade, exactly like
    // one nobody declares, so the fallback is what paints.
    assert.equal(resolvedDifference({ '--ds-x': '4px' }, { '--ds-x': 'var(--ds-y, 4px)', '--ds-y': '' }, {}).differing, 0);
    const cyclic = resolvedDifference({ '--ds-x': '4px' }, { '--ds-x': 'var(--ds-y)', '--ds-y': 'var(--ds-x)' }, {});
    assert.equal(cyclic.differing, 0);
    assert.equal(cyclic.unresolved, 2);
  });

  it('the reason a cell publishes and the reason the verdict prints are ONE sentence', () => {
    const inert = cell({ compiledA: 40, compiledB: 40, appliedA: 40, appliedB: 40,
      channels: 40, differing: 0, resolvedDiffering: 0, evidential: false });
    inert.nonEvidentialReason = inertReason(inert);
    const failures = evaluate(result([inert]));
    assert.ok(failures.some((line) => line.includes(inert.nonEvidentialReason)), failures.join(' | '));
    assert.match(inert.nonEvidentialReason, /0 differing/);
  });

  it('a witnessed control that ALSO lost its witness is still accused with the PAINT measurement', () => {
    // Two sentences, two subjects: the cell publishes why its control carries
    // no witness, and the verdict accuses the pair of painting the same. The
    // accusation must not borrow the first, or a reader is told the control is
    // vacuous where the finding is that the pair is inert.
    const inert = paletteControl({ compiledA: 40, compiledB: 40, channels: 40, differing: 0, resolvedDiffering: 0,
      witness: mapWitness({ differing: 0 }) });
    const failures = evaluate(result(markVacuousControls([inert])));
    assert.match(inert.nonEvidentialReason, /IDENTICAL effective map/);
    assert.ok(
      failures.some((line) => line.includes('resolve to the SAME paint') && line.includes('INERT_PAIRS')),
      failures.join(' | '),
    );
  });
});

describe('axis-difference — a negative control is only evidence if its decision moved', () => {
  it('the states positive at zero makes the states.emphasis control NON-EVIDENTIAL, with its reason', () => {
    const cells = markVacuousControls([
      cell({ kind: 'positive', scenario: 'states', axis: 'states', moved: 0, percent: 0 }),
      control({ axis: 'shape', witness: witness({ moved: 0 }) }),
      paletteControl(),
    ]);
    const nc2 = cells.find((entry) => entry.scenario === STATES_DEPENDENT_CONTROL);
    assert.equal(nc2.evidential, false);
    assert.match(nc2.nonEvidentialReason, /states positive moved 0 famil\(ies\) in bithire\/light/);
    assert.equal(
      cells.find((entry) => entry.scenario === 'palette-only').evidential,
      true,
      'the palette control is independent of the states axis and keeps its standing',
    );
  });

  it('the same control REGAINS its standing when the positive AND the row itself move in its cell', () => {
    const cells = markVacuousControls([
      cell({ kind: 'positive', scenario: 'states', axis: 'states', moved: 7, percent: 4.7 }),
      control({ axis: 'shape', witness: witness({ moved: 3 }) }),
    ]);
    assert.equal(cells.find((entry) => entry.scenario === STATES_DEPENDENT_CONTROL).evidential, true);
  });

  it('THE DEFECT, MIXED: one working cell certifies itself and nothing else', () => {
    // Four cells of the same control, one per shape the rule has to separate.
    // `bithire/dark` is the row that exists to keep the two halves apart: its
    // own row moved but the positive did not move THERE, so a witness read
    // run-globally would credit it off bithire/light. `evnto/light` is the
    // mirror: the positive moved there, but not because of the row this
    // control isolates.
    const cells = markVacuousControls([
      cell({ kind: 'positive', scenario: 'states', axis: 'states', vertical: 'bithire', theme: 'light', moved: 7 }),
      cell({ kind: 'positive', scenario: 'states', axis: 'states', vertical: 'bithire', theme: 'dark', moved: 0 }),
      cell({ kind: 'positive', scenario: 'states', axis: 'states', vertical: 'evnto', theme: 'light', moved: 9 }),
      cell({ kind: 'positive', scenario: 'states', axis: 'states', vertical: 'evnto', theme: 'dark', moved: 0 }),
      control({ vertical: 'bithire', theme: 'light', axis: 'shape', witness: witness({ moved: 3 }) }),
      control({ vertical: 'bithire', theme: 'light', axis: 'typography', witness: witness({ moved: 3 }) }),
      control({ vertical: 'bithire', theme: 'dark', axis: 'shape', witness: witness({ moved: 4 }) }),
      control({ vertical: 'evnto', theme: 'light', axis: 'shape', witness: witness({ moved: 0 }) }),
      control({ vertical: 'evnto', theme: 'dark', axis: 'shape', witness: witness({ moved: 0 }) }),
    ]);
    const standing = cells
      .filter((entry) => entry.scenario === STATES_DEPENDENT_CONTROL)
      .map((entry) => [`${entry.vertical}/${entry.theme} ${entry.axis}`, entry.evidential]);
    assert.deepEqual(standing, [
      ['bithire/light shape', true],
      ['bithire/light typography', true],
      ['bithire/dark shape', false],
      ['evnto/light shape', false],
      ['evnto/dark shape', false],
    ]);

    const byCell = (vertical, theme) => cells.find((entry) =>
      entry.kind === 'negative' && entry.vertical === vertical && entry.theme === theme);
    assert.match(
      byCell('bithire', 'dark').nonEvidentialReason,
      /states positive moved 0 famil\(ies\) in bithire\/dark/,
      'a positive that moved in another cell is not this cell’s witness',
    );
    assert.match(
      byCell('evnto', 'light').nonEvidentialReason,
      /states\.emphasis on its own moved 0 of 148 famil\(ies\).*not to states\.emphasis/s,
      'the states positive moves emphasis AND focus-style, so it cannot witness emphasis alone',
    );
  });

  it('the binding is per CONTROL, so a focus-only control stands or falls on its own row', () => {
    const cells = markVacuousControls([
      cell({ kind: 'positive', scenario: 'states', axis: 'states', moved: 9 }),
      control({ axis: 'shape', witness: witness({ moved: 0 }) }),
      control({
        scenario: 'states-focus-only',
        axis: 'shape',
        witness: witness({ control: 'states.focus-style', moved: 5 }),
      }),
    ], { witnessedControls: [STATES_DEPENDENT_CONTROL, 'states-focus-only'] });
    assert.equal(cells.find((entry) => entry.scenario === 'states-focus-only').evidential, true);
    assert.equal(cells.find((entry) => entry.scenario === STATES_DEPENDENT_CONTROL).evidential, false);
  });

  it('a witnessed control with NO witness measured keeps the honest NON-EVIDENTIAL verdict', () => {
    const cells = markVacuousControls([
      cell({ kind: 'positive', scenario: 'states', axis: 'states', moved: 9 }),
      cell({ kind: 'negative', scenario: STATES_DEPENDENT_CONTROL, axis: 'shape', moved: 0, percent: 0 }),
    ]);
    const nc2 = cells.find((entry) => entry.scenario === STATES_DEPENDENT_CONTROL);
    assert.equal(nc2.evidential, false);
    assert.match(nc2.nonEvidentialReason, /no witness was measured/);
  });

  it('THE DEFECT: a palette cell whose two arms compile the SAME map is NOT evidence', () => {
    // The reading this replaces: both arms compiled 23 channels, neither map
    // was empty, so the cell was credited. They are the same 23 channels.
    const cells = markVacuousControls([
      paletteControl({ vertical: 'rottay', theme: 'light', compiledA: 23, compiledB: 23,
        witness: mapWitness({ channels: 23, differing: 0 }) }),
      paletteControl({ vertical: 'evnto', theme: 'dark', compiledA: 42, compiledB: 42,
        witness: mapWitness({ channels: 42, differing: 0 }) }),
      paletteControl({ vertical: 'bithire', theme: 'light', compiledA: 40, compiledB: 40,
        witness: mapWitness({ channels: 40, differing: 17 }) }),
    ]);
    const standing = cells.map((entry) => [`${entry.vertical}/${entry.theme}`, entry.evidential]);
    assert.deepEqual(standing, [
      ['rottay/light', false],
      ['evnto/dark', false],
      ['bithire/light', true],
    ]);
    assert.match(
      cells[0].nonEvidentialReason,
      /IDENTICAL effective map in rottay\/light \(23 channel\(s\), 0 differing\)/,
      'the reason names the cell and the reading it was taken from',
    );
    assert.match(cells[0].nonEvidentialReason, /identical map = no witness this probe can read/);
  });

  it('ONE differing channel is a witness; the map size is not the reading', () => {
    const [cell1] = markVacuousControls([
      paletteControl({ witness: mapWitness({ channels: 42, differing: 1 }) }),
    ]);
    assert.equal(cell1.evidential, true);
    assert.equal(cell1.nonEvidentialReason, undefined);
  });

  it('the map witness is the DIFFERENCE between the two arms, not the size of either', () => {
    const same = { '--ds-color-primary': '#111', '--ds-color-accent': '#222' };
    assert.deepEqual(effectiveMapDifference(same, { ...same }), {
      channels: 2, differing: 0, differingChannels: [],
    });
    assert.deepEqual(effectiveMapDifference(same, { ...same, '--ds-color-accent': '#333' }), {
      channels: 2, differing: 1, differingChannels: ['--ds-color-accent'],
    });
    assert.deepEqual(
      effectiveMapDifference(same, { ...same, '--ds-color-extra': '#444' }).differing,
      1,
      'a name present in only one arm is a difference, not a match',
    );
    assert.deepEqual(effectiveMapDifference({}, {}), { channels: 0, differing: 0, differingChannels: [] });
  });

  it('the run wires the map witness from the pair it actually applied', () => {
    const reading = witnessReading({
      witness: { kind: 'effective-map', control: 'palette.seeds' },
      before: { base: {}, states: {} },
      after: { base: {}, states: {} },
      variablesA: { '--ds-color-primary': '#111' },
      variablesB: { '--ds-color-primary': '#111' },
    });
    assert.deepEqual(reading, {
      kind: 'effective-map', control: 'palette.seeds', channels: 1, differing: 0, differingChannels: [],
    });
  });

  it('the shipped control DECLARES the witness the run has to measure for it', () => {
    const emphasis = SCENARIOS.find((scenario) => scenario.id === STATES_DEPENDENT_CONTROL);
    assert.deepEqual(emphasis.witness, {
      kind: 'axis-positive', axis: 'states', control: 'states.emphasis', positive: 'states',
    });
    assert.deepEqual(
      Object.keys(emphasis.a),
      [emphasis.witness.control],
      'the witness may only name the row the control actually isolates',
    );
  });

  it('EVERY negative control declares a witness — a control with none is credited for free', () => {
    const negatives = SCENARIOS.filter((scenario) => scenario.kind === 'negative').map((scenario) => scenario.id);
    assert.deepEqual([...WITNESSED_CONTROLS].sort(), [...negatives].sort());
    const palette = SCENARIOS.find((scenario) => scenario.id === 'palette-only');
    assert.deepEqual(palette.witness, { kind: 'effective-map', control: 'palette.seeds' });
    assert.deepEqual(
      Object.keys(palette.a),
      [palette.witness.control],
      'the witness may only name the row the control actually isolates',
    );
  });

  it('the witness reading is taken from the control OWN pair, on the axis its row owns', () => {
    const before = { base: {}, states: { hovered: { probe: { 'box-shadow': 'none' }, quiet: { 'box-shadow': 'none' } } } };
    const after = { base: {}, states: { hovered: { probe: { 'box-shadow': '0 1px 2px' }, quiet: { 'box-shadow': 'none' } } } };
    const reading = witnessReading({
      witness: { axis: 'states', control: 'states.emphasis', positive: 'states' },
      before,
      after,
      denominator: ['probe', 'quiet'],
    });
    assert.equal(reading.moved, 1);
    assert.equal(reading.denominator, 2);
    assert.deepEqual(reading.movedFamilies, [{ family: 'probe', property: 'box-shadow' }]);
  });

  it('the limits that bound it are measurements, not adjectives', () => {
    const limits = STATES_AXIS_LIMITS;
    assert.equal(limits.channels.total, 28, 'the two states rows produce 28 channels');
    assert.equal(
      limits.channels.withoutReaders + limits.channels.paintingColourOnly + limits.channels.paintingInsideVocabulary,
      limits.channels.total,
      'every states channel is accounted for',
    );
    assert.equal(
      limits.declarations.pseudoClassOnly + limits.declarations.byDataState + limits.declarations.byChannelOnly,
      limits.declarations.population,
      'the three declaration kinds must partition the states population',
    );
    assert.deepEqual(limits.stampedStates, [...STATE_VARIANTS]);
    assert.ok(limits.unreachable.length >= 3, 'each limit is written out, not summarised to a flag');
  });
});

describe('axis-difference — the fixture is read off the skin, never invented', () => {
  it('prefers the data-part root and materialises its classes and its STRUCTURAL attributes', () => {
    const element = familyElement(
      ".ds-card[data-component='card'] { color: red; }\n"
      + ".ds-card.ds-card--modern[data-component='card'][data-part='root'][data-radius='md'] { padding: 1px; }",
    );
    assert.deepEqual(element.classes, ['ds-card', 'ds-card--modern']);
    // `data-component` is on every root compound this skin writes, so the root
    // it renders always carries it. `data-radius` is not: mounting it would
    // measure one configuration of the family and call it the family.
    assert.deepEqual(element.attributes, { 'data-component': 'card', 'data-part': 'root' });
  });

  it('a variant only SOME rules gate on is not admitted, and a state is never baked in', () => {
    const element = familyElement(
      ".ds-card.ds-card--modern[data-part='root'] { padding: 1px; }\n"
      + ".ds-card.ds-card--modern[data-part='root'][data-standalone='true'][data-state~='hovered'] { padding: 2px; }",
    );
    assert.deepEqual(element.attributes, { 'data-part': 'root' });
  });

  it('refuses a descendant, a pseudo-class and a foreign namespace', () => {
    assert.equal(isSingleElement('.ds-card .ds-card__body'), false);
    assert.equal(isSingleElement('.ds-card:hover'), false);
    assert.equal(isSingleElement('.ant-btn'), false);
    assert.equal(isSingleElement('.ds-card'), true);
  });

  it('a comment is not a selector', () => {
    assert.deepEqual(selectorParts('/* .ds-ghost { color: red; } */\n.ds-real { color: blue; }'), ['.ds-real']);
  });

  it('a family whose skin publishes no mountable selector is null, not a zero reading', () => {
    assert.equal(familyElement('@media (min-width: 10px) { .ds-x .ds-y { color: red; } }'), null);
  });

  it('the real corpus mounts the overwhelming majority of families', () => {
    const elements = familyElements(ROOT);
    const mountable = [...elements].filter(([, element]) => element !== null).length;
    assert.ok(elements.size > 200, `only ${elements.size} families found; the walk is broken`);
    assert.ok(mountable / elements.size > 0.85, `only ${mountable} of ${elements.size} families mount`);
  });
});

describe('axis-difference drills — every verdict is reachable', () => {
  it('MUTANT: a negative control that moved is named with the families', () => {
    const failures = evaluate(result([
      cell({ kind: 'negative', scenario: 'palette-only', axis: 'depth', moved: 3, percent: 1.6,
        movedFamilies: [{ family: 'badge', property: 'box-shadow' }] }),
    ]));
    assert.ok(failures.some((line) => line.startsWith('NEGATIVE CONTROL palette-only')), failures.join(' | '));
    assert.ok(failures.some((line) => line.includes('badge(box-shadow)')));
  });

  it('MUTANT: a palette control that has gone WHOLLY vacuous fails closed', () => {
    // Marking a cell non-evidential is what makes the verdict honest. It must
    // not also be what makes it green: a control with no standing cell left has
    // stopped being a control, and the run has nothing holding its positives up.
    const vacuous = markVacuousControls([
      paletteControl({ vertical: 'rottay', theme: 'light', witness: mapWitness({ differing: 0 }) }),
      paletteControl({ vertical: 'evnto', theme: 'dark', witness: mapWitness({ differing: 0 }) }),
    ]);
    const failures = evaluate(result(vacuous));
    assert.ok(
      failures.some((line) => line.startsWith('NEGATIVE CONTROL palette-only')
        && line.includes('all 2 of its cell(s) are NON-EVIDENTIAL')),
      failures.join(' | '),
    );
    assert.ok(failures.some((line) => line.includes('identical map = no witness')), failures.join(' | '));

    // One surviving evidential cell is enough for the control to stand.
    const survives = markVacuousControls([
      ...vacuous.map((entry) => ({ ...entry })),
      paletteControl({ vertical: 'bithire', theme: 'light', witness: mapWitness({ differing: 17 }) }),
    ]);
    assert.deepEqual(
      evaluate(result(survives)).filter((line) => line.startsWith('NEGATIVE CONTROL palette-only')),
      [],
    );
  });

  it('the ONE control allowed to be wholly vacuous is the one whose vacuity is measured', () => {
    assert.deepEqual([...VACUITY_PERMITTED_CONTROLS], [STATES_DEPENDENT_CONTROL]);
    const failures = evaluate(result([
      cell({ kind: 'positive', scenario: 'states', axis: 'states', moved: 0 }),
      control({ axis: 'shape', evidential: false, nonEvidentialReason: 'the states positive moved 0' }),
      paletteControl(),
    ]));
    assert.deepEqual(failures.filter((line) => line.startsWith('NEGATIVE CONTROL')), []);
  });

  it('a verdict that loses cells NAMES them', () => {
    assert.equal(
      namedCells([
        { vertical: 'rottay', theme: 'light', axis: 'shape' },
        { vertical: 'rottay', theme: 'light', axis: 'depth' },
        { vertical: 'evnto', theme: 'dark', axis: 'shape' },
      ]),
      'rottay/light (shape, depth); evnto/dark (shape)',
    );
  });

  it('MUTANT: a pair the instrument lost is a different verdict from an inert pair', () => {
    const lost = evaluate(result([cell({ compiledA: 40, compiledB: 41, appliedA: 0, appliedB: 41 })]));
    assert.ok(lost.some((line) => line.includes('arm A compiled 40 variables and the page applied 0')
      && line.includes('the instrument lost them')), lost.join(' | '));

    const inert = evaluate(result([cell({ vertical: 'evnto', scenario: 'palette-only', kind: 'negative',
      compiledA: 40, compiledB: 40, channels: 40, differing: 0, resolvedDiffering: 0, evidential: false })]));
    assert.ok(inert.some((line) => line.includes('resolve to the SAME paint')), inert.join(' | '));
  });

  it('MUTANT: the instrument-loss guard is PER ARM, so one empty arm cannot hide the other', () => {
    // The hole the ANDed precondition left: `compiledA > 0 && compiledB > 0`
    // was false the moment either arm was empty, so an arm that compiled 2 and
    // applied 0 beside a baseline-coincident one was never accused at all.
    const failures = evaluate(result([
      cell({ compiledA: 0, appliedA: 0, compiledB: 2, appliedB: 0, channels: 2, differing: 2, resolvedDiffering: 2 }),
    ]));
    assert.ok(
      failures.some((line) => line.includes('arm B compiled 2 variables and the page applied 0')),
      failures.join(' | '),
    );
    assert.deepEqual(failures.filter((line) => line.includes('arm A')), [], 'the empty arm applied nothing BY DESIGN');
    // And a loss is still the ONLY verdict that cell gets: an accusation of
    // inertness on top of it would be a reading of a page that never received
    // the pair.
    assert.deepEqual(failures.filter((line) => line.includes('SAME paint')), []);
  });

  it('an arm that COINCIDES with the vertical baseline is not an inert pair — the bithire rhythm case', () => {
    // bithire's preset states `density.mode: compact` and `spacing.rhythm:
    // tight`, so the arm that authors those values subtracts to an empty
    // artifact delta while painting 0.85/0.85 off the bundle. The other arm
    // compiles 1.15/1.2. The pair moves 45 of 209 families on the page, and the
    // rule that read `compiledA === 0` called it inert.
    const rhythm = cell({
      vertical: 'bithire', scenario: 'rhythm', axis: 'rhythm',
      compiledA: 0, compiledB: 2, appliedA: 0, appliedB: 2,
      channels: 2, differing: 2, resolvedDiffering: 2,
      moved: 45, denominator: 209, percent: 21.5,
    });
    assert.deepEqual(
      evaluate(result([rhythm])).filter((line) => line.includes('SAME paint')),
      [],
      'an empty delta is not an empty paint',
    );
    // And the reading it publishes is evidence, which is the whole point: the
    // old rule printed this exact 21.5 % beside [NON-EVIDENTIAL].
    assert.equal(rhythm.evidential, true);
  });

  it('every shipped inert entry names a mode, a scenario and its measurement', () => {
    for (const entry of INERT_PAIRS) {
      assert.equal(typeof entry.vertical, 'string');
      assert.equal(typeof entry.scenario, 'string');
      assert.ok(['light', 'dark'].includes(entry.theme), `${entry.vertical}: a mode-less entry excuses every cell`);
      assert.ok(
        typeof entry.note === 'string' && /\d/u.test(entry.note),
        `${entry.vertical}/${entry.theme}: an entry without a measurement is an excuse`,
      );
    }
  });

  it('a mode-scoped entry excuses ONLY that mode', () => {
    const scoped = [{ vertical: 'rottay', theme: 'dark', scenario: 'palette-only', note: 'measured 0' }];
    const empty = { scenario: 'palette-only', kind: 'negative', axis: 'depth', compiledA: 40, compiledB: 40,
      channels: 40, differing: 0, resolvedDiffering: 0, evidential: false, moved: 0, percent: 0 };
    assert.deepEqual(
      evaluate(result([cell({ vertical: 'rottay', theme: 'dark', ...empty })]), { inertPairs: scoped })
        .filter((line) => line.includes('SAME paint')),
      [],
      'the declared mode must be excused',
    );
    assert.ok(
      evaluate(result([cell({ vertical: 'rottay', theme: 'light', ...empty })]), { inertPairs: scoped })
        .some((line) => line.startsWith('rottay/light') && line.includes('SAME paint')),
      'the OTHER mode must still be accused — that is the whole point of scoping the entry',
    );
  });

  it('a declared inert pair is NOT accused, and its cells carry no credit', () => {
    const declared = DECLARED_INERT[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth',
        channels: 40, differing: 0, resolvedDiffering: 0, evidential: false, moved: 0, percent: 0 }),
      // The control still has to STAND somewhere: a run whose only palette
      // cells are inert carries no palette control, which is its own verdict.
      paletteControl({ vertical: 'bithire', axis: 'depth' }),
      cell({ kind: 'negative', scenario: 'states-emphasis-only', axis: 'shape', moved: 0, percent: 0 }),
    ]), { inertPairs: DECLARED_INERT });
    assert.deepEqual(failures, [], failures.join(' | '));
  });

  it('MUTANT: a run whose every negative cell is non-evidential carries no control at all', () => {
    const declared = DECLARED_INERT[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth',
        channels: 40, differing: 0, resolvedDiffering: 0, evidential: false, moved: 0, percent: 0 }),
    ]), { inertPairs: DECLARED_INERT });
    assert.ok(failures.some((line) => line.includes('carries no negative control at all')), failures.join(' | '));
  });

  it('MUTANT: an inert pair that started moving must be unpinned', () => {
    const declared = DECLARED_INERT[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth', moved: 0, percent: 0 }),
    ]), { inertPairs: DECLARED_INERT });
    assert.ok(failures.some((line) => line.includes('declared inert and is no longer')), failures.join(' | '));
  });

  it('MUTANT: a family that stops mounting cannot leave the denominator quietly', () => {
    const failures = evaluate(result([cell()], {
      families: {
        mountable: 10,
        unmountable: [...UNMOUNTABLE_FAMILIES, 'button'],
        pinnedUnmountable: [...UNMOUNTABLE_FAMILIES],
        excludedUnsettled: [...UNSETTLED_FAMILIES],
        observedUnsettled: [],
        newlyUnsettled: [],
      },
    }));
    assert.ok(failures.some((line) => line.startsWith('button:') && line.includes('UNMOUNTABLE_FAMILIES')), failures.join(' | '));
  });

  it('MUTANT: a pinned family that starts mounting again must be unpinned', () => {
    const failures = evaluate(result([cell()], {
      families: {
        mountable: 10,
        unmountable: UNMOUNTABLE_FAMILIES.filter((family) => family !== 'billing'),
        pinnedUnmountable: [...UNMOUNTABLE_FAMILIES],
        excludedUnsettled: [...UNSETTLED_FAMILIES],
        observedUnsettled: [],
        newlyUnsettled: [],
      },
    }));
    assert.ok(failures.some((line) => line.startsWith('billing:') && line.includes('now mounts')), failures.join(' | '));
  });

  it('a --families run does not check the corpus-wide unmountable pin', () => {
    const failures = evaluate(result([cell()], {
      familiesFiltered: true,
      families: {
        mountable: 3,
        unmountable: ['button'],
        pinnedUnmountable: [...UNMOUNTABLE_FAMILIES],
        excludedUnsettled: [...UNSETTLED_FAMILIES],
        observedUnsettled: [],
        newlyUnsettled: [],
      },
    }));
    assert.deepEqual(failures, [], failures.join(' | '));
  });

  it('MUTANT: a newly unsettled family is named rather than quietly excluded', () => {
    const failures = evaluate(result([cell()], {
      families: { mountable: 10, unmountable: [], excludedUnsettled: [...UNSETTLED_FAMILIES], observedUnsettled: ['button'], newlyUnsettled: ['button'] },
    }));
    assert.ok(failures.some((line) => line.startsWith('button:')), failures.join(' | '));
  });

  it('MUTANT: an axis under the threshold is named, and only when a threshold is asked for', () => {
    const cells = [cell({ axis: 'shape', moved: 10, denominator: 100, percent: 10 })];
    assert.deepEqual(evaluate(result(cells)).filter((line) => line.startsWith('shape:')), []);
    const failures = evaluate(result(cells), { threshold: 80 });
    assert.ok(failures.some((line) => line.startsWith('shape: 10.0 % < 80 %')), failures.join(' | '));
  });

  it('MUTANT: a run with no cell at all is a broken probe, not a clean one', () => {
    assert.ok(evaluate(result([])).some((line) => line.includes('the probe ran nothing')));
    assert.ok(
      evaluate(result([cell()], { families: { mountable: 0, unmountable: [], excludedUnsettled: [], observedUnsettled: [], newlyUnsettled: [] } }))
        .some((line) => line.includes('the selector reader is broken')),
    );
  });

  it('MUTANT: a refused pair is reported, never counted as "no difference"', () => {
    const failures = evaluate(result([cell()], {
      refusals: [{ vertical: 'bithire', theme: 'light', scenario: 'motion', reason: 'Value exceeds the envelope' }],
    }));
    assert.ok(failures.some((line) => line.includes('REFUSED and therefore not measured')), failures.join(' | '));
  });
});


/** Two complete documents that differ on every kit group, the shape the pilot pair has. */
const PAIR_A = Object.freeze({
  'palette.seeds': { primary: '#2F5BE8' },
  'palette.contrast-posture': 'high',
  'typography.scale': 0.94,
  'shape.radius-scale': 0.8,
  'density.mode': 'compact',
  'surfaces.elevation-posture': 'soft',
  'states.emphasis': 'strong',
  'states.focus-style': 'ring',
  'motion.character': 'mechanical',
  'chrome.anatomy': { table: 'zebra' },
});
const PAIR_B = Object.freeze({
  'palette.seeds': { primary: '#7A4BC4' },
  'palette.contrast-posture': 'soft',
  'typography.scale': 1,
  'shape.radius-scale': 1.2,
  'density.mode': 'normal',
  'surfaces.elevation-posture': 'elevated',
  'states.emphasis': 'medium',
  'states.focus-style': 'glow',
  'motion.character': 'playful',
  'chrome.anatomy': { table: 'open' },
});

const PILOT = Object.freeze({
  catalogRevision: 'rev',
  families: { button: [...AXIS_IDS], checkbox: ['shape', 'states'] },
  denominators: { shape: 2, typography: 1, rhythm: 1, depth: 1, states: 2, motion: 1 },
});

/** A pilot run in which every pilot family moved on every positive and both controls stand. */
const pilotRun = (over = {}) => {
  const cells = [
    ...AXIS_IDS.map((axis) => cell({
      scenario: axis, axis, denominator: 2, moved: 2, percent: 100, movedIds: ['button', 'checkbox'],
    })),
    ...AXIS_IDS.map((axis) => paletteControl({ axis, denominator: 2 })),
    ...['shape', 'typography'].map((axis) => control({
      axis, denominator: 2, witness: witness({ moved: 2, denominator: 2 }),
    })),
  ];
  return result(cells, {
    familiesFiltered: true,
    revision: { digest: 'rev' },
    effectiveFamilies: Object.fromEntries(AXIS_IDS.map((axis) => [axis, ['button', 'checkbox']])),
    ...over,
  });
};

describe('axis-difference — the pilot pair is cut one group at a time', () => {
  const scenarios = pairScenarios({ base: PAIR_A, other: PAIR_B });

  it('one positive per axis and both shipped negative controls, with their witnesses', () => {
    assert.deepEqual(scenarios.filter((entry) => entry.kind === 'positive').map((entry) => entry.axis), [...AXIS_IDS]);
    assert.deepEqual(scenarios.filter((entry) => entry.kind === 'negative').map((entry) => entry.id), [...NEGATIVE_CONTROLS]);
    const emphasis = scenarios.find((entry) => entry.id === 'states-emphasis-only');
    assert.deepEqual(emphasis.witness, SCENARIOS.find((entry) => entry.id === 'states-emphasis-only').witness);
    assert.deepEqual(emphasis.expectZeroOn, ['shape', 'typography']);
    const palette = scenarios.find((entry) => entry.id === 'palette-only');
    assert.equal(palette.witness.kind, 'effective-map');
    assert.deepEqual(palette.expectZeroOn, [...AXIS_IDS]);
  });

  it('every scenario keeps the base and differs from it in exactly the rows it names', () => {
    const controls = axisControls();
    const rowsOf = (entry) => (entry.kind === 'positive'
      ? controls.get(entry.axis)
      : entry.id === 'palette-only' ? groupControls('color') : ['states.emphasis']);
    for (const entry of scenarios) {
      assert.equal(entry.a, PAIR_A);
      const differing = Object.keys({ ...entry.a, ...entry.b })
        .filter((row) => JSON.stringify(entry.a[row]) !== JSON.stringify(entry.b[row]));
      assert.ok(differing.length > 0, `${entry.id}: moves nothing`);
      for (const row of differing) assert.ok(rowsOf(entry).includes(row), `${entry.id}: ${row} leaked into the cut`);
    }
    assert.deepEqual(scenarios.find((entry) => entry.id === 'states-emphasis-only').b['states.focus-style'], 'ring');
  });

  it('MUTANT: a pair that agrees on a whole group is refused, never published as a zero', () => {
    assert.throws(
      () => pairScenarios({ base: PAIR_A, other: { ...PAIR_B, 'motion.character': 'mechanical' } }),
      /agrees on every row of motion/u,
    );
  });
});

describe('axis-difference — the pilot verdict', () => {
  it('a run where every pilot family moved and both controls stand is green', () => {
    assert.deepEqual(evaluatePilot(pilotRun(), PILOT), []);
  });

  it('publishes pilot readings over the pilot denominator with the N/A beside it, labelled as the pilot', () => {
    const readings = pilotReadings(pilotRun(), PILOT);
    assert.ok(readings.every((entry) => entry.scope === 'pilot'));
    assert.deepEqual(readings.find((entry) => entry.axis === 'states'), {
      scope: 'pilot', vertical: 'bithire', theme: 'light', axis: 'states', moved: 2, denominator: 2, notApplicable: 0,
    });
    const withdrawn = {
      ...PILOT,
      families: { ...PILOT.families, radio: ['states'] },
      notApplicable: { radio: { shape: { reason: 'semantic identity', review: 'core review' } } },
    };
    const shape = pilotReadings(pilotRun(), withdrawn).find((entry) => entry.axis === 'shape');
    assert.equal(shape.denominator, 2, 'the N/A family is outside the applicable denominator');
    assert.equal(shape.notApplicable, 1, 'and is published beside it, so 2/2 cannot be read as the whole axis');
  });

  it('MUTANT: a pilot family that does not move on an axis it declares is named', () => {
    const run = pilotRun();
    run.cells.find((entry) => entry.axis === 'depth' && entry.kind === 'positive').movedIds = ['checkbox'];
    assert.ok(evaluatePilot(run, PILOT).some((line) => line === 'button: declares depth and did not move on it in bithire/light'));
  });

  it('MUTANT: a pilot family outside the measured denominator cannot pass by absence', () => {
    const run = pilotRun();
    run.effectiveFamilies.states = ['button'];
    assert.ok(evaluatePilot(run, PILOT).some((line) => line.startsWith('checkbox: declares states and is outside')));
  });

  it('MUTANT: a vacuous control is not credited in the pilot, emphasis included', () => {
    const run = pilotRun();
    for (const entry of run.cells.filter((item) => item.scenario === 'states-emphasis-only')) {
      entry.witness = witness({ moved: 0 });
    }
    markVacuousControls(run.cells);
    const failures = evaluatePilot(run, PILOT);
    assert.ok(failures.some((line) => line.startsWith('NEGATIVE CONTROL states-emphasis-only: all 2')));
    assert.ok(failures.some((line) => line.startsWith('NEGATIVE CONTROL states-emphasis-only bithire/light shape: NON-EVIDENTIAL')));
  });

  it('MUTANT: a control that was not run at all is named', () => {
    const run = pilotRun();
    run.cells = run.cells.filter((entry) => entry.scenario !== 'palette-only');
    assert.ok(evaluatePilot(run, PILOT).includes('NEGATIVE CONTROL palette-only: not run'));
  });

  it('MUTANT: a control that moved fails the pilot like it fails the fleet', () => {
    const run = pilotRun();
    Object.assign(run.cells.find((entry) => entry.scenario === 'palette-only' && entry.axis === 'rhythm'), {
      moved: 1, movedFamilies: [{ family: 'button', property: 'padding-top' }],
    });
    assert.ok(evaluatePilot(run, PILOT).some((line) => line.startsWith('NEGATIVE CONTROL palette-only moved 1/2 families on rhythm')));
  });

  it('MUTANT: a run at another catalog revision, or a shrunk pilot denominator, is refused', () => {
    assert.ok(evaluatePilot(pilotRun({ revision: { digest: 'other' } }), PILOT)
      .some((line) => line.startsWith('the run measured catalog other')));
    const shrunk = { ...PILOT, denominators: { ...PILOT.denominators, shape: 1 } };
    assert.ok(evaluatePilot(pilotRun(), shrunk).includes('shape: pilot denominator 1 != 2 declaring families'));
  });
});

describe('axis-difference — a family can be measured on its own anatomy', () => {
  it('a mount replaces the skin element in the scene, and an unmountable family with a mount is mounted', () => {
    const elements = new Map([['alert', { classes: ['ds-alert'], attributes: {} }], ['team', null]]);
    const html = sceneHtml({
      css: '', vertical: 'bithire', theme: 'light', elements,
      mounts: { team: { markup: '<section class="ds-team"><b data-part="row"></b></section>' } },
    });
    assert.match(html, /<div data-axis-family="alert" class="ds-alert"><\/div>/u);
    assert.match(html, /<div data-axis-family="team" data-axis-mount="">(<section class="ds-team">)/u);
  });

  it('the states axis reads the non-chromatic longhands a state paints, under every stamped state', () => {
    assert.deepEqual([...STATE_VARIANTS], ['hovered', 'pressed', 'selected', 'focus-visible', 'disabled', 'focused']);
    for (const property of ['transform', 'opacity', 'outline-width', 'outline-offset']) {
      assert.ok(AXES.states.computed.includes(property), property);
    }
    const before = { base: {}, states: { pressed: { probe: { transform: 'matrix(0.98, 0, 0, 0.98, 0, 0)' } } } };
    const after = { base: {}, states: { pressed: { probe: { transform: 'matrix(0.96, 0, 0, 0.96, 0, 0)' } } } };
    assert.equal(differsOnAxis('states', before, after, 'probe'), 'transform');
  });
});


/**
 * THE PART MOUNTS, which exist because the instrument was blind.
 *
 * The probe read one bare element per family, so a skin that paints its radius
 * on `[data-part='bubble']` declared that paint in a rule no scene ever
 * mounted and the family read as a NON-MOVER. These cases pin the repair from
 * both ends: the projection law (what may be grafted onto the root, and every
 * reason a selector is refused), and -- in a real browser -- the three readings
 * that tell the repair apart from a number that merely went up.
 */
const DRILL_ROOT_CSS = ".ds-drill.ds-drill--modern[data-part='root'] { padding: 4px; }";
/* Two levels deep on purpose: a chain merged onto one node -- the cheap
 * collapse -- stops matching, and the browser arms below say so. */
const DRILL_LIVE_PART = ".ds-drill.ds-drill--modern[data-part='root'] > [data-part='content'] > [data-part='bubble'] "
  + '{ border-radius: var(--ds-radius-md); }';
const DRILL_DEAD_PART = ".ds-drill.ds-drill--modern[data-part='root'] > [data-part='content'] > [data-part='bubble'] "
  + '{ border-radius: 6px; }';
const DRILL_ELEMENT = Object.freeze({
  classes: ['ds-drill', 'ds-drill--modern'],
  attributes: { 'data-part': 'root' },
});

describe('axis-difference — the mount is the element the family PAINTS the axis on', () => {
  it('splits a selector list on its top-level commas only, so :is(a, b) survives as one selector', () => {
    assert.deepEqual(selectorList(".ds-x:is([data-part='a'], [data-part='b']) .ds-y, .ds-z"), [
      ".ds-x:is([data-part='a'], [data-part='b']) .ds-y",
      '.ds-z',
    ]);
  });

  it('expands :is() into the selectors it stands for, and bounds the expansion', () => {
    assert.deepEqual(expandAlternatives(".ds-x :is([data-part='a'], [data-part='b'])"), [
      ".ds-x [data-part='a']",
      ".ds-x [data-part='b']",
    ]);
    const wide = `.ds-x :is(${[...Array(20).keys()].map((n) => `[data-part='p${n}']`).join(', ')})`;
    assert.equal(expandAlternatives(wide).length, ALTERNATIVE_LIMIT);
  });

  it('expands an element branch of :is() as an ELEMENT, not as text glued onto the class before it', () => {
    // Measured on the Modern typography skin: `.t.t--modern:is(a)` expanded to
    // `.t.t--moderna`, a class no node carries, so the link outline (the rule
    // that reads the focus-ring width and offset) was a probe that could never
    // match. A type selector leads its compound; a class or attribute branch
    // appends to it.
    assert.deepEqual(expandAlternatives(".t.t--modern:is(a)[data-color='primary']"), [
      "a.t.t--modern[data-color='primary']",
    ]);
    assert.deepEqual(expandAlternatives('.r .t.t--modern:is(.cls, a):focus-visible'), [
      '.r .t.t--modern.cls:focus-visible',
      '.r a.t.t--modern:focus-visible',
    ]);
    assert.deepEqual(expandAlternatives('.t:is(a.link, button)'), ['a.t.link', 'button.t']);
    assert.deepEqual(expandAlternatives('a:is(a, span)'), ['a'], 'a branch naming another element can never match and is dropped');
    const probes = stateRuleProbes(".t.t--modern:is(.cls, a)[data-state~='focus-visible'] { outline-width: 2px; }");
    assert.deepEqual(probes.map((probe) => probe.probe), ['.t.t--modern.cls', 'a.t.t--modern']);
  });

  it('expands an :is() whose branches carry their own parentheses, so a nested :has() does not hide the list', () => {
    assert.deepEqual(
      expandAlternatives(".rg [data-part='option']:is([data-state~='focus-visible'], :has(> input:focus-visible))"),
      [".rg [data-part='option'][data-state~='focus-visible']", ".rg [data-part='option']:has(> input:focus-visible)"],
    );
  });

  it('grafts a descendant part onto the family root and keeps the chain, because a descendant needs an ANCESTOR', () => {
    const projection = projectPartChain(
      ".ds-drill.ds-drill--modern[data-part='root'] > [data-part='content'] > [data-part='title']",
      DRILL_ELEMENT,
    );
    assert.deepEqual(projection.chain.map(compoundKey), ['div||data-part=content', 'div||data-part=title']);
  });

  it('refuses every selector the part law refuses, each with its own reason', () => {
    const refusals = {
      'root-level': '.ds-drill.ds-drill--modern',
      'sibling-combinator': ".ds-drill.ds-drill--modern[data-part='root'] ~ [data-part='x']",
      'pseudo-element': ".ds-drill.ds-drill--modern[data-part='root'] [data-part='x']::after",
      'head-pseudo': ".ds-drill.ds-drill--modern:hover [data-part='x']",
      'head-not-the-family-root': ".ds-other[data-part='root'] [data-part='x']",
      'head-variant-gated': ".ds-drill.ds-drill--modern[data-variant='ghost'] [data-part='x']",
      'part-pseudo': ".ds-drill.ds-drill--modern[data-part='root'] [data-part='x']:focus-visible",
      'part-universal': ".ds-drill.ds-drill--modern[data-part='root'] *",
      'part-variant-gated': ".ds-drill.ds-drill--modern[data-part='root'] [data-part='x'][data-tone='danger']",
      'part-substring-operator': ".ds-drill.ds-drill--modern[data-part='root'] [data-part^='x']",
    };
    for (const [reason, selector] of Object.entries(refusals)) {
      assert.equal(projectPartChain(selector, DRILL_ELEMENT).rejected, reason, selector);
    }
    // RESTATED for the pseudo-element read law: still a NODE refusal -- the
    // part law never builds a pseudo -- and now the entry the read law reads
    // on its host, so the refusal count and the census share one unit.
    const record = familyParts(`${refusals['pseudo-element']} { box-shadow: 0 0 1px black; }`, DRILL_ELEMENT, ['depth']);
    assert.deepEqual(record.parts, []);
    assert.equal(record.rejected['pseudo-element'], 1);
    assert.deepEqual(record.pseudoReads.reads, [
      { axis: 'depth', host: ".ds-drill.ds-drill--modern[data-part='root'] [data-part='x']", pseudo: '::after' },
    ]);
  });

  it('strips the kernel state stamp rather than baking it into the part', () => {
    const projection = projectPartChain(
      ".ds-drill.ds-drill--modern[data-part='root'] [data-part='x'][data-state~='pressed']",
      DRILL_ELEMENT,
    );
    assert.deepEqual(projection.chain[0].attributes, { 'data-part': 'x' });
    assert.ok(!partTreeHtml([{ chain: projection.chain, axes: ['states'] }]).includes('data-state'));
  });

  it('a part is read for the axes its OWN declaring rule wrote, and for no others', () => {
    const css = `${DRILL_ROOT_CSS}\n.ds-drill.ds-drill--modern[data-part='root'] > [data-part='pad'] { gap: 8px; }`;
    const { parts } = familyParts(css, DRILL_ELEMENT, ['shape', 'rhythm']);
    assert.deepEqual(parts.map((part) => part.axes), [['rhythm']]);
    assert.match(partTreeHtml(parts), /data-part="pad" data-axis-part="rhythm"/u);
  });

  it('shares every ancestor two parts share, and marks only the node a rule TARGETS', () => {
    const css = `.ds-drill.ds-drill--modern[data-part='root'] > [data-part='body'] > [data-part='title'] { font-size: 1rem; }
      .ds-drill.ds-drill--modern[data-part='root'] > [data-part='body'] > [data-part='lede'] { font-size: 2rem; }`;
    const html = partTreeHtml(familyParts(css, DRILL_ELEMENT, ['typography']).parts);
    assert.equal(html.match(/data-part="body"/gu).length, 1, html);
    assert.ok(!/data-part="body" data-axis-part/u.test(html), html);
    assert.match(html, /data-part="title" data-axis-part="typography"/u);
  });

  it('mounts a void element as a leaf and never as scaffolding', () => {
    const html = partTreeHtml(familyParts(
      ".ds-drill.ds-drill--modern[data-part='root'] img[data-part='thumb'] { border-radius: 4px; }",
      DRILL_ELEMENT,
      ['shape'],
    ).parts);
    assert.match(html, /<img data-part="thumb" data-axis-part="shape">/u);
    assert.ok(!html.includes('</img>'));
    assert.equal(
      projectPartChain(".ds-drill.ds-drill--modern[data-part='root'] img [data-part='x']", DRILL_ELEMENT).rejected,
      'part-under-void-element',
    );
  });

  it('keeps the family root in the scene and nests the parts inside it, so the reading is a SUPERSET of the old one', () => {
    const elements = new Map([['drill', DRILL_ELEMENT]]);
    const parts = new Map([['drill', familyParts(`${DRILL_ROOT_CSS}\n${DRILL_LIVE_PART}`, DRILL_ELEMENT, ['shape'])]]);
    const before = sceneHtml({ css: '', vertical: 'bithire', theme: 'light', elements });
    const after = sceneHtml({ css: '', vertical: 'bithire', theme: 'light', elements, partMounts: parts });
    assert.match(before, /<div data-axis-family="drill" class="ds-drill ds-drill--modern" data-part="root"><\/div>/u);
    assert.match(
      after,
      /<div data-axis-family="drill" class="ds-drill ds-drill--modern" data-part="root"><div data-part="content"><div data-part="bubble" data-axis-part="shape"><\/div><\/div><\/div>/u,
    );
  });

  it('every computed property this probe reads belongs to exactly one axis, which is what makes the scoping possible', () => {
    const owner = axisByProperty();
    for (const axis of AXIS_IDS) {
      for (const property of AXES[axis].computed) assert.equal(owner[property], axis, property);
    }
  });
});

describe('axis-difference — the part mounts honour the pins they were told to honour', () => {
  const report = partMountReport(familyAxisParts(ROOT));

  it('grafts parts onto a real corpus rather than a handful of families', () => {
    assert.ok(report.families > 100, `only ${report.families} families gained a part mount`);
    assert.ok(report.parts > report.families, `${report.parts} parts over ${report.families} families`);
  });

  it('gives NO part to a family pinned as unmountable, so the denominator is the one the pre-lot run published', () => {
    const wrong = UNMOUNTABLE_FAMILIES.filter((family) => report.map[family] !== undefined);
    assert.deepEqual(wrong, [], `part-mounted despite being pinned unmountable: ${wrong.join(', ')}`);
  });

  it('never gives a family a part on an axis it is not in the population of, so a reviewed N/A stays withdrawn', () => {
    const populations = axisPopulations(ROOT);
    const wrong = [];
    for (const [family, byAxis] of Object.entries(report.map)) {
      for (const axis of Object.keys(byAxis)) {
        if (!populations.get(axis).includes(family)) wrong.push(`${family}/${axis}`);
      }
    }
    assert.deepEqual(wrong, [], `part-mounted outside the population: ${wrong.join(', ')}`);
  });

  it('names the families the unmountable pin now costs, instead of letting them disappear', () => {
    const candidates = unmountablePartCandidates(ROOT);
    assert.ok(candidates.length > 0, 'no unmountable family paints an axis on a descendant — check the walk');
    assert.deepEqual(candidates.filter((family) => !UNMOUNTABLE_FAMILIES.includes(family)), []);
    assert.deepEqual(
      partMountReport(familyAxisParts(ROOT), { unmountableCandidates: candidates }).pinnedUnmountableWithPartPaint,
      candidates,
    );
  });

  it('publishes the refusals, because they are the BOUNDARY of the lot and not noise', () => {
    assert.ok(report.refused['head-variant-gated'] > 0, JSON.stringify(report.refused));
    assert.ok(report.refused['part-pseudo'] > 0, JSON.stringify(report.refused));
  });
});

/**
 * THE ROOT IS THE HEAD, and the breadcrumb anomaly is why.
 *
 * `breadcrumb` paints `border-radius: var(--ds-breadcrumb-radius,
 * var(--ds-radius-lg))` on its own ROOT rule -- dial-fed, root level, nothing
 * gated -- and measured as a shape NON-MOVER. The reason was not the skin: the
 * probe mounted it as the merge of
 * `.ds-breadcrumb--modern[data-part='root'] [data-part='crumb'][data-clickable='true'] [data-part='label']`,
 * one node carrying `data-part="label"`, which its root rule cannot match and
 * which its 59 part chains were then refused against as `head-variant-gated`.
 * The fixtures below are that shape in miniature.
 */
describe('axis-difference — the root is the compound the skin requires, not the chain merged', () => {
  const MERGED_CSS = `${DRILL_ROOT_CSS}
    .ds-drill.ds-drill--modern[data-part='root'] [data-part='crumb'][data-clickable='true'] [data-part='label']
      { border-radius: 2px; }`;

  it('THE DEFECT: the merged reading fabricates a node the family root rule cannot match', () => {
    const merged = familyElement(MERGED_CSS, { collapsedRoots: true });
    assert.deepEqual(merged.attributes, { 'data-part': 'label', 'data-clickable': 'true' });
    assert.equal(merged.selector.includes(' '), true, 'the pre-repair root IS a whole chain on one node');
  });

  it('the repaired reading mounts the head, so the root rule matches the node again', () => {
    const element = familyElement(MERGED_CSS);
    assert.deepEqual(element.classes, ['ds-drill', 'ds-drill--modern']);
    assert.deepEqual(element.attributes, { 'data-part': 'root' });
    assert.equal(compoundPieces(element.selector).length, 1);
  });

  it('and the chain the merge ate comes back as the parts it always was', () => {
    const css = `${MERGED_CSS}
      .ds-drill.ds-drill--modern[data-part='root'] [data-part='icon'] { border-radius: var(--ds-radius-sm); }`;
    const merged = familyParts(css, familyElement(css, { collapsedRoots: true }), ['shape']);
    assert.deepEqual(merged.parts, [], 'the fabricated root refused every chain the family writes');
    const repaired = familyParts(css, familyElement(css), ['shape']);
    assert.deepEqual(repaired.parts.map((part) => part.chain.map(compoundKey)), [['div||data-part=icon']]);
  });

  it('and the refusals stop being charged to the prop-gated cluster they were never about', () => {
    // Both readings refuse the `[data-clickable='true']` chain, and only one of
    // them refuses it for the reason it is actually refused: the merge blamed
    // the HEAD against attributes the family root never carried, which is what
    // made the published `head-variant-gated` count overstate the wiring lots'
    // backlog. The repaired reading blames the PART, where the gate is.
    const merged = familyParts(MERGED_CSS, familyElement(MERGED_CSS, { collapsedRoots: true }), ['shape']);
    assert.deepEqual(merged.rejected, { 'head-variant-gated': 1 });
    const repaired = familyParts(MERGED_CSS, familyElement(MERGED_CSS), ['shape']);
    assert.deepEqual(repaired.rejected, { 'part-variant-gated': 1 });
  });

  it('a rule whose WHOLE selector is the compound wins a tie against one that only heads a chain', () => {
    // Same score either way -- two classes, two attributes, a root part. The
    // whole-selector candidate is the stronger claim (it paints the root
    // directly), and preferring it is what keeps every family that already
    // mounted a single compound on exactly the element it was measured on.
    const css = `.ds-drill.ds-drill--modern[data-part='root'][data-tone='warn'] [data-part='x'] { padding: 1px; }
      .ds-drill.ds-drill--modern[data-part='root'][data-tone='calm'] { padding: 2px; }`;
    assert.deepEqual(familyElement(css).attributes, { 'data-part': 'root', 'data-tone': 'calm' });
  });

  it('a compound is cut on combinators OUTSIDE brackets, so a spaced attribute value stays one piece', () => {
    assert.deepEqual(compoundPieces(".ds-x[data-state~='is open'] > [data-part='y']"), [
      ".ds-x[data-state~='is open']",
      "[data-part='y']",
    ]);
    assert.deepEqual(
      projectPartChain(".ds-drill.ds-drill--modern[data-part='root'] [data-part='y'][data-state~='is open']", DRILL_ELEMENT)
        .chain.map(compoundKey),
      ['div||data-part=y'],
    );
  });

  it('THE CORPUS: the repair changes the NODE and not the mountable set, so every pin and denominator is the one the pre-repair run published', () => {
    const repaired = familyElements(ROOT);
    const merged = familyElements(ROOT, null, { collapsedRoots: true });
    const mountable = (elements) => [...elements].filter(([, element]) => element !== null).map(([family]) => family);
    assert.deepEqual(mountable(repaired), mountable(merged), 'the root repair moved a family in or out of the denominator');
    const stillMerged = mountable(repaired).filter((family) => compoundPieces(repaired.get(family).selector).length > 1);
    assert.deepEqual(stillMerged, [], `roots still merged: ${stillMerged.join(', ')}`);
    const wasMerged = mountable(merged).filter((family) => compoundPieces(merged.get(family).selector).length > 1);
    assert.ok(wasMerged.length > 100, `only ${wasMerged.length} merged roots in the pre-repair reading`);
    assert.ok(wasMerged.includes('breadcrumb'));
  });

  it('THE CORPUS: repairing the root un-refuses the head-gated chains it was refusing against a fabricated node', () => {
    const repaired = partMountReport(familyAxisParts(ROOT, null, familyElements(ROOT)));
    const merged = partMountReport(familyAxisParts(ROOT, null, familyElements(ROOT, null, { collapsedRoots: true })));
    assert.ok(
      repaired.refused['head-variant-gated'] < merged.refused['head-variant-gated'],
      `head-variant-gated ${merged.refused['head-variant-gated']} -> ${repaired.refused['head-variant-gated']}`,
    );
    assert.equal(merged.map.breadcrumb, undefined, 'breadcrumb gained a part under the fabricated root');
    assert.ok(repaired.map.breadcrumb.shape.length > 0, 'breadcrumb gained no shape part under its real root');
  });

  it('THE CORPUS: the root a family is mounted on is its identity, not one of its configurations', () => {
    const elements = familyElements(ROOT);
    // The measured case, named: mounted with `[data-standalone='true']` the
    // checkbox box is painted by the standalone rule's deliberate non-dial
    // `var(--ds-radius-full)`, and the family reads as a shape non-mover while
    // the checkbox a tenant renders moves.
    assert.deepEqual(elements.get('checkbox').attributes, { 'data-part': 'root' });
    // A structural attribute is kept: this skin writes no root rule without it.
    assert.deepEqual(elements.get('flex').attributes, { 'data-component': 'flex' });
    const stateful = [...elements].filter(([, element]) => element !== null
      && Object.keys(element.attributes).some((name) => /(^|-)state$/u.test(name)));
    assert.deepEqual(stateful.map(([family]) => family), [], 'a root baked a state in; the scene stamps states');
  });

  it('MUTANT: a run that publishes a merged root is refused, and the pre-repair reading is not', () => {
    const merged = result([cell()], { roots: { collapsedRoots: false, merged: 113 } });
    assert.ok(evaluate(merged).some((line) => line.includes('MERGED onto one node')), 'a fabricated root passed');
    assert.deepEqual(
      evaluate({ ...merged, roots: { collapsedRoots: true, merged: 113 } }).filter((line) => line.includes('MERGED onto one node')),
      [],
    );
  });

  it('the run publishes the root each family was measured on, and how many of them were a merge', () => {
    const elements = new Map([['drill', familyElement(MERGED_CSS)]]);
    assert.deepEqual(rootReport(elements), {
      collapsedRoots: false,
      families: 1,
      merged: 0,
      map: { drill: ".ds-drill.ds-drill--modern[data-part='root']" },
    });
    const before = rootReport(new Map([['drill', familyElement(MERGED_CSS, { collapsedRoots: true })]]), { collapsedRoots: true });
    assert.equal(before.merged, 1);
    assert.equal(before.collapsedRoots, true);
  });
});

/**
 * THE RED ARM, and it is the case this lot exists to make reachable.
 *
 * Proving the numbers went up proves nothing: a mount that reported a
 * difference because it mounted MORE nodes would do exactly that. What has to
 * be true of a repaired instrument is the opposite reading -- a part that is
 * mounted, read, and STOPS consuming the dial must come back as a non-mover
 * and fail the axis. So the same family is driven three ways through one real
 * browser, over one page, with the same two arms:
 *
 *   BLIND  the part is not mounted           -> no difference (the defect)
 *   SEEING the part is mounted and dial-fed  -> the difference, on the part
 *   RED    the part is mounted and literal   -> no difference, and the axis fails
 *
 * BLIND and RED read the same 0 and mean opposite things, which is the whole
 * reason the mount map is published with the run.
 */
/**
 * THE REACH REPAIR, and the three ways the probe was reading a node the fleet
 * does not render or refusing to read one it does.
 *
 * The rhythm census (`evidence/rhythm-wiring-census/`) enumerated a 35-family
 * residual and found 18 of them were the INSTRUMENT, not the fleet: nine whose
 * root is mounted without an attribute the default render always stamps, two
 * whose moving paint sits on a node the scene builds and no axis is allowed to
 * read, and seven whose reaching rule is written without an ancestor. These
 * cases pin each of the three repairs from both ends -- the law, offline, and
 * the BLIND/SEEING/RED reading in a browser, because only the last can tell a
 * repair apart from a number that went up.
 */
describe('axis-difference — the root is mounted AS THE DEFAULT RENDER stamps it', () => {
  const element = Object.freeze({
    classes: ['ds-drill'],
    attributes: { 'data-part': 'root', 'data-size': '' },
    selector: ".ds-drill[data-part='root'][data-size='']",
  });

  it('replaces the value the mount law read off a bare attribute, which is the kbd case', () => {
    const stamped = withAsRenderedStamps(element, [{ attribute: 'data-size', value: 'md' }]);
    assert.equal(stamped.attributes['data-size'], 'md');
    assert.equal(stamped.selector, ".ds-drill[data-part='root'][data-size='md']");
  });

  it('adds an attribute the mount law dropped, and leaves the classes alone', () => {
    const stamped = withAsRenderedStamps(element, [{ attribute: 'data-structure', value: 'record' }]);
    assert.deepEqual(stamped.classes, ['ds-drill']);
    assert.equal(stamped.attributes['data-structure'], 'record');
  });

  it('a row that names a STATE is refused, because the scene stamps state and a root born in one measures the fabrication', () => {
    const stamped = withAsRenderedStamps(element, [{ attribute: 'data-state', value: 'error' }]);
    assert.equal(stamped.attributes['data-state'], undefined);
  });

  it('a family with no row is returned unchanged, and so is a null element', () => {
    assert.equal(withAsRenderedStamps(element, []), element);
    assert.equal(withAsRenderedStamps(null, [{ attribute: 'data-size', value: 'md' }]), null);
  });

  it('THE STALENESS DOOR: every shipped row still matches the tree it was read off', () => {
    // A FLOOR, not a comment: a roster that silently shrinks is a numerator
    // that silently shrinks, and this door is the only thing standing under it.
    assert.ok(Object.keys(AS_RENDERED_ROOT_STAMPS).length >= 10, 'the roster is the mount source; an empty one proves nothing');
    assert.deepEqual(asRenderedRosterFailures(ROOT), []);
  });

  it('MUTANT: a row whose stamp, default, attribute or file has moved is named, one failure each', () => {
    const failures = asRenderedRosterFailures(ROOT, {
      kbd: [{ attribute: 'data-size', value: 'md', source: 'src/nowhere/index.tsx', stamp: 'x', resolves: 'y' }],
    });
    assert.ok(failures.some((line) => line.includes('does not exist')), failures.join(' | '));
    const moved = asRenderedRosterFailures(ROOT, {
      kbd: [{
        attribute: 'data-size',
        value: 'md',
        source: 'src/components/primitives/display/kbd/engines/modern/index.tsx',
        stamp: 'data-size={THE_SIZE_THAT_IS_NOT_THERE}',
        resolves: 'size = KBD_DEFAULTS.size,',
      }],
    });
    assert.ok(moved.some((line) => line.includes('no longer carries the stamp')), moved.join(' | '));
    const ungated = asRenderedRosterFailures(ROOT, {
      kbd: [{
        attribute: 'data-nobody-gates-on-this',
        value: 'md',
        source: 'src/components/primitives/display/kbd/engines/modern/index.tsx',
        stamp: 'data-size={size}',
        resolves: 'size = KBD_DEFAULTS.size,',
      }],
    });
    assert.ok(ungated.some((line) => line.includes('no longer gates on this attribute')), ungated.join(' | '));
  });

  it('MUTANT: a stamp for a gate the default render never carries fails on its fabricated default', () => {
    // `image` stamps `data-radius={radius}` on every render, but its default is
    // `none`: a row claiming `sm` has no source line to resolve from.
    const failures = asRenderedRosterFailures(ROOT, {
      image: [{
        attribute: 'data-radius',
        value: 'sm',
        source: 'src/components/primitives/display/image/engines/modern/index.tsx',
        stamp: 'data-radius={radius}',
        resolves: "radius = 'sm'",
      }],
    });
    assert.ok(failures.some((line) => line.includes('no longer carries the resolves')), failures.join(' | '));
    assert.equal(AS_RENDERED_ROOT_STAMPS.image, undefined, 'a true-configuration gate never becomes a roster row');
    assert.equal(AS_RENDERED_ROOT_STAMPS.box, undefined);
  });

  it('THE ROW THAT ADDS NO PAINT: the value is the DEFAULT, not the one that makes a number move', () => {
    // `anchor` paints a rhythm `gap` only under `[data-direction='horizontal']`
    // and its own default is `vertical`. A roster that chose the moving value
    // would be mounting a configuration, which is the law this instrument
    // refuses for a prop gate.
    assert.deepEqual(AS_RENDERED_ROOT_STAMPS.anchor.map((row) => [row.attribute, row.value]), [['data-direction', 'vertical']]);
    const anchor = familyElements(ROOT, ['anchor']).get('anchor');
    assert.equal(anchor.attributes['data-direction'], 'vertical');
  });

  it('THE LINE LAW 1 DRAWS runs per FAMILY, not per attribute name: grid stamps the rung, flex does not', () => {
    // Both families gate their dial-scaled `gap` on `[data-gap-preset]`. Grid's
    // root writes `gridGapPresetSpelling(adaptation.gap ?? GRID_DEFAULTS.gap)`
    // on every render, so the rung is the default render; Flex writes the same
    // attribute only inside `if (props.gap !== undefined)`, so a row for it
    // would mount a configuration. The roster carries exactly one of them.
    assert.deepEqual(AS_RENDERED_ROOT_STAMPS.grid.map((row) => [row.attribute, row.value]), [['data-gap-preset', 'md']]);
    assert.equal(AS_RENDERED_ROOT_STAMPS.flex, undefined);
    const elements = familyElements(ROOT, ['grid', 'flex']);
    assert.equal(elements.get('grid').attributes['data-gap-preset'], 'md');
    assert.equal(elements.get('flex').attributes['data-gap-preset'], undefined);
    // And the row is under the same door as every other: a moved stamp fails named.
    const moved = asRenderedRosterFailures(ROOT, {
      grid: [{
        ...AS_RENDERED_ROOT_STAMPS.grid[0],
        stamp: '"data-gap-preset": THE_SPELLING_THAT_IS_NOT_THERE(',
      }],
    });
    assert.ok(moved.some((line) => line.includes('no longer carries the stamp')), moved.join(' | '));
    const revalued = asRenderedRosterFailures(ROOT, {
      grid: [{ ...AS_RENDERED_ROOT_STAMPS.grid[0], resolves: 'adaptation.gap ?? THE_DEFAULT_THAT_MOVED' }],
    });
    assert.ok(revalued.some((line) => line.includes('no longer carries the resolves')), revalued.join(' | '));
  });

  it('THE CORPUS: the stamps change the NODE and never the mountable set, so every denominator is the one the pre-roster run published', () => {
    const before = familyElements(ROOT, null, { asRendered: false });
    const after = familyElements(ROOT, null, { asRendered: true });
    const nulls = (map) => [...map].filter(([, value]) => value === null).map(([family]) => family).sort();
    assert.deepEqual(nulls(after), nulls(before));
    assert.equal(after.size, before.size);
    const changed = [...after].filter(([family, value]) => value?.selector !== before.get(family)?.selector).map(([family]) => family).sort();
    assert.deepEqual(changed, Object.keys(AS_RENDERED_ROOT_STAMPS).sort());
  });

  it('the run publishes which families it mounted as rendered, and the opt-out says so', () => {
    const elements = familyElements(ROOT, null, { asRendered: true });
    const report = asRenderedReport(elements);
    assert.equal(report.applied, true);
    assert.equal(report.families, Object.keys(AS_RENDERED_ROOT_STAMPS).length);
    assert.deepEqual(report.map.kbd, { 'data-size': 'md' });
    assert.equal(asRenderedReport(elements, { applied: false }).applied, false);
  });
});

describe('axis-difference — the part vocabulary reaches the LOGICAL edge longhands', () => {
  it('expands the block/inline authored names into the edges a browser hands back as physical ones', () => {
    assert.deepEqual(logicalEdgeLonghands(['margin-inline', 'padding-block', 'border-inline-width', 'gap']), [
      'margin-inline-start', 'margin-inline-end',
      'padding-block-start', 'padding-block-end',
      'border-inline-start-width', 'border-inline-end-width',
    ]);
  });

  it('THE DENOMINATOR IS NOT WIDENED: the population vocabulary is untouched by the expansion', () => {
    for (const axis of AXIS_IDS) {
      for (const property of logicalEdgeLonghands(AXES[axis].authored)) {
        assert.ok(!AXES[axis].authored.includes(property), `${property} must not enter the population vocabulary`);
      }
    }
  });

  it('a rule that authors only a logical edge is a part source, and the same rule is not one under the opt-out', () => {
    const element = Object.freeze({ classes: ['ds-drill'], attributes: { 'data-part': 'root' } });
    const css = ".ds-drill[data-part='root'] [data-part='nested'] { margin-inline-start: var(--ds-spacing-4); }";
    assert.deepEqual(familyParts(css, element, ['rhythm']).parts.map((part) => part.axes), [['rhythm']]);
    assert.deepEqual(familyParts(css, element, ['rhythm'], { partReach: false }).parts, []);
  });
});

describe('axis-difference — a `:has()` is a condition on the SCENE, and it stamps an axis without mounting a node', () => {
  const element = Object.freeze({ classes: ['ds-drill'], attributes: { 'data-part': 'root' } });

  it('reads a selector with its `:has()` removed, parentheses balanced', () => {
    assert.equal(withoutStructuralHas(".ds-a:has(> [data-part='x']) [data-part='y']"), ".ds-a [data-part='y']");
    assert.equal(withoutStructuralHas('.ds-a:has(:is(.b, .c)) .d'), '.ds-a .d');
  });

  it('is structural ONLY when no other pseudo rides with it, because this probe never enters an interaction', () => {
    assert.equal(hasOnlyStructuralHas(".ds-a:has([data-part='x']) [data-part='y']"), true);
    assert.equal(hasOnlyStructuralHas(".ds-a:has([data-part='x']):hover [data-part='y']"), false);
    // RESTATED: a pseudo-element is never retried as a `:has()` NODE; the read
    // law reads it on its host instead, so this stays false.
    assert.equal(hasOnlyStructuralHas(".ds-a::after"), false);
    assert.equal(hasOnlyStructuralHas(".ds-a:has([data-part='x'])::after"), false);
    assert.equal(hasOnlyStructuralHas(".ds-a [data-part='y']"), false);
  });

  it('adds the axis to a node the first pass BUILT, and mounts no node of its own', () => {
    const css = `.ds-drill[data-part='root'] > [data-part='wrap'] > [data-part='button'] { padding: 2px; }
      .ds-drill[data-part='root'] > [data-part='wrap']:has(> [data-part='button']) { gap: var(--ds-spacing-2); }`;
    const record = familyParts(css, element, ['rhythm']);
    const ids = record.parts.map((part) => part.id);
    assert.equal(ids.length, 2, 'the `:has()` rule must reuse the chain the first pass built, never add a third node');
    assert.ok(ids.some((id) => id.endsWith("|data-part=wrap")), ids.join(' / '));
    assert.equal(record.rejected['has-node-not-in-scene'], undefined);
    assert.ok(partTreeHtml(record.parts).includes('<div data-part="wrap" data-axis-part="rhythm">'));
  });

  it('FAIL-CLOSED: a `:has()` rule whose node the scene never built is refused and named, not mounted', () => {
    const css = ".ds-drill[data-part='root'] > [data-part='ghost']:has(> [data-part='x']) { gap: var(--ds-spacing-2); }";
    const record = familyParts(css, element, ['rhythm']);
    assert.deepEqual(record.parts, []);
    assert.equal(record.rejected['has-node-not-in-scene'], 1);
  });

  it('and the opt-out reproduces the refusal the pre-lot law published', () => {
    const css = `.ds-drill[data-part='root'] > [data-part='wrap'] > [data-part='button'] { padding: 2px; }
      .ds-drill[data-part='root'] > [data-part='wrap']:has(> [data-part='button']) { gap: var(--ds-spacing-2); }`;
    const record = familyParts(css, element, ['rhythm'], { partReach: false });
    assert.equal(record.parts.length, 1);
    assert.equal(record.rejected['part-pseudo'], 1);
  });
});

describe("axis-difference — a family's own BEM element is the descendant it is, not a root nobody mounts", () => {
  const element = Object.freeze({ classes: ['rt-drill'], attributes: { 'data-part': 'root' } });

  it('owns a block under every prefix the corpus writes it with', () => {
    assert.equal(familyOwnsBlock('rt-terminal-block', 'terminal-block'), true);
    assert.equal(familyOwnsBlock('rottay-bottom-tab-bar', 'bottom-tab-bar'), true);
    assert.equal(familyOwnsBlock('ds-feature-workspace-frame', 'feature-workspace-frame'), true);
    assert.equal(familyOwnsBlock('ds-pattern-feature-workspace-frame', 'feature-workspace-frame'), true);
    assert.equal(familyOwnsBlock('ds-tooltip-bubble', 'tooltip'), false);
    assert.equal(familyOwnsBlock('ds-drill', null), false);
  });

  it('admits the element class as a one-node chain under the root', () => {
    const part = familyElementPart(".rt-drill__body[data-part='body']", 'drill', element);
    assert.deepEqual(part.classes, ['rt-drill__body']);
    assert.deepEqual(part.attributes, { 'data-part': 'body' });
  });

  it('refuses a foreign block, a variant gate and the node the family is already mounted as', () => {
    // `.ds-auto-complete-panel`, `.ds-tooltip-bubble`, `.ds-saved-views-menu-panel`:
    // a separate block, and in every measured case a portal the default render
    // does not mount until an interaction opens it.
    assert.equal(familyElementPart('.rt-drill-panel', 'drill', element), null);
    assert.equal(familyElementPart(".rt-drill__body[data-variant='x']", 'drill', element), null);
    assert.equal(familyElementPart(".rt-drill[data-part='root']", 'drill', element), null);
    assert.equal(familyElementPart(".rt-drill__body[data-part='body']", null, element), null);
  });

  it('is mounted as a part with the axes its OWN rule wrote, and not at all under the opt-out', () => {
    const css = ".rt-drill__body { gap: var(--ds-spacing-2); }\n.rt-drill__body { border-radius: 4px; }";
    const record = familyParts(css, element, ['rhythm', 'shape'], { family: 'drill' });
    assert.deepEqual(record.parts.map((part) => part.axes), [['rhythm', 'shape']]);
    assert.deepEqual(familyParts(css, element, ['rhythm', 'shape'], { family: 'drill', partReach: false }).parts, []);
  });

  it('THE CORPUS: the reach repair leaves the unmountable pin and what it costs exactly where they were', () => {
    const elements = familyElements(ROOT, null, { asRendered: true });
    const before = familyAxisParts(ROOT, null, elements, { partReach: false });
    const after = familyAxisParts(ROOT, null, elements, { partReach: true });
    const partsOf = (map) => [...map].reduce((total, [, record]) => total + record.parts.length, 0);
    assert.ok(partsOf(after) > partsOf(before), 'the repair must reach paint the pre-lot law did not');
    assert.deepEqual(unmountablePartCandidates(ROOT), [...unmountablePartCandidates(ROOT)].sort());
    for (const family of UNMOUNTABLE_FAMILIES) {
      assert.equal(after.get(family)?.parts.length ?? 0, 0, `${family} is pinned unmountable and may not gain a part`);
    }
  });
});

describe('axis-difference BROWSER drill — a mounted part that STOPS differing is caught', { skip: browserReason }, () => {
  const ARM_A = { '--ds-radius-md': '4px', '--ds-state-press-scale': '0.9' };
  const ARM_B = { '--ds-radius-md': '16px', '--ds-state-press-scale': '0.7' };
  const axisOf = axisByProperty();

  /** Both arms of one scene, measured the way `run` measures a cell. */
  const measure = async (page, css, partMounts, axis = 'shape') => {
    const properties = axis === 'states' ? allProperties() : AXES[axis].computed;
    await page.setContent(
      sceneHtml({ css, vertical: 'bithire', theme: 'light', elements: new Map([['drill', DRILL_ELEMENT]]), partMounts }),
      { waitUntil: 'load' },
    );
    const before = await measureCell({ page, variables: ARM_A, properties, axisOf });
    const after = await measureCell({ page, variables: ARM_B, properties, axisOf });
    return differsOnAxis(axis, before, after, 'drill');
  };

  it('reads the difference on the part, reads nothing without the mount, and reads nothing again when the part goes literal', async () => {
    const live = `${DRILL_ROOT_CSS}\n${DRILL_LIVE_PART}`;
    const dead = `${DRILL_ROOT_CSS}\n${DRILL_DEAD_PART}`;
    const mounted = (css) => new Map([['drill', familyParts(css, DRILL_ELEMENT, ['shape'])]]);
    const { browser, close } = await launchBrowser();
    let blind;
    let seeing;
    let red;
    try {
      const page = await (await browser.newContext()).newPage();
      blind = await measure(page, live, null);
      seeing = await measure(page, live, mounted(live));
      red = await measure(page, dead, mounted(dead));
      await page.close();
    } finally {
      await close();
    }
    // The defect this lot repairs, planted: the paint is live and the
    // instrument cannot see it because it never mounted the element.
    assert.equal(blind, null, 'the unmounted part must be invisible — otherwise this drill proves nothing');
    assert.equal(seeing, 'border-top-left-radius', 'the mounted part must carry the dial to the page');
    // THE RED ARM. The part is still mounted and still read; it stopped
    // consuming the dial, and that must read as a non-mover.
    assert.equal(red, null, 'a mounted part that stopped consuming the dial must NOT keep reporting a difference');
  }, 120_000);

  it('reads a part for its OWN axes only, so a rhythm part cannot lend the shape axis a node it never asked for', async () => {
    // `pad` is a RHYTHM part -- the rule that mounts it writes `gap`. A second,
    // root-level rule paints its radius from the shape dial, so the node's
    // border-radius genuinely differs between the arms. The shape axis must
    // still read nothing: it did not ask for this element.
    const css = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root'] > [data-part='pad'] { gap: 8px; }
      [data-part='pad'] { border-radius: var(--ds-radius-md); }`;
    const partMounts = new Map([['drill', familyParts(css, DRILL_ELEMENT, ['shape', 'rhythm'])]]);
    assert.deepEqual(partMounts.get('drill').parts.map((part) => part.axes), [['rhythm']]);
    const { browser, close } = await launchBrowser();
    let shape;
    try {
      const page = await (await browser.newContext()).newPage();
      shape = await measure(page, css, partMounts, 'shape');
      await page.close();
    } finally {
      await close();
    }
    assert.equal(shape, null, 'the shape axis read a part that declares only rhythm');
  }, 120_000);

  it('stamps the mounted parts with the probed state, so a state-gated part is reachable at all', async () => {
    const css = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root'] > [data-part='knob'] { opacity: 1; }
      .ds-drill.ds-drill--modern[data-part='root'] > [data-part='knob'][data-state~='pressed']
        { transform: scale(var(--ds-state-press-scale)); }`;
    const partMounts = new Map([['drill', familyParts(css, DRILL_ELEMENT, ['states'])]]);
    const { browser, close } = await launchBrowser();
    let states;
    try {
      const page = await (await browser.newContext()).newPage();
      states = await measure(page, css, partMounts, 'states');
      await page.close();
    } finally {
      await close();
    }
    assert.equal(states, 'transform', 'a part the scene never stamped can never move on the states axis');
  }, 120_000);

  it('the axis FAILS when its only mounted part goes literal, so the loss is a verdict and not a quieter number', async () => {
    const dead = `${DRILL_ROOT_CSS}\n${DRILL_DEAD_PART}`;
    const live = `${DRILL_ROOT_CSS}\n${DRILL_LIVE_PART}`;
    const mounted = (css) => new Map([['drill', familyParts(css, DRILL_ELEMENT, ['shape'])]]);
    const { browser, close } = await launchBrowser();
    let moved;
    let lost;
    try {
      const page = await (await browser.newContext()).newPage();
      moved = await measure(page, live, mounted(live));
      lost = await measure(page, dead, mounted(dead));
      await page.close();
    } finally {
      await close();
    }
    const axisCell = (property) => cell({
      axis: 'shape', scenario: 'shape', denominator: 1,
      moved: property === null ? 0 : 1, percent: property === null ? 0 : 100,
      movedFamilies: property === null ? [] : [{ family: 'drill', property }],
      movedIds: property === null ? [] : ['drill'],
    });
    assert.deepEqual(evaluate(result([axisCell(moved)]), { threshold: 80 }).filter((line) => line.startsWith('shape:')), []);
    const failures = evaluate(result([axisCell(lost)]), { threshold: 80 });
    assert.ok(failures.some((line) => line.startsWith('shape: 0.0 % < 80 %')), failures.join(' | '));
  }, 120_000);
});

/**
 * THE RED ARM OF THE ROOT REPAIR, driven through one real browser over one
 * page, because the defect and the repair are both about whether a selector
 * MATCHES and no offline reading can answer that.
 *
 * The fixture is `breadcrumb` in miniature: a dial-fed `border-radius` on the
 * family's own root rule, and a more-decorated descendant chain that used to
 * win the mount and fabricate a `data-part="label"` node out of it.
 *
 *   BLIND  the merged root        -> no difference (the defect, measured)
 *   SEEING the head compound      -> the difference, on the root's own rule
 *   RED    the head, rule literal -> no difference, and the axis FAILS
 *
 * BLIND and RED read the same 0 and mean opposite things, which is why the
 * root map is published with every run.
 */
describe('axis-difference BROWSER drill — a root that STOPS differing is caught', { skip: browserReason }, () => {
  const ARM_A = { '--ds-radius-md': '4px' };
  const ARM_B = { '--ds-radius-md': '16px' };
  const axisOf = axisByProperty();
  const CHAIN = ".ds-drill.ds-drill--modern[data-part='root'] [data-part='crumb'][data-clickable='true'] [data-part='label']"
    + ' { padding: 2px; }';
  const LIVE_ROOT = `.ds-drill.ds-drill--modern[data-part='root'] { border-radius: var(--ds-radius-md); }\n${CHAIN}`;
  const DEAD_ROOT = `.ds-drill.ds-drill--modern[data-part='root'] { border-radius: 6px; }\n${CHAIN}`;

  /** The family measured exactly as `run` measures it, on whichever root reading is asked for. */
  const measure = async (page, css, { collapsedRoots }) => {
    const element = familyElement(css, { collapsedRoots });
    const elements = new Map([['drill', element]]);
    const partMounts = new Map([['drill', familyParts(css, element, ['shape'])]]);
    await page.setContent(
      sceneHtml({ css, vertical: 'bithire', theme: 'light', elements, partMounts }),
      { waitUntil: 'load' },
    );
    const properties = AXES.shape.computed;
    const before = await measureCell({ page, variables: ARM_A, properties, axisOf });
    const after = await measureCell({ page, variables: ARM_B, properties, axisOf });
    return differsOnAxis('shape', before, after, 'drill');
  };

  it('reads the dial on the real root, reads nothing on the merged one, and reads nothing again when the root rule goes literal', async () => {
    const { browser, close } = await launchBrowser();
    let blind;
    let seeing;
    let red;
    try {
      const page = await (await browser.newContext()).newPage();
      blind = await measure(page, LIVE_ROOT, { collapsedRoots: true });
      seeing = await measure(page, LIVE_ROOT, { collapsedRoots: false });
      red = await measure(page, DEAD_ROOT, { collapsedRoots: false });
      await page.close();
    } finally {
      await close();
    }
    // The defect this lot repairs, planted: the paint is live, root-level and
    // dial-fed, and the instrument cannot see it because the node it mounted is
    // not the node the rule selects.
    assert.equal(blind, null, 'the merged root must be blind to its own root rule — otherwise this drill proves nothing');
    assert.equal(seeing, 'border-top-left-radius', 'the repaired root must carry the dial to the page');
    // THE RED ARM. The root is still mounted and still read; its rule stopped
    // consuming the dial, and that must read as a non-mover.
    assert.equal(red, null, 'a mounted root whose rule stopped consuming the dial must NOT keep reporting a difference');
  }, 120_000);

  it('the axis FAILS when the repaired root goes literal, so the loss is a verdict and not a quieter number', async () => {
    const { browser, close } = await launchBrowser();
    let moved;
    let lost;
    try {
      const page = await (await browser.newContext()).newPage();
      moved = await measure(page, LIVE_ROOT, { collapsedRoots: false });
      lost = await measure(page, DEAD_ROOT, { collapsedRoots: false });
      await page.close();
    } finally {
      await close();
    }
    const axisCell = (property) => cell({
      axis: 'shape', scenario: 'shape', denominator: 1,
      moved: property === null ? 0 : 1, percent: property === null ? 0 : 100,
      movedFamilies: property === null ? [] : [{ family: 'drill', property }],
      movedIds: property === null ? [] : ['drill'],
    });
    assert.deepEqual(evaluate(result([axisCell(moved)]), { threshold: 80 }).filter((line) => line.startsWith('shape:')), []);
    assert.ok(
      evaluate(result([axisCell(lost)]), { threshold: 80 }).some((line) => line.startsWith('shape: 0.0 % < 80 %')),
    );
  }, 120_000);

  it('a family whose paint genuinely does not differ still reads as a NON-MOVER on its repaired root', async () => {
    // The mount reaches more paint; it must not invent any. This root is
    // mounted, matched and read -- and its radius is a literal, so the honest
    // verdict is the same 0 the merged reading gave, for the opposite reason.
    const { browser, close } = await launchBrowser();
    let verdict;
    try {
      const page = await (await browser.newContext()).newPage();
      verdict = await measure(page, DEAD_ROOT, { collapsedRoots: false });
      await page.close();
    } finally {
      await close();
    }
    assert.equal(verdict, null);
  }, 120_000);
});

/**
 * THE RED ARMS OF THE REACH REPAIR, one per mechanism, each driven through one
 * real browser over one page with one pair of arms.
 *
 * Proving the rhythm numerator went up proves nothing: an instrument that
 * mounted more nodes would do exactly that. What has to be true is the
 * opposite reading -- a node that is now mounted, now read, and STOPS
 * consuming the dial must come back as a non-mover and fail the axis.
 *
 *   BLIND  the pre-repair reading        -> no difference (the defect)
 *   SEEING the repaired reading          -> the difference, on the node
 *   RED    the repaired reading, literal -> no difference, and the axis FAILS
 *
 * BLIND and RED read the same 0 and mean opposite things, which is why the
 * root map, the as-rendered map and the part map are all published with a run.
 */
describe('axis-difference BROWSER drill — the reach repair, and every node it reaches that STOPS differing', { skip: browserReason }, () => {
  const ARM_A = { '--ds-spacing-2': '4px' };
  const ARM_B = { '--ds-spacing-2': '16px' };
  const axisOf = axisByProperty();

  /** One family measured on whichever reading is asked for, exactly as `run` measures a cell. */
  const measure = async (page, css, { element, partMounts }) => {
    await page.setContent(
      sceneHtml({ css, vertical: 'bithire', theme: 'light', elements: new Map([['drill', element]]), partMounts }),
      { waitUntil: 'load' },
    );
    const properties = AXES.rhythm.computed;
    const before = await measureCell({ page, variables: ARM_A, properties, axisOf });
    const after = await measureCell({ page, variables: ARM_B, properties, axisOf });
    return differsOnAxis('rhythm', before, after, 'drill');
  };

  const axisFails = (property) => {
    const only = cell({
      axis: 'rhythm', scenario: 'rhythm', denominator: 1,
      moved: property === null ? 0 : 1, percent: property === null ? 0 : 100,
      movedFamilies: property === null ? [] : [{ family: 'drill', property }],
      movedIds: property === null ? [] : ['drill'],
    });
    return evaluate(result([only]), { threshold: 80 }).some((line) => line.startsWith('rhythm: 0.0 % < 80 %'));
  };

  it('AS RENDERED: reads the size rung the default render carries, reads nothing on the bare root, and nothing again when the rung goes literal', async () => {
    // `kbd` in miniature: every rhythm rule the family has is behind a
    // `[data-size]` rung, and the mount law reads the bare attribute as `''`.
    const live = ".rottay-drill[data-part='root'][data-size] { display: block; }\n"
      + ".rottay-drill[data-part='root'][data-size='md'] { padding-inline: var(--ds-spacing-2); }";
    const dead = ".rottay-drill[data-part='root'][data-size] { display: block; }\n"
      + ".rottay-drill[data-part='root'][data-size='md'] { padding-inline: 7px; }";
    const bare = (css) => familyElement(css);
    const rendered = (css) => withAsRenderedStamps(bare(css), [{ attribute: 'data-size', value: 'md' }]);
    const { browser, close } = await launchBrowser();
    let blind;
    let seeing;
    let red;
    try {
      const page = await (await browser.newContext()).newPage();
      assert.equal(bare(live).attributes['data-size'], '', 'the defect: the mount law reads the bare rung as an empty value');
      blind = await measure(page, live, { element: bare(live), partMounts: null });
      seeing = await measure(page, live, { element: rendered(live), partMounts: null });
      red = await measure(page, dead, { element: rendered(dead), partMounts: null });
      await page.close();
    } finally {
      await close();
    }
    assert.equal(blind, null, 'the unstamped root must be blind — otherwise this drill proves nothing');
    assert.equal(seeing, 'padding-right', 'the default-render stamp must carry the dial to the page');
    assert.equal(red, null, 'a stamped root that stopped consuming the dial must NOT keep reporting a difference');
    assert.ok(axisFails(red), 'the loss must be a verdict, not a quieter number');
  }, 120_000);

  it('BEM ELEMENT: reads the element the family renders inside its root, reads nothing when it is not mounted, and nothing again when it goes literal', async () => {
    // `terminal-block` in miniature: the reaching rule is written WITHOUT an
    // ancestor, so the pre-lot law never built the node at all.
    const root = ".rt-drill[data-part='root'] { display: block; }";
    const live = `${root}\n.rt-drill__body { gap: var(--ds-spacing-2); }`;
    const dead = `${root}\n.rt-drill__body { gap: 7px; }`;
    const element = familyElement(live);
    const mounted = (css, reach) => new Map([['drill', familyParts(css, element, ['rhythm'], { family: 'drill', partReach: reach })]]);
    const { browser, close } = await launchBrowser();
    let blind;
    let seeing;
    let red;
    try {
      const page = await (await browser.newContext()).newPage();
      assert.equal(mounted(live, false).get('drill').parts.length, 0, 'the defect: the pre-lot law builds no node for this rule');
      blind = await measure(page, live, { element, partMounts: mounted(live, false) });
      seeing = await measure(page, live, { element, partMounts: mounted(live, true) });
      red = await measure(page, dead, { element, partMounts: mounted(dead, true) });
      await page.close();
    } finally {
      await close();
    }
    assert.equal(blind, null, 'the unmounted element must be blind');
    assert.equal(seeing, 'row-gap', 'the grafted element must carry the dial to the page');
    assert.equal(red, null, 'a mounted element that stopped consuming the dial must NOT keep reporting a difference');
    assert.ok(axisFails(red), 'the loss must be a verdict, not a quieter number');
  }, 120_000);

  it('`:has()`: reads the node the scene already built, reads nothing without the stamp, and nothing again when the rule goes literal', async () => {
    // `qrcode` in miniature: the moving `gap` is declared on an INTERMEDIATE
    // node of a chain the scene builds, under a condition on the scene itself.
    const root = ".ds-drill[data-part='root'] { display: block; }";
    const chain = ".ds-drill[data-part='root'] > [data-part='wrap'] > [data-part='text'] { padding: 1px; }";
    const live = `${root}\n${chain}\n.ds-drill[data-part='root'] > [data-part='wrap']:has(> [data-part='text']) { gap: var(--ds-spacing-2); }`;
    const dead = `${root}\n${chain}\n.ds-drill[data-part='root'] > [data-part='wrap']:has(> [data-part='text']) { gap: 7px; }`;
    const element = familyElement(live);
    const mounted = (css, reach) => new Map([['drill', familyParts(css, element, ['rhythm'], { family: 'drill', partReach: reach })]]);
    const { browser, close } = await launchBrowser();
    let blind;
    let seeing;
    let red;
    try {
      const page = await (await browser.newContext()).newPage();
      assert.equal(mounted(live, false).get('drill').rejected['part-pseudo'], 1, 'the defect: the reaching rule is refused outright');
      blind = await measure(page, live, { element, partMounts: mounted(live, false) });
      seeing = await measure(page, live, { element, partMounts: mounted(live, true) });
      red = await measure(page, dead, { element, partMounts: mounted(dead, true) });
      await page.close();
    } finally {
      await close();
    }
    assert.equal(blind, null, 'an intermediate node no axis stamps must be blind');
    assert.equal(seeing, 'row-gap', 'the stamped intermediate must carry the dial to the page');
    assert.equal(red, null, 'a stamped node that stopped consuming the dial must NOT keep reporting a difference');
    assert.ok(axisFails(red), 'the loss must be a verdict, not a quieter number');
  }, 120_000);

  it('FAIL-CLOSED: a family whose rhythm paint is a literal stays a NON-MOVER on every node the repair reaches', async () => {
    // The negative control of the whole lot, and it is the reading two of the
    // census families actually give once they are reached: `bottom-tab-bar`
    // (6px/2px/10px private channels) and `terminal-block` (bare rem) are
    // MOUNTED by this repair and still do not move, because their paint is a
    // literal and not a dial.
    const css = ".rt-drill[data-part='root'] { display: block; padding: 3px; }\n"
      + '.rt-drill__body { gap: 0.375rem; padding: 1rem 1.25rem; }\n'
      + ".rt-drill[data-part='root'][data-size='md'] { padding-inline: 6px; }";
    const element = withAsRenderedStamps(familyElement(css), [{ attribute: 'data-size', value: 'md' }]);
    const partMounts = new Map([['drill', familyParts(css, element, ['rhythm'], { family: 'drill' })]]);
    assert.ok(partMounts.get('drill').parts.length > 0, 'the drill is vacuous unless the literal node is actually mounted');
    const { browser, close } = await launchBrowser();
    let reading;
    try {
      const page = await (await browser.newContext()).newPage();
      reading = await measure(page, css, { element, partMounts });
      await page.close();
    } finally {
      await close();
    }
    assert.equal(reading, null, 'a literal must read 0 however many nodes the repair reaches');
  }, 120_000);
});

describe('axis-difference BROWSER drill — a document does not differ from itself', { skip: browserReason }, () => {
  // Families the full run measured as MOVING on shape, so the positive half of
  // this drill is not silently asserting against a subset that moves nothing.
  const FAMILIES = ['alert', 'callout', 'collapse', 'activity-log', 'badge'];

  it('a NULL pair reads 0 % on its axis, and the real pair reads more', async () => {
    const shape = SCENARIOS.find((scenario) => scenario.id === 'shape');
    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: FAMILIES,
      scenarios: [
        { id: 'null-pair', kind: 'positive', axis: 'shape', a: shape.a, b: shape.a },
        shape,
      ],
    });

    const nullCell = measurement.cells.find((entry) => entry.scenario === 'null-pair');
    const realCell = measurement.cells.find((entry) => entry.scenario === 'shape');
    assert.ok(nullCell && realCell, 'both scenarios must have produced a cell');
    assert.equal(
      nullCell.moved,
      0,
      `the instrument reported ${nullCell.moved} famil(ies) differing between a document and ITSELF: `
      + `${nullCell.movedFamilies.map((entry) => `${entry.family}(${entry.property})`).join(', ')}`,
    );
    assert.ok(
      realCell.moved > 0,
      'the real shape pair moved nothing, so the null result above proves nothing either',
    );
    assert.deepEqual(measurement.refusals, [], JSON.stringify(measurement.refusals));
  });

  it('a palette control whose two documents are the SAME document is refused, end to end', async () => {
    // The identical-map law driven through the real compiler, the real bundle
    // and the real browser rather than asserted over a hand-built cell. A NULL
    // palette pair is the shape the defect had: both arms compile a full map,
    // the maps are the same map, and the 0 % that follows is arithmetic.
    const palette = SCENARIOS.find((scenario) => scenario.id === 'palette-only');
    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: FAMILIES,
      scenarios: [{ ...palette, a: palette.a, b: palette.a }],
    });

    const cells = measurement.cells.filter((entry) => entry.scenario === 'palette-only');
    assert.ok(cells.length > 0);
    for (const entry of cells) {
      assert.ok(entry.compiledA > 0 && entry.compiledB > 0, 'the defect needs BOTH arms to compile a full map');
      assert.equal(entry.witness.differing, 0);
      assert.equal(entry.evidential, false, `${entry.axis}: a document does not witness itself`);
      assert.match(entry.nonEvidentialReason, /IDENTICAL effective map in bithire\/light/);
    }
    assert.ok(
      evaluate(measurement).some((line) => line.startsWith('NEGATIVE CONTROL palette-only')
        && line.includes('NON-EVIDENTIAL')),
      'and the run fails closed rather than publishing a control it no longer has',
    );
  });

  it('MUTANT: controls that smuggle a shape row and a typography row are caught end to end', async () => {
    // The shipped controls with one foreign row planted in each second document,
    // driven through the real compiler, bundle and browser. Red here is the proof
    // that the controls' green on the real pair is a measurement.
    const byId = (id) => SCENARIOS.find((scenario) => scenario.id === id);
    const palette = byId('palette-only');
    const emphasis = byId('states-emphasis-only');
    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: [...FAMILIES, 'heading'],
      scenarios: [
        byId('states'),
        { ...palette, b: { ...palette.b, 'shape.radius-scale': 1.15 } },
        { ...emphasis, b: { ...emphasis.b, 'typography.scale': 1.05 } },
      ],
    });
    const failures = evaluate(measurement, { vacuityPermitted: VACUITY_PERMITTED_CONTROLS });
    assert.ok(
      failures.some((line) => line.startsWith('NEGATIVE CONTROL palette-only moved') && line.includes('on shape')),
      failures.join(' | '),
    );
    assert.ok(
      failures.some((line) => line.startsWith('NEGATIVE CONTROL states-emphasis-only moved') && line.includes('on typography')),
      failures.join(' | '),
    );
  });

  it('the bithire rhythm pair: one arm compiles NOTHING, the pair is not inert, end to end', async () => {
    // The case that fails the emptiness rule, driven through the real compiler,
    // the real bundle and the real browser. bithire's preset already states
    // `density.mode: compact` and `spacing.rhythm: tight`, so the arm that
    // authors them subtracts to an empty artifact delta against the vertical's
    // own compile -- and paints 0.85/0.85 off the bundle underneath.
    const rhythm = SCENARIOS.find((scenario) => scenario.id === 'rhythm');
    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: FAMILIES,
      scenarios: [rhythm],
    });

    const [rhythmCell] = measurement.cells.filter((entry) => entry.scenario === 'rhythm');
    assert.ok(rhythmCell, JSON.stringify(measurement.refusals));
    assert.equal(rhythmCell.compiledA, 0, 'the arm that restates the vertical must compile nothing — that is the case');
    assert.ok(rhythmCell.compiledB > 0);
    assert.equal(rhythmCell.appliedA, 0, 'and an empty arm applies nothing BY DESIGN, not an instrument loss');
    assert.equal(rhythmCell.resolvedDiffering, rhythmCell.channels, 'every channel resolves to a different paint');
    assert.equal(rhythmCell.evidential, true);
    assert.equal(rhythmCell.nonEvidentialReason, undefined);
    assert.deepEqual(
      evaluate(measurement).filter((line) => line.includes('SAME paint') || line.includes('instrument lost')),
      [],
      'neither verdict may be reached by a baseline-coincident arm',
    );

    // The same vertical against ITSELF is still inert, so the drill above is
    // not merely proving that nothing fails any more.
    const nullPair = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: FAMILIES,
      scenarios: [{ ...rhythm, b: rhythm.a }],
    });
    for (const entry of nullPair.cells) {
      assert.equal(entry.resolvedDiffering, 0, JSON.stringify(entry.resolvedDifferingChannels));
      assert.equal(entry.evidential, false);
    }
    assert.ok(
      evaluate(nullPair).some((line) => line.startsWith('bithire/light rhythm') && line.includes('SAME paint')
        && line.includes('INERT_PAIRS')),
      evaluate(nullPair).join(' | '),
    );
  });

  it('ALIAS: an arm that reaches the other arm\'s value through var() is NOT a differing channel', async () => {
    // The audit's counterexample driven through the REAL path -- the real
    // bundle, the real scene, the real per-arm application -- rather than
    // against the comparator on its own. `compile` is overridden because the
    // point is the channel values the arms carry, not how a decision produced
    // them; everything downstream of them is the shipped instrument.
    const ARMS = {
      // Both arms declare the alias, so the only channel in question is the
      // one that CONSUMES it: literally in arm A, through var() in arm B.
      'alias-equal-a': { '--ds-axis-alias': '0.5', '--ds-state-disabled-opacity': '0.5' },
      'alias-equal-b': { '--ds-axis-alias': '0.5', '--ds-state-disabled-opacity': 'var(--ds-axis-alias)' },
      // POSITIVE CONTROL: the same shape, a genuinely different value.
      'alias-different-a': { '--ds-axis-alias': '0.5', '--ds-state-disabled-opacity': '0.5' },
      'alias-different-b': { '--ds-axis-alias': '0.75', '--ds-state-disabled-opacity': 'var(--ds-axis-alias)' },
    };
    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: FAMILIES,
      compile: ({ slug }) => ({ artifact: { variables: ARMS[slug], modeDeltas: [] } }),
      scenarios: ['alias-equal', 'alias-different'].map((id) => ({ id, kind: 'positive', axis: 'shape', a: {}, b: {} })),
    });
    assert.deepEqual(measurement.refusals, [], JSON.stringify(measurement.refusals));

    const equal = measurement.cells.find((entry) => entry.scenario === 'alias-equal');
    assert.equal(equal.resolvedSource, 'browser', 'the reading must come from the page, not from the maps');
    assert.equal(equal.channels, 2);
    assert.equal(equal.differing, 1, 'the two maps DO differ as strings — that is the defect this refuses');
    assert.equal(
      equal.resolvedDiffering,
      0,
      `the alias computes to what the other arm writes: ${JSON.stringify(equal.resolvedDifferingChannels)}`,
    );
    assert.equal(equal.evidential, false, 'so the pair buys no standing');
    assert.match(equal.nonEvidentialReason, /SAME paint in bithire\/light/);

    const different = measurement.cells.find((entry) => entry.scenario === 'alias-different');
    assert.equal(different.resolvedSource, 'browser');
    assert.equal(different.resolvedDiffering, 2, 'the alias AND the channel that consumes it both move');
    assert.deepEqual(different.resolvedDifferingChannels, ['--ds-axis-alias', '--ds-state-disabled-opacity']);
    assert.equal(different.evidential, true, 'or the repair would be passing by seeing nothing at all');
  });

  it('the resolved reading is the PAGE: a reference only the bundle can close is still closed', async () => {
    // The separation between the two readings, stated as a case: neither arm
    // declares `--ds-rhythm-scale`, so the offline reader cannot close either
    // arm's reference and says so, while the browser reads what the bundle
    // paints and finds the consumer identical in both arms.
    const ARMS = {
      'bundle-alias-a': { '--ds-axis-probe': 'var(--ds-rhythm-scale)' },
      'bundle-alias-b': {
        '--ds-axis-probe-alias': 'var(--ds-rhythm-scale)',
        '--ds-axis-probe': 'var(--ds-axis-probe-alias)',
      },
    };
    const offline = resolvedDifference(ARMS['bundle-alias-a'], ARMS['bundle-alias-b'], {});
    assert.equal(offline.source, 'offline');
    assert.equal(offline.differing, 0);
    assert.equal(offline.unresolved, 2, 'the map reader cannot see the bundle, and does not pretend to');

    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: FAMILIES,
      compile: ({ slug }) => ({ artifact: { variables: ARMS[slug], modeDeltas: [] } }),
      scenarios: [{ id: 'bundle-alias', kind: 'positive', axis: 'shape', a: {}, b: {} }],
    });
    assert.deepEqual(measurement.refusals, [], JSON.stringify(measurement.refusals));
    const [entry] = measurement.cells.filter((cell) => cell.scenario === 'bundle-alias');
    assert.equal(entry.resolvedSource, 'browser');
    assert.equal(entry.channels, 2);
    assert.deepEqual(
      entry.resolvedDifferingChannels,
      ['--ds-axis-probe-alias'],
      'only the name arm B newly declares differs — the channel both arms route through the bundle does not',
    );
  });

  it('a mounted anatomy against itself reads 0 % on every axis, states included', async () => {
    const shape = SCENARIOS.find((scenario) => scenario.id === 'shape');
    const markup = '<button type="button" class="ds-button ds-button--modern" data-variant="primary" '
      + 'data-part="trigger"><span data-part="content"><span data-part="label">Save</span></span></button>';
    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: ['button'],
      mounts: { button: { markup } },
      scenarios: AXIS_IDS.map((axis) => ({ id: `null-${axis}`, kind: 'positive', axis, a: shape.b, b: shape.b })),
    });
    assert.deepEqual(measurement.families.mounted, ['button']);
    assert.equal(measurement.cells.length, AXIS_IDS.length);
    for (const entry of measurement.cells) {
      assert.equal(entry.denominator, 1, `${entry.axis}: the mounted family is in the denominator`);
      assert.equal(entry.moved, 0, `${entry.axis}: ${JSON.stringify(entry.movedFamilies)}`);
    }
  });
});

describe('axis-difference — computed invariants over mounted parts, and the N/A beside every printed denominator', () => {
  const reading = (over = {}) => ({
    vertical: 'bithire', theme: 'light', scenario: 'shape-only', kind: 'positive',
    family: 'radio', part: 'circle', selector: "[data-part='circle']", property: 'border-top-left-radius',
    a: ['9999px', '9999px', '9999px'], b: ['9999px', '9999px', '9999px'],
    ...over,
  });
  const CIRCLE = { family: 'radio', part: 'circle', selector: "[data-part='circle']", expected: '9999px' };

  it('a part that reads the expected value in every arm of every cell passes', () => {
    assert.deepEqual(partInvariantFailures({ partReadings: [reading(), reading({ theme: 'dark' })] }, [CIRCLE]), []);
  });

  it('MUTANT: a producer change that squares one arm is named by part, value, cell and arm', () => {
    const failures = partInvariantFailures({ partReadings: [reading({ b: ['0px', '9999px', '0px'] })] }, [CIRCLE]);
    assert.deepEqual(failures, ['radio/circle: border-top-left-radius computed 0px != 9999px in bithire/light shape-only arm B']);
  });

  it('MUTANT: a part nobody measured, or a selector that matched no element, is a failure rather than a pass', () => {
    assert.deepEqual(partInvariantFailures({ partReadings: [] }, [CIRCLE]),
      ["radio/circle: not measured — no reading was taken for [data-part='circle']"]);
    const failures = partInvariantFailures({ partReadings: [reading({ a: [] })] }, [CIRCLE]);
    assert.ok(failures.some((line) => line.includes('not measured in bithire/light shape-only arm A')), failures.join(' | '));
  });

  it('prints every denominator with its N/A, effective and declared alike', () => {
    const result = {
      populations: { shape: 4, typography: 5 },
      declaredPopulations: { shape: 216, typography: 181 },
      notApplicable: { shape: 1, typography: 0 },
    };
    assert.equal(denominatorLine(result), 'shape 4 (1 N/A), typography 5 (0 N/A)');
    assert.equal(denominatorLine(result, 'declaredPopulations'), 'shape 216 (1 N/A), typography 181 (0 N/A)');
    assert.equal(denominatorLine({ populations: { shape: 4 } }), 'shape 4 (0 N/A)');
  });
});

/**
 * THE DISABLED STAMP, which exists because the axis could not see the state at
 * all.
 *
 *   `STATE_VARIANTS` was `['hovered','pressed','selected','focus-visible']`.
 *
 * Nothing in the scene ever became disabled, so every declaration the fleet
 * gates on being disabled -- the press-scale pair, the disabled opacity, the
 * disabled shadow -- sat outside the instrument BY CONSTRUCTION and its 0 was
 * arithmetic rather than a reading. These cases pin the repair from both ends:
 * what the stamp is (the two attributes a disabled component writes, measured
 * over the corpus rather than assumed), and -- in a real browser -- the four
 * readings that tell a repair apart from a number that merely went up.
 */
describe('axis-difference — disabled is a stamped state, and the stamp is the contract a component writes', () => {
  it('stamps the fifth state, and it is the one a component receives as a PROP', () => {
    assert.ok(STATE_VARIANTS.includes('disabled'));
    assert.deepEqual(STATES_AXIS_LIMITS.stampedStates, [...STATE_VARIANTS]);
  });

  it('carries the second attribute for disabled ALONE, because it is the only state a component also spells out', () => {
    // The kernel's `serializeState` gives every state its `data-state` token.
    // `data-disabled='true'` is what the component writes beside it when the
    // prop arrives, and the corpus gates on the two in comparable measure.
    assert.deepEqual(Object.keys(STATE_STAMP_ATTRIBUTES), ['disabled']);
    assert.deepEqual(STATE_STAMP_ATTRIBUTES.disabled, { 'data-disabled': 'true' });
    assert.deepEqual([...STATE_STAMP_ATTRIBUTE_NAMES], ['data-disabled']);
    for (const state of STATE_VARIANTS) {
      if (state !== 'disabled') assert.equal(STATE_STAMP_ATTRIBUTES[state], undefined, state);
    }
  });

  it('counts the reach of the stamp per vocabulary, and names what no attribute stamp can reach', () => {
    const census = disabledVocabularyCensus(ROOT);
    // Both vocabularies are live and NEITHER covers the other: stamping only
    // the kernel token would have reached under half of what the corpus gates.
    assert.ok(census.families.dataState > 20, JSON.stringify(census.families));
    assert.ok(census.families.dataDisabled > 20, JSON.stringify(census.families));
    assert.ok(census.reachedFamilies > census.families.dataState, JSON.stringify(census));
    assert.ok(census.reachedFamilies > census.families.dataDisabled, JSON.stringify(census));
    assert.equal(
      census.reachedFamilies + census.unreachedFamilies.length,
      census.gatedFamilies,
      'every family that gates disabled paint is either reached or named as unreached',
    );
    // The honest residual: a pseudo-class and an aria mirror this scene cannot
    // produce, named rather than folded into the percentage. Each named family
    // is re-read on its own, so "unreached" is a measurement and not a label.
    for (const family of census.unreachedFamilies) {
      const own = disabledVocabularyCensus(ROOT, [family]);
      assert.equal(own.rules.dataState, 0, family);
      assert.equal(own.rules.dataDisabled, 0, family);
      assert.ok(own.rules.nativePseudo + own.rules.ariaDisabled > 0, family);
    }
    assert.ok(
      STATES_AXIS_LIMITS.unreachable.some((line) => line.includes(':disabled')),
      'the residual must be published with the run',
    );
  });

  it('reads a fixture family by the vocabulary it actually gates on', () => {
    const census = disabledVocabularyCensus(ROOT, ['button']);
    assert.ok(census.rules.dataDisabled > 0, JSON.stringify(census));
    assert.equal(census.gatedFamilies, 1);
    assert.equal(census.reachedFamilies, 1);
    assert.deepEqual(census.unreachedFamilies, []);
  });
});

/**
 * THE PUBLICATION REFUSAL, which is the friction the press/disabled lot
 * registered: every run rewrote the published pilot artifact, including the
 * ad-hoc one a reviewer takes to answer a single question about a single
 * family. The record then carried a reading nobody reviewed.
 */
describe('axis-difference — a measurement that is not the published one may not publish', () => {
  it('permits an unflagged run', () => {
    assert.equal(publicationRefusal({ argv: ['node', 'index.mjs'], env: {} }), null);
    assert.equal(publicationRefusal(), null);
  });

  it('refuses on the flag and on the environment opt-out, which is the one a vitest can reach', () => {
    assert.match(publicationRefusal({ argv: [NO_WRITE_FLAG] }), /--no-write was passed/u);
    assert.match(publicationRefusal({ env: { [NO_WRITE_ENV]: '1' } }), /AXIS_DIFFERENCE_NO_WRITE=1 is set/u);
  });

  it('does NOT refuse a filtered run by itself: the pilot always filters, to its own declared roster', () => {
    assert.equal(publicationRefusal({ argv: ['node', 'index.mjs', '--families=button'], env: {} }), null);
  });

  it('treats an empty, zero or false opt-out as absent, so an exported blank does not silently stop publishing', () => {
    for (const value of ['', '0', 'false']) {
      assert.equal(publicationRefusal({ env: { [NO_WRITE_ENV]: value } }), null, value);
    }
  });
});

/**
 * THE RED ARM OF THE DISABLED STAMP, driven through one real browser over one
 * page, because the defect and the repair are both about whether a rule enters
 * the cascade at all and no offline reading can answer that.
 *
 * Three fixtures, each a family in miniature, and the arms are the two values
 * `states.emphasis` actually compiles for the disabled channels (0.68/0.99
 * subtle against 0.5/0.965 strong):
 *
 *   state-gated  `[data-state~='disabled']`  -> opacity moves
 *   attr-gated   `[data-disabled='true']`    -> transform moves
 *   literal      `[data-state~='disabled']`  -> a literal, so it must NOT move
 *
 * Read twice on the SAME tree: with the stamp, and with `statesDisabled: false`
 * -- the four-state set the probe shipped before this lot. The second reading is
 * the defect, measured rather than recalled, and the `literal` fixture is what
 * separates "the instrument reaches the paint" from "the number went up".
 */
describe('axis-difference BROWSER drill — the scene becomes disabled, and a literal still does not move', { skip: browserReason }, () => {
  const ARM_A = { '--ds-state-disabled-opacity': '0.68', '--ds-state-press-scale': '0.99' };
  const ARM_B = { '--ds-state-disabled-opacity': '0.5', '--ds-state-press-scale': '0.965' };
  const axisOf = axisByProperty();
  const FIXTURES = {
    'state-gated': ".ds-sg.ds-sg--modern[data-part='root'] { opacity: 1; }\n"
      + ".ds-sg.ds-sg--modern[data-part='root'][data-state~='disabled'] { opacity: var(--ds-state-disabled-opacity); }",
    'attr-gated': ".ds-ag.ds-ag--modern[data-part='root'] { transform: none; }\n"
      + ".ds-ag.ds-ag--modern[data-part='root'][data-disabled='true'] { transform: scale(var(--ds-state-press-scale)); }",
    literal: ".ds-lit.ds-lit--modern[data-part='root'] { opacity: 1; }\n"
      + ".ds-lit.ds-lit--modern[data-part='root'][data-state~='disabled'] { opacity: 0.5; }",
  };
  const CSS = Object.values(FIXTURES).join('\n');
  const elements = () => new Map(Object.entries(FIXTURES).map(([family, own]) => [family, familyElement(own)]));

  const open = async (page) => {
    await page.setContent(
      sceneHtml({ css: CSS, vertical: 'bithire', theme: 'light', elements: elements() }),
      { waitUntil: 'load' },
    );
  };

  const measure = async (page, { states }) => {
    const properties = allProperties();
    const before = await measureCell({ page, variables: ARM_A, properties, axisOf, states });
    const after = await measureCell({ page, variables: ARM_B, properties, axisOf, states });
    return {
      before,
      after,
      differs: (family) => differsOnAxis('states', before, after, family),
    };
  };

  it('the root is NOT born disabled: the stamp supplies the state, exactly as it does for the other four', () => {
    // A gate the mount baked in would measure a configuration the default
    // render never produces, and the drill below would then pass for the
    // wrong reason.
    for (const [family, css] of Object.entries(FIXTURES)) {
      const element = familyElement(css);
      assert.deepEqual(element.attributes, { 'data-part': 'root' }, family);
    }
  });

  it('reads the disabled paint of BOTH vocabularies, read nothing before the stamp, and still reads nothing on a literal', async () => {
    const { browser, close } = await launchBrowser();
    let stamped;
    let preLot;
    try {
      const page = await (await browser.newContext()).newPage();
      await open(page);
      stamped = await measure(page, { states: undefined });
      preLot = await measure(page, { states: STATE_VARIANTS.filter((state) => state !== 'disabled') });
      await page.close();
    } finally {
      await close();
    }
    // THE DEFECT, measured: four states stamped, and the paint is unreachable.
    assert.equal(preLot.differs('state-gated'), null, 'the pre-lot state set must be blind — otherwise this drill proves nothing');
    assert.equal(preLot.differs('attr-gated'), null, 'the pre-lot state set must be blind on the attribute vocabulary too');
    // THE REPAIR: measurable AND measured, on each vocabulary separately.
    assert.equal(stamped.differs('state-gated'), 'opacity');
    assert.equal(stamped.differs('attr-gated'), 'transform');
    // THE NEGATIVE ARM: mounted, stamped, matched and read -- and its value is
    // a literal, so the honest verdict is the same 0 the blind reading gave,
    // for the opposite reason.
    assert.equal(stamped.differs('literal'), null, 'a literal disabled value must NOT be reported as a tenant difference');
  }, 120_000);

  it('clears the disabled attribute for the next state and again at rest, so no later reading inherits it', async () => {
    const { browser, close } = await launchBrowser();
    let sweep;
    let settled;
    try {
      const page = await (await browser.newContext()).newPage();
      await open(page);
      const properties = allProperties();
      // `disabled` FIRST on purpose: the shipped order stamps it last, so a
      // leak into the following state would never be read by the real run.
      sweep = await measureCell({ page, variables: ARM_A, properties, axisOf, states: ['disabled', 'hovered'] });
      settled = await measureCell({ page, variables: ARM_A, properties, axisOf, states: [] });
      await page.close();
    } finally {
      await close();
    }
    assert.notEqual(sweep.states.disabled['attr-gated'].transform, sweep.base['attr-gated'].transform,
      'the disabled stamp must reach the attribute-gated rule at all');
    assert.equal(sweep.states.hovered['attr-gated'].transform, sweep.base['attr-gated'].transform,
      'the hovered reading inherited the disabled attribute from the state before it');
    assert.equal(sweep.states.hovered['state-gated'].opacity, sweep.base['state-gated'].opacity,
      'the hovered reading inherited the disabled token from the state before it');
    assert.deepEqual(settled.base, sweep.base, 'the scene did not return to rest after a disabled sweep');
  }, 120_000);
});

/**
 * THE NATIVE-PSEUDO HALF of the states axis: `:hover`, `:active` and
 * `:focus-visible` matched by the browser through the DevTools protocol.
 *
 * Every expectation below is derived from the CSS selector semantics the
 * forcing claims to reproduce -- the hovered node's ancestors match `:hover`,
 * a focused node's ancestors match `:focus-within` and not `:focus-visible` --
 * never from a reading of the fleet.
 */
describe('axis-difference — the native half forces what a real pointer or keyboard produces', () => {
  it('forces the pseudo on the ancestor chain for hover and press, and ONLY focus-within above a focused node', () => {
    assert.deepEqual([...NATIVE_PSEUDO_VARIANTS], ['hover', 'active', 'focus-visible']);
    assert.deepEqual([...NATIVE_PSEUDO_FORCING.hover.ancestors], [...NATIVE_PSEUDO_FORCING.hover.target]);
    assert.deepEqual([...NATIVE_PSEUDO_FORCING.active.ancestors], [...NATIVE_PSEUDO_FORCING.active.target]);
    assert.ok(NATIVE_PSEUDO_FORCING.active.target.includes('hover'), 'a pressed pointer is a hovered pointer');
    assert.deepEqual([...NATIVE_PSEUDO_FORCING['focus-visible'].ancestors], ['focus-within']);
    for (const pseudo of ['focus', 'focus-visible', 'focus-within']) {
      assert.ok(NATIVE_PSEUDO_FORCING['focus-visible'].target.includes(pseudo), pseudo);
    }
    for (const variant of NATIVE_PSEUDO_VARIANTS) {
      for (const pseudo of [...NATIVE_PSEUDO_FORCING[variant].target, ...NATIVE_PSEUDO_FORCING[variant].ancestors]) {
        assert.ok(FORCED_PSEUDO_CLASSES.includes(pseudo), `${variant} forces ${pseudo}, which is not a forced class`);
      }
    }
  });

  it('strips a top-level forced pseudo and leaves the ones inside :not() and :has() where they are', () => {
    assert.equal(withoutForcedPseudos(".a:hover [data-part='x']:focus-visible"), ".a [data-part='x']");
    assert.equal(withoutForcedPseudos('.a:not(:hover) .b'), '.a:not(:hover) .b');
    assert.equal(withoutForcedPseudos('.a:has(.b:active) .c:active'), '.a:has(.b:active) .c');
    assert.equal(withoutForcedPseudos(".a[data-x=':hover'] .b"), ".a[data-x=':hover'] .b");
    assert.equal(withoutForcedPseudos('.a:focus-within .b:focus'), '.a .b');
    assert.equal(withoutForcedPseudos('.a:disabled .b:checked'), '.a:disabled .b:checked', 'nothing forces these');
    assert.equal(withoutForcedPseudos('.a:hovered'), '.a:hovered', 'a longer name is not the pseudo');
  });

  it('withholds a variant exactly where its pseudo drives a sibling, and nowhere else', () => {
    const forcing = (pseudo) => NATIVE_PSEUDO_VARIANTS.filter((variant) =>
      NATIVE_PSEUDO_FORCING[variant].target.includes(pseudo)).sort();
    assert.deepEqual([...forcedPseudoHazards('.r input:focus-visible ~ [data-part="box"]')].sort(), forcing('focus-visible'));
    assert.deepEqual([...forcedPseudoHazards(".r [data-part='track']:hover + [data-part='handle']")].sort(), forcing('hover'));
    assert.deepEqual([...forcedPseudoHazards('.g > .addon:has(+ .field:focus-within)')].sort(), forcing('focus-within'));
    assert.deepEqual([...forcedPseudoHazards('.r:hover [data-part="x"]')], [], 'an ancestor is on the pointer chain');
    assert.deepEqual([...forcedPseudoHazards('.r [data-part="x"]:hover')], []);
    assert.deepEqual([...forcedPseudoHazards(".r[data-state~='a'] [data-part='x']:hover")], [], '~= is an operator, not a combinator');
    assert.deepEqual([...forcedPseudoHazards('.r:not(:hover) + .x')], [], 'a negation is not a forced state');
    assert.deepEqual(Object.keys(familyForcedPseudoHazards('.a:hover { opacity: 1 }\n.a:focus ~ .b { opacity: 0 }')), ['focus-visible']);
  });

  it('mounts a part gated on a forced pseudo ONLY for the native scene, at rest, for the axes its own rule wrote', () => {
    const css = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root']:hover > [data-part='knob'] { transform: scale(0.9); }
      .ds-drill.ds-drill--modern[data-part='root'] > [data-part='pad'] { gap: 4px; }`;
    const stamped = familyParts(css, DRILL_ELEMENT, ['states', 'rhythm']);
    const native = familyParts(css, DRILL_ELEMENT, ['states', 'rhythm'], { nativePseudos: true });
    assert.deepEqual(stamped.parts.map((part) => part.chain[0].attributes['data-part']), ['pad']);
    assert.equal(stamped.rejected['head-pseudo'], 1);
    const knob = native.parts.find((part) => part.chain[0].attributes['data-part'] === 'knob');
    assert.deepEqual(knob.axes, ['states']);
    assert.ok(knob.selector.includes(':hover'), 'the part publishes the selector its skin authored');
    assert.ok(!partTreeHtml(native.parts).includes('hover'));
    const padded = (record) => record.parts.find((part) => part.chain[0].attributes['data-part'] === 'pad');
    assert.deepEqual(padded(native), padded(stamped), 'a rule with no forced pseudo is the same part in both scenes');
    const element = familyParts(`${DRILL_ROOT_CSS}\n.ds-drill.ds-drill--modern[data-part='root'] > [data-part='x']::after:hover { opacity: 0 }`,
      DRILL_ELEMENT, ['states'], { nativePseudos: true });
    // RESTATED: a pseudo-element is never a NODE the scene builds, in either
    // scene; `::after:hover` (a trailing pseudo-class) is not even a read --
    // it is refused by name, and that refusal is what the census publishes.
    assert.equal(element.parts.length, 0, 'a pseudo-element is never a node the scene builds');
    assert.deepEqual(element.pseudoReads.reads, []);
    assert.deepEqual(element.pseudoReads.entries.map((entry) => entry.refused), ['ua-shadow-pseudo']);
  });

  it('THE COMBINATION RULE: a family moves on states when EITHER half differs, and each half is reported alone', () => {
    const resting = { base: { probe: { opacity: '1' } } };
    const stampedOnly = [
      { ...resting, states: { hovered: { probe: { opacity: '0.9' } } }, native: { hover: { probe: { opacity: '1' } } } },
      { ...resting, states: { hovered: { probe: { opacity: '0.8' } } }, native: { hover: { probe: { opacity: '1' } } } },
    ];
    const nativeOnly = [
      { ...resting, states: { hovered: { probe: { opacity: '1' } } }, native: { hover: { probe: { opacity: '0.9' } } } },
      { ...resting, states: { hovered: { probe: { opacity: '1' } } }, native: { hover: { probe: { opacity: '0.8' } } } },
    ];
    const neither = [
      { base: { probe: { opacity: '0.5' } }, states: { hovered: { probe: { opacity: '1' } } }, native: { hover: { probe: { opacity: '1' } } } },
      { base: { probe: { opacity: '0.7' } }, states: { hovered: { probe: { opacity: '1' } } }, native: { hover: { probe: { opacity: '1' } } } },
    ];
    assert.deepEqual(statesHalves(...stampedOnly, 'probe'), { stamped: 'opacity', native: null });
    assert.deepEqual(statesHalves(...nativeOnly, 'probe'), { stamped: null, native: 'opacity' });
    assert.equal(differsOnAxis('states', ...stampedOnly, 'probe'), 'opacity');
    assert.equal(differsOnAxis('states', ...nativeOnly, 'probe'), 'opacity');
    assert.equal(differsOnAxis('states', ...neither, 'probe'), null, 'a resting change is not a states change in either half');
    const colourOnly = [
      { states: {}, native: { hover: { probe: { 'box-shadow': 'rgb(1, 2, 3) 0px 1px 2px' } } } },
      { states: {}, native: { hover: { probe: { 'box-shadow': 'rgb(9, 9, 9) 0px 1px 2px' } } } },
    ];
    assert.equal(differsOnAxis('states', ...colourOnly, 'probe'), null, 'the native half is attributed exactly like the stamped one');
    assert.equal(differsOnAxis('states', { states: {} }, { states: {} }, 'probe'), null, 'an absent half reads nothing');
  });

  it('takes the native half for every scenario whose cells read the states axis, and only for those', () => {
    const reading = SCENARIOS.filter((scenario) => scenario.axis === 'states'
      || scenario.expectZeroOn?.includes('states')
      || scenario.witness?.axis === 'states').map((scenario) => scenario.id);
    assert.deepEqual(SCENARIOS.filter(readsStatesAxis).map((scenario) => scenario.id), reading);
    assert.ok(reading.includes('palette-only'), 'the palette control holds the states axis at zero, so it must see the native half');
    assert.ok(reading.includes('states-emphasis-only'), 'its witness is read on the states axis');
  });

  it('merges the depth passes back into the stamped reading shape, one pass per node', () => {
    const merged = mergeDepthPasses([
      { f: { opacity: ['1', null, null] } },
      { f: { opacity: [null, '0.5', null] } },
      { f: { opacity: [null, null, '0.25'] } },
    ]);
    assert.deepEqual(merged, { f: { opacity: '1 | 0.5 | 0.25' } });
  });

  it('classifies each state rule by the half that could enter it, and why neither can', () => {
    const probes = stateRuleProbes([
      ".r:hover [data-part='x'] { transform: scale(0.9); }",
      ".r[data-state~='selected'] { opacity: 0.8; }",
      ".r[data-state~='selected']:hover { opacity: 0.7; }",
      ".r:hover::after { opacity: 0.5; }",
      '.r:hover { color: red; }',
      '.r:hover { --ds-x: 1; }',
      '.r input:focus-visible ~ .box { outline-width: 2px; }',
      '.r:has(.b:focus-visible) { outline-offset: 2px; }',
      '.r:disabled { opacity: 0.4; }',
    ].join('\n'));
    const by = (selector) => probes.find((probe) => probe.selector === selector);
    assert.deepEqual(
      { vocabulary: by(".r:hover [data-part='x']").vocabulary, probe: by(".r:hover [data-part='x']").probe, owners: by(".r:hover [data-part='x']").owners },
      { vocabulary: 'native', probe: ".r [data-part='x']", owners: ['states'] },
    );
    assert.deepEqual({ vocabulary: by(".r[data-state~='selected']").vocabulary, probe: by(".r[data-state~='selected']").probe },
      { vocabulary: 'stamped', probe: '.r' });
    assert.equal(by(".r[data-state~='selected']:hover").reason, 'needs-pseudo-and-stamp');
    // RESTATED: under the pseudo-element read law a `:hover::after` is asked
    // through its HOST, the forced pseudo stripped, and the page decides
    // whether the box is generated; with the law off it is the old refusal.
    assert.deepEqual(
      { reason: by('.r:hover::after').reason, vocabulary: by('.r:hover::after').vocabulary, probe: by('.r:hover::after').probe, pseudo: by('.r:hover::after').pseudo },
      { reason: null, vocabulary: 'native', probe: '.r', pseudo: '::after' },
    );
    const off = stateRuleProbes('.r:hover::after { opacity: 0.5; }', { pseudoReads: false });
    assert.equal(off[0].reason, 'pseudo-element');
    assert.equal(stateRuleProbes('.r:hover::-webkit-slider-thumb { opacity: 0.5; }')[0].reason, 'ua-shadow-pseudo');
    assert.equal(probes.filter((probe) => probe.selector === '.r:hover')[0].reason, 'unread-property');
    assert.equal(probes.filter((probe) => probe.selector === '.r:hover')[1].owners, null, 'a custom property may feed any axis');
    assert.equal(by('.r input:focus-visible ~ .box').reason, 'relational');
    assert.equal(by('.r:has(.b:focus-visible)').reason, 'pseudo-inside-has');
    assert.equal(probes.some((probe) => probe.selector === '.r:disabled'), false, 'nothing forces :disabled, so it is no probe of either half');
  });

  it('classifies each :is() branch on its own, so a stamp-only alternative is reachable by the stamp', () => {
    // Measured on the radio-group skin: the two arms are ALTERNATIVES, and the
    // union of their requirements (a stamp AND a forced pseudo) is a selector
    // no branch of the rule actually asks for.
    const probes = stateRuleProbes(
      ".rg [data-part='option']:is([data-state~='focus-visible'], :has(> input:focus-visible)) { outline-offset: 2px; }",
    );
    assert.equal(probes.some((probe) => probe.reason === 'needs-pseudo-and-stamp'), false);
    const stamped = probes.filter((probe) => probe.vocabulary === 'stamped');
    assert.deepEqual(stamped.map((probe) => ({ probe: probe.probe, reason: probe.reason })), [
      { probe: ".rg [data-part='option']", reason: null },
    ]);
    const native = probes.filter((probe) => probe.vocabulary === 'native');
    assert.equal(native.length, 1);
    assert.equal(native[0].reason, 'pseudo-inside-has');
  });

  it('credits a stamped rule only when its data-state VALUE is one the scene stamps', () => {
    const probes = stateRuleProbes([
      ".r[data-state~='hovered'] { opacity: 0.9; }",
      ".r[data-state='disabled'] { opacity: 0.5; }",
      ".r[data-disabled='true'] { opacity: 0.4; }",
      ".r[data-state~='error'] { opacity: 0.8; }",
      ".r[data-state='buttons'] { opacity: 0.7; }",
      ".r[data-state~='empty'] [data-part='x'] { opacity: 0.6; }",
      ".r[data-disabled='false'] { opacity: 0.3; }",
      ".r[data-state~='open'][data-state~='pressed'] { opacity: 0.2; }",
      ".r[data-state='open'][data-state~='pressed'] { opacity: 0.1; }",
      ".r[data-state] { opacity: 0.05; }",
      ".r[data-state~='focused'] { opacity: 0.02; }",
    ].join('\n'));
    const by = (selector) => probes.find((probe) => probe.selector === selector);
    for (const selector of [".r[data-state~='hovered']", ".r[data-state='disabled']", ".r[data-disabled='true']", '.r[data-state]']) {
      assert.deepEqual({ selector, reason: by(selector).reason, probe: by(selector).probe }, { selector, reason: null, probe: '.r' });
    }
    for (const selector of [
      ".r[data-state~='error']",
      ".r[data-state='buttons']",
      ".r[data-state~='empty'] [data-part='x']",
      ".r[data-disabled='false']",
      ".r[data-state='open'][data-state~='pressed']",
    ]) {
      assert.deepEqual({ selector, reason: by(selector).reason }, { selector, reason: 'domain-state-value' });
    }
    // `focused` is serialized by the kernel and, since S1, stamped by the
    // scene: it is reached like every other kernel token.
    assert.deepEqual(
      { reason: by(".r[data-state~='focused']").reason, probe: by(".r[data-state~='focused']").probe },
      { reason: null, probe: '.r' },
    );
    const kernel = readFileSync(join(ROOT, 'src/foundation/behavior/kernel/anatomy/index.ts'), 'utf8');
    const flags = /STATE_FLAG_ORDER[^=]*=\s*\[([^\]]*)\]/u.exec(kernel)[1].match(/'([A-Za-z]+)'/gu)
      .map((flag) => flag.slice(1, -1).replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`));
    assert.deepEqual([...KERNEL_STATE_TOKENS].sort(), flags.sort(), 'the kernel tokens are read from the kernel, not remembered');
    // A domain token beside a stamped one stays in the probe: a real mount that
    // carries it at rest is reached, a synthesized node that does not is not.
    assert.deepEqual(
      { reason: by(".r[data-state~='open'][data-state~='pressed']").reason, probe: by(".r[data-state~='open'][data-state~='pressed']").probe },
      { reason: null, probe: ".r[data-state~='open']" },
    );
  });

  it('names every family NEITHER half reaches, and credits the native half only when it ran', () => {
    const probesByFamily = new Map([
      ['both', [{ vocabulary: 'stamped' }, { vocabulary: 'native' }]],
      ['native-only', [{ vocabulary: 'native' }]],
      ['channel-only', []],
      ['refused', [{ vocabulary: 'native' }]],
    ]);
    const stamped = { both: ['reached'] };
    const native = { both: ['reached'], 'native-only': ['reached'], refused: ['relational'] };
    const population = ['both', 'native-only', 'channel-only', 'refused'];
    const on = statesReachReport({ population, probesByFamily, stamped, native, applied: true });
    assert.deepEqual(on.reached, { stamped: 1, native: 2, either: 2, nativeOnly: 1 });
    assert.deepEqual(on.neither.map((entry) => entry.family), ['channel-only', 'refused']);
    assert.match(on.neither[1].why, /native:relational 1/u);
    const off = statesReachReport({ population, probesByFamily, stamped, native, applied: false });
    assert.deepEqual(off.reached, { stamped: 1, native: 0, either: 1, nativeOnly: 0 });
  });

  it('MUTANT: a variant whose forcing failed its calibration fails the run and is named', () => {
    const failures = evaluate(result([cell()], {
      nativePseudos: {
        refusedVariants: ['active'],
        calibration: { active: { forced: 'none | none', expected: 'none | matrix(0.5, 0, 0, 0.5, 0, 0)', rest: 'none | none', restAfter: 'none | none' } },
      },
    }));
    assert.ok(failures.some((line) => line.startsWith('native :active failed its calibration')), failures.join(' | '));
  });
});

describe('axis-difference BROWSER drill — the native half reads the browser\'s own pseudo match', { skip: browserReason }, () => {
  const ARM_A = { '--ds-state-press-scale': '0.9', '--ds-focus-ring-offset': '2px' };
  const ARM_B = { '--ds-state-press-scale': '0.7', '--ds-focus-ring-offset': '4px' };
  const properties = allProperties();
  const axisOf = axisByProperty();

  /** Both halves of one drill family, each on its own page, exactly as `run` separates them. */
  const halves = async (context, css, { withheld = new Map(), a = ARM_A, b = ARM_B } = {}) => {
    const scene = (partMounts) => sceneHtml({
      css, vertical: 'bithire', theme: 'light', elements: new Map([['drill', DRILL_ELEMENT]]), partMounts,
    });
    const stampedPage = await context.newPage();
    await stampedPage.setContent(scene(new Map([['drill', familyParts(css, DRILL_ELEMENT, ['states'])]])), { waitUntil: 'load' });
    const before = await measureCell({ page: stampedPage, variables: a, properties, axisOf });
    const after = await measureCell({ page: stampedPage, variables: b, properties, axisOf });
    await stampedPage.close();
    const nativePage = await context.newPage();
    await nativePage.setContent(
      scene(new Map([['drill', familyParts(css, DRILL_ELEMENT, ['states'], { nativePseudos: true })]])),
      { waitUntil: 'load' },
    );
    const native = await measureNativeHalf({
      page: nativePage,
      arms: [{ key: 'a', variables: a }, { key: 'b', variables: b }],
      properties,
      axisOf,
      withheld,
    });
    await nativePage.close();
    before.native = native.readings.get('a');
    after.native = native.readings.get('b');
    return { ...statesHalves(before, after, 'drill'), union: differsOnAxis('states', before, after, 'drill'), measurement: native };
  };

  const withBrowser = async (body) => {
    const { browser, close } = await launchBrowser();
    try {
      return await body(await browser.newContext());
    } finally {
      await close();
    }
  };

  it('the calibration scene reaches its paint under every variant and returns to rest afterwards', async () => {
    const calibration = await withBrowser((context) => calibrateNativeForcing(context));
    for (const variant of NATIVE_PSEUDO_VARIANTS) {
      assert.equal(calibration[variant].reached, true, `${variant}: ${JSON.stringify(calibration[variant])}`);
    }
  }, 120_000);

  it('reads an ANCESTOR-gated hover the stamped half cannot see, and reads nothing once the rule goes literal', async () => {
    const LIVE = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root']:hover > [data-part='knob'] { transform: scale(var(--ds-state-press-scale)); }`;
    const DEAD = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root']:hover > [data-part='knob'] { transform: scale(0.9); }`;
    const [live, dead] = await withBrowser(async (context) => [await halves(context, LIVE), await halves(context, DEAD)]);
    assert.equal(live.stamped, null, 'the stamped half never enters :hover -- otherwise this drill proves nothing');
    assert.equal(live.native, 'transform', 'the knob is read with its ancestor hovered, as a real pointer on it leaves it');
    assert.equal(live.union, 'transform');
    // Per variant, because a press forces `:hover` on the chain as well and
    // would carry this reading on its own.
    const hovered = (arm) => live.measurement.readings.get(arm).hover.drill.transform;
    assert.notEqual(hovered('a'), hovered('b'), 'the hover variant itself must reach the ancestor-gated paint');
    assert.equal(dead.native, null, 'a hover paint that stopped consuming the channel must not keep reading as a move');
  }, 120_000);

  it('a NULL pair reads nothing in the native half', async () => {
    const LIVE = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root']:hover { transform: scale(var(--ds-state-press-scale)); }`;
    const reading = await withBrowser((context) => halves(context, LIVE, { b: ARM_A }));
    assert.equal(reading.native, null, 'the native half reported a difference between a document and itself');
  }, 120_000);

  it('focus lands on ONE node: an ancestor never matches :focus-visible for it, but does match :focus-within', async () => {
    const ANCESTOR_FOCUS = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root']:focus-visible > [data-part='ring'] { outline-offset: var(--ds-focus-ring-offset); }
      .ds-drill.ds-drill--modern[data-part='root'] > [data-part='ring'] { opacity: 1; }`;
    const WITHIN = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root']:focus-within > [data-part='ring'] { outline-offset: var(--ds-focus-ring-offset); }
      .ds-drill.ds-drill--modern[data-part='root'] > [data-part='ring'] { opacity: 1; }`;
    const [ancestor, within] = await withBrowser(async (context) => [
      await halves(context, ANCESTOR_FOCUS),
      await halves(context, WITHIN),
    ]);
    assert.equal(ancestor.native, null, 'the ring was read while its root ALSO held focus, which no keyboard produces');
    assert.equal(within.native, 'outline-offset', 'a focused ring leaves its root matching :focus-within');
  }, 120_000);

  it('a family whose forced pseudo drives a sibling has that variant withheld, not credited', async () => {
    const LIVE = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root']:hover { transform: scale(var(--ds-state-press-scale)); }`;
    const [open, held] = await withBrowser(async (context) => [
      await halves(context, LIVE),
      await halves(context, LIVE, { withheld: new Map([['drill', NATIVE_PSEUDO_VARIANTS.slice()]]) }),
    ]);
    assert.equal(open.native, 'transform');
    assert.equal(held.native, null);
    assert.equal(held.native === null && held.union === null, true, 'a withheld reading must not reach the union either');
  }, 120_000);
});

describe('axis-difference — a real-render mount is the engine\'s markup, never a fabrication', () => {
  const SKELETON = REAL_RENDER_MOUNTS.skeleton;
  const drifted = (from, to) => (file) => {
    const text = readFileSync(file, 'utf8');
    return file.endsWith(SKELETON.state.source) ? text.replaceAll(from, to) : text;
  };

  it('reads a markup as the tokens the witness law checks', () => {
    assert.deepEqual(
      markupTokens('<ul role="menu" class="a b"><li data-part="x" style="width:40px;--ds-y:50%"></li></ul>'),
      ['attr:data-part=x', 'attr:role=menu', 'class:a', 'class:b', 'style:--ds-y=50%', 'style:width=40px', 'tag:li', 'tag:ul'],
    );
    assert.equal(literalWitness('attr:data-part=title', '<div data-part="title" />'), true);
    assert.equal(literalWitness('attr:data-part=title', 'data-part={part}'), false);
    assert.equal(literalWitness('class:ds-a', "['ds-a', className]"), true);
    assert.equal(literalWitness('class:ds-a', "'ds-ab'"), false);
    assert.equal(literalWitness('tag:li', '<li role="none">'), true);
    assert.equal(literalWitness('tag:li', '<link />'), false);
  });

  it('THE STALENESS DOOR: every shipped row is witnessed by the engine it names', () => {
    assert.deepEqual(Object.keys(REAL_RENDER_MOUNTS).sort(), [
      'activity-log',
      'anchor',
      'assistant-preview-diff',
      'avatar',
      'box',
      'breadcrumb-compounds',
      'carousel',
      'chart-c',
      'column-menu',
      'column-settings',
      'command-palette',
      'data-table-actions',
      'date-picker',
      'descriptions',
      'detail',
      'drawer-compounds',
      'drawer-compounds-divider',
      'dropdown',
      'edit-fields',
      'export-button',
      'feature-workspace-frame',
      'filter-panel',
      'flex',
      'float-button',
      'form',
      'guided-draft-form',
      'image',
      'image-compounds',
      'layout',
      'list',
      'modal-compounds',
      'modal-compounds-divider',
      'pattern-timeline',
      'presence',
      'presence-typing',
      'record',
      'saved-views-menu',
      'search-command-bar',
      'sidebar-surface',
      'skeleton',
      'skeleton-anatomy',
      'skeleton-anatomy-block',
      'stats-grid',
      'stats-grid-interactive',
      'stats-header',
      'table',
      'time-picker',
      'tooltip',
      'tooltip-interactive',
      'tree',
      'tree-view-connector',
      'typography',
      'visual-excellence-preview',
    ]);
    assert.deepEqual(realRenderRosterFailures(ROOT), []);
    for (const entry of Object.values(REAL_RENDER_MOUNTS)) {
      assert.ok(entry.axes.length > 0 && entry.axes.every((axis) => REAL_RENDER_AXES.includes(axis)));
    }
  });

  it('MUTANT: a fabricated token -- a part, a class or a value the engine never writes -- fails its pin', () => {
    for (const markup of [
      SKELETON.markup.replace('data-part="title"', 'data-part="headline"'),
      SKELETON.markup.replace('rottay-skeleton-wrapper', 'rottay-skeleton-wrapper rottay-skeleton--glow'),
      SKELETON.markup.replace('--ds-skeleton-avatar-radius:50%', '--ds-skeleton-avatar-radius:var(--ds-skeleton-radius)'),
    ]) {
      const failures = realRenderRosterFailures(ROOT, { skeleton: { ...SKELETON, markup } });
      assert.ok(failures.some((line) => line.includes('is not written by')), failures.join(' | '));
    }
  });

  it('MUTANT: an engine that stops rendering the pinned markup fails, whichever line drifted', () => {
    const lost = realRenderRosterFailures(ROOT, REAL_RENDER_MOUNTS, { readSource: drifted('data-part="title"', 'data-part="heading"') });
    assert.ok(lost.some((line) => line.startsWith('skeleton:') && line.includes('`attr:data-part=title` is not written')), lost.join(' | '));
    const restamped = realRenderRosterFailures(ROOT, REAL_RENDER_MOUNTS, { readSource: drifted('data-animation={resolvedStyle}', 'data-motion={resolvedStyle}') });
    assert.ok(restamped.some((line) => line.includes('no longer carries the stamp `data-animation={resolvedStyle}`')), restamped.join(' | '));
    const ungated = realRenderRosterFailures(ROOT, REAL_RENDER_MOUNTS, { readSource: drifted('rottay-skeleton-wrapper rottay-skeleton--modern ${className}', 'rottay-skeleton-stack ${className}') });
    assert.ok(ungated.some((line) => line.includes('no longer carries the gate')), ungated.join(' | '));
  });

  it('MUTANT: a stamp row nobody uses, a dressed host, and an axis the law or the population refuses are each named', () => {
    const orphan = realRenderRosterFailures(ROOT, {
      skeleton: { ...SKELETON, stamps: [...SKELETON.stamps, { token: 'attr:data-size=md', stamp: 'data-part="avatar"' }] },
    });
    assert.ok(orphan.some((line) => line.includes('a stamp row no mount token uses')), orphan.join(' | '));
    const anatomy = REAL_RENDER_MOUNTS['skeleton-anatomy'];
    const dressed = realRenderRosterFailures(ROOT, { 'skeleton-anatomy': { ...anatomy, host: ['table class="x"', 'tbody'] } });
    assert.ok(dressed.some((line) => line.includes('must be a bare element name')), dressed.join(' | '));
    const axes = realRenderRosterFailures(ROOT, { skeleton: { ...SKELETON, axes: ['typography', 'states', 'depth'] } });
    assert.ok(axes.some((line) => line.startsWith('skeleton/typography: a real-render mount is read only on')), axes.join(' | '));
    // States is admitted since S1 (law 5); skeleton is not in its population.
    assert.ok(axes.some((line) => line.startsWith('skeleton/states: the family does not declare this axis')), axes.join(' | '));
    assert.ok(axes.some((line) => line.startsWith('skeleton/depth: the family does not declare this axis')), axes.join(' | '));
  });

  it('LAW 3 over a reading: the default must not MOVE between the arms, and the real render must', () => {
    const motion = (value) => ({ 'transition-duration': value, 'animation-duration': value });
    const reading = (own, real) => ({
      base: { [`f${REAL_RENDER_KEY.default}`]: own, [`f${REAL_RENDER_KEY.real}`]: real },
    });
    const qualify = (ownA, ownB, realA, realB) => realRenderQualification({
      before: reading(motion(ownA), motion(realA)),
      after: reading(motion(ownB), motion(realB)),
      family: 'f',
      axis: 'motion',
    });
    assert.deepEqual(qualify('0s', '0s', '0.096s', '0.156s'), { qualified: true }, 'a root that paints nothing qualifies');
    assert.deepEqual(
      qualify('0.2s', '0.2s', '0.096s', '0.156s'),
      { qualified: true },
      'a root painting a FIXED value carries no axis signal, so it does not block the mount',
    );
    const moving = qualify('0.096s', '0.156s', '0.096s', '0.156s');
    assert.equal(moving.qualified, false, 'a root that already MOVES never gets the mount');
    assert.match(moving.reason, /default mount already MOVES on transition-duration \(0\.096s -> 0\.156s\)/u);
    const still = qualify('0.2s', '0.2s', '0.2s', '0.2s');
    assert.equal(still.qualified, false);
    assert.match(still.reason, /the real render does not move on motion/u);
    assert.equal(realRenderQualification({ before: { base: {} }, after: { base: {} }, family: 'f', axis: 'motion' }).qualified, false);
  });

  it('the scene carries the mounts only when the law is on, and the report names each gate line', () => {
    const owners = [...new Set(Object.entries(REAL_RENDER_MOUNTS).map(([row, entry]) => entry.family ?? row))];
    const elements = familyElements(ROOT, owners);
    const mounts = realRenderMountList(elements);
    assert.deepEqual(mounts.map((mount) => mount.row).sort(), Object.keys(REAL_RENDER_MOUNTS).sort());
    // A row keyed apart is a real render OF the family it names.
    assert.equal(mounts.find((mount) => mount.row === 'tooltip-interactive').family, 'tooltip');
    assert.match(mounts.find((mount) => mount.family === 'skeleton-anatomy').markup, /^<table data-axis-real-host=""><tbody data-axis-real-host=""><tr /u);
    assert.deepEqual(realRenderMountList(elements, { applied: false }), []);
    const on = sceneHtml({ css: '', vertical: 'bithire', theme: 'light', elements, realRenders: mounts });
    const off = sceneHtml({ css: '', vertical: 'bithire', theme: 'light', elements });
    assert.match(on, /data-axis-real-render="skeleton" data-axis-real-axes="shape rhythm motion"/u);
    assert.match(on, /data-axis-real-render="dropdown" data-axis-real-axes="shape rhythm depth motion"/u);
    assert.doesNotMatch(off, /data-axis-real-render/u);
    const report = realRenderReport(mounts);
    assert.equal(report.rows, Object.keys(REAL_RENDER_MOUNTS).length);
    assert.equal(report.families, owners.length);
    for (const row of Object.values(report.map)) {
      for (const gate of row.gates) assert.match(gate, /^src\/components\/.+\/index\.tsx:\d+$/u);
    }
  });

  it('a refused real-render axis FAILS the run, named, rather than reading as a quieter number', () => {
    const refused = cell({
      axis: 'motion',
      scenario: 'motion',
      realRender: { credited: [], rescued: [], refused: [{ family: 'tooltip', reason: 'its default mount already paints animation-duration = 0.15s', realMoved: null }] },
    });
    const failures = evaluate(result([refused]));
    assert.ok(failures.some((line) => line.startsWith('tooltip: its real-render mount was REFUSED on motion')), failures.join(' | '));
  });

  it('every reproduction flag the indicator refuses is one the CLI actually reads', () => {
    const cli = readFileSync(join(ROOT, 'scripts/check/theme/axis-difference/index.mjs'), 'utf8');
    assert.ok(REPRODUCTION_FLAGS.includes('--no-real-render-mounts'));
    for (const flag of REPRODUCTION_FLAGS) assert.ok(cli.includes(`process.argv.includes('${flag}')`), flag);
  });
});

describe('axis-difference BROWSER drill — the real-render mounts reach the paint, and only where the law admits them', { skip: browserReason }, () => {
  const FAMILIES = ['dropdown', 'skeleton', 'skeleton-anatomy', 'tooltip'];
  const byId = (id) => SCENARIOS.find((scenario) => scenario.id === id);

  it('skeleton, tooltip and dropdown move on shape through their real render; the default mounts alone do not; the palette control stays 0', async () => {
    const scenarios = [byId('shape'), byId('rhythm'), byId('palette-only')];
    const on = await run({ verticals: ['bithire'], themes: ['light'], families: FAMILIES, scenarios, nativePseudos: false });
    const off = await run({ verticals: ['bithire'], themes: ['light'], families: FAMILIES, scenarios, nativePseudos: false, realRenderMounts: false });
    const shapeOn = on.cells.find((entry) => entry.scenario === 'shape');
    const shapeOff = off.cells.find((entry) => entry.scenario === 'shape');
    for (const family of ['skeleton', 'tooltip', 'dropdown']) {
      assert.ok(shapeOn.movedIds.includes(family), `${family} did not move on shape with its real render mounted`);
      assert.ok(shapeOn.realRender.rescued.includes(family), `${family} moved, but not through its real render`);
      assert.ok(!shapeOff.movedIds.includes(family), `${family} moved on shape WITHOUT the real render, so this drill proves nothing`);
    }
    const rhythmOn = on.cells.find((entry) => entry.scenario === 'rhythm');
    assert.ok(rhythmOn.realRender.rescued.includes('skeleton-anatomy'));
    assert.equal(on.realRender.applied, true);
    assert.equal(off.realRender.applied, false);
    assert.equal(off.realRender.families, 0);
    assert.deepEqual(on.populations, off.populations, 'a mount may move a numerator, never a denominator');
    // The control is decided by its axis's own positive, and then reads the
    // credited mounts: its 0 % covers those nodes, not only the default ones.
    const paletteShape = on.cells.find((entry) => entry.scenario === 'palette-only' && entry.axis === 'shape');
    assert.deepEqual([...paletteShape.realRender.credited].sort(), ['dropdown', 'skeleton', 'tooltip']);
    assert.deepEqual(paletteShape.realRender.refused, []);
    const paletteDepth = on.cells.find((entry) => entry.scenario === 'palette-only' && entry.axis === 'depth');
    // R3: skeleton-anatomy's block-mode row declares depth, so it joins the undecided set.
    assert.deepEqual([...paletteDepth.realRender.undecided].sort(), ['dropdown', 'skeleton-anatomy', 'tooltip'], 'no depth positive ran, so the mount is left unread');
    for (const entry of on.cells.filter((item) => item.kind === 'negative')) {
      assert.equal(entry.evidential, true);
      assert.equal(entry.moved, 0, `${entry.axis}: ${JSON.stringify(entry.movedFamilies)}`);
    }
    assert.deepEqual(evaluate(on), []);
  });

  it('a root painting a FIXED motion value qualifies: dropdown and tooltip are credited on motion through their real render', async () => {
    // Both roots run a constant enter animation from the personality layer
    // (0.2s, 0.15s); identical in both arms, it carries no motion signal.
    const on = await run({ verticals: ['bithire'], themes: ['light'], families: ['dropdown', 'tooltip'], scenarios: [byId('motion')], nativePseudos: false });
    const off = await run({ verticals: ['bithire'], themes: ['light'], families: ['dropdown', 'tooltip'], scenarios: [byId('motion')], nativePseudos: false, realRenderMounts: false });
    const motionOn = on.cells.find((entry) => entry.scenario === 'motion');
    const motionOff = off.cells.find((entry) => entry.scenario === 'motion');
    for (const family of ['dropdown', 'tooltip']) {
      assert.ok(motionOn.realRender.credited.includes(family), JSON.stringify(motionOn.realRender));
      assert.ok(motionOn.realRender.rescued.includes(family), `${family} did not move on motion through its real render`);
      assert.ok(!motionOff.movedIds.includes(family), `${family} moved on motion WITHOUT its real render, so this drill proves nothing`);
    }
    assert.deepEqual(evaluate(on), []);
  });

  it('MUTANT: a row that declares an axis its default mount already MOVES on is REFUSED and never credited as a rescue', async () => {
    // `skeleton-anatomy`'s bone part already moves on shape, so a mount there
    // could only restate a move the family has.
    const anatomy = REAL_RENDER_MOUNTS['skeleton-anatomy'];
    const roster = { ...REAL_RENDER_MOUNTS, 'skeleton-anatomy': { ...anatomy, axes: [...anatomy.axes, 'shape'] } };
    const measurement = await run({
      verticals: ['bithire'],
      themes: ['light'],
      families: ['skeleton-anatomy'],
      scenarios: [byId('shape')],
      nativePseudos: false,
      realRenderRoster: roster,
    });
    const shape = measurement.cells.find((entry) => entry.scenario === 'shape');
    const refusal = shape.realRender.refused.find((entry) => entry.family === 'skeleton-anatomy');
    assert.ok(refusal, JSON.stringify(shape.realRender));
    assert.match(refusal.reason, /default mount already MOVES on border-/u);
    assert.ok(!shape.realRender.credited.includes('skeleton-anatomy'));
    assert.ok(!shape.realRender.rescued.includes('skeleton-anatomy'));
    assert.ok(shape.movedIds.includes('skeleton-anatomy'), 'the refused axis is still read on the default mount, which moves');
    assert.ok(evaluate(measurement).some((line) => line.startsWith('skeleton-anatomy: its real-render mount was REFUSED on shape')));
  });

  it('an open panel and a close button are reached as rendered; each flag reproduces the reading it names', async () => {
    const scenarios = [byId('shape'), byId('depth'), byId('palette-only')];
    const families = ['column-menu', 'drawer-compounds', 'file-manager'];
    const on = await run({ verticals: ['bithire'], themes: ['light'], families, scenarios, nativePseudos: false });
    const noReal = await run({ verticals: ['bithire'], themes: ['light'], families, scenarios, nativePseudos: false, realRenderMounts: false });
    const noStamps = await run({ verticals: ['bithire'], themes: ['light'], families, scenarios, nativePseudos: false, asRendered: false });
    const cellOf = (measurement, id) => measurement.cells.find((entry) => entry.scenario === id);
    for (const [family, axis] of [['column-menu', 'shape'], ['column-menu', 'depth'], ['drawer-compounds', 'shape']]) {
      assert.ok(cellOf(on, axis).realRender.rescued.includes(family), `${family}/${axis}: ${JSON.stringify(cellOf(on, axis).realRender)}`);
      assert.ok(!cellOf(noReal, axis).movedIds.includes(family), `${family}/${axis} moved without its real render`);
    }
    // `file-manager`'s loaded root stamps `data-loading="false"`, and its elevation lives behind that gate.
    assert.ok(cellOf(on, 'depth').movedIds.includes('file-manager'));
    assert.ok(!cellOf(noStamps, 'depth').movedIds.includes('file-manager'), 'file-manager moved on depth without its default-render stamp');
    for (const entry of on.cells.filter((item) => item.kind === 'negative')) assert.equal(entry.moved, 0, `${entry.axis}: ${JSON.stringify(entry.movedFamilies)}`);
    assert.deepEqual(evaluate(on), []);
  });

  it('MUTANT: a drifted roster is refused before anything is mounted', async () => {
    const roster = {
      skeleton: { ...REAL_RENDER_MOUNTS.skeleton, markup: REAL_RENDER_MOUNTS.skeleton.markup.replace('data-part="line"', 'data-part="row"') },
    };
    await assert.rejects(
      run({ verticals: ['bithire'], themes: ['light'], families: ['skeleton'], scenarios: [byId('shape')], realRenderRoster: roster }),
      /the real-render roster does not match the engines it names/u,
    );
  });
});

/**
 * S1 -- THE STATES AXIS REACHES THE REAL-RENDER MOUNTS, AND THE SCENE STAMPS
 * `focused`.
 *
 * Before S1 a real-render mount was read at REST only (law 4): the state stamp
 * and the native forcing never touched it, so a family whose only state-gated
 * paint sat on a mounted node never moved on states. Law 5 reads a mount that
 * declares `states` under both halves, with the default scene's withholding
 * laws, and law 3 still decides per cell. `focused` is the one kernel token
 * the stamp left out.
 */
describe('axis-difference — S1: law 5 over a reading, the stamp contract, and the sixth state', () => {
  const view = (reading, family, key) => probe.realRenderView(reading, family, key);
  const transform = (value) => ({ transform: value });
  const reading = ({ own, real, half = 'states', state = 'pressed' }) => ({
    base: {},
    [half]: { [state]: { f: { ...own, ...real }, [`f${REAL_RENDER_KEY.default}`]: own, [`f${REAL_RENDER_KEY.real}`]: real } },
  });
  const qualify = (arms, half = 'states') => probe.realRenderQualification({
    before: reading({ ...arms[0], half, state: half === 'states' ? 'pressed' : 'active' }),
    after: reading({ ...arms[1], half, state: half === 'states' ? 'pressed' : 'active' }),
    family: 'f',
    axis: 'states',
  });

  it('admits states as a real-render axis, but never at rest', () => {
    assert.ok(REAL_RENDER_AXES.includes('states'));
    assert.deepEqual([...probe.REAL_RENDER_RESTING_AXES], ['shape', 'rhythm', 'depth', 'motion']);
  });

  it('LAW 3 over states: the default mount must move on NEITHER half, and the real render on one', () => {
    const still = transform('none');
    const scale = (value) => transform(`matrix(${value}, 0, 0, ${value}, 0, 0)`);
    assert.deepEqual(qualify([{ own: still, real: scale(0.98) }, { own: still, real: scale(0.94) }]), { qualified: true }, 'the stamp half moves the mount');
    assert.deepEqual(qualify([{ own: still, real: scale(0.98) }, { own: still, real: scale(0.94) }], 'native'), { qualified: true }, 'the forced half moves the mount');
    const moving = qualify([{ own: scale(0.98), real: scale(0.98) }, { own: scale(0.94), real: scale(0.94) }]);
    assert.equal(moving.qualified, false);
    assert.match(moving.reason, /default mount already MOVES on states \(the stamp half, transform\)/u);
    const dead = qualify([{ own: still, real: scale(0.98) }, { own: still, real: scale(0.98) }]);
    assert.equal(dead.qualified, false);
    assert.match(dead.reason, /does not move on states under either half/u);
    const rest = probe.realRenderQualification({ before: { base: {} }, after: { base: {} }, family: 'f', axis: 'states' });
    assert.equal(rest.qualified, false, 'a resting reading carries no states verdict');
  });

  it('a view re-keys every state and every variant onto the family, and nothing else', () => {
    const whole = { base: { 'f#default': { a: 1 } }, states: { hovered: { 'f#default': { b: 2 }, f: { b: 3 } } }, native: { hover: { 'f#real': { c: 4 } } } };
    assert.deepEqual(view(whole, 'f', REAL_RENDER_KEY.default), {
      base: { f: { a: 1 } }, states: { hovered: { f: { b: 2 } } }, native: { hover: { f: undefined } },
    });
  });

  it('THE STAMP CONTRACT: a real mount is stamped only on the parts its engine hands `partAttributes`', () => {
    assert.deepEqual(probe.realRenderStampedParts(REAL_RENDER_MOUNTS['drawer-compounds']), ['close-button']);
    assert.deepEqual(probe.realRenderStampedParts(REAL_RENDER_MOUNTS.record), ['field', 'field-link-body']);
    // The float-button trigger's `data-part` is literal: the engine never
    // writes `data-state` on it, so it is reached by forcing alone.
    assert.deepEqual(probe.realRenderStampedParts(REAL_RENDER_MOUNTS['float-button']), []);
    const [mount] = realRenderMountList(new Map([['drawer-compounds', { classes: ['x'], attributes: {} }]]), {
      roster: { 'drawer-compounds': REAL_RENDER_MOUNTS['drawer-compounds'] },
    });
    assert.match(sceneHtml({ css: '', vertical: 'bithire', theme: 'light', elements: new Map(), realRenders: [mount] }),
      /data-axis-real-axes="shape motion states" data-axis-real-row="drawer-compounds" data-axis-real-stamped="close-button"/u);
  });

  it('MUTANT: a sibling-written stamp is read in the file it names, and drifts like any other', () => {
    const source = 'src/components/structures/record/field-grid/index.tsx';
    const drifted = (file) => {
      const text = readFileSync(file, 'utf8');
      return file.endsWith(source) ? text.replace('data-part="field-grid"', 'data-part="grid"') : text;
    };
    assert.deepEqual(realRenderRosterFailures(ROOT, { record: REAL_RENDER_MOUNTS.record }), []);
    const failures = realRenderRosterFailures(ROOT, { record: REAL_RENDER_MOUNTS.record }, { readSource: drifted });
    assert.ok(failures.some((line) => line === `record/attr:data-part=field-grid: ${source} no longer carries the stamp \`data-part="field-grid"\``), failures.join(' | '));
  });

  it('THE STOPPED ROW: stepper-compounds has no row, because the Modern Stepper never renders `.ds-stepper-step`', () => {
    assert.equal(REAL_RENDER_MOUNTS['stepper-compounds'], undefined);
    const engine = readFileSync(join(ROOT, 'src/components/primitives/navigation/stepper/engines/modern/index.tsx'), 'utf8');
    assert.ok(!engine.includes('ds-stepper-step'), 'the Modern Stepper now writes .ds-stepper-step -- re-measure the stop');
    assert.ok(!engine.includes('<StepperStep'), 'the Modern Stepper now renders StepperStep -- re-measure the stop');
  });

  it('every S1 row declares states only, on a family in the states population', () => {
    const states = axisPopulations(ROOT).get('states');
    for (const row of ['stats-grid-interactive', 'tooltip-interactive', 'pattern-timeline', 'activity-log', 'avatar',
      'record', 'anchor', 'tree-view-connector', 'breadcrumb-compounds', 'typography']) {
      const entry = REAL_RENDER_MOUNTS[row];
      assert.deepEqual([...entry.axes], ['states'], row);
      assert.ok(states.includes(entry.family ?? row), row);
    }
    for (const row of ['float-button', 'drawer-compounds', 'modal-compounds', 'layout', 'stats-header']) assert.ok(REAL_RENDER_MOUNTS[row].axes.includes('states'), row);
    // R2a gave layout's S1 row a resting axis, R3 gave stats-header's one; their states declarations are untouched.
    assert.deepEqual([...REAL_RENDER_MOUNTS.layout.axes], ['rhythm', 'states']);
    assert.deepEqual([...REAL_RENDER_MOUNTS['stats-header'].axes], ['depth', 'states']);
    // Measured and refused on 2026-09-30 (S7: law 3, the default mount already
    // moves), so it may not declare it. column-menu left the pin in S7.
    assert.ok(!REAL_RENDER_MOUNTS['command-palette'].axes.includes('states'));
  });

  it('THE SIXTH STATE: every kernel token is stamped, and a run without `focused` names it unstamped', () => {
    const kernel = readFileSync(join(ROOT, 'src/foundation/behavior/kernel/anatomy/index.ts'), 'utf8');
    const flags = /STATE_FLAG_ORDER[^=]*=\s*\[([^\]]*)\]/u.exec(kernel)[1].match(/'([A-Za-z]+)'/gu)
      .map((flag) => flag.slice(1, -1).replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`));
    for (const flag of flags) assert.ok(STATE_VARIANTS.includes(flag), `${flag} is serialized by the kernel and not stamped`);
    assert.equal(STATE_VARIANTS.at(-1), 'focused', 'appended last, so every earlier state reads as it did');
    const css = ".r[data-state~='focused'] { opacity: 0.02; }";
    assert.equal(stateRuleProbes(css)[0].reason, null);
    const without = stateRuleProbes(css, { stamped: STATE_VARIANTS.filter((state) => state !== 'focused') });
    assert.equal(without[0].reason, 'unstamped-state');
    const cli = readFileSync(join(ROOT, 'scripts/check/theme/axis-difference/index.mjs'), 'utf8');
    assert.ok(cli.includes("process.argv.includes('--no-focused-stamp')"));
  });

  it('a domain-gated rule stays refused on a mount: the stamp never writes the value it names', () => {
    // Exact on a domain value: once the stamp appends its token the node no
    // longer equals it, so the pair can never hold -- on a mount as anywhere.
    const [probeRow] = stateRuleProbes(".ds-drill-pop [data-part='flagged'][data-state='error'][data-state~='pressed'] { transform: scale(0.5); }");
    assert.equal(probeRow.reason, 'domain-state-value');
  });
});

describe('axis-difference BROWSER drill — S1: a mount is read under the stamp AND under forcing', { skip: browserReason }, () => {
  const ARM_A = { '--ds-state-press-scale': '0.9', '--ds-focus-ring-offset': '2px' };
  const ARM_B = { '--ds-state-press-scale': '0.7', '--ds-focus-ring-offset': '4px' };
  const properties = allProperties();
  const axisOf = axisByProperty();
  const POP = '<div class="ds-drill-pop" data-part="pop"><button type="button" data-part="knob"></button>'
    + '<span data-part="lit"></span><i data-part="flagged" data-state="error"></i></div>';

  /** Both halves of one drill scene, the default root plus one real mount, exactly as `run` separates them. */
  const measure = async (context, css, { stampedParts = ['knob', 'flagged'], states = STATE_VARIANTS, realRender = true } = {}) => {
    const realRenders = [{ family: 'drill', row: 'drill', axes: ['states'], stampedParts, markup: POP }];
    const scene = sceneHtml({ css, vertical: 'bithire', theme: 'light', elements: new Map([['drill', DRILL_ELEMENT]]), realRenders });
    const stampedPage = await context.newPage();
    await stampedPage.setContent(scene, { waitUntil: 'load' });
    const before = await measureCell({ page: stampedPage, variables: ARM_A, properties, axisOf, states, realRender });
    const after = await measureCell({ page: stampedPage, variables: ARM_B, properties, axisOf, states, realRender });
    await stampedPage.close();
    const nativePage = await context.newPage();
    await nativePage.setContent(scene, { waitUntil: 'load' });
    const native = await measureNativeHalf({
      page: nativePage, arms: [{ key: 'a', variables: ARM_A }, { key: 'b', variables: ARM_B }], properties, axisOf, realRender,
    });
    await nativePage.close();
    before.native = native.readings.get('a');
    after.native = native.readings.get('b');
    return {
      whole: statesHalves(before, after, 'drill'),
      own: statesHalves(probe.realRenderView(before, 'drill', REAL_RENDER_KEY.default), probe.realRenderView(after, 'drill', REAL_RENDER_KEY.default), 'drill'),
      real: statesHalves(probe.realRenderView(before, 'drill', REAL_RENDER_KEY.real), probe.realRenderView(after, 'drill', REAL_RENDER_KEY.real), 'drill'),
      verdict: probe.realRenderQualification({ before, after, family: 'drill', axis: 'states' }),
    };
  };
  const withBrowser = async (body) => {
    const { browser, close } = await launchBrowser();
    try {
      return await body(await browser.newContext());
    } finally {
      await close();
    }
  };

  it('the stamp half and the forced half each reach a mounted node; the pre-S1 reading reaches neither', async () => {
    const STAMP = `${DRILL_ROOT_CSS}
      .ds-drill-pop [data-part='knob'][data-state~='pressed'] { transform: scale(var(--ds-state-press-scale)); }`;
    const FORCE = `${DRILL_ROOT_CSS}
      .ds-drill-pop [data-part='knob']:focus-visible { outline-offset: var(--ds-focus-ring-offset); }`;
    const [stamp, force, stampOff, forceOff] = await withBrowser(async (context) => [
      await measure(context, STAMP), await measure(context, FORCE),
      await measure(context, STAMP, { realRender: false }), await measure(context, FORCE, { realRender: false }),
    ]);
    assert.equal(stamp.real.stamped, 'transform', 'the stamp reached the kernel-stamped knob');
    assert.equal(stamp.own.stamped, null, 'the default root paints nothing on states, or this drill proves nothing');
    assert.deepEqual(stamp.verdict, { qualified: true });
    assert.equal(force.real.native, 'outline-offset', 'the forcing reached the mounted knob');
    assert.equal(force.real.stamped, null, 'a forced rule is not entered by the stamp');
    assert.deepEqual(force.verdict, { qualified: true });
    assert.deepEqual([stampOff.whole, forceOff.whole], [{ stamped: null, native: null }, { stamped: null, native: null }],
      'with the mount unread under states, as before S1, neither half reaches it');
  }, 120_000);

  it('a node the engine never hands the kernel is never stamped, and is still forced', async () => {
    const LIT = `${DRILL_ROOT_CSS}
      .ds-drill-pop [data-part='lit'][data-state~='pressed'] { transform: scale(var(--ds-state-press-scale)); }
      .ds-drill-pop [data-part='lit']:active { opacity: calc(var(--ds-state-press-scale) - 0.1); }`;
    const lit = await withBrowser((context) => measure(context, LIT));
    assert.equal(lit.real.stamped, null, 'a literal data-part was stamped: that is a fabricated configuration');
    assert.equal(lit.real.native, 'opacity');
  }, 120_000);

  it('a domain-gated rule stays refused on a mount, and the mount is refused for carrying no signal', async () => {
    const DOMAIN = `${DRILL_ROOT_CSS}
      .ds-drill-pop [data-part='flagged'][data-state='error'][data-state~='pressed'] { transform: scale(var(--ds-state-press-scale)); }`;
    const domain = await withBrowser((context) => measure(context, DOMAIN));
    assert.deepEqual(domain.real, { stamped: null, native: null }, 'the stamp entered a rule gated on a value it never writes');
    assert.equal(domain.verdict.qualified, false);
    assert.match(domain.verdict.reason, /does not move on states under either half/u);
  }, 120_000);

  it('the `focused` stamp opens a rule gated on it; the five-state set does not', async () => {
    const FOCUSED = `${DRILL_ROOT_CSS}
      .ds-drill.ds-drill--modern[data-part='root'][data-state~='focused'] { transform: scale(var(--ds-state-press-scale)); }`;
    const [six, five] = await withBrowser(async (context) => [
      await measure(context, FOCUSED),
      await measure(context, FOCUSED, { states: STATE_VARIANTS.filter((state) => state !== 'focused') }),
    ]);
    assert.equal(six.own.stamped, 'transform');
    assert.equal(five.own.stamped, null, 'the rule moved without `focused` stamped, so this drill proves nothing');
  }, 120_000);
});

describe('axis-difference BROWSER drill — S1: the states mounts inside a run', { skip: browserReason }, () => {
  const byId = (id) => SCENARIOS.find((scenario) => scenario.id === id);
  const scenarios = [byId('states'), byId('palette-only')];

  it('float-button and stats-header move on states through their mounts only; the control reads them and stays 0; no flag reproduces a move', async () => {
    const families = ['float-button', 'stats-header'];
    const on = await run({ verticals: ['bithire'], themes: ['light'], families, scenarios });
    const off = await run({ verticals: ['bithire'], themes: ['light'], families, scenarios, realRenderMounts: false });
    const cellOf = (measurement, id, axis) => measurement.cells.find((entry) => entry.scenario === id && entry.axis === axis);
    const states = cellOf(on, 'states', 'states');
    for (const family of families) {
      assert.ok(states.realRender.rescued.includes(family), `${family}: ${JSON.stringify(states.realRender)}`);
      assert.ok(!cellOf(off, 'states', 'states').movedIds.includes(family), `${family} moved on states without its mount`);
    }
    // float-button's trigger is literal (forcing alone); the stat card is
    // kernel-stamped (both halves).
    assert.equal(states.movedNative, 2);
    assert.equal(states.movedStamped, 1);
    const control = cellOf(on, 'palette-only', 'states');
    assert.deepEqual([...control.realRender.credited].sort(), families);
    assert.equal(control.moved, 0);
    assert.equal(control.movedStamped, 0);
    assert.equal(control.movedNative, 0);
    assert.deepEqual(on.populations, off.populations, 'a mount may move a numerator, never a denominator');
    assert.equal(on.realRender.map['stats-header'].statesReach.declared, true);
    assert.deepEqual(evaluate(on), []);
  }, 240_000);

  it('MUTANT: a row declaring states where the default mount already moves is REFUSED, per cell, and named', async () => {
    const roster = { ...REAL_RENDER_MOUNTS, dropdown: { ...REAL_RENDER_MOUNTS.dropdown, axes: [...REAL_RENDER_MOUNTS.dropdown.axes, 'states'] } };
    const measurement = await run({ verticals: ['bithire'], themes: ['light', 'dark'], families: ['dropdown'], scenarios, realRenderRoster: roster });
    const positives = measurement.cells.filter((entry) => entry.scenario === 'states');
    assert.equal(positives.length, 2);
    for (const cell of positives) {
      const refusal = cell.realRender.refused.find((entry) => entry.family === 'dropdown');
      assert.ok(refusal, `${cell.theme}: ${JSON.stringify(cell.realRender)}`);
      assert.match(refusal.reason, /default mount already MOVES on states/u);
      assert.ok(cell.movedIds.includes('dropdown'), 'the refused axis is still read on the default mount, which moves');
      assert.ok(!cell.realRender.credited.includes('dropdown'));
    }
    const control = measurement.cells.find((entry) => entry.scenario === 'palette-only' && entry.axis === 'states');
    assert.ok(!control.realRender.credited.includes('dropdown'), 'a control may not read a mount its positive refused');
    const failures = evaluate(measurement);
    for (const theme of ['light', 'dark']) {
      assert.ok(failures.some((line) => line.startsWith(`dropdown: its real-render mount was REFUSED on states in bithire/${theme} states`)), failures.join(' | '));
    }
  }, 240_000);

  it('`statesFocused: false` reproduces the five-state set', async () => {
    const measurement = await run({ verticals: ['bithire'], themes: ['light'], families: ['record'], scenarios: [byId('states')], statesFocused: false, nativePseudos: false });
    assert.deepEqual(measurement.limits.states.stampedStates, ['hovered', 'pressed', 'selected', 'focus-visible', 'disabled']);
  }, 120_000);
});

describe('axis-difference — S5 instrument truth lot (WO-EVI-02, the two Fable verdicts)', () => {
  const statesRow = (row) => ({ ...REAL_RENDER_MOUNTS[row], axes: Object.freeze(['states']) });

  it('LAW: at most one roster row per family declares states; the shipped roster passes, its resting+states pairs included', () => {
    assert.deepEqual(realRenderRosterFailures(ROOT), []);
    // tooltip and stats-grid each carry one resting row and one states row.
    for (const [resting, states] of [['tooltip', 'tooltip-interactive'], ['stats-grid', 'stats-grid-interactive']]) {
      assert.ok(!REAL_RENDER_MOUNTS[resting].axes.includes('states'), resting);
      assert.ok(REAL_RENDER_MOUNTS[states].axes.includes('states'), states);
      assert.deepEqual(realRenderRosterFailures(ROOT, {
        [resting]: REAL_RENDER_MOUNTS[resting], [states]: REAL_RENDER_MOUNTS[states],
      }), [], resting);
    }
  });

  it('MUTANT: a second states row for the same family is refused by the roster door, by name', () => {
    const failures = realRenderRosterFailures(ROOT, {
      tooltip: statesRow('tooltip'),
      'tooltip-interactive': REAL_RENDER_MOUNTS['tooltip-interactive'],
    });
    assert.ok(failures.some((line) => line.startsWith('tooltip: 2 rows declare states (tooltip, tooltip-interactive)')), failures.join(' | '));
  });

  it('PIN: the measured states refusal is command-palette, a row of a states family that does not declare states', () => {
    assert.deepEqual(Object.keys(REAL_RENDER_STATES_REFUSALS).sort(), ['command-palette']);
    const states = axisPopulations(ROOT).get('states');
    for (const row of Object.keys(REAL_RENDER_STATES_REFUSALS)) {
      assert.ok(!REAL_RENDER_MOUNTS[row].axes.includes('states'), row);
      assert.ok(states.includes(REAL_RENDER_MOUNTS[row].family ?? row), row);
    }
  });

  it('MUTANT: a pinned refusal that declares states, or is gone from the roster, is refused by the roster door', () => {
    const refusals = { 'command-palette': REAL_RENDER_STATES_REFUSALS['command-palette'] };
    const declares = realRenderRosterFailures(ROOT, { 'command-palette': statesRow('command-palette') }, { statesRefusals: refusals });
    assert.ok(declares.some((line) => line.startsWith('command-palette: pinned as a measured states refusal and declares states')), declares.join(' | '));
    const gone = realRenderRosterFailures(ROOT, { avatar: REAL_RENDER_MOUNTS.avatar }, { statesRefusals: refusals });
    assert.ok(gone.some((line) => line.startsWith('command-palette: pinned as a measured states refusal and no longer a roster row')), gone.join(' | '));
  });

  it('the record publishes every refusal with the reach the run read, and a full run that drops one FAILS', () => {
    const mounts = realRenderMountList(new Map(Object.keys(REAL_RENDER_MOUNTS)
      .map((row) => [REAL_RENDER_MOUNTS[row].family ?? row, { classes: ['x'], attributes: {} }])));
    const reach = { stamped: 0, native: 2, declared: false };
    const report = realRenderReport(mounts, { statesReach: { 'command-palette': reach } });
    assert.deepEqual(report.statesRefused.map((entry) => entry.row), ['command-palette']);
    assert.deepEqual(report.statesRefused[0], {
      row: 'command-palette', family: 'command-palette', reason: REAL_RENDER_STATES_REFUSALS['command-palette'], statesReach: reach,
    });
    assert.equal(realRenderReport(mounts).statesRefused[0].statesReach, null);
    assert.deepEqual(evaluate(result([cell()], { realRender: report })), []);
    const dropped = evaluate(result([cell()], { realRender: { ...report, statesRefused: report.statesRefused.slice(1) } }));
    assert.deepEqual(dropped, ['command-palette: a pinned states refusal the run did not publish in realRender.statesRefused']);
  });

  it('S7 MEASURED: column-menu declares states -- the panel the engine focuses on open is a stamped part its focus rule reaches -- and left the pin', () => {
    const entry = REAL_RENDER_MOUNTS['column-menu'];
    assert.deepEqual([...entry.axes], ['shape', 'rhythm', 'depth', 'motion', 'states']);
    assert.ok(probe.realRenderStampedParts(entry).includes('panel'));
    assert.equal(Object.hasOwn(REAL_RENDER_STATES_REFUSALS, 'column-menu'), false);
    // The configuration the row reads under a state is the engine's own: the
    // panel is focused on open, and its ring rule carries both halves.
    const engine = readFileSync(join(ROOT, 'src/components/structures/workspace/column-menu/index.tsx'), 'utf8');
    assert.ok(engine.includes('window.requestAnimationFrame(() => panelRef.current?.focus());'));
    const skin = readFileSync(join(ROOT, 'src/foundation/tokens/css/presentation/components/skin/column-menu/index.css'), 'utf8');
    assert.ok(skin.includes('[data-part="panel"]:is([data-state~="focus-visible"], :focus-visible) {'));
    assert.deepEqual(realRenderRosterFailures(ROOT, { 'column-menu': entry }), []);
  });

  it('S7 STALE PIN: a row that credits on states and is still pinned as a refusal is refused by the roster door', () => {
    const failures = realRenderRosterFailures(ROOT, { 'column-menu': REAL_RENDER_MOUNTS['column-menu'] }, {
      statesRefusals: { 'column-menu': 'measured 2026-09-30 (S1 recheck): the open panel moves on neither states half' },
    });
    assert.deepEqual(failures, [
      'column-menu: pinned as a measured states refusal and declares states -- re-measure and drop it from REAL_RENDER_STATES_REFUSALS',
    ]);
  });

  it('S7 MEASURED: command-palette stays pinned, and the pin names law 3 -- the default mount already moves on the disabled stamp', () => {
    // The shape of the S7 reading (bithire+evnto, light+dark): the default
    // mount's item and the real render's item both move `opacity` under the
    // disabled stamp, so a states declaration could only restate a move.
    const reading = (opacity) => ({
      base: {},
      states: {
        disabled: {
          'command-palette': { opacity },
          [`command-palette${REAL_RENDER_KEY.default}`]: { opacity },
          [`command-palette${REAL_RENDER_KEY.real}`]: { opacity },
        },
      },
    });
    const verdict = realRenderQualification({ before: reading('0.5'), after: reading('0.6'), family: 'command-palette', axis: 'states' });
    assert.equal(verdict.qualified, false);
    assert.match(verdict.reason, /default mount already MOVES on states \(the stamp half, opacity\)/u);
    assert.ok(!REAL_RENDER_MOUNTS['command-palette'].axes.includes('states'));
    assert.match(REAL_RENDER_STATES_REFUSALS['command-palette'], /default mount already moves on the stamp half/u);
    assert.doesNotMatch(REAL_RENDER_STATES_REFUSALS['command-palette'], /moves on neither states half/u);
  });

  it('the witness list is published IN FULL: thirteen movers publish thirteen ids, never a 12-entry preview', () => {
    const denominator = Array.from({ length: 13 }, (_, index) => `family-${String(index).padStart(2, '0')}`);
    const reading = (opacity) => ({
      base: {},
      states: { hovered: Object.fromEntries(denominator.map((family) => [family, { opacity }])) },
    });
    const published = witnessReading({
      witness: { kind: 'axis-positive', axis: 'states', control: 'states.emphasis', positive: 'states' },
      before: reading('0.5'),
      after: reading('0.7'),
      denominator,
    });
    assert.equal(published.moved, 13);
    assert.deepEqual(published.movedIds, denominator);
    assert.equal(published.movedFamilies.length, 13);
  });

  it('MUTANT: a witness whose list is shorter than its count FAILS the run', () => {
    const truncated = witness({ moved: 13 });
    truncated.movedFamilies = truncated.movedFamilies.slice(0, 12);
    const failures = evaluate(result([control({ axis: 'shape', witness: truncated })]));
    assert.ok(failures.some((line) => line.includes('witness moved 13 and published 13 id(s) / 12 famil(ies)')), failures.join(' | '));
  });

  it('PIN: the unobservable set is exactly what check/theme/population derives on this tree -- 8 on states, 0 elsewhere', () => {
    const live = axisUnobservable(ROOT);
    const asRun = Object.fromEntries(AXIS_IDS.map((axis) => [axis, live.get(axis)]));
    assert.deepEqual(unobservableDrift(asRun), []);
    assert.equal(Object.keys(UNOBSERVABLE_FAMILIES.states).length, 8);
    assert.deepEqual(Object.values(UNOBSERVABLE_FAMILIES.states).filter((kind) => kind === 'colour-only').length, 6);
    assert.deepEqual(Object.entries(UNOBSERVABLE_FAMILIES.states).filter(([, kind]) => kind === 'no-vocabulary').map(([family]) => family),
      ['button-group', 'metrics-rows']);
    for (const axis of AXIS_IDS.filter((id) => id !== 'states')) assert.deepEqual(UNOBSERVABLE_FAMILIES[axis], {}, axis);
    // Reported, never subtracted: every unobservable family is in the declared states population.
    const states = axisPopulations(ROOT).get('states');
    for (const family of Object.keys(UNOBSERVABLE_FAMILIES.states)) assert.ok(states.includes(family), family);
  });

  it('MUTANT: a family that leaves or enters the unobservable set is refused on a full run, and not on a --families run', () => {
    const left = pinnedUnobservable();
    left.states = left.states.filter((entry) => entry.family !== 'button-group');
    assert.ok(evaluate(result([cell()], { unobservable: left })).some((line) => line.startsWith(
      'states: button-group is pinned unobservable (no-vocabulary) and the probe can now observe it',
    )));
    const entered = pinnedUnobservable();
    entered.states.push({ family: 'badge', class: 'colour-only', properties: ['color'] });
    assert.ok(evaluate(result([cell()], { unobservable: entered })).some((line) => line.startsWith(
      'states: badge is unobservable (colour-only) and not in UNOBSERVABLE_FAMILIES',
    )));
    assert.ok(!evaluate(result([cell()], { unobservable: entered, familiesFiltered: true })).some((line) => line.includes('UNOBSERVABLE')));
  });
});

describe('axis-difference — R2a: the rhythm reach rows the R1 census measured moving', () => {
  const R2A_REAL_ROWS = ['chart-c', 'detail', 'flex', 'presence-typing', 'visual-excellence-preview'];

  it('each new real-render row declares rhythm alone, on a family in the rhythm population, and passes the door on its own', () => {
    const rhythm = axisPopulations(ROOT).get('rhythm');
    for (const row of R2A_REAL_ROWS) {
      const entry = REAL_RENDER_MOUNTS[row];
      assert.ok(entry !== undefined, `${row} has no roster row`);
      assert.deepEqual([...entry.axes], ['rhythm'], row);
      assert.ok(rhythm.includes(entry.family ?? row), row);
      assert.deepEqual(realRenderRosterFailures(ROOT, { [row]: entry }), [], row);
    }
    // layout reads its existing S1 markup on rhythm too; the markup is unchanged.
    assert.ok(rhythm.includes('layout'));
    assert.ok(REAL_RENDER_MOUNTS.layout.axes.includes('rhythm'));
    assert.match(REAL_RENDER_MOUNTS.layout.markup, /data-part="trigger"/u);
  });

  it('presence carries two rows -- the cursor (shape, depth) and the typing indicator (rhythm) -- on disjoint axes, neither declaring states', () => {
    const rows = Object.entries(REAL_RENDER_MOUNTS).filter(([row, entry]) => (entry.family ?? row) === 'presence');
    assert.deepEqual(rows.map(([row]) => row).sort(), ['presence', 'presence-typing']);
    const [cursor, typing] = [REAL_RENDER_MOUNTS.presence.axes, REAL_RENDER_MOUNTS['presence-typing'].axes];
    assert.equal(cursor.some((axis) => typing.includes(axis)), false);
    assert.equal([...cursor, ...typing].includes('states'), false);
  });

  it('detail mounts a DOMAIN lifecycle value the scene never stamps, on a row that is never stamped or forced', () => {
    const tokens = markupTokens(REAL_RENDER_MOUNTS.detail.markup);
    assert.ok(tokens.includes('attr:data-state=error'));
    assert.equal(STATE_VARIANTS.includes('error'), false);
    assert.equal(REAL_RENDER_MOUNTS.detail.axes.includes('states'), false);
  });

  it('flex stays OFF the as-rendered roster (law 1) and reaches its rung only as a named configuration', () => {
    assert.equal(AS_RENDERED_ROOT_STAMPS.flex, undefined);
    const tokens = markupTokens(REAL_RENDER_MOUNTS.flex.markup);
    for (const token of ['attr:data-gap=uniform', 'attr:data-gap-preset=md', 'style:--ds-flex-gap=var(--ds-spacing-4, 1rem)']) {
      assert.ok(tokens.includes(token), token);
    }
  });

  it('MUTANT: a sibling resolver or scaffold that stops writing the pinned token fails the row, named', () => {
    const drift = (suffix, from, to) => (file) => {
      const text = readFileSync(file, 'utf8');
      return file.endsWith(suffix) ? text.replaceAll(from, to) : text;
    };
    const flex = realRenderRosterFailures(ROOT, { flex: REAL_RENDER_MOUNTS.flex }, {
      readSource: drift('flex/runtime/presentation/index.ts', 'attributes["data-gap-preset"] = flexGapPresetSpelling(scalarGap);', 'attributes["data-gap-preset"] = undefined;'),
    });
    assert.ok(flex.some((line) => line.startsWith('flex/attr:data-gap-preset=md:') && line.includes('no longer carries the stamp')), flex.join(' | '));
    const rung = realRenderRosterFailures(ROOT, { flex: REAL_RENDER_MOUNTS.flex }, {
      readSource: drift('flex/contracts/index.ts', 'md: "var(--ds-spacing-4, 1rem)",', 'md: "var(--ds-spacing-3, 0.75rem)",'),
    });
    assert.ok(rung.some((line) => line.includes('no longer carries the resolves `md: "var(--ds-spacing-4, 1rem)",`')), rung.join(' | '));
    const funnel = realRenderRosterFailures(ROOT, { 'chart-c': REAL_RENDER_MOUNTS['chart-c'] }, {
      readSource: drift('funnel-chart/index.tsx', 'overlay={fallbackMessage ? (', 'overlay={null && ('),
    });
    assert.ok(funnel.some((line) => line.startsWith('chart-c:') && line.includes('no longer carries the gate')), funnel.join(' | '));
    const scaffold = realRenderRosterFailures(ROOT, { 'chart-c': REAL_RENDER_MOUNTS['chart-c'] }, {
      readSource: drift('charts/presentation/scaffold/index.tsx', 'data-state="ready"', 'data-state={resolvedState}'),
    });
    assert.ok(scaffold.some((line) => line.startsWith('chart-c/attr:data-state=ready:')), scaffold.join(' | '));
    const detail = realRenderRosterFailures(ROOT, { detail: REAL_RENDER_MOUNTS.detail }, {
      readSource: drift('pages/data/detail/index.tsx', 'data-state="error"', 'data-state="failed"'),
    });
    assert.ok(detail.some((line) => line.includes('`attr:data-state=error` is not written by')), detail.join(' | '));
  });

  it('the three as-rendered stamps are the DEFAULT render, and each mounts on its root', () => {
    assert.deepEqual(AS_RENDERED_ROOT_STAMPS.descriptions.map((row) => [row.attribute, row.value]), [['data-layout', 'horizontal']]);
    assert.deepEqual(AS_RENDERED_ROOT_STAMPS['input-number'].map((row) => [row.attribute, row.value]), [['data-size', 'md']]);
    assert.deepEqual(AS_RENDERED_ROOT_STAMPS.progress.map((row) => [row.attribute, row.value]), [['data-type', 'line']]);
    const elements = familyElements(ROOT, ['descriptions', 'input-number', 'progress']);
    assert.equal(elements.get('descriptions').attributes['data-layout'], 'horizontal');
    assert.equal(elements.get('input-number').attributes['data-size'], 'md');
    assert.equal(elements.get('progress').attributes['data-type'], 'line');
    const contract = readFileSync(join(ROOT, 'src/components/primitives/display/descriptions/contracts/index.ts'), 'utf8');
    assert.ok(contract.includes("layout: 'horizontal' as const,"), 'DESCRIPTIONS_DEFAULTS.layout moved -- re-read the row');
    const progress = readFileSync(join(ROOT, 'src/components/primitives/feedback/progress/contracts/index.ts'), 'utf8');
    assert.ok(progress.includes("type: 'line',"), 'PROGRESS_DEFAULTS.type moved -- re-read the row');
  });

  it('MUTANT: a two-step default is pinned on BOTH lines -- a re-spelled legacy default fails the input-number row', () => {
    const [row] = AS_RENDERED_ROOT_STAMPS['input-number'];
    assert.deepEqual(asRenderedRosterFailures(ROOT, { 'input-number': [row] }), []);
    const respelled = asRenderedRosterFailures(ROOT, {
      'input-number': [{ ...row, resolves: ["size = 'small',", "const sizeKey = toCanonicalSize(size) ?? 'md';"] }],
    });
    assert.deepEqual(respelled, ["input-number/data-size: src/components/primitives/inputs/input-number/engines/modern/index.tsx no longer carries the resolves `size = 'small',`"]);
  });

  it('the part law admits the rhythm chains the stamps open, and no others than the gate names', () => {
    const elements = familyElements(ROOT, ['descriptions', 'progress']);
    const parts = familyAxisParts(ROOT, ['descriptions', 'progress'], elements);
    const rhythmSelectors = (family) => parts.get(family).parts.filter((part) => part.axes.includes('rhythm')).map((part) => part.selector);
    assert.ok(rhythmSelectors('descriptions').includes(
      ".rottay-descriptions.rottay-descriptions--modern[data-part='root'][data-layout='horizontal'] > [data-part='body'] > [data-part='rows']"));
    assert.ok(rhythmSelectors('progress').includes(".rottay-progress-shell.rottay-progress-shell--modern[data-type='line'] [data-part='label']"));
    assert.equal(rhythmSelectors('descriptions').some((selector) => selector.includes("[data-layout='vertical']")), false);
  });
});

describe('axis-difference — R3: the depth reach rows the R3 census measured moving', () => {
  // Default renders first, then the configurations a public prop ships.
  const R3_REAL_ROWS = ['sidebar-surface', 'saved-views-menu', 'skeleton-anatomy-block', 'table', 'assistant-preview-diff', 'tree', 'descriptions',
    'carousel', 'image', 'box', 'list', 'drawer-compounds-divider', 'modal-compounds-divider', 'data-table-actions'];
  const R3_JOINED = { 'edit-fields': ['shape', 'rhythm', 'depth', 'motion'], 'feature-workspace-frame': ['shape', 'depth', 'motion'], 'stats-header': ['depth', 'states'] };
  const R3_STAMPED = ['table-toolbar', 'user-profile-card'];
  const drift = (suffix, from, to) => (file) => {
    const text = readFileSync(file, 'utf8');
    return file.endsWith(suffix) ? text.replaceAll(from, to) : text;
  };

  it('each new real-render row declares depth alone, on a family in the depth population, and passes the door on its own', () => {
    const depth = axisPopulations(ROOT).get('depth');
    for (const row of R3_REAL_ROWS) {
      const entry = REAL_RENDER_MOUNTS[row];
      assert.ok(entry !== undefined, `${row} has no roster row`);
      assert.deepEqual([...entry.axes], ['depth'], row);
      assert.ok(depth.includes(entry.family ?? row), row);
      assert.deepEqual(realRenderRosterFailures(ROOT, { [row]: entry }), [], row);
    }
  });

  it('three existing rows read depth on their UNCHANGED markup, which already holds the node the depth rule paints', () => {
    for (const [row, axes] of Object.entries(R3_JOINED)) assert.deepEqual([...REAL_RENDER_MOUNTS[row].axes], axes, row);
    assert.match(REAL_RENDER_MOUNTS['edit-fields'].markup, /data-part="editor"><div data-part="editor-header">.*data-part="editor-icon"/u);
    assert.match(REAL_RENDER_MOUNTS['feature-workspace-frame'].markup, /ds-feature-workspace-frame__skeleton" [^>]*><span><\/span>/u);
    assert.match(REAL_RENDER_MOUNTS['stats-header'].markup, /data-part="stat-card" data-accent="primary"/u);
  });

  it('a second row of a family names it, declares no states, and leaves the single-states-row law intact', () => {
    for (const [row, family] of [['skeleton-anatomy-block', 'skeleton-anatomy'], ['drawer-compounds-divider', 'drawer-compounds'],
      ['modal-compounds-divider', 'modal-compounds'], ['assistant-preview-diff', 'assistant']]) {
      assert.equal(REAL_RENDER_MOUNTS[row].family, family, row);
      assert.equal(REAL_RENDER_MOUNTS[row].axes.includes('states'), false, row);
    }
    assert.deepEqual(realRenderRosterFailures(ROOT), []);
  });

  it('the two as-rendered stamps are the DEFAULT render, and each mounts on its root', () => {
    assert.deepEqual(AS_RENDERED_ROOT_STAMPS['table-toolbar'].map((row) => [row.attribute, row.value]), [['data-structure', 'table-toolbar']]);
    assert.deepEqual(AS_RENDERED_ROOT_STAMPS['user-profile-card'].map((row) => [row.attribute, row.value]), [['data-loading', 'false'], ['data-variant', 'full']]);
    assert.deepEqual(asRenderedRosterFailures(ROOT), []);
    const elements = familyElements(ROOT, R3_STAMPED);
    assert.equal(elements.get('table-toolbar').attributes['data-structure'], 'table-toolbar');
    assert.equal(elements.get('user-profile-card').attributes['data-loading'], 'false');
    assert.equal(elements.get('user-profile-card').attributes['data-variant'], 'full');
  });

  it('MUTANT: a moved default or a vanished gate fails the row it pins, named', () => {
    const table = realRenderRosterFailures(ROOT, { table: REAL_RENDER_MOUNTS.table }, {
      readSource: drift('display/table/engines/modern/index.tsx', 'headerBordered = true,', 'headerBordered = false,'),
    });
    assert.ok(table.some((line) => line.startsWith('table/state:') && line.includes('no longer carries the resolves `headerBordered = true,`')), table.join(' | '));
    const sidebar = realRenderRosterFailures(ROOT, { 'sidebar-surface': REAL_RENDER_MOUNTS['sidebar-surface'] }, {
      readSource: drift('navigation/sidebar-surface/index.tsx', '{ stacked: false };', '{ stacked: true };'),
    });
    assert.ok(sidebar.some((line) => line.startsWith('sidebar-surface/attr:data-stacked=false:')), sidebar.join(' | '));
    const bones = realRenderRosterFailures(ROOT, { 'skeleton-anatomy-block': REAL_RENDER_MOUNTS['skeleton-anatomy-block'] }, {
      readSource: drift('skeleton/runtime/anatomy-renderer/index.tsx', "  root: 'frame',", "  root: 'block',"),
    });
    assert.ok(bones.some((line) => line.startsWith('skeleton-anatomy-block/attr:data-bone=frame:')), bones.join(' | '));
    const tree = realRenderRosterFailures(ROOT, { tree: REAL_RENDER_MOUNTS.tree }, {
      readSource: drift('display/tree/engines/modern/index.tsx', '{showLine && level > 0 && (', '{false && ('),
    });
    assert.ok(tree.some((line) => line.startsWith('tree:') && line.includes('no longer carries the gate')), tree.join(' | '));
    const card = asRenderedRosterFailures(ROOT, {
      'user-profile-card': AS_RENDERED_ROOT_STAMPS['user-profile-card'].map((row) => (row.attribute === 'data-variant' ? { ...row, resolves: "variant = 'compact'," } : row)),
    });
    assert.deepEqual(card, ["user-profile-card/data-variant: src/components/patterns/identity/profile/user-profile-card/engines/modern/index.tsx no longer carries the resolves `variant = 'compact',`"]);
  });

  it('MUTANT: a token the engine never writes -- a fabricated variant, an invented part -- is refused, never mounted', () => {
    const box = { ...REAL_RENDER_MOUNTS.box, markup: REAL_RENDER_MOUNTS.box.markup.replace('data-component="box"', 'data-component="box" data-elevated="true"') };
    assert.ok(realRenderRosterFailures(ROOT, { box }).some((line) => line.includes('`attr:data-elevated=true` is not written by')));
    const tree = { ...REAL_RENDER_MOUNTS.tree, markup: REAL_RENDER_MOUNTS.tree.markup.replace('data-span="half"', 'data-span="quarter"') };
    assert.ok(realRenderRosterFailures(ROOT, { tree }).some((line) => line.includes('`attr:data-span=quarter` is not written by')));
    // A stamp row nobody's markup uses rots the roster into claims; refused too.
    const list = { ...REAL_RENDER_MOUNTS.list, markup: REAL_RENDER_MOUNTS.list.markup.replace(' data-bordered="true"', '') };
    assert.ok(realRenderRosterFailures(ROOT, { list }).some((line) => line.startsWith('list/attr:data-bordered=true: a stamp row no mount token uses')));
  });
});

describe('axis-difference BROWSER drill — R3: the depth reach rows move depth through their mount, and only through it', { skip: browserReason }, () => {
  const byId = (id) => SCENARIOS.find((scenario) => scenario.id === id);
  const REAL = ['sidebar-surface', 'saved-views-menu', 'table', 'stats-header'];
  const STAMPED = ['table-toolbar', 'user-profile-card'];

  it('the rows move on depth with their mount and not without it; the palette control stays 0 over the credited mounts', async () => {
    const families = [...REAL, ...STAMPED];
    const scenarios = [byId('depth'), byId('palette-only')];
    const before = Object.fromEntries(Object.entries(AS_RENDERED_ROOT_STAMPS).filter(([family]) => !STAMPED.includes(family)));
    const on = await run({ verticals: ['bithire'], themes: ['light'], families, scenarios, nativePseudos: false });
    const off = await run({
      verticals: ['bithire'], themes: ['light'], families, scenarios, nativePseudos: false, realRenderMounts: false, asRenderedRoster: before,
    });
    const depthOn = on.cells.find((entry) => entry.scenario === 'depth');
    const depthOff = off.cells.find((entry) => entry.scenario === 'depth');
    for (const family of families) {
      assert.ok(depthOn.movedIds.includes(family), `${family} did not move on depth with its R3 mount`);
      assert.ok(!depthOff.movedIds.includes(family), `${family} moved on depth WITHOUT its R3 mount, so this drill proves nothing`);
    }
    for (const family of REAL) assert.ok(depthOn.realRender.rescued.includes(family), `${family} moved, but not through its real render`);
    assert.deepEqual(depthOn.realRender.refused, []);
    assert.deepEqual(on.populations, off.populations, 'a mount may move a numerator, never a denominator');
    const paletteDepth = on.cells.find((entry) => entry.scenario === 'palette-only' && entry.axis === 'depth');
    assert.deepEqual([...paletteDepth.realRender.credited].sort(), [...REAL].sort());
    for (const entry of on.cells.filter((item) => item.kind === 'negative')) {
      assert.equal(entry.evidential, true);
      assert.equal(entry.moved, 0, `${entry.axis}: ${JSON.stringify(entry.movedFamilies)}`);
    }
    assert.deepEqual(evaluate(on), []);
  });
});

/**
 * THE PSEUDO-ELEMENT READ LAW (WO-EVI-02 instrument lot; Fable review
 * 2026-10-01, ACCEPT-WITH-CHANGES, C1-C8). Offline: the law's bounds, the
 * census reconciliation, the pin in both directions, one family per cell, the
 * reproduction flag. Read off the namespace so a tree without the law fails
 * here as a drill.
 */
describe('axis-difference — the pseudo-element read law: bounds, census, pin', () => {
  const ROOT = ".ds-drill.ds-drill--modern[data-part='root']";

  it('reads ::before/::after at the END of a selector on its host, forced pseudo-classes stripped; refuses every other :: by name', () => {
    assert.deepEqual(probe.pseudoReadEntry(`${ROOT} [data-part='x']:hover::after`, 'states'),
      { axis: 'states', selector: `${ROOT} [data-part='x']:hover::after`, host: `${ROOT} [data-part='x']`, pseudo: '::after' });
    assert.equal(probe.pseudoReadEntry(`${ROOT}::before`, 'depth').host, ROOT);
    for (const selector of [
      `${ROOT} input::-webkit-slider-thumb`, `${ROOT} input::placeholder`, `${ROOT} li::marker`,
      `${ROOT}::-moz-range-thumb`, `${ROOT}::after:hover`, `${ROOT}::view-transition-old(root)`,
    ]) {
      assert.equal(probe.pseudoReadEntry(selector, 'states').refused, 'ua-shadow-pseudo', selector);
    }
  });

  it('derives the hosts INSIDE the instrument, one census row per node refusal, reads deduplicated per (axis, host, pseudo)', () => {
    const css = [
      `${ROOT}::after { content: ''; box-shadow: 0 0 1px black; }`,
      `${ROOT}::after { border-width: 1px; }`,
      `${ROOT} input::-webkit-slider-thumb { border-radius: 4px; }`,
      `${ROOT}[data-variant='ghost']::before { border-radius: 2px; }`,
    ].join('\n');
    const record = familyParts(css, DRILL_ELEMENT, ['shape', 'depth'], { family: 'drill' });
    assert.equal(record.rejected['pseudo-element'], 4);
    assert.equal(record.pseudoReads.entries.length, 4, 'the census unit is the refusal unit');
    assert.deepEqual(record.pseudoReads.reads.map((read) => `${read.axis} ${read.host}${read.pseudo}`), [
      `shape ${ROOT}[data-variant='ghost']::before`,
      `depth ${ROOT}::after`,
    ]);
    assert.equal(probe.setPseudoHosts, undefined, 'no injected host map: the instrument derives its own');
    const report = partMountReport(new Map([['drill', record]]));
    assert.deepEqual(report.pseudoReads, { drill: { shape: [`${ROOT}[data-variant='ghost']::before`], depth: [`${ROOT}::after`] } },
      'the hosts are published per family beside the parts');
  });

  it('(e) a pseudo rule writing only `gap` is a RHYTHM read and lends shape nothing', () => {
    const record = familyParts(`${ROOT}::after { content: ''; gap: 2px; }`, DRILL_ELEMENT, ['shape', 'rhythm']);
    assert.deepEqual(record.pseudoReads.reads.map((read) => read.axis), ['rhythm']);
  });

  it('the census gives every refusal one outcome, reconciles with the node refusals, and says not-read when the law is off', () => {
    const css = [
      `${ROOT}::after { content: ''; box-shadow: 0 0 1px black; }`,
      `${ROOT}::before { box-shadow: 0 0 1px black; }`,
      `${ROOT}[data-variant='ghost']::after { box-shadow: 0 0 1px black; }`,
      `${ROOT}::-webkit-scrollbar { box-shadow: 0 0 1px black; }`,
    ].join('\n');
    const byFamily = new Map([['drill', familyParts(css, DRILL_ELEMENT, ['depth'])]]);
    const plan = probe.pseudoReadPlan(byFamily);
    const seen = new Map();
    // What a page reports: `::after` read (2), `::before` matched and not generated (1), the ghost never matched.
    const key = (read) => `drill\u0000${read.axis}\u0000${read.host}\u0000${read.pseudo}`;
    seen.set(key(plan.drill[0]), 2);
    seen.set(key(plan.drill[1]), 1);
    const census = probe.pseudoReadCensus(byFamily, seen, { nodeRefusals: 4 });
    assert.deepEqual(census.census, { read: 1, 'host-absent': 1, ungenerated: 1, 'ua-shadow-pseudo': 1 });
    assert.deepEqual(census.reconciliation, { nodeRefusals: 4, entries: 4, equal: true });
    const off = probe.pseudoReadCensus(byFamily, seen, { applied: false, nodeRefusals: 4 });
    assert.equal(off.census['not-read'], 3);
    assert.equal(off.census.read, 0);
    assert.equal(probe.pseudoReadPlan(byFamily, { applied: false }), null, 'the reproduction flag reads no pseudo at all');
  });

  /** A full-run result carrying the read law, with one positive cell per axis given. */
  const lawResult = (cells, over = {}) => result(cells, {
    pseudoReads: { applied: true, census: { read: 1, 'host-absent': 0, ungenerated: 0, 'ua-shadow-pseudo': 0 }, reconciliation: { nodeRefusals: 1, entries: 1, equal: true } },
    partMounts: { applied: true },
    ...over,
  });
  const stepperCell = (over = {}) => cell({
    scenario: 'depth', axis: 'depth', moved: 1, movedIds: ['stepper'], movedFamilies: [{ family: 'stepper', property: 'border-top-width' }],
    pseudoOnly: [{ family: 'stepper', property: 'border-top-width' }],
    pseudoChannels: { stepper: { moves: { channel: '--ds-edge-standard-width', a: '0px', b: '1.5px' }, holds: { channel: '--ds-edge-standard-style', a: 'solid', b: 'solid' } } },
    ...over,
  });
  const recordFactsCell = (over = {}) => cell({
    scenario: 'motion', axis: 'motion', moved: 1, movedIds: ['record-facts'], movedFamilies: [{ family: 'record-facts', property: 'animation-duration' }],
    pseudoOnly: [{ family: 'record-facts', property: 'animation-duration' }],
    pseudoChannels: { 'record-facts': { moves: { channel: '--ds-motion-duration-scale', a: '0.8', b: '1.3' } } },
    ...over,
  });

  it('C5: pins exactly stepper on depth (the WIDTH channel) and record-facts on motion (the shimmer duration)', () => {
    assert.deepEqual(Object.keys(probe.PSEUDO_ONLY_CREDITS).sort(), ['depth', 'motion']);
    assert.deepEqual(Object.keys(probe.PSEUDO_ONLY_CREDITS.depth), ['stepper']);
    assert.deepEqual(Object.keys(probe.PSEUDO_ONLY_CREDITS.motion), ['record-facts']);
    assert.equal(probe.PSEUDO_ONLY_CREDITS.depth.stepper.moves, '--ds-edge-standard-width');
    assert.equal(probe.PSEUDO_ONLY_CREDITS.depth.stepper.holds, '--ds-edge-standard-style', 'the style channel reads solid in both arms');
    assert.equal(probe.PSEUDO_ONLY_CREDITS.depth.stepper.property, 'border-top-width');
    assert.equal(probe.PSEUDO_ONLY_CREDITS.motion['record-facts'].property, 'animation-duration');
    assert.deepEqual(evaluate(lawResult([stepperCell(), recordFactsCell()])), [], 'the green arm');
  });

  it('C5 RED: a pinned credit that stops moving through its pseudo fails, on every cell it stops in', () => {
    const failures = evaluate(lawResult([stepperCell({ pseudoOnly: [], moved: 0, movedIds: [], movedFamilies: [] }), recordFactsCell()]));
    assert.ok(failures.some((line) => line.startsWith('stepper: pinned in PSEUDO_ONLY_CREDITS on depth and NOT credited')), failures.join(' | '));
  });

  it('C5 RED: an UNPINNED pseudo-only credit fails until it is pinned', () => {
    const failures = evaluate(lawResult([
      stepperCell({ moved: 2, movedIds: ['stepper', 'badge'], pseudoOnly: [{ family: 'stepper', property: 'border-top-width' }, { family: 'badge', property: 'box-shadow' }] }),
      recordFactsCell(),
    ]));
    assert.ok(failures.some((line) => line.startsWith('badge: credited on bithire/light depth through a ::before/::after reading ALONE')), failures.join(' | '));
  });

  it('C5 RED: the pin reads its property and its channels -- width must move, style must hold', () => {
    const wrongProperty = evaluate(lawResult([stepperCell({ pseudoOnly: [{ family: 'stepper', property: 'border-top-style' }] }), recordFactsCell()]));
    assert.ok(wrongProperty.some((line) => line.includes('the pin reads border-top-width')), wrongProperty.join(' | '));
    const still = evaluate(lawResult([stepperCell({ pseudoChannels: { stepper: { moves: { a: '1px', b: '1px' }, holds: { a: 'solid', b: 'solid' } } } }), recordFactsCell()]));
    assert.ok(still.some((line) => line.includes('--ds-edge-standard-width did not move')), still.join(' | '));
    const style = evaluate(lawResult([stepperCell({ pseudoChannels: { stepper: { moves: { a: '0px', b: '1.5px' }, holds: { a: 'none', b: 'solid' } } } }), recordFactsCell()]));
    assert.ok(style.some((line) => line.includes('--ds-edge-standard-style moved')), style.join(' | '));
  });

  it('C5: the pin is a full-run check -- a --families run, a run with the law off, or without part mounts reproduces another reading', () => {
    const lost = [stepperCell({ pseudoOnly: [] }), recordFactsCell()];
    assert.deepEqual(probe.pseudoOnlyDrift(lawResult(lost, { familiesFiltered: true })), []);
    assert.deepEqual(probe.pseudoOnlyDrift(lawResult(lost, { pseudoReads: { applied: false } })), []);
    assert.deepEqual(probe.pseudoOnlyDrift(lawResult(lost, { partMounts: { applied: false } })), []);
    assert.ok(probe.pseudoOnlyDrift(lawResult(lost)).length > 0);
  });

  it('C3 RED: a census that does not reconcile with the node refusals fails the run', () => {
    const failures = evaluate(lawResult([stepperCell(), recordFactsCell()], {
      pseudoReads: { applied: true, census: { read: 1, 'host-absent': 0, ungenerated: 0, 'ua-shadow-pseudo': 0 }, reconciliation: { nodeRefusals: 2, entries: 1, equal: false } },
    }));
    assert.ok(failures.some((line) => line.startsWith('pseudo-element read law: 2 node refusal(s) and 1 census entr(ies)')), failures.join(' | '));
  });

  it('(g) a family counts ONCE per cell: a duplicated id or a count that disagrees with its ids fails', () => {
    assert.deepEqual(evaluate(result([cell({ moved: 2, movedIds: ['a', 'b'] })])), []);
    const twice = evaluate(result([cell({ moved: 2, movedIds: ['a', 'a'] })]));
    assert.ok(twice.some((line) => line.includes('moved 2 over 2 id(s), 1 distinct')), twice.join(' | '));
    const short = evaluate(result([cell({ moved: 2, movedIds: ['a'] })]));
    assert.ok(short.some((line) => line.includes('moved 2 over 1 id(s)')), short.join(' | '));
  });

  it('(g) pseudo-only is decided AFTER law 3 and adds no mover: host movers, credited real movers and non-movers are not pseudo-only', () => {
    const sources = [
      { family: 'only', hosts: null, pseudo: 'box-shadow', real: null },
      { family: 'both', hosts: 'box-shadow', pseudo: 'box-shadow', real: null },
      { family: 'real', hosts: null, pseudo: 'box-shadow', real: 'box-shadow' },
      { family: 'still', hosts: null, pseudo: null, real: null },
      { family: 'unmoved', hosts: null, pseudo: 'box-shadow', real: null },
    ];
    const target = { moved: 4, movedIds: ['only', 'both', 'real', 'still'], realRender: { credited: ['real'] } };
    const untouched = cell({ ...target });
    probe.resolvePseudoOnly([untouched]);
    assert.equal(untouched.pseudoOnly, undefined, 'a cell with no pending record is left alone');
    const resolved = probe.resolvePseudoOnlyFrom(cell({ ...target }), { sources, channels: {} });
    assert.deepEqual(resolved.pseudoOnly, [{ family: 'only', property: 'box-shadow' }]);
    assert.deepEqual(resolved.pseudoMoved, ['only', 'both', 'real', 'unmoved']);
    assert.deepEqual(resolved.movedIds, target.movedIds, 'the verdict never edits the numerator');
  });

  it('C4: --no-pseudo-reads is a run option, read off argv, named in the usage header, and refused by the indicator', () => {
    const cli = readFileSync(join(HERE, '../index.mjs'), 'utf8');
    assert.ok(cli.includes("pseudoReads: !process.argv.includes('--no-pseudo-reads')"));
    assert.match(cli, /^ \*   node scripts\/check\/theme\/axis-difference\/index\.mjs --no-pseudo-reads /mu);
    assert.ok(REPRODUCTION_FLAGS.includes('--no-pseudo-reads'));
    assert.match(probe.publicationRefusal({ argv: [] }) ?? 'permitted', /permitted/u);
  });
});

/**
 * THE PSEUDO-ELEMENT READ LAW IN A BROWSER, one drill per class the law
 * refuses and one per withholding law, each with its red arm. Only a real
 * browser can say whether a host MATCHES and whether a box is GENERATED.
 */
describe('axis-difference BROWSER drill — the pseudo-element read law reads paint already there, and nothing else', { skip: browserReason }, () => {
  const ROOT = ".ds-drill.ds-drill--modern[data-part='root']";
  const ARM_A = { '--ds-drill-blur': '2px', '--ds-state-disabled-opacity': '0.5', '--ds-state-press-scale': '0.9', '--ds-drill-op': '0.9' };
  const ARM_B = { '--ds-drill-blur': '6px', '--ds-state-disabled-opacity': '0.3', '--ds-state-press-scale': '0.7', '--ds-drill-op': '0.6' };
  const properties = allProperties();
  const axisOf = axisByProperty();

  const withPage = async (body) => {
    const { browser, close } = await launchBrowser();
    try {
      const context = await browser.newContext();
      return await body(context);
    } finally {
      await close();
    }
  };

  /**
   * Both arms of one drill family, stamped half (and the native half when
   * asked), with the read law on or off. `familyCss` is what the part law and
   * the read law are derived from; `sceneCss` is what the page paints with.
   */
  const measure = async (context, familyCss, { axes, pseudo = true, sceneCss = familyCss, native = false, withheld = new Map() }) => {
    const stamped = familyParts(familyCss, DRILL_ELEMENT, axes, { family: 'drill' });
    const byFamily = new Map([['drill', stamped]]);
    const plan = probe.pseudoReadPlan(byFamily, { applied: pseudo });
    const page = await context.newPage();
    await page.setContent(sceneHtml({
      css: sceneCss, vertical: 'bithire', theme: 'light', elements: new Map([['drill', DRILL_ELEMENT]]), partMounts: byFamily,
    }), { waitUntil: 'load' });
    const before = await measureCell({ page, variables: ARM_A, properties, axisOf, pseudoReads: plan });
    const after = await measureCell({ page, variables: ARM_B, properties, axisOf, pseudoReads: plan });
    const seen = await probe.collectPseudoSeen(page, plan, new Map());
    await page.close();
    if (native) {
      const nativeParts = new Map([['drill', familyParts(familyCss, DRILL_ELEMENT, axes, { family: 'drill', nativePseudos: true })]]);
      const nativePage = await context.newPage();
      await nativePage.setContent(sceneHtml({
        css: sceneCss, vertical: 'bithire', theme: 'light', elements: new Map([['drill', DRILL_ELEMENT]]), partMounts: nativeParts,
      }), { waitUntil: 'load' });
      const nativePlan = probe.pseudoReadPlan(nativeParts, { applied: pseudo });
      const half = await measureNativeHalf({
        page: nativePage, arms: [{ key: 'a', variables: ARM_A }, { key: 'b', variables: ARM_B }], properties, axisOf, withheld, pseudoReads: nativePlan,
      });
      await probe.collectPseudoSeen(nativePage, nativePlan, seen);
      await nativePage.close();
      before.native = half.readings.get('a');
      after.native = half.readings.get('b');
    }
    const census = probe.pseudoReadCensus(byFamily, seen, { applied: pseudo, nodeRefusals: stamped.rejected['pseudo-element'] ?? 0 });
    const axis = axes[0];
    return {
      moved: differsOnAxis(axis, before, after, 'drill'),
      halves: axis === 'states' ? statesHalves(before, after, 'drill') : null,
      sources: plan === null ? null : probe.pseudoSources({ before, after, family: 'drill', axis }),
      census,
    };
  };

  const LIVE = `${DRILL_ROOT_CSS}\n${ROOT}::after { content: ''; box-shadow: 0 0 var(--ds-drill-blur) black; }`;
  const LITERAL = `${DRILL_ROOT_CSS}\n${ROOT}::after { content: ''; box-shadow: 0 0 4px black; }`;
  const DRILL_PIN = Object.freeze({ depth: Object.freeze({ drill: Object.freeze({ pseudo: `${ROOT}::after`, property: 'box-shadow', moves: '--ds-drill-blur' }) }) });

  /** The positive depth cell `run` would publish for the drill family off one measurement. */
  const depthCell = (reading) => {
    const moved = reading.moved === null ? [] : [{ family: 'drill', property: reading.moved }];
    return probe.resolvePseudoOnlyFrom(cell({
      scenario: 'depth', axis: 'depth', denominator: 1, moved: moved.length, percent: moved.length * 100,
      movedFamilies: moved, movedIds: moved.map((entry) => entry.family),
    }), {
      sources: reading.sources === null ? [] : [reading.sources],
      channels: { drill: { moves: { channel: '--ds-drill-blur', a: ARM_A['--ds-drill-blur'], b: ARM_B['--ds-drill-blur'] } } },
    });
  };
  const lawRun = (cells) => result(cells, {
    pseudoReads: { applied: true, census: { read: 1, 'host-absent': 0, ungenerated: 0, 'ua-shadow-pseudo': 0 }, reconciliation: { nodeRefusals: 1, entries: 1, equal: true } },
    partMounts: { applied: true },
  });

  it('(a) reads a generated pseudo the host does not paint, reads nothing with the law off, and the PIN catches the pseudo that stops differing', async () => {
    const [blind, seeing, red] = await withPage(async (context) => [
      await measure(context, LIVE, { axes: ['depth'], pseudo: false }),
      await measure(context, LIVE, { axes: ['depth'] }),
      await measure(context, LITERAL, { axes: ['depth'] }),
    ]);
    assert.equal(blind.moved, null, 'with the law off the box is invisible -- otherwise this drill proves nothing');
    assert.equal(seeing.moved, 'box-shadow', 'the pseudo must carry the dial to the page');
    assert.deepEqual({ hosts: seeing.sources.hosts, pseudo: seeing.sources.pseudo }, { hosts: null, pseudo: 'box-shadow' }, 'a pseudo-only credit');
    assert.equal(seeing.census.census.read, 1);
    assert.equal(red.moved, null, 'a pseudo that went literal must NOT keep reporting a difference');
    assert.deepEqual(probe.pseudoOnlyDrift(lawRun([depthCell(seeing)]), DRILL_PIN), [], 'the green arm of the pin');
    const caught = probe.pseudoOnlyDrift(lawRun([depthCell(red)]), DRILL_PIN);
    assert.ok(caught.some((line) => line.startsWith('drill: pinned in PSEUDO_ONLY_CREDITS on depth and NOT credited')), caught.join(' | '));
  }, 120_000);

  it('(b) UNGENERATED: a `content: none` pseudo whose box-shadow differs is not credited and publishes `ungenerated`', async () => {
    const NONE = `${DRILL_ROOT_CSS}\n${ROOT}::after { content: none; box-shadow: 0 0 var(--ds-drill-blur) black; }`;
    const [ungenerated, generated] = await withPage(async (context) => [
      await measure(context, NONE, { axes: ['depth'] }),
      await measure(context, LIVE, { axes: ['depth'] }),
    ]);
    assert.equal(ungenerated.moved, null, 'the browser hands back a box-shadow for a box it never generated; crediting it is the lie');
    assert.deepEqual(ungenerated.census.census, { read: 0, 'host-absent': 0, ungenerated: 1, 'ua-shadow-pseudo': 0 });
    assert.equal(generated.moved, 'box-shadow', 'the red arm: the same rule with content generated moves');
  }, 120_000);

  it('(c) UA-SHADOW: a `::-webkit-slider-thumb` rule is refused by name and never read, because the browser answers with the HOST', async () => {
    const css = `${DRILL_ROOT_CSS}
      ${ROOT} > input[data-part='range'] { opacity: var(--ds-drill-op); }
      ${ROOT} > input[data-part='range']::-webkit-slider-thumb { opacity: 0.4; }`;
    const naive = await withPage(async (context) => {
      const byFamily = new Map([['drill', familyParts(css, DRILL_ELEMENT, ['states'], { family: 'drill' })]]);
      const page = await context.newPage();
      await page.setContent(sceneHtml({
        css, vertical: 'bithire', theme: 'light', elements: new Map([['drill', DRILL_ELEMENT]]), partMounts: byFamily,
      }), { waitUntil: 'load' });
      const read = (arm) => page.evaluate((variables) => {
        for (const [name, value] of Object.entries(variables)) document.documentElement.style.setProperty(name, value);
        const input = document.querySelector("[data-part='range']");
        return { thumb: getComputedStyle(input, '::-webkit-slider-thumb').opacity, host: getComputedStyle(input).opacity };
      }, arm);
      const out = { a: await read(ARM_A), b: await read(ARM_B), record: byFamily.get('drill') };
      await page.close();
      return out;
    });
    // THE RED ARM, the hazard itself: read naively, the "thumb" is the host.
    assert.equal(naive.a.thumb, naive.a.host, `the browser returned ${naive.a.thumb} for the thumb and ${naive.a.host} for its host`);
    assert.notEqual(naive.a.thumb, naive.b.thumb, 'a naive read would credit the HOST\'s move to a box nobody read');
    assert.notEqual(naive.a.thumb, '0.4');
    // THE LAW: refused by name, absent from the plan, published in the census.
    assert.deepEqual(naive.record.pseudoReads.entries.map((entry) => entry.refused), ['ua-shadow-pseudo']);
    assert.equal(probe.pseudoReadPlan(new Map([['drill', naive.record]])), null);
    const census = probe.pseudoReadCensus(new Map([['drill', naive.record]]), new Map(), { nodeRefusals: 1 });
    assert.deepEqual(census.census, { read: 0, 'host-absent': 0, ungenerated: 0, 'ua-shadow-pseudo': 1 });
  }, 120_000);

  it('(d) HOST-ABSENT: a variant-gated host publishes `host-absent`, not silence, and the ungated host is read', async () => {
    const GATED = `${DRILL_ROOT_CSS}\n${ROOT}[data-variant='ghost']::after { content: ''; box-shadow: 0 0 var(--ds-drill-blur) black; }`;
    const [gated, open] = await withPage(async (context) => [
      await measure(context, GATED, { axes: ['depth'] }),
      await measure(context, LIVE, { axes: ['depth'] }),
    ]);
    assert.equal(gated.moved, null, 'a configuration the default render does not produce is not mounted to make a number move');
    assert.deepEqual(gated.census.entries.map((entry) => entry.outcome), ['host-absent']);
    assert.equal(gated.census.reconciliation.equal, true);
    assert.deepEqual(open.census.entries.map((entry) => entry.outcome), ['read'], 'the red arm');
  }, 120_000);

  it('(e) PER AXIS: a pseudo rule writing only `gap` lends the shape axis nothing, even when the box\'s radius moves', async () => {
    const GAP = `${DRILL_ROOT_CSS}\n${ROOT}::after { content: ''; gap: 2px; }`;
    const RADIUS = `[data-part='root']::after { border-radius: var(--ds-drill-blur); }`;
    const [lent, owned] = await withPage(async (context) => [
      await measure(context, GAP, { axes: ['shape', 'rhythm'], sceneCss: `${GAP}\n${RADIUS}` }),
      await measure(context, `${GAP}\n${RADIUS}`, { axes: ['shape', 'rhythm'] }),
    ]);
    assert.equal(lent.moved, null, 'the shape axis read a pseudo only a rhythm rule wrote');
    assert.equal(owned.moved, 'border-top-left-radius', 'the red arm: a shape rule on the same box is a shape read');
  }, 120_000);

  it('(f) WITHHOLDING through the host: a stamped `::after` credits states under the stamp; a `:hover::after` under forcing, and is withheld where the family is', async () => {
    const STAMPED = `${DRILL_ROOT_CSS}
      ${ROOT}::after { content: ''; }
      ${ROOT}[data-state~='disabled']::after { opacity: var(--ds-state-disabled-opacity); }`;
    const HOVER = `${DRILL_ROOT_CSS}
      ${ROOT}::after { content: ''; }
      ${ROOT}:hover::after { transform: scale(var(--ds-state-press-scale)); }`;
    assert.equal(familyParts(HOVER, DRILL_ELEMENT, ['states']).pseudoReads.reads[0].host, ROOT,
      'the host is matched with the forced pseudo stripped, and the cascade decides');
    const [stamp, stampOff, forced, withheld] = await withPage(async (context) => [
      await measure(context, STAMPED, { axes: ['states'] }),
      await measure(context, STAMPED, { axes: ['states'], pseudo: false }),
      await measure(context, HOVER, { axes: ['states'], native: true }),
      await measure(context, HOVER, { axes: ['states'], native: true, withheld: new Map([['drill', NATIVE_PSEUDO_VARIANTS.slice()]]) }),
    ]);
    assert.deepEqual(stamp.halves, { stamped: 'opacity', native: null }, 'the stamp on the host reaches its pseudo');
    assert.equal(stampOff.moved, null, 'the red arm: with the law off the stamped pseudo is unseen');
    assert.deepEqual(forced.halves, { stamped: null, native: 'transform' }, 'forcing the host reaches its own pseudo; the stamp never enters :hover');
    assert.equal(withheld.moved, null, 'a withheld family is withheld on its pseudo too -- never credited');
  }, 180_000);
});

describe('axis-difference — S8: the shape rows the D1 census named, measured and refused (WO-EVI-02)', () => {
  const refusals = () => probe.REAL_RENDER_SHAPE_REFUSALS ?? {};
  const BULLET = 'src/components/patterns/visualization/charts/families/bullet/index.tsx';

  it('PIN: the three reachable families carry a refused shape row, each declaring shape alone, none in the roster', () => {
    assert.deepEqual(Object.keys(refusals()).sort(), ['chart-bullet', 'chart-c-histogram-legend', 'chart-waterfall']);
    for (const [row, entry] of Object.entries(refusals())) {
      assert.deepEqual([...entry.axes], ['shape'], row);
      assert.match(entry.measured, /real render does not move on shape/u, row);
      assert.equal(REAL_RENDER_MOUNTS[row], undefined, row);
    }
  });

  it('the refused rows pass the same roster door as the shipped ones: engine-literal markup, cited stamps', () => {
    assert.equal(typeof probe.realRenderRefusedRowFailures, 'function');
    assert.deepEqual(probe.realRenderRefusedRowFailures(ROOT), []);
  });

  it('MUTANT: a refused row whose stamp drifts is named by the door; one moved into the roster is refused', () => {
    const drifted = (file) => {
      const text = readFileSync(file, 'utf8');
      return file.endsWith(BULLET) ? text.replaceAll('data-variant={item.variant}', 'data-kind={item.variant}') : text;
    };
    const drift = probe.realRenderRefusedRowFailures(ROOT, { readSource: drifted });
    assert.ok(drift.some((line) => line.startsWith('chart-bullet/attr:data-variant=range:') && line.includes('no longer carries the stamp')), drift.join(' | '));
    const roster = { ...REAL_RENDER_MOUNTS, 'chart-bullet': refusals()['chart-bullet'] };
    const moved = probe.realRenderRefusedRowFailures(ROOT, { roster });
    assert.ok(moved.some((line) => line.startsWith('chart-bullet: a measured shape refusal is also a REAL_RENDER_MOUNTS row')), moved.join(' | '));
  });

  it('waterfall: every swatch the row mounts carries data-status, so the bare :4 corner is never what it reads', () => {
    const swatches = [...refusals()['chart-waterfall'].markup.matchAll(/<span data-part="legend-swatch"([^>]*)>/gu)];
    assert.equal(swatches.length, 3);
    for (const [, attributes] of swatches) assert.match(attributes, /data-status="(increase|decrease|total)"/u);
  });

  it('STOP: the dashboard interaction families paint shape only on ::-webkit-scrollbar-thumb, which no law can read', () => {
    for (const family of ['dashboard-activity-interactions', 'dashboard-metrics-interactions']) {
      const css = skinFamilies(ROOT).get(family).map((file) => readFileSync(file, 'utf8')).join('\n');
      const radius = cssRules(css).filter((rule) => rule.declarations.some((d) => /radius/u.test(d.property)));
      assert.ok(radius.length > 0, family);
      for (const rule of radius) {
        assert.match(rule.selector, /::-webkit-scrollbar-thumb$/u, `${family}: ${rule.selector}`);
        assert.equal(probe.pseudoReadEntry(rule.selector, 'shape').refused, 'ua-shadow-pseudo', rule.selector);
      }
      assert.ok(UNMOUNTABLE_FAMILIES.includes(family), family);
    }
  });

  it('STOP: statistic-compounds has no mountable root, so no real render may be mounted beside it', () => {
    assert.ok(UNMOUNTABLE_FAMILIES.includes('statistic-compounds'));
    const css = skinFamilies(ROOT).get('statistic-compounds').map((file) => readFileSync(file, 'utf8')).join('\n');
    assert.equal(familyElement(css), null);
  });
});
