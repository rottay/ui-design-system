/**
 * @fileoverview The fail-closed measurement guards.
 *
 * Every one of these guards exists because the same underlying accident —
 * "nothing was measured" — produces output that is INDISTINGUISHABLE from the
 * most valuable finding this instrument can produce: "the tenant's control
 * reaches nothing here". A zero-match selector, an element that never received
 * the stylesheet, a digest that no longer describes the tree, and a property
 * that produced no reading at all ALL look like a channel that is inert. So
 * none of them may warn. Each makes the run FAIL, and the verdict is written
 * into the artifact so a later reader cannot quote an inert number out of a run
 * that had already failed its own self-check.
 *
 * THIS IS THE SAME LAW THE `controls: harness-live | harness-suspect` VERDICT
 * ALREADY STATES, generalised. That verdict says: no control moved, therefore
 * every inert verdict in this artifact is void. These guards say the same thing
 * about four more ways of measuring nothing, and they void the same verdicts.
 *
 * WHY "STILL AT INITIAL VALUES" NEEDS A DECLARED TABLE. The unhydrated check
 * asks whether an element's channels are at their INITIAL values, which
 * requires knowing what the initial value of each property is. Guessing is not
 * available: a property whose initial value is not declared makes the target
 * UNDECIDABLE, and an undecidable target fails closed. Silently skipping it
 * would reintroduce the exact hole the guard closes.
 *
 * @module Tooling/ResolutionProbe/Foundation/Guards
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const TABLE = JSON.parse(readFileSync(resolve(HERE, 'initial-values.json'), 'utf-8'));

/** Declared CSS initial values. A property absent from this map is undecidable. */
export const INITIAL_VALUES = Object.freeze({ ...TABLE.initialValues });

export const INITIAL_VALUES_NOTE = TABLE.note;

/**
 * The guard vocabulary. Each id is a way of measuring nothing that reads as a
 * finding, and each is a FAIL rather than a warning.
 */
export const GUARDS = Object.freeze({
  'zero-match-selector': Object.freeze({
    id: 'zero-match-selector',
    meaning:
      'A declared fixture target matched zero elements. Its properties produced no reading, ' +
      'and a target that is not on the page cannot be evidence that a control failed to reach ' +
      'it.',
  }),
  'absent-measurement': Object.freeze({
    id: 'absent-measurement',
    meaning:
      'A declared property produced no reading at all. It is NOT inert and NOT unchanged; it ' +
      'is unmeasured, and the two must never be reported with the same word.',
  }),
  'unhydrated-target': Object.freeze({
    id: 'unhydrated-target',
    meaning:
      'The element is in the DOM but its measured channels are still at their initial values, ' +
      'or a canary token that the bundle declares resolves empty on it. The stylesheet or the ' +
      'hydration did not land, so every reading taken from it is the initial value wearing the ' +
      'costume of a tenant result.',
  }),
  'unhydrated-undecidable': Object.freeze({
    id: 'unhydrated-undecidable',
    meaning:
      'No declared property of this target has a declared initial value and no canary was read ' +
      'on it, so the harness cannot tell a hydrated element from an unhydrated one. Fails ' +
      'closed: declare the initial values or read a canary on the target.',
  }),
  'stale-source': Object.freeze({
    id: 'stale-source',
    meaning:
      'The measured source tree no longer hashes to the digest the receipt claims. The numbers ' +
      'describe a tree that is not the one being certified.',
  }),
});

export const GUARD_IDS = Object.freeze(Object.keys(GUARDS));

export const MEASUREMENT_SOUND = 'measurement-sound';
export const MEASUREMENT_VOID = 'measurement-void';

function targetKey(row) {
  return `${row.fixtureId}/${row.targetId}`;
}

function failure(guardId, detail) {
  return Object.freeze({ guard: guardId, meaning: GUARDS[guardId].meaning, ...detail });
}

/**
 * A declared target that matched zero elements.
 *
 * @param {{plan: object[], readings: Record<string, Record<string, object>>}} input
 */
export function detectZeroMatchTargets({ plan, readings }) {
  const failures = [];
  for (const [scope, targets] of Object.entries(readings ?? {})) {
    for (const row of plan) {
      const key = targetKey(row);
      const reading = targets[key];
      if (reading && reading.present === true) continue;
      failures.push(
        failure('zero-match-selector', {
          scope,
          target: key,
          selector: row.selector,
          observed: reading ? 'present:false' : 'no-entry-in-readings',
        }),
      );
    }
  }
  return failures;
}

/**
 * A declared property that produced no reading.
 *
 * An empty string is a legitimate reading for a CUSTOM property — it is how the
 * browser says "this name does not resolve here", which is a real answer. It is
 * never a legitimate reading for a painted longhand, so an empty computed
 * property is absence, not a value.
 */
export function detectAbsentReadings({ plan, readings }) {
  const failures = [];
  for (const [scope, targets] of Object.entries(readings ?? {})) {
    for (const row of plan) {
      const key = targetKey(row);
      const reading = targets[key];
      if (!reading || reading.present !== true) continue;
      const values = reading.values ?? {};
      for (const property of row.properties) {
        const isCustom = property.startsWith('--');
        const has = Object.hasOwn(values, property);
        const value = has ? values[property] : undefined;
        if (has && value !== undefined && (isCustom || value !== '')) continue;
        failures.push(
          failure('absent-measurement', {
            scope,
            target: key,
            property,
            observed: has ? JSON.stringify(value) : 'property-key-absent',
          }),
        );
      }
    }
  }
  return failures;
}

