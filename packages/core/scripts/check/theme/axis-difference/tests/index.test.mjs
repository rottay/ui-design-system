/**
 * The drill for the by-axis probe.
 *
 * Two halves, because the probe has two ways of lying.
 *
 * The OFFLINE half plants a defect in each verdict the gate can reach -- a
 * negative control that moved, a pair the instrument lost, a new inert pair, a
 * newly unsettled family, an axis under a threshold -- and asserts each is
 * named. It also asserts the attribution law directly: a colour change inside a
 * `box-shadow` is a difference on COLOUR, and counting it would have put the
 * rule's own first negative control at 1.6 % on depth for a reason that has
 * nothing to do with depth.
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
  UNSETTLED_FAMILIES,
  differsOnAxis,
  evaluate,
  familyElement,
  familyElements,
  isSingleElement,
  run,
  selectorParts,
  stripColour,
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

const result = (cells, over = {}) => ({
  cells,
  refusals: [],
  families: { mountable: 10, unmountable: [], excludedUnsettled: [...UNSETTLED_FAMILIES], observedUnsettled: [], newlyUnsettled: [] },
  ...over,
});

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

  it('the declared inert pair is NOT accused, and its cells carry no credit', () => {
    const declared = INERT_PAIRS[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth',
        compiledA: 0, compiledB: 0, evidential: false, moved: 0, percent: 0 }),
      cell({ kind: 'negative', scenario: 'states-emphasis-only', axis: 'shape', moved: 0, percent: 0 }),
    ]));
    assert.deepEqual(failures, [], failures.join(' | '));
  });

  it('MUTANT: a run whose every negative cell is non-evidential carries no control at all', () => {
    const declared = INERT_PAIRS[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth',
        compiledA: 0, compiledB: 0, evidential: false, moved: 0, percent: 0 }),
    ]));
    assert.ok(failures.some((line) => line.includes('carries no negative control at all')), failures.join(' | '));
  });

  it('MUTANT: an inert pair that started moving must be unpinned', () => {
    const declared = INERT_PAIRS[0];
    const failures = evaluate(result([
      cell({ vertical: declared.vertical, scenario: declared.scenario, kind: 'negative', axis: 'depth', moved: 0, percent: 0 }),
    ]));
    assert.ok(failures.some((line) => line.includes('declared inert and is no longer')), failures.join(' | '));
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
