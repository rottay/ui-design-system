/**
 * The governed vocabulary of CSS-first responsive visibility boundaries.
 *
 * `Show`, `Hide` and `ResponsiveSlot` express one boundary each -- a lower
 * bound, an upper bound, or a device band. The boundary set is CLOSED, so the
 * whole family is a fixed, static stylesheet
 * (`foundation/tokens/css/foundation/responsive/visibility`) plus one attribute
 * per instance, instead of the per-instance `<style>` element each wrapper used
 * to inject with a `useId`-scoped class.
 */

import {
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_BREAKPOINT_ORDER,
  RESPONSIVE_DEVICE_ALIASES,
  RESPONSIVE_DEVICE_END,
  RESPONSIVE_DEVICE_START,
  type ResponsiveBreakpointKey,
  type ResponsiveDeviceAlias,
} from '../breakpoints';

export type { ResponsiveDeviceAlias };
export { RESPONSIVE_DEVICE_ALIASES, RESPONSIVE_DEVICE_START, RESPONSIVE_DEVICE_END };

/** Every bound a visibility boundary accepts. */
export type ResponsiveVisibilityBound =
  | Exclude<ResponsiveBreakpointKey, 'xs'>
  | 'xs'
  | ResponsiveDeviceAlias;

export interface ResponsiveVisibilityConstraints {
  from?: ResponsiveVisibilityBound;
  below?: ResponsiveVisibilityBound;
  on?: ResponsiveDeviceAlias;
}

/** The attribute a visible-at boundary stamps. */
export const RESPONSIVE_SHOW_ATTRIBUTE = 'data-ds-show';

/** The attribute a hidden-at boundary stamps. */
export const RESPONSIVE_HIDE_ATTRIBUTE = 'data-ds-hide';

function toBreakpoint(bound: ResponsiveVisibilityBound): ResponsiveBreakpointKey {
  return (RESPONSIVE_DEVICE_START as Record<string, ResponsiveBreakpointKey>)[bound]
    ?? (bound as ResponsiveBreakpointKey);
}

/**
 * The canonical token for one boundary, or `null` when it bounds nothing.
 *
 * Device aliases collapse onto the breakpoint ladder here rather than in the
 * stylesheet, so `from="tablet"` and `from="sm"` are one rule and not two.
 */
export function responsiveVisibilityToken(
  constraints: ResponsiveVisibilityConstraints,
): string | null {
  if (constraints.on) return `on:${constraints.on}`;
  if (constraints.from) return `from:${toBreakpoint(constraints.from)}`;
  if (constraints.below) return `below:${toBreakpoint(constraints.below)}`;
  return null;
}

/**
 * The media query a boundary stands for.
 *
 * Kept beside the token because both are projections of the same thresholds,
 * and because `buildShowMediaQuery`/`buildHideMediaQuery` are public API.
 * A 0px breakpoint is a real bound, not a missing one: as a lower bound it
 * means "always", as an upper bound it means "never".
 */
export function responsiveVisibilityQuery(
  constraints: ResponsiveVisibilityConstraints,
): string | null {
  const { on, from, below } = constraints;

  if (on) {
    const min = RESPONSIVE_BREAKPOINTS[RESPONSIVE_DEVICE_START[on]];
    const endKey = RESPONSIVE_DEVICE_END[on];
    if (endKey === null) return `(min-width: ${min}px)`;
    const max = RESPONSIVE_BREAKPOINTS[endKey] - 1;
    if (min === 0) return `(max-width: ${max}px)`;
    return `(min-width: ${min}px) and (max-width: ${max}px)`;
  }

  if (from) return `(min-width: ${RESPONSIVE_BREAKPOINTS[toBreakpoint(from)]}px)`;

  if (below) {
    const pixels = RESPONSIVE_BREAKPOINTS[toBreakpoint(below)];
    return pixels === 0 ? 'not all' : `(max-width: ${pixels - 1}px)`;
  }

  return null;
}
