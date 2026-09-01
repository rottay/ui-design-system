/**
 * @fileoverview Drills for the DATA-terminal causal run.
 *
 * Run: node --test scripts/check/tokens/cascade/probe/composition/data-run/tests/index.test.mjs
 *
 * Pure: no compiler, no browser, no dist. Every drill hands
 * `buildDataCausalReport` synthetic artifacts, because what is under test is
 * the PREDICATE — which wrong answers it refuses — and a drill that needed a
 * build would be testing whether somebody had run one.
 *
 * @module Tooling/ResolutionProbe/Composition/DataRun/Tests
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compareExact, propertyKind } from '../../../foundation/causality/index.mjs';
import { buildDataCausalReport, DATA_GUARDS, readGovernedField } from '../index.mjs';

const FIELD_PATH = ['normalizedAppearance', 'advanced', 'responsivePosture'];
const SURFACE = ['chrome', 'tokenOverrides', 'profiles', 'responsivePosture'];

/** The three siblings the equality surface holds constant. */
const SIBLINGS = {
  chrome: { cardComponent: { bg: '#FFFEFB' } },
  tokenOverrides: { '--ds-color-error': '#7f1d1d' },
  profiles: { edge: 'inset-double' },
};

const artifact = (posture, siblings = SIBLINGS) => ({
  normalizedAppearance: {
    advanced: {
      ...siblings,
      ...(posture === undefined ? {} : { responsivePosture: posture }),
    },
  },
});

const report = (overrides = {}) =>
  buildDataCausalReport({
    controlId: 'responsive.posture',
    vertical: 'rottay',
    fieldPath: FIELD_PATH,
    equalitySurface: SURFACE,
    baseline: artifact(undefined),
    removal: artifact(undefined),
    stops: [
      { stopId: 'compact', artifact: artifact('compact') },
      { stopId: 'expansive', artifact: artifact('expansive') },
    ],
    ...overrides,
  });

const guardIds = (result) => result.dataGuards.map((entry) => entry.guard);

test('positive control: a healthy DATA run passes with no guards', () => {
  const result = report();
  assert.deepEqual(guardIds(result), []);
  assert.equal(result.verdict.pass, true);
  assert.equal(result.verdict.restoreExact, true);
  assert.equal(result.terminal, 'DATA');
  // Every stop moved the field and left the three siblings alone.
  for (const entry of result.equalityExceptField) {
    assert.equal(entry.fieldMoved, true, `${entry.stopId} must move the governed field`);
    assert.deepEqual(entry.siblingsDiffering, []);
    assert.deepEqual(entry.siblingsChecked, ['chrome', 'tokenOverrides', 'profiles']);
  }
});

test('drill 1 — data-constant: two stops lowering the SAME value is refused', () => {
  const result = report({
    stops: [
      { stopId: 'compact', artifact: artifact('balanced') },
      { stopId: 'expansive', artifact: artifact('balanced') },
    ],
  });
  assert.ok(guardIds(result).includes(DATA_GUARDS.CONSTANT));
  assert.equal(result.verdict.pass, false);
});

test('drill 2 — data-absent: a requested stop with an undefined field is refused', () => {
  const result = report({
    stops: [
      { stopId: 'compact', artifact: artifact(undefined) },
      { stopId: 'expansive', artifact: artifact('expansive') },
    ],
  });
  const absent = result.dataGuards.filter((entry) => entry.guard === DATA_GUARDS.ABSENT);
  assert.equal(absent.length, 1);
  assert.equal(absent[0].stopId, 'compact');
});

