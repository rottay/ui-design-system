/**
 * @fileoverview The DATA-terminal causal run.
 *
 * THE PROBLEM THIS EXISTS FOR. Every other capability in this harness measures
 * what a browser paints. A control whose terminal is DATA paints nothing: it
 * travels document -> schema -> compiled artifact and reaches geometry through a
 * JS solver, never through a CSS channel. `responsive.posture` is the first
 * such control the programme certifies, and the CSS instrument REFUSES it by
 * construction -- `lowerStop` and `assertStopDiscrimination` both throw on an
 * empty `declaredOutputs.channels`, and the DB arm cannot even build an input
 * because this control's keypath does not start at `appearance.general`. That
 * refusal is correct and must stay: running the CSS harness against a
 * channel-less control and reporting "negative controls held" would be a
 * verdict about nothing at all.
 *
 * So this is a SIBLING instrument, not a flag on the existing one. What
 * transfers is the LAW -- three phases, exact restore, every differing row
 * named, receipted like any other evidence. What does not transfer is the
 * browser: both halves here are plain function calls on a compiled artifact, so
 * this is the only capability in the harness that pays no Chromium cost.
 *
 * WHAT IT PROVES, AND WHAT IT DOES NOT. It proves the datum ARRIVES and VARIES:
 * the field lands where the contract says, differs per stop, and disappears on
 * removal. It does NOT prove the resulting geometry is the right geometry --
 * that a board laid out under `spanBias: 'min'` looks as it should is sighted
 * acceptance, not a fact this file can establish.
 *
 * @module Tooling/ResolutionProbe/Composition/DataRun
 */

import { CAUSAL_PHASES, compareExact, RESTORE_LAW } from '../../foundation/causality/index.mjs';

/** Artifact shape version for DATA runs; independent of the CSS artifact's. */
export const DATA_CAUSAL_ARTIFACT_VERSION = 1;

/**
 * The four fail-closed guards a DATA diff needs.
 *
 * None of the five CSS guards apply: every one of them is about a selector or
 * property producing no reading, and there is no selector here. These are their
 * DATA-domain counterparts, and each one exists because a specific wrong answer
 * is otherwise indistinguishable from a right one.
 */
export const DATA_GUARDS = Object.freeze({
  ABSENT: 'data-absent',
  CONSTANT: 'data-constant',
  BYPASS: 'data-bypass',
  RESTORE: 'data-restore',
  NOT_DECIDABLE: 'data-not-decidable',
});

const guard = (id, meaning, detail) => Object.freeze({ guard: id, meaning, ...detail });

/**
 * Reads the governed field off a compiled artifact, as the real consumer does.
 *
 * `undefined` is a real answer here and is never coerced: the consumer
 * (`resolveActiveResponsivePosture`) branches on `!== undefined`, so "absent"
 * and "present with the default value" take DIFFERENT code paths and must stay
 * distinguishable all the way through this file.
 */
export function readGovernedField(artifact, fieldPath) {
  let cursor = artifact;
  for (const segment of fieldPath) {
    if (cursor === null || cursor === undefined || typeof cursor !== 'object') return undefined;
    cursor = cursor[segment];
  }
  return cursor;
}

/**
 * Projects one compiled artifact into the scope/target/property shape
 * `compareExact` already speaks, so the DATA probe inherits the restore law
 * verbatim instead of growing a second comparator with a second definition of
 * "exact".
 *
 * `equalitySurface` is the CLOSED field list the contract declares. Passing it
 * in rather than walking the object is what makes the assertion falsifiable: a
 * fifth field appearing in `.advanced` must redden a drill, not be silently
 * swept into the diff.
 */
export function projectDataObservation({ scope, target, artifact, fieldPath, equalitySurface }) {
  const container = readGovernedField(artifact, fieldPath.slice(0, -1)) ?? {};
  const values = {};
  for (const field of equalitySurface) {
    const raw = container?.[field];
    // Serialised so nested objects compare by content, and `undefined` stays a
    // value of its own rather than collapsing into "missing key".
    values[field] = raw === undefined ? undefined : JSON.stringify(raw);
  }
  return Object.freeze({
    readingKind: 'data',
    readings: { [scope]: { [target]: { values } } },
  });
}

