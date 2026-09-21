/**
 * @fileoverview The edit-fields adaptation: how many tracks the ledger's field
 * region keeps, per posture.
 *
 * The region is measured on its OWN box, not on the viewport: an inline editor
 * inside a narrow rail collapses while the same editor on the same page at full
 * width keeps the caller's tracks.
 *
 * @module Contracts/Kernel/Adaptation/Families/EditFields
 * @category Types
 * @package @rottay/design-system
 */

import type { Adapt } from '../../../foundation';

/** The ledger read: one labelled field per row. */
export const EDIT_FIELDS_SINGLE_TRACK = 'minmax(0, 1fr)';

export interface EditFieldsAdaptation {
  /** `grid-template-columns` for the field region. */
  readonly columns?: string;
}

export interface ResolvedEditFieldsAdaptation {
  readonly columns: string;
}

/**
 * The family narrows and never widens: a phone request and a compact box both
 * fall to the single-track ledger, and every wider posture keeps whatever the
 * caller declared.
 */
export const EDIT_FIELDS_ADAPT_DEFAULTS: Adapt<EditFieldsAdaptation> = Object.freeze({
  phone: Object.freeze({ columns: EDIT_FIELDS_SINGLE_TRACK }),
  compact: Object.freeze({ columns: EDIT_FIELDS_SINGLE_TRACK }),
});
