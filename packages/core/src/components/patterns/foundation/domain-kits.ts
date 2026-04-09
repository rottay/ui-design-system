/**
 * @fileoverview Legacy domain-specific patterns barrel.
 *
 * These patterns are classic-engine-only, domain-specific components that were
 * historically surfaced alongside the main patterns barrel. They are kept here
 * for in-repo compatibility only and are not part of the canonical public API.
 *
 * Usage:
 *   import { PatternApprovalInbox } from '../workflow/approval-inbox';
 *
 * Prefer the corresponding surface or canonical pattern entrypoint where one
 * exists; this barrel is a legacy compatibility layer inside the source tree.
 */

// ApprovalInbox (deprecated -- use DecisionInboxSurface)
export { PatternApprovalInbox } from '../workflow/approval-inbox';
export type { ApprovalInboxProps, ApprovalItem, ApprovalGroup } from '../workflow/approval-inbox';

// ModerationGallery
export { PatternModerationGallery } from '../workflow/moderation-gallery';
export type { ModerationGalleryProps, ModerationItem, ModerationBulkAction } from '../workflow/moderation-gallery';

// OperationalLedger
export { PatternOperationalLedger } from '../workflow/operational-ledger';
export type { OperationalLedgerProps, LedgerEntry, LedgerFilter } from '../workflow/operational-ledger';

// ShiftMatrix
export { PatternShiftMatrix } from '../workflow/shift-matrix';
export type { ShiftMatrixProps, ShiftTimeSlot, ShiftAssignment } from '../workflow/shift-matrix';
