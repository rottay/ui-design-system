/**
 * @fileoverview Declared negative controls: which properties a control is
 * FORBIDDEN to move, read from the programme manifest rather than from here.
 *
 * A positive result on its own is not evidence. "Rhythm moved the gap" is
 * compatible with "rhythm moved everything", which is the failure mode a
 * spacing axis actually has: it reaches a control height, a touch target or an
 * icon box and quietly breaks the coarse-pointer floor while the gap number
 * looks right. So a causal run must state, before it runs, what must NOT move,
 * and must fail when one of those moves.
 *
 * THE LIST IS NOT IN THIS FILE, AND MUST NOT BE. A negative control hardcoded
 * in the instrument is an instrument grading its own homework: the day the
 * manifest adds one, the harness keeps passing. The applicable list is read
 * from `governance/manifest/controls/<control-id>.json#calibration.negativeControls`, and
 * narrowed by `governance/manifest/families/<family>.json#themeControls[].negativeControls`
 * where a family states something more specific about its own root.
 *
 * WHAT LIVES HERE IS THE MEASURABLE DEFINITION. The manifest speaks prose
 * ("control height remains fixed"); a browser needs property names. That
 * translation is data (`vocabulary/index.json`) rather than code, and it is
 * FAIL-CLOSED in both directions:
 *
 *   - a manifest phrase with no vocabulary entry is UNRESOLVED, and the run
 *     fails naming the phrase. It is never dropped, and never approximated.
 *   - a control that declares negative controls and a run that resolves none is
 *     a run with no negative controls at all, which is exactly the shape of
 *     evidence this programme refuses. That also fails.
 *   - an entry scoped to `declared-targets` that the run did not bind fails
 *     closed, because "checked nothing" and "checked and found nothing" are the
 *     same sentence otherwise.
 *
 * SCOPE MATTERS AND IS DECLARED. "Control height remains fixed" is bound to
 * control-bearing targets on purpose: a LAYOUT container's intrinsic height
 * legitimately grows when its gaps grow, so asserting it everywhere would
 * report the control's intended effect as a violation and teach a reader to
 * ignore the guard.
 *
 * @module Tooling/ResolutionProbe/Foundation/NegativeControls
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

const VOCABULARY = JSON.parse(readFileSync(resolve(HERE, 'vocabulary/index.json'), 'utf-8'));

export const VOCABULARY_NOTE = VOCABULARY.note;

/** The measurable definition of each negative control this harness can check. */
export const NEGATIVE_CONTROL_VOCABULARY = Object.freeze(
  VOCABULARY.entries.map((entry) => Object.freeze({ ...entry })),
);

const BY_PHRASE = new Map();
for (const entry of NEGATIVE_CONTROL_VOCABULARY) {
  for (const phrase of entry.phrases) BY_PHRASE.set(normalise(phrase), entry);
}

function normalise(phrase) {
  return String(phrase).trim().replace(/\s+/gu, ' ').toLowerCase();
}

/** Reads a modern-rescue manifest file. Kept here so a caller passes a path, not JSON text. */
export function readManifest(absolutePath) {
  return JSON.parse(readFileSync(absolutePath, 'utf-8'));
}

/**
 * The phrases a run must honour, and where each came from.
 *
 * The family list NARROWS the control list by being more specific about one
 * family's own root; it never replaces it. So the effective set is the union,
 * and a family that says nothing inherits the control's full list rather than
 * escaping it.
 *
 * @param {{controlManifest: object, familyManifest?: object|null, controlId: string}} input
 */
export function declaredPhrasesFor({ controlManifest, familyManifest = null, controlId }) {
  if (!controlManifest) {
    throw new Error(
      'resolution-probe: a causal run needs the control manifest to know which negative ' +
        'controls apply. Running without it would be a run with none.',
    );
  }
  const controlPhrases = [...(controlManifest.calibration?.negativeControls ?? [])];
  const familyEntry = (familyManifest?.themeControls ?? []).find(
    (entry) => entry.controlId === controlId,
  );
  const familyPhrases = [...(familyEntry?.negativeControls ?? [])];
  const effective = [];
  for (const phrase of [...controlPhrases, ...familyPhrases]) {
    if (!effective.some((known) => normalise(known) === normalise(phrase))) effective.push(phrase);
  }
  return {
    controlId,
    controlPhrases,
    familyId: familyManifest?.familyId ?? null,
    familyPhrases,
    effective,
    law:
      'The family list narrows the control list by being more specific about one family root. ' +
      'It never replaces it, so the effective set is the union and a silent family inherits ' +
      'the full control list.',
  };
}

