/**
 * @fileoverview The collection-header adaptation: whether the hero rail runs
 * its compact composition, per posture.
 *
 * One boolean, because the family asks its space exactly one question. The
 * answer then decides WHICH ELEMENTS RENDER -- the eyebrow's column, the
 * editorial-tech divider and rule, the overflow menu, the icon-only action
 * collapse -- plus the rail's gaps and justification. That is content reflow,
 * so it must follow the header's OWN box: the same header in a narrow rail on
 * a desktop page runs compact, while a wide rail on a phone keeps whatever the
 * viewport already decided.
 *
 * @module Contracts/Kernel/Adaptation/Families/CollectionHeader
 * @category Types
 * @package @rottay/design-system
 */

import type { Adapt } from '../../../foundation';

export interface CollectionHeaderAdaptation {
  /** The rail renders its compact composition. */
  readonly compactLayout?: boolean;
}

export interface ResolvedCollectionHeaderAdaptation {
  readonly compactLayout: boolean;
}

/**
 * The family narrows and never widens: a compact box runs the compact
 * composition whatever the viewport says, and every wider posture keeps
 * whatever the header already resolved.
 *
 * There is deliberately NO viewport entry here. The header's base already
 * answers the viewport (`compact ?? isPhoneOrTablet`), so a `phone` default
 * would be a second, competing decision about the same axis -- and would
 * silently outrank an explicit `compact={false}`. With the container entry
 * alone, a header that declares no `adapt` and whose box has not been measured
 * renders exactly as it did before the slot existed.
 */
export const COLLECTION_HEADER_ADAPT_DEFAULTS: Adapt<CollectionHeaderAdaptation> = Object.freeze({
  compact: Object.freeze({ compactLayout: true }),
});
