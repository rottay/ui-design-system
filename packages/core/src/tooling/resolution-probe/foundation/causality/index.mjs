/**
 * @fileoverview Causality vocabulary: three phases, one exact restore comparator,
 * and the inline write/restore planner that makes removal reversible.
 *
 * WHY A THIRD PHASE. A two-arm before/after `dial` can prove a channel moves. It
 * cannot prove the move is REVERSIBLE, and irreversibility is the failure a
 * tenant actually meets: they try `airy`, dislike it, unset it, and the product
 * does not come back. So a causal run is `baseline -> mutation -> removal`, and
 * the third phase is compared against the first.
 *
 * THE COMPARISON IS EXACT. Not "within a pixel", not "close enough", not
 * "ignoring sub-pixel rounding". `13.6px` and `13.5999px` are a FINDING. A
 * tolerance would be a place for a real restore defect to hide, and the defect
 * class this programme cares about — a stale attribute, a channel that latched,
 * an instance value that survived a rerender — expresses itself as exactly the
 * small difference a tolerance would swallow. Every differing row is NAMED:
 * scope, target, property, before, after. A boolean with no rows is not a
 * verdict, it is a claim.
 *
 * THREE THINGS ARE COMPARED, not one:
 *   1. every measured computed property (the painted longhands);
 *   2. every measured CSS custom property (the token stream, which can differ
 *      while the painted longhand agrees — a latched variable that nothing
 *      currently reads is still a restore defect, because the next consumer
 *      added to that chain inherits it);
 *   3. the root attributes (a `data-*` the mutation stamped and the removal
 *      forgot to clear is invisible in both of the above until some selector
 *      keys on it).
 *
 * REMOVAL IS NOT "SET IT BACK TO THE DEFAULT". A tenant unsetting a control
 * removes their declaration; whatever was underneath resurfaces. Writing the
 * default value back is a different operation that happens to agree with
 * removal only while the underlying value IS the default — which is precisely
 * the case a calibration run must not assume. So the planner records what was
 * inline BEFORE the harness wrote, and restores exactly that: a preexisting
 * inline value comes back byte-identical WITH ITS PRIORITY, and a property the
 * harness introduced is removed rather than zeroed.
 *
 * @module Tooling/ResolutionProbe/Foundation/Causality
 */

/** The three phases of one causal run, in execution order. */
export const CAUSAL_PHASES = Object.freeze(['baseline', 'mutation', 'removal']);

export const RESTORE_LAW =
  'Restore is EXACT: every measured computed property, every measured CSS custom property ' +
  'and every root attribute must be byte-identical between the baseline and removal phases. ' +
  'There is no numeric tolerance and no ignored property. A single differing row makes the ' +
  'run restore.exact=false and the row is named.';

/**
 * A measured name is a custom property when it starts with `--`.
 *
 * The distinction is kept in the comparison rows because the two carry
 * different weight: a custom property reads back as a substituted token stream
 * and is diagnostic, a painted longhand is a verdict. Both must restore.
 */
export function propertyKind(name) {
  return String(name).startsWith('--') ? 'custom-property' : 'computed-property';
}

function union(a, b) {
  return [...new Set([...a, ...b])].sort();
}

function row(entry) {
  return Object.freeze(entry);
}

/**
 * Compares two phase observations, row by row, with no tolerance.
 *
 * @param {object} input
 * @param {{readings: object, rootAttributes?: object}} input.before
 * @param {{readings: object, rootAttributes?: object}} input.after
 * @param {string} [input.beforeLabel]
 * @param {string} [input.afterLabel]
 * @returns {{exact: boolean, comparedRows: number, rows: object[], counts: object, law: string}}
 */
