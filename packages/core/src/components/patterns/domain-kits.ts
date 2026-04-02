/**
 * @fileoverview Domain-Kit Patterns barrel.
 *
 * These patterns are classic-engine-only, domain-specific components that were
 * historically exported from the main patterns barrel. They are NOT part of the
 * canonical pattern API and are separated here for clarity.
 *
 * Usage:
 *   import { PatternApprovalInbox } from '@rottay/design-system/patterns/domain-kits';
 *
 * Or, if the package subpath is not wired, import the individual pattern:
 *   import { PatternApprovalInbox } from './approval-inbox';
 *
 * These will move to components/kits/ in a future restructuring.
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
