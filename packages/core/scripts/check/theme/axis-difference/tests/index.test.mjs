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
 * Three of those verdicts exist because the probe got them WRONG. It applied
 * `artifact.variables` and nothing else, so a mode-routed palette read as an
 * empty delta and the run declared a live decision inert; it marked both
 * negative controls green while the states positive read 0 %, which is a
 * control that costs nothing; and it then read that same witness run-globally
 * and across two catalog rows at once, so one working cell would have
 * certified the eleven vacuous ones and a move of `states.focus-style` would
 * have certified the `states.emphasis` control. Each now has cases that fail
 * if the behaviour comes back.
 *
 * The BROWSER half is the one no unit test can replace. It drives a NULL pair
 * -- two identical documents -- through the same Chromium, the same bundle and
 * the same comparison as a real one, and requires 0 % on every axis; then it
 * drives a real pair through the same path and requires more than 0 %. An
 * instrument that reports a difference between a document and itself is
 * reporting noise, and every percentage it publishes would be that noise plus
 * whatever else it found.
 */
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import {
  COMPILER_MODULE,
  INERT_PAIRS,
  SCENARIOS,
  STATES_AXIS_LIMITS,
  STATES_DEPENDENT_CONTROL,
  UNMOUNTABLE_FAMILIES,
  UNSETTLED_FAMILIES,
  WITNESSED_CONTROLS,
  differsOnAxis,
  effectiveVariables,
  evaluate,
  familyElement,
  familyElements,
  isSingleElement,
  markVacuousControls,
  run,
  selectorParts,
  stripColour,
  witnessReading,
} from '../index.mjs';
import { AXIS_IDS } from '../../population/index.mjs';
import { resolvePlaywright } from '../../../tokens/cascade/probe/runtime/browser/index.mjs';
import { packageRoot as findPackageRoot } from '../../../../libraries/repo-root/index.mjs';

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

const witness = (over = {}) => ({
  axis: 'states',
  control: 'states.emphasis',
  positive: 'states',
  moved: 0,
  denominator: 148,
  movedFamilies: [],
  ...over,
});

const result = (cells, over = {}) => ({
  cells,
  refusals: [],
  familiesFiltered: false,
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

describe('axis-difference — a negative control is only evidence if its decision moved', () => {
  it('the states positive at zero makes the states.emphasis control NON-EVIDENTIAL, with its reason', () => {
    const cells = markVacuousControls([
      cell({ kind: 'positive', scenario: 'states', axis: 'states', moved: 0, percent: 0 }),
      control({ axis: 'shape', witness: witness({ moved: 0 }) }),
      cell({ kind: 'negative', scenario: 'palette-only', axis: 'shape', moved: 0, percent: 0 }),
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

  it('the shipped control DECLARES the witness the run has to measure for it', () => {
    const emphasis = SCENARIOS.find((scenario) => scenario.id === STATES_DEPENDENT_CONTROL);
    assert.deepEqual(emphasis.witness, { axis: 'states', control: 'states.emphasis', positive: 'states' });
    assert.deepEqual([...WITNESSED_CONTROLS], [STATES_DEPENDENT_CONTROL]);
    assert.deepEqual(
      Object.keys(emphasis.a),
      [emphasis.witness.control],
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

  it('the limits that make it vacuous are measurements, not adjectives', () => {
    const limits = STATES_AXIS_LIMITS;
    assert.equal(limits.channels.total, 28, 'the two states rows produce 28 channels');
    assert.ok(limits.channels.withoutReaders > 0 && limits.channels.withoutReaders < limits.channels.total);
    assert.equal(
      limits.declarations.pseudoClassOnly + limits.declarations.byDataState + limits.declarations.byChannelOnly,
      limits.declarations.population,
      'the three declaration kinds must partition the states population',
    );
    assert.equal(
      limits.focusReads.focusGuarded + limits.focusReads.keyframeStop,
      limits.focusReads.rules,
      'every box-shadow read of a focus channel is accounted for',
    );
    assert.ok(!limits.stampedStates.includes('focused'), 'the limit is that focused is never stamped');
    assert.ok(limits.unreachable.length >= 4, 'each limit is written out, not summarised to a flag');
  });
});

describe('axis-difference — the fixture is read off the skin, never invented', () => {
  it('prefers the data-part root and materialises its classes and attributes', () => {
    const element = familyElement(
      ".ds-card { color: red; }\n.ds-card.ds-card--modern[data-part='root'][data-radius='md'] { padding: 1px; }",
    );
    assert.deepEqual(element.classes, ['ds-card', 'ds-card--modern']);
    assert.deepEqual(element.attributes, { 'data-part': 'root', 'data-radius': 'md' });
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

  it('MUTANT: a pair the instrument lost is a different verdict from an inert pair', () => {
    const lost = evaluate(result([cell({ compiledA: 40, compiledB: 41, appliedA: 0, appliedB: 41 })]));
    assert.ok(lost.some((line) => line.includes('the instrument lost them')), lost.join(' | '));

    const inert = evaluate(result([cell({ vertical: 'evnto', scenario: 'palette-only', compiledA: 0, compiledB: 0, evidential: false })]));
    assert.ok(inert.some((line) => line.includes('compiles to an EMPTY artifact delta')), inert.join(' | '));
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
    const empty = { scenario: 'palette-only', kind: 'negative', axis: 'depth', compiledA: 0, compiledB: 0, evidential: false, moved: 0, percent: 0 };
    assert.deepEqual(
      evaluate(result([cell({ vertical: 'rottay', theme: 'dark', ...empty })]), { inertPairs: scoped })
        .filter((line) => line.includes('EMPTY artifact delta')),
      [],
      'the declared mode must be excused',
    );
    assert.ok(
      evaluate(result([cell({ vertical: 'rottay', theme: 'light', ...empty })]), { inertPairs: scoped })
        .some((line) => line.startsWith('rottay/light') && line.includes('EMPTY artifact delta')),
      'the OTHER mode must still be accused — that is the whole point of scoping the entry',
    );
  });

  it('a declared inert pair is NOT accused, and its cells carry no credit', () => {
    const declared = DECLARED_INERT[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth',
        compiledA: 0, compiledB: 0, evidential: false, moved: 0, percent: 0 }),
      cell({ kind: 'negative', scenario: 'states-emphasis-only', axis: 'shape', moved: 0, percent: 0 }),
    ]), { inertPairs: DECLARED_INERT });
    assert.deepEqual(failures, [], failures.join(' | '));
  });

  it('MUTANT: a run whose every negative cell is non-evidential carries no control at all', () => {
    const declared = DECLARED_INERT[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth',
        compiledA: 0, compiledB: 0, evidential: false, moved: 0, percent: 0 }),
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
});