/**
 * Present in the DOM, but nothing reached it.
 *
 * Two independent signals, because they fail in different places:
 *
 *   canary   the SAME layer canary tokens the document-level guard already
 *            uses, read at the element instead of at the root. A token the
 *            bundle declares must resolve on every element that inherits from
 *            the root; an empty reading means the stream did not arrive here.
 *   initial  every decidable declared property is at its declared initial
 *            value. One property at its initial value is ordinary; all of them
 *            is a document that never got styled.
 *
 * @param {object} input
 * @param {object[]} input.plan
 * @param {Record<string, Record<string, object>>} input.readings
 * @param {Record<string, Record<string, Record<string,string>>>} [input.canaryReadings]
 *   scope -> targetKey -> canaryProperty -> value
 * @param {Record<string,string>} [input.initialValues]
 */
export function detectUnhydratedTargets({
  plan,
  readings,
  canaryReadings = {},
  initialValues = INITIAL_VALUES,
}) {
  const failures = [];
  for (const [scope, targets] of Object.entries(readings ?? {})) {
    for (const row of plan) {
      const key = targetKey(row);
      const reading = targets[key];
      if (!reading || reading.present !== true) continue;

      const canary = canaryReadings?.[scope]?.[key] ?? null;
      const emptyCanaries = canary
        ? Object.entries(canary)
            .filter(([, value]) => String(value ?? '').trim() === '')
            .map(([name]) => name)
        : [];
      if (emptyCanaries.length > 0) {
        failures.push(
          failure('unhydrated-target', {
            scope,
            target: key,
            signal: 'canary-empty-on-element',
            emptyCanaries,
          }),
        );
        continue;
      }

      const values = reading.values ?? {};
      const decidable = row.properties.filter(
        (property) => !property.startsWith('--') && Object.hasOwn(initialValues, property),
      );
      if (decidable.length === 0) {
        if (canary && Object.keys(canary).length > 0) continue;
        failures.push(
          failure('unhydrated-undecidable', {
            scope,
            target: key,
            properties: [...row.properties],
            reason:
              'no declared property has a declared initial value, and no canary was read on ' +
              'this element',
          }),
        );
        continue;
      }
      const atInitial = decidable.filter((property) => values[property] === initialValues[property]);
      if (atInitial.length === decidable.length) {
        failures.push(
          failure('unhydrated-target', {
            scope,
            target: key,
            signal: 'every-decidable-property-at-initial-value',
            properties: atInitial,
          }),
        );
      }
    }
  }
  return failures;
}

/**
 * The measured tree is not the tree the receipt names.
 *
 * @param {{declaredDigest: string|null, observedDigest: string|null, sourceFiles?: string[]}} input
 */
export function detectStaleSource({
  declaredDigest,
  observedDigest,
  preMeasurementDigest = observedDigest,
  postMeasurementDigest = observedDigest,
  sourceFiles = [],
}) {
  if (!declaredDigest || !observedDigest) {
    return [
      failure('stale-source', {
        declaredDigest: declaredDigest ?? null,
        observedDigest: observedDigest ?? null,
        sourceFiles: [...sourceFiles],
        reason:
          'a source digest is missing on one side, so freshness is unproven rather than proven',
      }),
    ];
  }
  if (!preMeasurementDigest || !postMeasurementDigest) {
    return [
      failure('stale-source', {
        declaredDigest,
        observedDigest,
        preMeasurementDigest: preMeasurementDigest ?? null,
        postMeasurementDigest: postMeasurementDigest ?? null,
        sourceFiles: [...sourceFiles],
        reason:
          'the run did not hash its source both before and after measurement, so it cannot prove ' +
          'that one immutable tree produced the artifact',
      }),
    ];
  }
  if (preMeasurementDigest !== postMeasurementDigest) {
    return [
      failure('stale-source', {
        declaredDigest,
        observedDigest,
        preMeasurementDigest,
        postMeasurementDigest,
        sourceFiles: [...sourceFiles],
        reason: 'the measured source changed while the causal run was in progress',
      }),
    ];
  }
  if (declaredDigest === observedDigest) return [];
  return [
    failure('stale-source', {
      declaredDigest,
      observedDigest,
      sourceFiles: [...sourceFiles],
      reason: 'the owned source files no longer hash to the declared digest',
    }),
  ];
}

/**
 * Runs every guard and states, inside the artifact, what a failure costs.
 *
 * @returns {{verdict: string, failures: object[], byGuard: Record<string, number>,
 *   voidsInertVerdicts: boolean, meaning: string}}
 */
export function evaluateMeasurementGuards({
  plan,
  readings,
  canaryReadings = {},
  initialValues = INITIAL_VALUES,
  sourceFreshness = null,
}) {
  const failures = [
    ...detectZeroMatchTargets({ plan, readings }),
    ...detectAbsentReadings({ plan, readings }),
    ...detectUnhydratedTargets({ plan, readings, canaryReadings, initialValues }),
    ...(sourceFreshness ? detectStaleSource(sourceFreshness) : []),
  ];
  const byGuard = {};
  for (const entry of failures) byGuard[entry.guard] = (byGuard[entry.guard] ?? 0) + 1;
  const sound = failures.length === 0;
  return {
    verdict: sound ? MEASUREMENT_SOUND : MEASUREMENT_VOID,
    failures,
    byGuard,
    voidsInertVerdicts: !sound,
    meaning: sound
      ? 'Every declared target matched, every declared property produced a reading, every ' +
        'measured element carried the bundle it was supposed to, and the source digest still ' +
        'describes the tree. Inert verdicts in this artifact are about the CSS.'
      : 'This run measured nothing it can be held to. Every inert and every unchanged verdict ' +
        'in this artifact is VOID; fix the named rows before quoting any number from it.',
  };
}
