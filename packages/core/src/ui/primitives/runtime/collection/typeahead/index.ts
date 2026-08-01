'use client';

/**
 * @fileoverview Collection type-ahead kernel -- the single accumulator behind
 * every APG list/menu/tree type-ahead in the primitive tier.
 *
 * @remarks
 * Two layers, deliberately separated so the rule is falsifiable without a DOM:
 *
 * - {@link advanceTypeahead} is pure: it takes the previous buffer state and a
 *   keystroke and returns the next state plus the prefix to search for. No
 *   timers, no refs, no element identity.
 * - {@link resolveTypeaheadPrefix} keys that same accumulator to a DOM element
 *   through a module-private WeakMap, for owners whose buffer belongs to a
 *   rendered container (a menu level) rather than to a React instance.
 *
 * Owners that already hold a React ref use the pure layer directly and keep
 * their own matcher: the accumulator is shared because it is byte-identical
 * across families, while "which row does this prefix select" legitimately
 * differs (flat listbox, visible tree rows, nested menu level).
 *
 * @module Runtime/Collection/Typeahead
 * @package @rottay/design-system
 */

/**
 * Rolling type-ahead buffer. `lastKeyTime` is a millisecond timestamp on the
 * same clock the caller passes to {@link advanceTypeahead}.
 */
export interface TypeaheadState {
  buffer: string;
  lastKeyTime: number;
}

/** Result of folding one keystroke into a {@link TypeaheadState}. */
export interface TypeaheadAdvance {
  /** The next state. Callers own whether and when they commit it. */
  state: TypeaheadState;
  /** Lower-cased accumulated buffer to match rows against. */
  prefix: string;
}

/**
 * Window within which consecutive keystrokes accumulate into one prefix.
 * The APG leaves the exact figure to the implementation; 500ms is the value
 * every Rottay collection has always used.
 */
export const TYPEAHEAD_RESET_MS = 500;

/**
 * Folds one printable keystroke into the rolling buffer.
 *
 * The buffer extends while the gap since the previous keystroke stays within
 * `resetMs`, and restarts from the fresh character once the gap EXCEEDS it --
 * a gap of exactly `resetMs` still extends. Callers keep raw case in the
 * buffer and match against the lower-cased `prefix`, so a mixed-case run
 * ("Sa" then "N") accumulates the same prefix as an all-lower one.
 *
 * Pure: the caller decides whether the returned state is committed, which is
 * what lets a matcher reject a prefix and roll the buffer back to a single
 * character without the accumulator knowing anything about rows.
 *
 * @param state   Previous buffer state.
 * @param key     The raw `KeyboardEvent.key` (callers guard printability).
 * @param now     Current timestamp, in milliseconds.
 * @param resetMs Accumulation window; defaults to {@link TYPEAHEAD_RESET_MS}.
 */
export function advanceTypeahead(
  state: TypeaheadState,
  key: string,
  now: number,
  resetMs: number = TYPEAHEAD_RESET_MS
): TypeaheadAdvance {
  const buffer = now - state.lastKeyTime > resetMs ? key : state.buffer + key;
  return { state: { buffer, lastKeyTime: now }, prefix: buffer.toLowerCase() };
}

/**
 * Type-ahead buffers keyed to the element that owns them. Weak on purpose:
 * a menu level that unmounts must not keep its buffer alive, and two open
 * menus must not share one.
 */
const typeaheadStateByElement = new WeakMap<HTMLElement, TypeaheadState>();

/**
 * DOM-keyed accumulator for owners whose buffer belongs to a container rather
 * than to a component instance -- menus, where each level scopes its own
 * type-ahead and the level is the only stable identity a nested submenu has.
 *
 * @param el  The element the buffer belongs to (a menu level).
 * @param key The raw `KeyboardEvent.key`.
 * @param now Current timestamp; defaults to `Date.now()`.
 * @returns The lower-cased prefix to match menu items against.
 */
export function resolveTypeaheadPrefix(el: HTMLElement, key: string, now: number = Date.now()): string {
  const previous = typeaheadStateByElement.get(el) ?? { buffer: '', lastKeyTime: 0 };
  const { state, prefix } = advanceTypeahead(previous, key, now);
  typeaheadStateByElement.set(el, state);
  return prefix;
}
