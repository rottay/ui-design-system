/**
 * DS-A002 — the two named debt counters of the ownership census.
 *
 * Owner class is DERIVED from the finding's path with the engine freeze gate's
 * own law and is never stored: a stored class would be a second authority that
 * an edit to the ledger could move.
 *
 *  - `productive`         Modern engine + shared core, drained by its receiver;
 *  - `frozen-transferred` Classic + Rustic, transferred to an open receiver and
 *                         published until that receiver disposes of it.
 *
 * The two are never netted against each other. Their sum is published only to
 * state the F-86 clause as measured.
 *
 * This module carries no parser, so a reader that only needs the figures (the
 * gate runner's debt line) can import it without loading the census.
 */

import { createHash } from 'node:crypto';
import { FROZEN } from '../../../../engine/lifecycle/freeze/index.mjs';
import { FROZEN_ENGINE_NAMES } from '../../../../../libraries/engine/roster/index.mjs';

export const BASELINE_SCHEMA = 'ds-a002-ownership-baseline/2';
export const BASELINE_SCOPE = 'src/components/patterns + src/components/surfaces';
export const F86_THRESHOLD = 1000;

/** The written subject the producer stamps on the ledger; the gate refuses any other. */
export const BASELINE_PURPOSE =
  'DS-A002 ownership census: presentation ownership leaked into patterns and surfaces, one row per '
  + 'finding id with its pinned occurrence count. Two counters derived from the path, never stored: '
  + 'productive (Modern engine + shared core) and frozen-transferred (Classic + Rustic, receiver '
  + 'WO-RET-06). Exact and decrease-only; lowered only by --update-baseline.';

export const PRODUCTIVE = 'productive';
export const FROZEN_TRANSFERRED = 'frozen-transferred';

export const COUNTERS = Object.freeze({
  [PRODUCTIVE]: Object.freeze({
    label: 'productive (Modern engine + shared core)',
    receiver: 'WO-EVI-02',
    standing: 'drained by its receiver',
    classes: Object.freeze(['modern', 'shared']),
  }),
  [FROZEN_TRANSFERRED]: Object.freeze({
    label: 'frozen-transferred (Classic + Rustic) → WO-RET-06',
    receiver: 'WO-RET-06',
    standing: 'OPEN, transferred, not resolved',
    classes: FROZEN_ENGINE_NAMES,
  }),
});

const MODERN_ENGINE = /(^|\/)engines\/modern\//u;

/** `classic` | `rustic` by the freeze law; otherwise `modern` or `shared`. */
export function ownerClass(path) {
  const frozen = FROZEN.exec(path);
  if (frozen) return frozen[2];
  return MODERN_ENGINE.test(path) ? 'modern' : 'shared';
}

export function counterOf(path) {
  return FROZEN.test(path) ? FROZEN_TRANSFERRED : PRODUCTIVE;
}

function emptyFigure() {
  return { occurrences: 0, rows: 0 };
}

/** Tally `{ id, path, count }` rows into the two counters, class by class. */
export function tallyCounters(rows) {
  const counters = {};
  const ids = {};
  for (const [name, counter] of Object.entries(COUNTERS)) {
    counters[name] = {
      ...emptyFigure(),
      classes: Object.fromEntries(counter.classes.map((owner) => [owner, emptyFigure()])),
    };
    ids[name] = [];
  }
  for (const row of rows) {
    const counter = counters[counterOf(row.path)];
    const owner = counter.classes[ownerClass(row.path)];
    counter.occurrences += row.count;
    counter.rows += 1;
    owner.occurrences += row.count;
    owner.rows += 1;
    ids[counterOf(row.path)].push(row.id);
  }
  for (const name of Object.keys(COUNTERS)) {
    counters[name].idSetDigest = createHash('sha256')
      .update(ids[name].sort().join('\n'))
      .digest('hex');
  }
  return counters;
}

export function ledgerRows(document) {
  const entries = document?.entries;
  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) return [];
  return Object.entries(entries).map(([id, row]) => ({ id, ...row }));
}

export function totalOf(counters) {
  return Object.values(counters).reduce((total, counter) => ({
    occurrences: total.occurrences + counter.occurrences,
    rows: total.rows + counter.rows,
  }), emptyFigure());
}

/** The F-86 clause as measured: printed while the total is at or above 1,000. */
export function f86Line(total) {
  if (total.occurrences < F86_THRESHOLD) return null;
  return `F-86 < 1.000: NOT MET (total ${total.occurrences} occurrence(s) / ${total.rows} row(s))`;
}

function figure(counter) {
  return `${counter.occurrences} occurrence(s) / ${counter.rows} row(s)`;
}

/** One sentence for a reader that holds only the ledger document. */
export function describeLedgerCounters(document) {
  const counters = tallyCounters(ledgerRows(document));
  const parts = Object.entries(COUNTERS).map(([name, counter]) => (
    `${name} ${figure(counters[name])} → ${counter.receiver} (${counter.standing})`
  ));
  const f86 = f86Line(totalOf(counters));
  if (f86) parts.push(f86);
  return parts.join('; ');
}