/**
 * The three-phase DATA causal run.
 *
 * @param {object} input
 * @param {string} input.controlId
 * @param {string} input.vertical
 * @param {string[]} input.fieldPath        e.g. ['normalizedAppearance','advanced','responsivePosture']
 * @param {string[]} input.equalitySurface  the CLOSED sibling list, e.g. the 4 fields of `.advanced`
 * @param {Array<{stopId: string, artifact: object}>} input.stops   one compiled artifact per requested stop
 * @param {object} input.baseline           the compiled artifact with NO stop requested
 * @param {object} input.removal            the compiled artifact after the stop is removed again
 * @param {object} [input.bypass]           {requestedId, writeTime, renderTime} for the bypass guard
 * @param {object} [input.exception]        adjudicated calibration.dataDiscriminationException
 * @param {Array<{id, question, holds, detail}>} [input.behaviouralWitnesses]
 *   Downstream observations made by the CALLER, positive or negative, each one
 *   already reduced to a boolean by whoever knows the domain. This file stays
 *   domain-blind -- it cannot compute whether a layout moved -- but it refuses
 *   to report a pass while a declared witness is false, so a scenario cannot be
 *   run, come back red and be quietly dropped from the verdict.
 */
export function buildDataCausalReport({
  controlId,
  vertical,
  fieldPath,
  equalitySurface,
  stops,
  baseline,
  removal,
  bypass = null,
  exception = null,
  behaviouralWitnesses = [],
  provenance = {},
}) {
  // `holds` is the whole contract, so a witness that forgot to compute one is a
  // programming error and not a silent false: an undefined `holds` coerced to
  // false would fail the run for the wrong reason and send the reader hunting a
  // defect that is really a missing measurement.
  for (const witness of behaviouralWitnesses) {
    if (typeof witness?.holds !== 'boolean') {
      throw new Error(
        `resolution-probe: behavioural witness ${JSON.stringify(witness?.id ?? '(unnamed)')} must ` +
          'reduce to a boolean `holds`; an unmeasured witness is not a failing one.',
      );
    }
  }
  const field = fieldPath.at(-1);
  const scope = `${vertical}/document`;
  const target = fieldPath.slice(0, -1).join('.');
  const project = (artifact) =>
    projectDataObservation({ scope, target, artifact, fieldPath, equalitySurface });

  const guards = [];
  const observed = stops.map(({ stopId, artifact }) => ({
    stopId,
    value: readGovernedField(artifact, fieldPath),
    observation: project(artifact),
  }));

  // --- data-absent ---------------------------------------------------------
  // A stop WAS requested and the field is undefined on the compiled output.
  // Distinguishes "the control never reached the artifact" from "it resolved to
  // nothing because unset was the intent" -- the second is the baseline phase,
  // not this one.
  for (const entry of observed) {
    if (entry.value === undefined) {
      guards.push(
        guard(DATA_GUARDS.ABSENT, 'a stop was requested and the governed field is undefined on the compiled artifact', {
          stopId: entry.stopId,
          fieldPath: fieldPath.join('.'),
        }),
      );
    }
  }

  // --- data-not-decidable (X-D) -------------------------------------------
  // The DATA sibling of H-2's law. Below two witnesses nothing can be shown to
  // vary, and a silent pass on one witness is exactly the failure mode the
  // constant guard exists to remove. An adjudicated exception is the only way
  // past it, and it must name who adjudicated it.
  const witnesses = observed.filter((entry) => entry.value !== undefined);
  const exceptionApplies =
    exception &&
    typeof exception === 'object' &&
    typeof exception.reason === 'string' &&
    exception.reason.length > 0 &&
    typeof exception.adjudicatedBy === 'string' &&
    exception.adjudicatedBy.length > 0;
  if (witnesses.length < 2 && !exceptionApplies) {
    guards.push(
      guard(DATA_GUARDS.NOT_DECIDABLE, 'fewer than two witness stops carried the field, so variation is not decidable', {
        witnesses: witnesses.map((entry) => entry.stopId),
        remedy:
          'an adjudicated calibration.dataDiscriminationException { reason, adjudicatedBy } is ' +
          'the only way past this; a silent pass is not one',
      }),
    );
  }

  // --- data-constant -------------------------------------------------------
  // Two different requested stops reading the same value is indistinguishable
  // from a broken ingress that ignores the request entirely.
  const distinct = new Set(witnesses.map((entry) => JSON.stringify(entry.value)));
  if (witnesses.length >= 2 && distinct.size < 2) {
    guards.push(
      guard(DATA_GUARDS.CONSTANT, 'every requested stop lowered the SAME value, so the field encodes no stop', {
        witnesses: witnesses.map((entry) => entry.stopId),
        value: witnesses[0]?.value,
      }),
    );
  }

  // --- data-bypass ---------------------------------------------------------
  // TWO code paths reached by the same bad input, and a probe that conflates
  // them misreports which layer fails closed: the compiler THROWS at write
  // time, the resolver returns the default at render time. Both must be
  // observed, separately, or neither is claimed.
  if (bypass) {
    const writeThrew = bypass.writeTime?.threw === true;
    const renderDefaulted = bypass.renderTime?.resolvedId === bypass.expectedDefaultId;
    if (!writeThrew || !renderDefaulted) {
      guards.push(
        guard(DATA_GUARDS.BYPASS, 'an out-of-catalog id did not produce BOTH a write-time throw and a render-time fail-closed default', {
          requestedId: bypass.requestedId,
          writeTimeThrew: writeThrew,
          renderTimeResolvedId: bypass.renderTime?.resolvedId ?? null,
          expectedDefaultId: bypass.expectedDefaultId ?? null,
        }),
      );
    }
  }

  // --- data-restore --------------------------------------------------------
  // Stricter than the CSS byte law, and deliberately so: the consumer branches
  // on `!== undefined`, so a removal that leaves the DEFAULT VALUE behind looks
  // identical in the value and takes the other branch of the resolver. Removal
  // is removal.
  const removedValue = readGovernedField(removal, fieldPath);
  if (removedValue !== undefined) {
    guards.push(
      guard(DATA_GUARDS.RESTORE, 'after removal the governed field is still present; removal is removal, not writing the default back', {
        fieldPath: fieldPath.join('.'),
        found: removedValue,
      }),
    );
  }

  // --- exact restore, through the shared comparator ------------------------
  const restore = compareExact({
    before: project(baseline),
    after: project(removal),
    beforeLabel: 'baseline',
    afterLabel: 'removal',
  });

  // --- equality-except-the-field, per stop ---------------------------------
  const siblings = equalitySurface.filter((name) => name !== field);
  const equalityExceptField = observed.map((entry) => {
    const baselineValues = project(baseline).readings[scope][target].values;
    const stopValues = entry.observation.readings[scope][target].values;
    const differing = siblings.filter((name) => baselineValues[name] !== stopValues[name]);
    return {
      stopId: entry.stopId,
      fieldMoved: baselineValues[field] !== stopValues[field],
      siblingsChecked: siblings,
      siblingsDiffering: differing,
      holds: differing.length === 0 && baselineValues[field] !== stopValues[field],
    };
  });

  const witnessesHeld = behaviouralWitnesses.every((witness) => witness.holds === true);
  const pass =
    guards.length === 0 &&
    restore.exact === true &&
    equalityExceptField.every((entry) => entry.holds) &&
    witnessesHeld;

  return Object.freeze({
    artifactVersion: DATA_CAUSAL_ARTIFACT_VERSION,
    controlId,
    vertical,
    terminal: 'DATA',
    question:
      'Does this control CAUSE the governed field to appear with the requested value, leave ' +
      'every declared sibling untouched, and disappear entirely when the tenant removes it?',
    limit:
      'This proves the datum ARRIVES and VARIES. It does not prove the resulting geometry is ' +
      'the right geometry: that is sighted acceptance.',
    fieldPath: fieldPath.join('.'),
    equalitySurface: [...equalitySurface],
    phases: [...CAUSAL_PHASES],
    restoreLaw: RESTORE_LAW,
    stops: observed.map((entry) => ({ stopId: entry.stopId, value: entry.value })),
    equalityExceptField,
    restore,
    dataGuards: guards,
    // Recorded even when it held: without it, a run that never exercised the
    // bypass and a run whose bypass failed closed are the same artifact, and the
    // absence of a guard is not evidence that the check was made.
    bypass: bypass ? { ...bypass } : null,
    behaviouralWitnesses: behaviouralWitnesses.map((witness) => ({ ...witness })),
    exception: exceptionApplies ? { ...exception } : null,
    provenance,
    verdict: {
      pass,
      guardsHeld: guards.length === 0,
      restoreExact: restore.exact === true,
      equalityHeld: equalityExceptField.every((entry) => entry.holds),
      witnessesHeld,
    },
  });
}
