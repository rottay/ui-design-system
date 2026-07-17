/**
 * @fileoverview Type definitions for the ApprovalInbox pattern component.
 *
 * ApprovalInbox renders grouped approval items organized by domain with
 * SLA timers, amount/risk indicators, and batch action capabilities.
 *
 * @module Patterns/ApprovalInbox/Types
 * @category Patterns
 * @package @rottay/design-system
 */

import type { PatternBaseProps } from '../../../../../foundation/contracts/runtime/components/patterns/core';

/**
 * A single approval item within a domain group.
 */
export interface ApprovalItem {
  /** Unique identifier for the approval item. */
  id: string;
  /** Primary title of the approval request. */
  title: string;
  /** Optional secondary description. */
  subtitle?: string;
  /** Monetary amount associated with the request. */
  amount?: number;
  /** Risk level indicator. */
  risk?: 'low' | 'medium' | 'high' | 'critical';
  /** ISO 8601 timestamp of when the request was submitted. */
  submittedAt: string;
  /** ISO 8601 deadline for SLA compliance. When close or past, displays urgency. */
  slaDeadline?: string;
}

/**
 * A group of approval items belonging to a specific domain.
 */
export interface ApprovalGroup {
  /** Domain name used as the group header (e.g., "Finance", "HR", "Compliance"). */
  domain: string;
  /** Approval items within this domain group. */
  items: ApprovalItem[];
}

/**
 * Props for the ApprovalInbox pattern component.
 *
 * Renders grouped approval cards with domain headers, item rows with
 * approve/reject actions, SLA indicators, and a batch action toolbar.
 *
 * @example
 * ```tsx
 * <PatternApprovalInbox
 *   groups={[
 *     {
 *       domain: 'Finance',
 *       items: [
 *         { id: '1', title: 'Invoice #4521', amount: 12500, risk: 'low',
 *           submittedAt: '2026-03-17T09:00:00Z', slaDeadline: '2026-03-19T17:00:00Z' },
 *       ],
 *     },
 *   ]}
 *   onApprove={(id) => approve(id)}
 *   onReject={(id) => reject(id)}
 *   onBatchApprove={(ids) => batchApprove(ids)}
 * />
 * ```
 */
export interface ApprovalInboxProps extends PatternBaseProps {
  /** Approval groups organized by domain. */
  groups: ApprovalGroup[];
  /** Callback fired when a single item is approved. */
  onApprove?: (id: string) => void;
  /** Callback fired when a single item is rejected. */
  onReject?: (id: string) => void;
  /** Callback fired when selected items are batch-approved. */
  onBatchApprove?: (ids: string[]) => void;
  /** Message displayed when there are no approval items. */
  emptyMessage?: string;
}
