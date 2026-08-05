/**
 * @fileoverview Segmented reveal geometry — scrollport-local, direction-neutral.
 * @module Segmented/Runtime/Reveal
 * @category Navigation
 * @package @rottay/design-system
 *
 * @remarks
 * WHY THIS EXISTS AS A UNIT, AND WHY IT DOES NOT CALL `scrollIntoView`.
 *
 * The Segmented root scrolls rather than clipping. When the selected option
 * lies outside the scrollport, it must be brought into view — otherwise arrow
 * navigation selects an option the user cannot see (measured at 280px: `Closed`
 * at 254..318 while the visible root is 12..268, scrollLeft pinned at 0 of a
 * possible 54).
 *
 * The obvious call is `element.scrollIntoView({ block: 'nearest', inline:
 * 'nearest' })`, and the first version of this fix used it. It is wrong for a
 * primitive. `scrollIntoView` walks the WHOLE ancestor chain and may scroll any
 * scrollable ancestor and the document — `'nearest'` only minimises each
 * individual scroll, it does not confine the operation to one element. A leaf
 * control that yanks the page when a segment is selected is a worse defect than
 * the one being fixed, and it is invisible from this file: whether an ancestor
 * scrolls depends on the consuming page, not on the component.
 *
 * So the reveal is computed here and applied ONLY to the Segmented root's own
 * `scrollLeft` — one property, on one element, on the one axis the skin
 * actually scrolls. That is a structural guarantee rather than a best-effort
 * one: no other element is written to, so no other element can move, and no
 * vertical offset is touched at all. The sibling Tabs family still uses `scrollIntoView` and therefore
 * carries the same latent hazard; that is recorded, not fixed here — it is
 * another family's file and outside this cohort's write domain.
 *
 * DIRECTION NEUTRALITY. The arithmetic works in viewport coordinates and
 * produces a DELTA, never an absolute offset. Under the spec-compliant scroll
 * model (Chrome 85+, Firefox, Safari) an RTL scroller's `scrollLeft` runs from
 * `-(scrollWidth - clientWidth)` to `0` rather than `0` to `max`, but in BOTH
 * directions increasing `scrollLeft` by `d` shifts the visible window right by
 * `d`. A delta is therefore correct in both without a branch, and — unlike an
 * absolute assignment — it cannot be silently wrong about the origin. The
 * legacy reversed model shipped by pre-85 Chromium is out of support scope.
 * For the same reason the result is deliberately NOT clamped: min/max differ by
 * direction model, so clamping here would reintroduce the assumption the delta
 * form exists to avoid. The platform clamps assignment already.
 */

/**
 * One axis of the reveal problem, in viewport coordinates.
 *
 * `viewStart`/`viewEnd` are the edges of the scrollport's visible CONTENT box
 * (borders already subtracted). `itemStart`/`itemEnd` are the edges of the
 * element that must become visible.
 */
export interface RevealAxisGeometry {
  viewStart: number;
  viewEnd: number;
  itemStart: number;
  itemEnd: number;
  /**
   * Which PHYSICAL edge is the LOGICAL start of the axis: `'left'` under LTR,
   * `'right'` under RTL. It only affects the oversized case, where no offset
   * can contain the item and one edge has to be chosen. Defaults to `'left'`.
   */
  logicalStart?: 'left' | 'right';
}

/**
 * Sub-pixel tolerance. Fractional rects are routine at non-integer zoom and
 * under transform; without a tolerance a permanently-half-a-pixel-short item
 * would rewrite the scroll offset on every observation and fight the user.
 */
const EPSILON = 0.5;

/**
 * Scroll delta that brings `item` inside `view` on one axis.
 *
 * @returns The amount to ADD to the scroller's current offset on this axis.
 *   `0` when the item is already contained.
 *
 * @remarks
 * When the item is wider than the scrollport no delta can contain it, so the
 * LOGICAL START edge wins: reading a truncated label from its start is useful,
 * from its end is not. That case is decided FIRST, because it also satisfies
 * the "starts before the view" test and would otherwise be handled by accident
 * rather than by decision.
 *
 * The logical start is the only place in this file where direction matters, and
 * it is the one place an earlier version got wrong: it aligned the physical
 * LEFT edge unconditionally, which under RTL is the logical END — so an RTL
 * reader was shown the tail of an over-wide label while the doc comment claimed
 * "leading edge wins". Every other case is a containment fix, and containment
 * has no handedness.
 */