/**
 * Translates declared phrases into checkable property sets.
 *
 * @param {object} input
 * @param {string[]} input.phrases
 * @param {Record<string, string[]>} [input.bindings]  entry id -> target keys
 * @returns {{resolved: object[], unresolved: object[], unbound: object[], complete: boolean}}
 */
export function resolveNegativeControls({ phrases, bindings = {} }) {
  const resolved = [];
  const unresolved = [];
  const unbound = [];
  for (const phrase of phrases ?? []) {
    const entry = BY_PHRASE.get(normalise(phrase));
    if (!entry) {
      unresolved.push({
        phrase,
        reason:
          'no vocabulary entry declares this phrase, so the harness cannot say which computed ' +
          'properties it forbids. Add a machine-readable entry; do not drop the phrase.',
      });
      continue;
    }
    const targets = bindings[entry.id] ?? null;
    if (entry.targetScope === 'declared-targets' && (!targets || targets.length === 0)) {
      unbound.push({
        phrase,
        id: entry.id,
        reason:
          'this negative control is scoped to declared targets and the run bound none, so it ' +
          'would check nothing while reporting that it checked.',
      });
      continue;
    }
    resolved.push({
      id: entry.id,
      phrase,
      assertion: entry.assertion,
      targetScope: entry.targetScope,
      properties: [...entry.properties],
      targets: entry.targetScope === 'declared-targets' ? [...targets] : null,
      partiallyMechanised: [...entry.partiallyMechanised],
      meaning: entry.meaning,
    });
  }
  return {
    resolved,
    unresolved,
    unbound,
    complete: unresolved.length === 0 && unbound.length === 0,
  };
}

/**
 * The fail-closed check: a control with declared negative controls may not be
 * calibrated by a run that resolved none of them.
 *
 * @returns {{ok: boolean, failures: object[]}}
 */
export function requireResolvedNegativeControls({ declared, resolution }) {
  const failures = [];
  if ((declared?.effective ?? []).length > 0 && resolution.resolved.length === 0) {
    failures.push({
      kind: 'no-negative-controls-resolved',
      declaredCount: declared.effective.length,
      meaning:
        'The manifest declares negative controls for this control and this run resolved none. ' +
        'A positive delta with no negative control is not calibration evidence.',
    });
  }
  for (const entry of resolution.unresolved) {
    failures.push({ kind: 'unresolved-negative-control-phrase', ...entry });
  }
  for (const entry of resolution.unbound) {
    failures.push({ kind: 'unbound-negative-control', ...entry });
  }
  return { ok: failures.length === 0, failures };
}

/**
 * Expands the browser plan BEFORE measurement so every negative assertion has
 * an observation row to inspect. A negative property absent from the fixture's
 * ordinary focal list is still part of the contract; leaving it out and then
 * treating its absence as "did not move" is a false green.
 *
 * `every-measured-target` entries are added to every selected target. Entries
 * bound to `declared-targets` are added only to the exact roster keys named by
 * the manifest binding. The returned fixtures are copies; the frozen roster is
 * never mutated by a run.
 */
export function expandFixturesForNegativeControls({ fixtures, resolved }) {
  const everyTarget = new Set();
  const byTarget = new Map();
  for (const entry of resolved ?? []) {
    if (entry.targetScope === 'every-measured-target') {
      for (const property of entry.properties) everyTarget.add(property);
      continue;
    }
    for (const target of entry.targets ?? []) {
      const properties = byTarget.get(target) ?? new Set();
      for (const property of entry.properties) properties.add(property);
      byTarget.set(target, properties);
    }
  }

  return (fixtures ?? []).map((fixture) => ({
    ...fixture,
    targets: fixture.targets.map((target) => {
      const key = `${fixture.id}/${target.id}`;
      return {
        ...target,
        properties: [
          ...new Set([
            ...target.properties,
            ...everyTarget,
            ...(byTarget.get(key) ?? []),
          ]),
        ],
      };
    }),
  }));
}

