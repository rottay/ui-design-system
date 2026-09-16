/**
 * @fileoverview Segmented reveal — anatomy binding over the shared geometry.
 * @module Segmented/Runtime/Reveal
 * @category Navigation
 * @package @rottay/design-system
 *
 * @remarks
 * The Segmented root scrolls rather than clipping, so the selected option has
 * to be brought back inside the scrollport after arrow navigation. The reveal
 * ARITHMETIC is not a Segmented concern — Pagination's joined controls row has
 * the identical scrollport problem — so it lives in
 * `primitives/foundation/scroll-reveal`, below both categories. What stays here
 * is the only Segmented-specific part: which element is "the selected option".
 *
 * The shared unit explains why `scrollIntoView` is not used and why only the
 * inline axis is ever written.
 */

import { revealInlineWithinScroller } from '../../../../foundation/scroll-reveal';

/** Anatomy hook for the currently selected option. */
export const SELECTED_OPTION_SELECTOR = '[data-part="option"][aria-checked="true"]';

/**
 * Reveal the selected option inside a Segmented root.
 *
 * @returns The element revealed, or `null` when there is no selection.
 *
 * `isRtl` arrives from the caller, which is a component and reads the i18n
 * authority; nothing here measures direction.
 */
export function revealSelectedOption(root: HTMLElement, isRtl: boolean): HTMLElement | null {
  const selected = root.querySelector<HTMLElement>(SELECTED_OPTION_SELECTOR);
  if (!selected) return null;
  revealInlineWithinScroller(root, selected, isRtl);
  return selected;
}