test('drill 3 — data-bypass: the two layers are asserted SEPARATELY, never conflated', () => {
  // Both halves present -> no guard. This is the shape the real control has:
  // the compiler throws at write time, the resolver defaults at render time.
  const healthy = report({
    bypass: {
      requestedId: 'not-a-posture',
      writeTime: { threw: true },
      renderTime: { resolvedId: 'balanced' },
      expectedDefaultId: 'balanced',
    },
  });
  assert.ok(!guardIds(healthy).includes(DATA_GUARDS.BYPASS));
  // ...and the observation is written down, because "no guard fired" is not by
  // itself evidence that the check was ever run.
  assert.equal(healthy.bypass.writeTime.threw, true);
  assert.equal(healthy.bypass.renderTime.resolvedId, 'balanced');
  assert.equal(report().bypass, null, 'a run that did not exercise it says so');

  // Write-time silently accepted the bad id -> refused, even though the render
  // half still defaulted. A probe that only checked the render half would call
  // this fail-closed.
  const writeAccepted = report({
    bypass: {
      requestedId: 'not-a-posture',
      writeTime: { threw: false },
      renderTime: { resolvedId: 'balanced' },
      expectedDefaultId: 'balanced',
    },
  });
  assert.ok(guardIds(writeAccepted).includes(DATA_GUARDS.BYPASS));

  // Render-time returned the bad id instead of the default -> refused, even
  // though the write half threw.
  const renderLeaked = report({
    bypass: {
      requestedId: 'not-a-posture',
      writeTime: { threw: true },
      renderTime: { resolvedId: 'not-a-posture' },
      expectedDefaultId: 'balanced',
    },
  });
  assert.ok(guardIds(renderLeaked).includes(DATA_GUARDS.BYPASS));
});

test('drill 4 — data-restore demands UNDEFINED, not "equal to the default"', () => {
  // The consumer branches on `!== undefined`, so a removal that leaves the
  // default VALUE behind takes the document branch instead of the fallback
  // branch: identical value, different code path. Equality would pass it.
  const result = report({ removal: artifact('balanced') });
  assert.ok(guardIds(result).includes(DATA_GUARDS.RESTORE));
  assert.equal(result.verdict.pass, false);

  const restored = report({ removal: artifact(undefined) });
  assert.ok(!guardIds(restored).includes(DATA_GUARDS.RESTORE));
});

test('drill 5 — equality-except-the-field: a moved sibling is a failure', () => {
  const result = report({
    stops: [
      { stopId: 'compact', artifact: artifact('compact') },
      {
        stopId: 'expansive',
        artifact: artifact('expansive', { ...SIBLINGS, profiles: { edge: 'MOVED' } }),
      },
    ],
  });
  const moved = result.equalityExceptField.find((entry) => entry.stopId === 'expansive');
  assert.deepEqual(moved.siblingsDiffering, ['profiles']);
  assert.equal(moved.holds, false);
  assert.equal(result.verdict.equalityHeld, false);
});

test('drill 6 — the equality surface is CLOSED: a fifth field is not swept in', () => {
  // The surface is passed in, not walked off the object. A field the contract
  // does not declare must be invisible to the diff, so that adding one to the
  // contract without adding it here reddens rather than passing silently.
  const withFifth = (posture) => ({
    normalizedAppearance: {
      advanced: { ...SIBLINGS, undeclaredNewField: 'x', ...(posture ? { responsivePosture: posture } : {}) },
    },
  });
  const result = report({
    baseline: withFifth(undefined),
    removal: withFifth(undefined),
    stops: [
      { stopId: 'compact', artifact: withFifth('compact') },
      { stopId: 'expansive', artifact: withFifth('expansive') },
    ],
  });
  assert.deepEqual(result.equalitySurface, SURFACE, 'the surface is the declared list, verbatim');
  for (const entry of result.equalityExceptField) {
    assert.equal(entry.siblingsChecked.includes('undeclaredNewField'), false);
  }
  assert.equal(result.verdict.pass, true);
});

test('drill 7 (X-D) — fewer than two DATA witnesses is NOT DECIDABLE, not a pass', () => {
  const result = report({
    stops: [{ stopId: 'compact', artifact: artifact('compact') }],
  });
  const notDecidable = result.dataGuards.filter((e) => e.guard === DATA_GUARDS.NOT_DECIDABLE);
  assert.equal(notDecidable.length, 1);
  assert.match(notDecidable[0].remedy, /adjudicated calibration\.dataDiscriminationException/);
  assert.equal(result.verdict.pass, false);
});