/**
 * Asserts the resolved negative controls held across a movement report.
 *
 * `movements` is the shape the dial/causal report already produces:
 * scope -> `fixture/target` -> property -> `{moved, from, to}` or
 * `{moved: false, value}`.
 *
 * A bound property that produced NO movement row is reported as `unmeasured`
 * and counts as a violation: a negative control nobody measured has not held,
 * it has been skipped. For a `declared-targets` entry this has always been
 * true regardless of `plan` — the caller named the target explicitly, so
 * every one of the entry's properties is unconditionally expected there.
 *
 * `every-measured-target` used to be exempt from that rule: a property
 * absent from `movements[scope][target]` was silently skipped rather than
 * reported, so "checked and found nothing" and "never checked" read as the
 * same green result. That is the exact hole this programme exists to close
 * for every OTHER assertion in this harness, and it was still open here.
 *
 * @param {object} input
 * @param {object[]} input.resolved
 * @param {object} input.movements
 * @param {object[]|null} [input.plan]
 *   The measurement plan — `{fixtureId, targetId, properties}` rows —
 *   EXPANDED BEFORE MEASURING (composition/run already builds this as the
 *   union across scopes before any browser read happens; see
 *   `runCausalProbe`'s `planByKey`). When supplied, an `every-measured-target`
 *   property is "expected" on a target only when that target's OWN plan row
 *   declares it — so this does not demand every fixture measure every
 *   font/color/border/motion property, only the ones it already declared it
 *   would read. An expected-but-missing row is `unmeasured`, exactly like a
 *   `declared-targets` one. Omitting `plan` (the default) keeps the old,
 *   lenient behaviour for a caller with no completeness information to give —
 *   `composition/run` always supplies one for a causal report.
 */
export function assertNegativeControlsHeld({ resolved, movements, plan = null }) {
  const violations = [];
  let checkedRows = 0;
  let expectedRows = 0;

  const planByTarget = plan
    ? new Map(plan.map((row) => [`${row.fixtureId}/${row.targetId}`, row]))
    : null;

  for (const entry of resolved ?? []) {
    for (const [scope, targets] of Object.entries(movements ?? {})) {
      const targetKeys =
        entry.targetScope === 'declared-targets' ? entry.targets : Object.keys(targets);
      for (const target of targetKeys) {
        const properties = targets[target];
        if (!properties) {
          if (entry.targetScope === 'declared-targets') {
            expectedRows += entry.properties.length;
            violations.push({
              kind: 'unmeasured',
              negativeControl: entry.id,
              phrase: entry.phrase,
              scope,
              target,
              meaning:
                'A bound negative-control target produced no movement rows at all, so this ' +
                'control was skipped rather than held.',
            });
          }
          continue;
        }
        const planRow = planByTarget?.get(target) ?? null;
        for (const property of entry.properties) {
          const row = properties[property];
          const expected =
            entry.targetScope === 'declared-targets' ||
            (planByTarget !== null && planRow !== null && planRow.properties.includes(property));
          if (row === undefined) {
            if (expected) {
              expectedRows += 1;
              violations.push({
                kind: 'unmeasured',
                negativeControl: entry.id,
                phrase: entry.phrase,
                scope,
                target,
                property,
                meaning:
                  'A bound negative-control property produced no reading, so it was skipped ' +
                  'rather than held.',
              });
            }
            continue;
          }
          expectedRows += 1;
          checkedRows += 1;
          if (row.moved === true) {
            violations.push({
              kind: 'moved',
              negativeControl: entry.id,
              phrase: entry.phrase,
              scope,
              target,
              property,
              from: row.from,
              to: row.to,
              meaning: entry.meaning,
            });
          }
        }
      }
    }
  }

  // A short read is a failure, not a silent pass: every expected row that did
  // not produce a value is already an `unmeasured` violation above, so this
  // equality is implied by `violations.length === 0` — stated explicitly
  // anyway, because a reader should not have to re-derive it.
  const observedRows = checkedRows;
  return {
    held: violations.length === 0 && observedRows === expectedRows,
    checkedRows,
    expectedRows,
    observedRows,
    violations,
    meaning:
      violations.length === 0
        ? 'Every declared negative control was measured and none moved.'
        : 'A declared negative control moved or was never measured. The control is reaching a ' +
          'channel it does not own, or the run did not check what it claimed to check.',
  };
}
