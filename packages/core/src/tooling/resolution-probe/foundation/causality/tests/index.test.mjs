/**
 * @fileoverview Negative drills for the restore comparator and the inline
 * write/restore planner.
 *
 * Run: node --test src/tooling/resolution-probe/foundation/causality/tests/index.test.mjs
 *
 * `.test.mjs` on purpose: the vitest project globs `src/**\/*.test.{ts,tsx}`,
 * so this file cannot be swept into the unit suite. Nothing here needs a
 * browser — every input is fabricated, which is exactly what lets each guard be
 * SEEN TO FAIL on the precise broken reading it exists to reject.
 *
 * @module Tooling/ResolutionProbe/Foundation/Causality/Tests
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  CAUSAL_PHASES,
  compareExact,
  describeRestore,
  planInlinePhase,
  propertyKind,
} from '../index.mjs';

const SCOPE = 'rottay/light/modern/both';

function observation({ gap = '16px', token = 'calc(1)', attributes = { 'data-theme': 'light' } } = {}) {
  return {
    readings: {
      [SCOPE]: {
        'flex/root': { present: true, values: { gap, '--ds-rhythm-effective-scale': token } },
      },
    },
    rootAttributes: { [SCOPE]: { ...attributes } },
  };
}

test('phases are the three a causal run has, in execution order', () => {
  assert.deepEqual([...CAUSAL_PHASES], ['baseline', 'mutation', 'removal']);
});

test('positive control: restoring a MUTATED observation field-by-field compares exact against the untouched baseline', () => {
  // NOT `compareExact({ before: observation(), after: observation() })`: two
  // fresh calls with the same defaults are equal because the defaults are
  // equal, which proves the comparator can see that identical input is
  // identical -- true of any comparator, including a broken one that always
  // returns true. This drill instead proves a genuine round trip: a real
  // mutation the comparator can be seen to CATCH, then a restore built by
  // writing the mutated observation's changed fields back to values read off
  // the baseline -- the same "recompute the undo, do not just replay the
  // baseline" shape `planInlinePhase` uses for a real inline style.
  const baseline = observation({ gap: '16px', token: 'calc(1)' });
  const mutation = observation({ gap: '19.2px', token: 'calc(1.2)' });

  const beforeVsMutation = compareExact({ before: baseline, after: mutation });
  assert.equal(beforeVsMutation.exact, false, 'the mutation must be a real, detectable change');

  const restored = structuredClone(mutation);
  restored.readings[SCOPE]['flex/root'].values.gap = baseline.readings[SCOPE]['flex/root'].values.gap;
  restored.readings[SCOPE]['flex/root'].values['--ds-rhythm-effective-scale'] =
    baseline.readings[SCOPE]['flex/root'].values['--ds-rhythm-effective-scale'];

  const comparison = compareExact({ before: baseline, after: restored });
  assert.equal(comparison.exact, true, JSON.stringify(comparison.rows));
  assert.equal(comparison.rows.length, 0);
  assert.equal(comparison.comparedRows, 3, 'two properties plus one root attribute');
  assert.match(describeRestore(comparison), /byte for byte/);
});

test('negative drill: a computed property that did not come back is named', () => {
  const comparison = compareExact({
    before: observation({ gap: '16px' }),
    after: observation({ gap: '19.2px' }),
  });
  assert.equal(comparison.exact, false);
  assert.equal(comparison.rows.length, 1);
  assert.deepEqual(
    { ...comparison.rows[0], meaning: undefined },
    {
      kind: 'value-differs',
      scope: SCOPE,
      target: 'flex/root',
      property: 'gap',
      propertyKind: 'computed-property',
      before: '16px',
      after: '19.2px',
      meaning: undefined,
    },
  );
  assert.match(describeRestore(comparison), /did NOT reproduce/);
});

test('negative drill: NO TOLERANCE — a sub-pixel difference is still a finding', () => {
  const comparison = compareExact({
    before: observation({ gap: '13.6px' }),
    after: observation({ gap: '13.5999px' }),
  });
  assert.equal(
    comparison.exact,
    false,
    'a tolerance would swallow exactly the size of difference a latched channel produces',
  );
  assert.equal(comparison.rows[0].property, 'gap');
});

test('negative drill: a LATCHED CUSTOM PROPERTY is caught even when the paint agrees', () => {
  // The dangerous shape: the painted longhand came back, so a comparator that
  // only read paint would call this restored, while the variable stayed at the
  // mutation value and the next consumer added to that chain inherits it.
  const comparison = compareExact({
    before: observation({ gap: '16px', token: 'calc(1)' }),
    after: observation({ gap: '16px', token: 'calc(1.2)' }),
  });
  assert.equal(comparison.exact, false);
  assert.equal(comparison.rows[0].property, '--ds-rhythm-effective-scale');
  assert.equal(comparison.rows[0].propertyKind, 'custom-property');
  assert.equal(comparison.counts.byPropertyKind['custom-property'], 1);
});

test('negative drill: a root attribute the mutation stamped and removal forgot is caught', () => {
  const comparison = compareExact({
    before: observation(),
    after: observation({ attributes: { 'data-theme': 'light', 'data-rhythm': 'airy' } }),
  });
  assert.equal(comparison.exact, false);
  assert.equal(comparison.rows[0].kind, 'root-attribute-missing-in');
  assert.equal(comparison.rows[0].attribute, 'data-rhythm');
  assert.equal(comparison.rows[0].presentIn, 'removal');
});

test('negative drill: a property read in one phase only is never reported as unchanged', () => {
  const before = observation();
  const after = observation();
  delete after.readings[SCOPE]['flex/root'].values.gap;
  const comparison = compareExact({ before, after });
  assert.equal(comparison.exact, false);
  assert.equal(comparison.rows[0].kind, 'property-missing-in');
  assert.equal(comparison.rows[0].presentIn, 'baseline');
});

test('negative drill: an element that came or went between phases is a presence row', () => {
  const after = observation();
  after.readings[SCOPE]['flex/root'].present = false;
  const comparison = compareExact({ before: observation(), after });
  assert.equal(comparison.rows[0].kind, 'presence-differs');
});

test('a missing phase is refused, not treated as an exact restore', () => {
  assert.throws(() => compareExact({ before: observation(), after: null }), /both phase/);
});

test('propertyKind separates the token stream from the paint', () => {
  assert.equal(propertyKind('--ds-rhythm-scale'), 'custom-property');
  assert.equal(propertyKind('gap'), 'computed-property');
});

test('positive control: removal REMOVES what the harness introduced', () => {
  const plan = planInlinePhase({
    memo: { '--ds-rhythm-scale': { present: false, value: '', priority: '' } },
    properties: { '--ds-rhythm-scale': '1.2' },
  });
  assert.deepEqual(plan.write, [
    { op: 'set', name: '--ds-rhythm-scale', value: '1.2', priority: '' },
  ]);
  assert.deepEqual(plan.restore, [{ op: 'remove', name: '--ds-rhythm-scale' }]);
  assert.deepEqual(plan.introduced, ['--ds-rhythm-scale']);
  assert.deepEqual(plan.clobbered, []);
});

test('positive control: a PREEXISTING inline value comes back byte-identical, with its priority', () => {
  const plan = planInlinePhase({
    memo: { '--ds-rhythm-scale': { present: true, value: '0.85', priority: 'important' } },
    properties: { '--ds-rhythm-scale': '1.2' },
  });
  assert.deepEqual(plan.restore, [
    { op: 'set', name: '--ds-rhythm-scale', value: '0.85', priority: 'important' },
  ]);
  assert.deepEqual(plan.clobbered, ['--ds-rhythm-scale']);
  assert.deepEqual(plan.introduced, []);
});

test('negative drill: writing a property whose prior inline state was never observed FAILS CLOSED', () => {
  assert.throws(
    () => planInlinePhase({ memo: {}, properties: { '--ds-rhythm-scale': '1.2' } }),
    /no inline memo for --ds-rhythm-scale/,
    'without a memo, removal cannot tell "unset what I wrote" from "delete what was already ' +
      'there", and both look green afterwards',
  );
});

test('negative drill: an arm that writes nothing is not a mutation phase', () => {
  assert.throws(() => planInlinePhase({ memo: {}, properties: {} }), /writes no property/);
});
