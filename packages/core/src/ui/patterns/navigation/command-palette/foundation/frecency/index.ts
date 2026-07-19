/**
 * @fileoverview Frecency scoring for command-palette ranking.
 *
 * Pure functions only: every entry point takes the current time as an
 * argument so callers inject their clock (render paths must never call
 * Date.now directly). Persistence uses the compact exponential-decay
 * representation -- one `{ score, lastUsedAt }` pair per command -- which is
 * mathematically equivalent to storing every use timestamp under a fixed
 * half-life, because exponential decay commutes with summation.
 */

/** Half-life of a recorded use: a use loses half its weight every 14 days. */
export const FRECENCY_HALF_LIFE_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Compact usage record for one command. `score` is the decayed use weight as
 * of `lastUsedAt`; the effective weight at any later time is derived by
 * {@link decayedFrecency}.
 */
export interface CommandUsageEntry {
  /** Accumulated use weight, valued as of `lastUsedAt`. */
  score: number;
  /** Epoch milliseconds of the most recent recorded use. */
  lastUsedAt: number;
}

/** Usage records keyed by command id. JSON-serializable for persistence. */
export type CommandUsageMap = Record<string, CommandUsageEntry>;

/**
 * Own-property read guard: command ids are caller-controlled strings, so a
 * bare index read would resolve ids like "toString" against
 * Object.prototype instead of the usage data.
 */
function usageEntryOf(usage: CommandUsageMap, commandId: string): CommandUsageEntry | undefined {
  if (!Object.prototype.hasOwnProperty.call(usage, commandId)) return undefined;
  const entry = usage[commandId];
  if (
    !entry ||
    typeof entry.score !== 'number' ||
    typeof entry.lastUsedAt !== 'number' ||
    !Number.isFinite(entry.score) ||
    !Number.isFinite(entry.lastUsedAt)
  ) {
    // Persisted storage is app-writable; malformed entries rank as unused
    // rather than poisoning the sort with NaN.
    return undefined;
  }
  return entry;
}

/**
 * Effective frecency weight of an entry at time `now`. Ages in the future
 * (clock skew, imported data) clamp to zero age so a bad timestamp can never
 * amplify a score.
 */
export function decayedFrecency(entry: CommandUsageEntry | undefined, now: number): number {
  if (!entry || entry.score <= 0) return 0;
  const age = Math.max(0, now - entry.lastUsedAt);
  return entry.score * Math.pow(2, -age / FRECENCY_HALF_LIFE_MS);
}

/**
 * Record one use of `commandId` at time `now`, returning a new map (the
 * input is never mutated). The previous weight is decayed to `now` before
 * the new use adds 1, keeping the compact representation exact.
 */
export function recordUse(usage: CommandUsageMap, commandId: string, now: number): CommandUsageMap {
  const previous = usageEntryOf(usage, commandId);
  const carried = previous ? decayedFrecency(previous, now) : 0;
  return {
    ...usage,
    [commandId]: { score: carried + 1, lastUsedAt: now },
  };
}

/**
 * Rank `items` by decayed frecency, descending, at time `now`. The sort is
 * stable: items with equal scores -- in particular every never-used item at
 * score 0 -- keep their incoming relative order, so upstream relevance or
 * priority ordering survives as the tiebreak.
 */
export function rankByFrecency<T>(
  items: readonly T[],
  getId: (item: T) => string,
  usage: CommandUsageMap,
  now: number,
): T[] {
  const decorated = items.map((item, index) => ({
    item,
    index,
    score: decayedFrecency(usageEntryOf(usage, getId(item)), now),
  }));
  decorated.sort((a, b) => (b.score - a.score) || (a.index - b.index));
  return decorated.map((d) => d.item);
}
