/**
 * @fileoverview Negative drills for the fail-closed measurement guards.
 *
 * Run: node --test scripts/check/tokens/cascade/probe/foundation/guards/tests/index.test.mjs
 *
 * Each guard is fed the EXACT broken reading it exists to reject, and must both
 * fail and name the offending row. The positive control in every case is the
 * same input made healthy: a guard that fires on everything is as useless as
 * one that fires on nothing.
 *
 * @module Tooling/ResolutionProbe/Foundation/Guards/Tests
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  detectAbsentReadings,
  detectStaleSource,
  detectUnhydratedTargets,
  detectZeroMatchTargets,
  evaluateMeasurementGuards,
  INITIAL_VALUES,
  MEASUREMENT_SOUND,
  MEASUREMENT_VOID,
} from '../index.mjs';

const SCOPE = 'rottay/light/modern/both';

const PLAN = [
  {
    fixtureId: 'flex',
    targetId: 'root',
    selector: "[data-probe='flex']",
    properties: ['gap', 'color', '--ds-rhythm-effective-scale'],
  },
];

function healthy() {
  return {
    [SCOPE]: {
      'flex/root': {
        present: true,
        values: {
          gap: '16px',
          color: 'rgb(20, 20, 20)',
          '--ds-rhythm-effective-scale': 'clamp(0.8, 1, 1.25)',
        },
      },
    },
  };
}

const CANARY = { [SCOPE]: { 'flex/root': { '--ds-radius-md': 'calc(8px * 1)', '--ds-radius-scale': '1' } } };

test('positive control: a healthy run is measurement-sound', () => {
  const result = evaluateMeasurementGuards({
    plan: PLAN,
    readings: healthy(),
    canaryReadings: CANARY,
  });
  assert.equal(result.verdict, MEASUREMENT_SOUND);
  assert.equal(result.voidsInertVerdicts, false);
  assert.deepEqual(result.failures, []);
});

test('negative drill: a ZERO-MATCH selector fails and names the target and selector', () => {
  const readings = healthy();
  readings[SCOPE]['flex/root'] = { present: false, values: {} };
  const failures = detectZeroMatchTargets({ plan: PLAN, readings });
  assert.equal(failures.length, 1);
  assert.equal(failures[0].guard, 'zero-match-selector');
  assert.equal(failures[0].target, 'flex/root');
  assert.equal(failures[0].selector, "[data-probe='flex']");
  assert.equal(failures[0].observed, 'present:false');
});

test('negative drill: a target absent from the readings entirely is also a zero match', () => {
  const failures = detectZeroMatchTargets({ plan: PLAN, readings: { [SCOPE]: {} } });
  assert.equal(failures[0].observed, 'no-entry-in-readings');
});

test('negative drill: a declared property with NO READING is absent, never inert', () => {
  const readings = healthy();
  delete readings[SCOPE]['flex/root'].values.gap;
  const failures = detectAbsentReadings({ plan: PLAN, readings });
  assert.equal(failures.length, 1);
  assert.equal(failures[0].guard, 'absent-measurement');
  assert.equal(failures[0].property, 'gap');
  assert.equal(failures[0].observed, 'property-key-absent');
  assert.match(failures[0].meaning, /NOT inert and NOT unchanged/);
});

test('negative drill: an EMPTY computed longhand is absence; an empty custom property is a reading', () => {
  const readings = healthy();
  readings[SCOPE]['flex/root'].values.gap = '';
  readings[SCOPE]['flex/root'].values['--ds-rhythm-effective-scale'] = '';
  const failures = detectAbsentReadings({ plan: PLAN, readings });
  assert.deepEqual(
    failures.map((entry) => entry.property),
    ['gap'],
    'an unresolved custom property is the browser answering, not the browser failing to answer',
  );
});

test('negative drill: an element present with an EMPTY CANARY is unhydrated', () => {
  const failures = detectUnhydratedTargets({
    plan: PLAN,
    readings: healthy(),
    canaryReadings: { [SCOPE]: { 'flex/root': { '--ds-radius-md': '', '--ds-radius-scale': '1' } } },
  });
  assert.equal(failures.length, 1);
  assert.equal(failures[0].guard, 'unhydrated-target');
  assert.equal(failures[0].signal, 'canary-empty-on-element');
  assert.deepEqual(failures[0].emptyCanaries, ['--ds-radius-md']);
});

test('negative drill: every decidable property AT ITS INITIAL VALUE is unhydrated, not inert', () => {
  const readings = {
    [SCOPE]: {
      'flex/root': {
        present: true,
        values: {
          gap: INITIAL_VALUES.gap,
          color: 'rgb(20, 20, 20)',
          '--ds-rhythm-effective-scale': '',
        },
      },
    },
  };
  const plan = [{ ...PLAN[0], properties: ['gap', '--ds-rhythm-effective-scale'] }];
  const failures = detectUnhydratedTargets({ plan, readings, canaryReadings: CANARY });
  assert.equal(failures.length, 1);
  assert.equal(failures[0].signal, 'every-decidable-property-at-initial-value');
  assert.deepEqual(failures[0].properties, ['gap']);
});

test('negative drill: a target with NO decidable property and NO canary fails CLOSED', () => {
  const plan = [{ ...PLAN[0], properties: ['-webkit-not-a-real-property'] }];
  const readings = {
    [SCOPE]: { 'flex/root': { present: true, values: { '-webkit-not-a-real-property': 'x' } } },
  };
  const failures = detectUnhydratedTargets({ plan, readings, canaryReadings: {} });
  assert.equal(failures.length, 1);
  assert.equal(
    failures[0].guard,
    'unhydrated-undecidable',
    'the harness must not decide hydration by guessing an initial value it never declared',
  );
});

test('negative drill: a STALE SOURCE digest fails and names both digests', () => {
  const failures = detectStaleSource({
    declaredDigest: 'aaaa',
    observedDigest: 'bbbb',
    sourceFiles: ['packages/core/src/foundation/tokens/css/foundation/themes/default/index.css'],
  });
  assert.equal(failures.length, 1);
  assert.equal(failures[0].guard, 'stale-source');
  assert.equal(failures[0].declaredDigest, 'aaaa');
  assert.equal(failures[0].observedDigest, 'bbbb');
});

test('negative drill: a MISSING digest is unproven freshness, not proven freshness', () => {
  assert.equal(detectStaleSource({ declaredDigest: null, observedDigest: 'bbbb' }).length, 1);
  assert.equal(detectStaleSource({ declaredDigest: 'aaaa', observedDigest: null }).length, 1);
  assert.equal(detectStaleSource({ declaredDigest: 'aaaa', observedDigest: 'aaaa' }).length, 0);
});

test('negative drill: a source tree that changes during measurement fails even if one endpoint was declared', () => {
  const failures = detectStaleSource({
    declaredDigest: 'aaaa',
    observedDigest: 'bbbb',
    preMeasurementDigest: 'aaaa',
    postMeasurementDigest: 'bbbb',
  });
  assert.equal(failures.length, 1);
  assert.match(failures[0].reason, /changed while/);
});

test('any single guard failure makes the whole run void, and says so in its own text', () => {
  const readings = healthy();
  readings[SCOPE]['flex/root'].present = false;
  const result = evaluateMeasurementGuards({ plan: PLAN, readings, canaryReadings: CANARY });
  assert.equal(result.verdict, MEASUREMENT_VOID);
  assert.equal(result.voidsInertVerdicts, true);
  assert.match(result.meaning, /EVERY inert and every unchanged verdict/i);
  assert.equal(result.byGuard['zero-match-selector'], 1);
});