test('drill 8 (X-D) — only a COMPLETE adjudicated exception gets past it', () => {
  const oneStop = { stops: [{ stopId: 'compact', artifact: artifact('compact') }] };
  const excepted = report({
    ...oneStop,
    exception: { reason: 'drill fixture', adjudicatedBy: 'drill' },
  });
  assert.ok(!guardIds(excepted).includes(DATA_GUARDS.NOT_DECIDABLE));
  assert.equal(excepted.exception.adjudicatedBy, 'drill');

  // An exception that does not name its adjudicator is not an exception.
  const incomplete = report({ ...oneStop, exception: { reason: 'no adjudicator' } });
  assert.ok(guardIds(incomplete).includes(DATA_GUARDS.NOT_DECIDABLE));
  assert.equal(incomplete.exception, null);
});

test('drill 9 (X-B) — a DATA observation NEVER produces a CSS property kind', () => {
  const result = report({ removal: artifact('balanced') });
  const rows = result.restore.rows.filter((r) => r.propertyKind !== undefined);
  assert.ok(rows.length > 0, 'the drill needs at least one labelled row to be meaningful');
  for (const r of rows) {
    assert.equal(r.propertyKind, 'data-field', `a DATA row must never be labelled ${r.propertyKind}`);
  }
  assert.equal(propertyKind('responsivePosture', 'data'), 'data-field');
  // And the shape of the name is NEVER the discriminator: a DATA field that
  // happens to look like a custom property is still a data-field.
  assert.equal(propertyKind('--looks-like-css', 'data'), 'data-field');
});

test('drill 10 (X-B) — a CSS observation NEVER produces data-field', () => {
  const cssPhase = (value) => ({
    readings: { 'rottay/light': { 'card/root': { values: { 'padding-top': value, '--ds-x': value } } } },
  });
  const comparison = compareExact({ before: cssPhase('16px'), after: cssPhase('20px') });
  const kinds = new Set(comparison.rows.map((r) => r.propertyKind).filter(Boolean));
  assert.ok(kinds.size > 0);
  assert.equal(kinds.has('data-field'), false, 'a CSS row must never be labelled data-field');
  assert.deepEqual([...kinds].sort(), ['computed-property', 'custom-property']);
  // The default is css, and an unknown kind is a throw rather than a guess.
  assert.equal(propertyKind('padding-top'), 'computed-property');
  assert.throws(() => propertyKind('x', 'guess'), /never inferred from the name/);
});

test('drill 11 — comparing two observations of DIFFERENT kinds is refused', () => {
  assert.throws(
    () =>
      compareExact({
        before: { readingKind: 'data', readings: {} },
        after: { readingKind: 'css', readings: {} },
      }),
    /different readingKinds/,
  );
});

test('readGovernedField keeps `undefined` a real answer at every depth', () => {
  assert.equal(readGovernedField(artifact('compact'), FIELD_PATH), 'compact');
  assert.equal(readGovernedField(artifact(undefined), FIELD_PATH), undefined);
  assert.equal(readGovernedField({}, FIELD_PATH), undefined);
  assert.equal(readGovernedField(null, FIELD_PATH), undefined);
});

test('drill 12 — a declared behavioural witness that failed cannot be dropped from the verdict', () => {
  // S2/S3/the tier negative are measured by the caller, which is the only layer
  // that knows what a posture is. The instrument stays domain-blind, but it will
  // not report a pass over a witness that came back red.
  const red = report({
    behaviouralWitnesses: [
      { id: 'S2', question: 'does the resolver return the requested stop?', holds: true },
      { id: 'S3', question: 'does the geometry differ per stop?', holds: false },
    ],
  });
  assert.equal(red.verdict.witnessesHeld, false);
  assert.equal(red.verdict.pass, false);
  // ...and every guard is still green: this is NOT a field-diff failure, and the
  // report must not disguise it as one.
  assert.deepEqual(guardIds(red), []);
  assert.equal(red.verdict.restoreExact, true);

  const green = report({
    behaviouralWitnesses: [{ id: 'S2', question: 'q', holds: true }],
  });
  assert.equal(green.verdict.pass, true);
});

test('drill 13 — an UNMEASURED witness throws instead of silently failing the run', () => {
  // `holds: undefined` coerced to false would redden the run for the wrong
  // reason and send the reader hunting a defect that is really a gap in the
  // harness.
  assert.throws(
    () => report({ behaviouralWitnesses: [{ id: 'S3', question: 'q' }] }),
    /must reduce to a boolean/,
  );
});