export function compareExact({
  before,
  after,
  beforeLabel = 'baseline',
  afterLabel = 'removal',
}) {
  if (!before || !after) {
    throw new Error(
      'resolution-probe: compareExact needs both phase observations. A missing phase is not ' +
        'an exact restore, it is an unmeasured one.',
    );
  }
  const rows = [];
  let comparedRows = 0;

  const beforeReadings = before.readings ?? {};
  const afterReadings = after.readings ?? {};
  for (const scope of union(Object.keys(beforeReadings), Object.keys(afterReadings))) {
    const left = beforeReadings[scope];
    const right = afterReadings[scope];
    if (!left || !right) {
      rows.push(
        row({
          kind: 'scope-missing-in',
          scope,
          presentIn: left ? beforeLabel : afterLabel,
          meaning:
            'One phase measured this scope and the other did not, so restore cannot be shown ' +
            'for it at all.',
        }),
      );
      continue;
    }
    for (const target of union(Object.keys(left), Object.keys(right))) {
      const leftTarget = left[target];
      const rightTarget = right[target];
      if (!leftTarget || !rightTarget) {
        rows.push(
          row({
            kind: 'target-missing-in',
            scope,
            target,
            presentIn: leftTarget ? beforeLabel : afterLabel,
            meaning: 'A measured target exists in only one phase.',
          }),
        );
        continue;
      }
      if (leftTarget.present !== rightTarget.present) {
        rows.push(
          row({
            kind: 'presence-differs',
            scope,
            target,
            before: leftTarget.present,
            after: rightTarget.present,
            meaning:
              'The element itself came or went between the phases. Nothing measured on it ' +
              'restores.',
          }),
        );
        continue;
      }
      const leftValues = leftTarget.values ?? {};
      const rightValues = rightTarget.values ?? {};
      for (const property of union(Object.keys(leftValues), Object.keys(rightValues))) {
        const hasLeft = Object.hasOwn(leftValues, property);
        const hasRight = Object.hasOwn(rightValues, property);
        if (!hasLeft || !hasRight) {
          rows.push(
            row({
              kind: 'property-missing-in',
              scope,
              target,
              property,
              propertyKind: propertyKind(property),
              presentIn: hasLeft ? beforeLabel : afterLabel,
              meaning:
                'A property was read in one phase and not the other. An unread property is ' +
                'never an unchanged one.',
            }),
          );
          continue;
        }
        comparedRows += 1;
        if (leftValues[property] !== rightValues[property]) {
          rows.push(
            row({
              kind: 'value-differs',
              scope,
              target,
              property,
              propertyKind: propertyKind(property),
              before: leftValues[property],
              after: rightValues[property],
              meaning: 'Exact comparison, no tolerance.',
            }),
          );
        }
      }
    }
  }

  const beforeAttributes = before.rootAttributes ?? {};
  const afterAttributes = after.rootAttributes ?? {};
  for (const scope of union(Object.keys(beforeAttributes), Object.keys(afterAttributes))) {
    const left = beforeAttributes[scope];
    const right = afterAttributes[scope];
    if (!left || !right) {
      rows.push(
        row({
          kind: 'root-attributes-scope-missing-in',
          scope,
          presentIn: left ? beforeLabel : afterLabel,
          meaning: 'Root attributes were captured in only one phase for this scope.',
        }),
      );
      continue;
    }
    for (const attribute of union(Object.keys(left), Object.keys(right))) {
      const hasLeft = Object.hasOwn(left, attribute);
      const hasRight = Object.hasOwn(right, attribute);
      if (!hasLeft || !hasRight) {
        rows.push(
          row({
            kind: 'root-attribute-missing-in',
            scope,
            attribute,
            presentIn: hasLeft ? beforeLabel : afterLabel,
            before: hasLeft ? left[attribute] : null,
            after: hasRight ? right[attribute] : null,
            meaning:
              'A root attribute exists in only one phase. A stamp the mutation added and the ' +
              'removal forgot is exactly this row.',
          }),
        );
        continue;
      }
      comparedRows += 1;
      if (left[attribute] !== right[attribute]) {
        rows.push(
          row({
            kind: 'root-attribute-differs',
            scope,
            attribute,
            before: left[attribute],
            after: right[attribute],
            meaning: 'Exact comparison, no tolerance.',
          }),
        );
      }
    }
  }

  const byKind = {};
  const byPropertyKind = {};
  for (const entry of rows) {
    byKind[entry.kind] = (byKind[entry.kind] ?? 0) + 1;
    if (entry.propertyKind) {
      byPropertyKind[entry.propertyKind] = (byPropertyKind[entry.propertyKind] ?? 0) + 1;
    }
  }

  return {
    exact: rows.length === 0,
    comparedRows,
    counts: { differingRows: rows.length, byKind, byPropertyKind },
    rows,
    law: RESTORE_LAW,
  };
}

/**
 * Plans the write and its exact undo from ONE observation of the inline style.
 *
 * The pair is produced together, from the same memo, so the undo cannot drift
 * from the write. Both are plain op lists (`set` / `remove`) that the page-side
 * code executes without deciding anything — every decision is here, where it
 * can be tested without a browser.
 *
 * @param {object} input
 * @param {Record<string, {present: boolean, value: string, priority?: string}>} input.memo
 *   what each property read on the target element's OWN inline style, before any write
 * @param {Record<string, string>} input.properties  what the ingress arm writes
 * @returns {{write: object[], restore: object[], clobbered: string[], introduced: string[]}}
 */
export function planInlinePhase({ memo, properties }) {
  const names = Object.keys(properties ?? {});
  if (names.length === 0) {
    throw new Error(
      'resolution-probe: an ingress arm that writes no property cannot be a mutation phase.',
    );
  }
  const missing = names.filter((name) => !memo || !Object.hasOwn(memo, name));
  if (missing.length > 0) {
    // FAIL CLOSED. Writing a property whose prior inline state was never
    // observed makes an exact restore impossible: `remove` would delete a
    // tenant's own inline declaration, and `set` would have nothing to set back
    // to. Both look green afterwards, which is why this throws instead.
    throw new Error(
      'resolution-probe: no inline memo for ' +
        `${missing.join(', ')}. The prior inline state must be observed BEFORE the write, or ` +
        'removal cannot distinguish "unset what I wrote" from "delete what was already there".',
    );
  }

  const write = names.map((name) => ({ op: 'set', name, value: properties[name], priority: '' }));
  const restore = names.map((name) => {
    const entry = memo[name];
    return entry.present
      ? { op: 'set', name, value: entry.value, priority: entry.priority ?? '' }
      : { op: 'remove', name };
  });
  return {
    write,
    restore,
    clobbered: names.filter((name) => memo[name].present),
    introduced: names.filter((name) => !memo[name].present),
  };
}

/**
 * A human sentence for a restore verdict, written into the artifact.
 *
 * The negative sentence is deliberately absolute: a run with a non-exact
 * restore has NOT proven the control is reversible, whatever else it proved.
 */
export function describeRestore(comparison) {
  return comparison.exact
    ? 'Removal reproduced the baseline byte for byte across every measured computed property, ' +
        'custom property and root attribute.'
    : `Removal did NOT reproduce the baseline. ${comparison.rows.length} differing row(s); the ` +
        'control is not reversible on this scene and no restore claim may be made from this run.';
}
