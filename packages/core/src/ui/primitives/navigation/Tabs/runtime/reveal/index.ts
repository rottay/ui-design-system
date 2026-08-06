/**
 * @fileoverview Tabs reveal geometry — scrollport-local, inline axis only.
 * @module Tabs/Runtime/Reveal
 * @category Navigation
 * @package @rottay/design-system
 *
 * @remarks
 * WHY THIS EXISTS, AND WHY IT DOES NOT CALL `scrollIntoView`.
 *
 * The modern tablist scrolls on the inline axis when the tabs overflow, so the
 * active tab must be brought into view — otherwise a controlled `activeKey`
 * change selects a tab the user cannot see.
 *
 * The obvious call is `activeTab.scrollIntoView({ block: 'nearest', inline:
 * 'nearest' })`, and that is what this engine shipped. It is wrong for a leaf
 * primitive: `scrollIntoView` walks the WHOLE ancestor chain and may scroll any
 * scrollable ancestor AND the document. `'nearest'` minimises each individual
 * scroll; it does not confine the operation to the tablist. The observable
 * defect is a page yank — a `<Tabs>` mounted below the fold drags the document
 * down to itself on first paint, and again on every `items` change, EVEN WHEN
 * THE TABLIST DOES NOT OVERFLOW and therefore had nothing to reveal. Whether an
 * ancestor moves depends on the consuming page, so no amount of care at the
 * call site makes the hazard visible from the engine file.
 *
 * The reveal is therefore computed here and applied ONLY to the tablist's own
 * `scrollLeft`: one property, one element, one axis. That is a structural
 * guarantee rather than a best-effort one — no other element is written to, so
 * no other element can move, and no vertical offset is touched at all.
 *
 * DIRECTION NEUTRALITY. The arithmetic works in viewport coordinates and yields
 * a DELTA, never an absolute offset. Under the spec-compliant scroll model an
 * RTL scroller's `scrollLeft` runs from `-(scrollWidth - clientWidth)` to `0`,
 * but in BOTH directions increasing `scrollLeft` by `d` shifts the visible
 * window right by `d`. A delta is correct in both without a branch, and cannot
 * be silently wrong about the origin. For the same reason it is deliberately
 * NOT clamped: min/max differ by direction model, and the platform clamps the
 * assignment already.
 *
 * This mirrors the technique proven in the sibling Segmented family, whose own
 * note records Tabs as still carrying the hazard. It is duplicated rather than
 * shared on purpose: extracting a cross-family navigation runtime is a
 * shared-contract decision, not a defect fix.
 */

/** One axis of the reveal problem, in viewport coordinates. */
export interface TabsRevealAxisGeometry {
  /** Visible CONTENT box edges of the scrollport (borders already subtracted). */
  viewStart: number;
  viewEnd: number;
  /** Edges of the element that must become visible. */
  itemStart: number;
  itemEnd: number;
  /**
   * Which PHYSICAL edge is the LOGICAL start: `'left'` under LTR, `'right'`
   * under RTL. It only decides the oversized case, where no offset can contain
   * the item and one edge has to win. Defaults to `'left'`.
   */
  logicalStart?: 'left' | 'right';
}

/**
 * Sub-pixel tolerance. Fractional rects are routine at non-integer zoom and
 * under transform; without a tolerance a permanently-half-a-pixel-short tab
 * would rewrite the scroll offset on every observation and fight the user.
 */
const EPSILON = 0.5;

/**
 * Scroll delta that brings `item` inside `view` on one axis.
 *
 * @returns The amount to ADD to the scroller's current offset. `0` when the
 *   item is already contained.
 *
 * @remarks
 * When the item is wider than the scrollport no delta can contain it, so the
 * LOGICAL START edge wins: reading a truncated label from its start is useful,
 * from its end is not. That case is decided FIRST, because it also satisfies
 * the "starts before the view" test and would otherwise be handled by accident.
 */
export function computeTabRevealDelta(geometry: TabsRevealAxisGeometry): number {
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

/** `parseFloat` that answers 0 for the empty strings a detached style returns. */
function pixels(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Bring `tab` into view inside `list` ON THE INLINE AXIS ONLY.
 *
 * @param direction - Writing direction of the tablist, resolved by the caller
 *   (the engine already owns that resolution for its overflow arithmetic).
 * @returns The inline delta applied. `0` when nothing moved.
 *
 * @remarks
 * NON-OVERFLOWING TABLISTS ARE SKIPPED ENTIRELY. A list whose content fits has
 * nothing to reveal, so any movement it produced would be pure side effect —
 * this is the guard whose absence made the old `scrollIntoView` yank the page
 * on lists that never scrolled.
 *
 * INLINE ONLY, DELIBERATELY. The block axis is not a scrollport this control
 * offers; an `overflow: hidden` box is still PROGRAMMATICALLY scrollable, and a
 * user with no scrollbar, wheel target or keyboard affordance cannot shift it
 * back. `scrollTop` is never read and never written here.
 *
 * Borders are subtracted because `getBoundingClientRect` measures the border
 * box while scrolling happens inside the padding box.
 */
export function revealTabWithinList(
  list: HTMLElement,
  tab: HTMLElement,
  direction: 'ltr' | 'rtl' = 'ltr'
): number {
  if (list.scrollWidth - list.clientWidth <= 1) return 0;

  const view = list.getBoundingClientRect();
  const rect = tab.getBoundingClientRect();
  const styles = getComputedStyle(list);

  const inline = computeTabRevealDelta({
    logicalStart: direction === 'rtl' ? 'right' : 'left',
    viewStart: view.left + pixels(styles.borderLeftWidth),
    viewEnd: view.right - pixels(styles.borderRightWidth),
    itemStart: rect.left,
    itemEnd: rect.right,
  });

  // Write only on a real move: a no-op assignment still emits `scroll` in some
  // engines, and this runs on every layout observation.
  if (inline !== 0) list.scrollLeft += inline;

  return inline;
}
