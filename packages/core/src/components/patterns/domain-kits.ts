/**
 * @fileoverview Legacy domain-specific patterns barrel.
 *
 * These patterns are classic-engine-only, domain-specific components that were
 * historically surfaced alongside the main patterns barrel. They are kept here
 * for in-repo compatibility only and are not part of the canonical public API.
 *
 * Usage:
 *   import { PatternApprovalInbox } from './approval-inbox';
 *
 * Prefer the corresponding surface or canonical pattern entrypoint where one
 * exists; this barrel is a legacy compatibility layer inside the source tree.
 */

// ApprovalInbox (deprecated -- use DecisionInboxSurface)
export { PatternApprovalInbox } from './approval-inbox';
export type { ApprovalInboxProps, ApprovalItem, ApprovalGroup } from './approval-inbox';

// ModerationGallery
export { PatternModerationGallery } from './moderation-gallery';
export type { ModerationGalleryProps, ModerationItem, ModerationBulkAction } from './moderation-gallery';

// OperationalLedger
export { PatternOperationalLedger } from './operational-ledger';
export type { OperationalLedgerProps, LedgerEntry, LedgerFilter } from './operational-ledger';

// ShiftMatrix
export { PatternShiftMatrix } from './shift-matrix';
export type { ShiftMatrixProps, ShiftTimeSlot, ShiftAssignment } from './shift-matrix';