export function computeRevealDelta(geometry: RevealAxisGeometry): number {
  const { viewStart, viewEnd, itemStart, itemEnd, logicalStart = 'left' } = geometry;

  const viewSize = viewEnd - viewStart;
  const itemSize = itemEnd - itemStart;

  if (viewSize <= 0) return 0;
  if (itemSize > viewSize + EPSILON) {
    return logicalStart === 'right' ? itemEnd - viewEnd : itemStart - viewStart;
  }

  if (itemStart < viewStart - EPSILON) return itemStart - viewStart;
  if (itemEnd > viewEnd + EPSILON) return itemEnd - viewEnd;
  return 0;
}

/**
 * Resolve writing direction from SEMANTIC MARKUP before computed CSS.
 *
 * `dir="rtl"` on an ancestor is the authoritative declaration of direction, and
 * reading it first matches the sibling Tabs family, which resolves direction the
 * same way for the same reason. It is also the only formulation that works in
 * jsdom, where the `dir` attribute does not cascade into `getComputedStyle`.
 * Computed style remains the fallback for the CSS-only `direction: rtl` case.
 */
function elementDirection(element: HTMLElement): 'ltr' | 'rtl' {
  const owner = element.closest?.('[dir]') as HTMLElement | null;
  if (owner?.dir === 'rtl') return 'rtl';
  if (owner?.dir === 'ltr') return 'ltr';
  return getComputedStyle(element).direction === 'rtl' ? 'rtl' : 'ltr';
}

/** `parseFloat` that answers 0 for the empty strings a detached style returns. */
function pixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Bring `item` into view inside `scroller` ON THE INLINE AXIS ONLY.
 *
 * @returns The inline delta applied. `0` when nothing moved.
 *
 * @remarks
 * INLINE ONLY, DELIBERATELY. The skin declares `overflow-x: auto;
 * overflow-y: hidden` (segmented.css:56-57), so the block axis is not a
 * scrollport this control offers the user. `overflow: hidden` is still
 * PROGRAMMATICALLY scrollable, though — writing `scrollTop` on it really does
 * shift the content, and the user has no scrollbar, no wheel target and no
 * keyboard affordance to shift it back. A first version of this helper computed
 * and wrote both axes "for symmetry"; on a hidden-overflow box that symmetry is
 * a one-way trip. `scrollTop` is therefore never read and never written here.
 *
 * Borders are subtracted because `getBoundingClientRect` measures the border
 * box while scrolling happens inside the padding box. A classic scrollbar
 * gutter is NOT subtracted: a horizontal scrollbar sits on the block edge, so
 * it cannot occlude either inline edge of the reveal.
 */
export function revealInlineWithinScroller(
  scroller: HTMLElement,
  item: HTMLElement
): number {
  const view = scroller.getBoundingClientRect();
  const rect = item.getBoundingClientRect();
  const styles = getComputedStyle(scroller);

  const inline = computeRevealDelta({
    logicalStart: elementDirection(scroller) === 'rtl' ? 'right' : 'left',
    viewStart: view.left + pixels(styles.borderLeftWidth),
    viewEnd: view.right - pixels(styles.borderRightWidth),
    itemStart: rect.left,
    itemEnd: rect.right,
  });

  // Write only on a real move: a no-op assignment still emits `scroll` in some
  // engines, and this runs on every resize observation.
  if (inline !== 0) scroller.scrollLeft += inline;

  return inline;
}

/** Anatomy hook for the currently selected option. */
export const SELECTED_OPTION_SELECTOR = '[data-part="option"][aria-checked="true"]';

/**
 * Reveal the selected option inside a Segmented root.
 *
 * @returns The element revealed, or `null` when there is no selection.
 */
export function revealSelectedOption(root: HTMLElement): HTMLElement | null {
  const selected = root.querySelector<HTMLElement>(SELECTED_OPTION_SELECTOR);
  if (!selected) return null;
  revealInlineWithinScroller(root, selected);
  return selected;
}
