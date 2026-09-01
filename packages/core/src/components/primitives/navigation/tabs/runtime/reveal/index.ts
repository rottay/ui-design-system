/**
 * @fileoverview Tabs reveal — anatomy binding over the shared geometry.
 * @module Tabs/Runtime/Reveal
 * @category Navigation
 * @package @rottay/design-system
 *
 * @remarks
 * The modern tablist scrolls on the inline axis when the tabs overflow, so the
 * active tab has to be brought back inside the scrollport — otherwise a
 * controlled `activeKey` change selects a tab the user cannot see.
 *
 * The reveal ARITHMETIC is not a Tabs concern — Segmented's option row and
 * Pagination's joined controls row have the identical scrollport problem — so
 * it lives in `primitives/foundation/scroll-reveal`, below all three. This file
 * carried a byte-for-byte copy of it while that shared unit already existed;
 * what stays here is the only Tabs-specific part, the overflow guard.
 *
 * The shared unit explains why `scrollIntoView` is not used (it walks the whole
 * ancestor chain and yanked the document), why only the inline axis is ever
 * written, and why the result is a direction-neutral delta rather than an
 * absolute offset.
 */

import { revealInlineWithinScroller } from '../../../../foundation/scroll-reveal';

/**
 * Bring `tab` into view inside `list` on the inline axis only.
 *
 * @returns The inline delta applied. `0` when nothing moved.
 *
 * @remarks
 * NON-OVERFLOWING TABLISTS ARE SKIPPED ENTIRELY. A list whose content fits has
 * nothing to reveal, so any movement it produced would be pure side effect —
 * this is the guard whose absence made the old `scrollIntoView` yank the page
 * on lists that never scrolled. It is the reason this binding exists rather
 * than the engine calling the shared unit directly.
 */
export function revealTabWithinList(list: HTMLElement, tab: HTMLElement): number {
  if (list.scrollWidth - list.clientWidth <= 1) return 0;
  return revealInlineWithinScroller(list, tab);
}
