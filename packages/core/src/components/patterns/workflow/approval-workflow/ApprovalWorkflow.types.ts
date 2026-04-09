/**
 * @fileoverview Type definitions for the ApprovalWorkflow pattern component.
 * Defines the five-state {@link ApprovalStatus} union, the {@link ApprovalStep}
 * shape (with status, comment, timestamp, and metadata), and
 * {@link ApprovalWorkflowProps} controlling the approval chain layout
 * and action callbacks.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

/**
 * Possible statuses for an individual approval step.
 *
 * - `'pending'`   -- Awaiting action from the approver.
 * - `'approved'`  -- The approver has approved the request.
 * - `'rejected'`  -- The approver has rejected the request.
 * - `'escalated'` -- The step has been escalated to a higher authority.
 * - `'skipped'`   -- The step was bypassed (e.g., auto-approved or N/A).
 */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'skipped';

/**
 * Represents a single step in an approval chain.
 *
 * Each step corresponds to one approver and tracks their action status,
 * optional comments, the timestamp of their action, and arbitrary metadata
 * (e.g., department, delegation info).
 */
export interface ApprovalStep {
  /** Unique key identifying this step within the workflow. */
  key: string;

  /** Display name of the person responsible for this approval step. */
  approver: string;

  /** Avatar image or icon element representing the approver. */
  avatar?: ReactNode;

  /** Current status of this approval step. */
  status: ApprovalStatus;

  /** Free-text comments left by the approver when acting on this step. */
  comments?: string;

  /**
   * When this step was acted on (approved, rejected, etc.).
   * Accepts an ISO 8601 string or a Date object.
   */
  timestamp?: string | Date;

  /**
   * Additional key-value metadata displayed alongside this step.
   * Values are ReactNode to allow rich rendering (e.g., links, badges).
   */
  metadata?: Record<string, ReactNode>;
}

/**
 * Props for the ApprovalWorkflow pattern component.
 *
 * Renders a sequential approval chain with visual status indicators,
 * approver information, and action buttons for the current step.
 * Supports approve, reject, and escalate actions.
 *
 * @example
 * ```tsx
 * <ApprovalWorkflow
 *   title="Expense Approval"
 *   entity="Expense Report #4521"
 *   steps={[
 *     { key: 'manager', approver: 'Jane Smith', status: 'approved',
 *       timestamp: '2026-03-14T09:00:00Z', comments: 'Looks good' },
 *     { key: 'director', approver: 'Bob Johnson', status: 'pending' },
 *     { key: 'finance', approver: 'Finance Team', status: 'pending' },
 *   ]}
 *   currentStep={1}
 *   onApprove={(stepKey) => handleApprove(stepKey)}
 *   onReject={(stepKey) => handleReject(stepKey)}
 *   onEscalate={(stepKey) => handleEscalate(stepKey)}
 * />
 * ```
 */
export interface ApprovalWorkflowProps extends PatternBaseProps {
  /**
   * Title of the approval workflow, displayed at the top of the component.
   * Accepts ReactNode for rich formatting.
   */
  title: ReactNode;

  /**
   * The entity being approved (e.g., "Offer #1234", "Purchase Order #567").
   * Displayed as a subtitle below the workflow title.
   */
  entity?: ReactNode;

  /** Ordered list of approval steps forming the chain. */
  steps: ApprovalStep[];

  /**
   * Zero-based index of the currently active step.
   * Action buttons (approve/reject/escalate) are shown for this step.
   */
  currentStep?: number;

  /** Callback fired when the current step is approved. Receives the step key. */
  onApprove?: (stepKey: string) => void;

  /** Callback fired when the current step is rejected. Receives the step key. */
  onReject?: (stepKey: string) => void;

  /** Callback fired when the current step is escalated. Receives the step key. */
  onEscalate?: (stepKey: string) => void;

  /**
   * Whether all action buttons (approve, reject, escalate) are disabled.
   * Useful while an async action is in flight.
   */
  actionsDisabled?: boolean;

  /** Extra content rendered below the approval chain (e.g., comment input). */
  footer?: ReactNode;
}
