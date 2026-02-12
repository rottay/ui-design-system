/**
 * ApprovalWorkflow - Type Definitions
 *
 * Multi-step approval chain component with status tracking and comments.
 */

import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../../types';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated' | 'skipped';

export interface ApprovalStep {
  /** Unique key for this step */
  key: string;
  /** Display name of the approver */
  approver: string;
  /** Avatar or icon for the approver */
  avatar?: ReactNode;
  /** Current status of this step */
  status: ApprovalStatus;
  /** Optional comments on this step */
  comments?: string;
  /** When this step was acted on */
  timestamp?: string | Date;
  /** Additional metadata */
  metadata?: Record<string, ReactNode>;
}

export interface ApprovalWorkflowProps extends PatternBaseProps {
  /** Title of the approval workflow */
  title: ReactNode;
  /** The entity being approved (e.g. "Offer #1234") */
  entity?: ReactNode;
  /** Ordered list of approval steps */
  steps: ApprovalStep[];
  /** Index of the current active step */
  currentStep?: number;
  /** Handler when current step is approved */
  onApprove?: (stepKey: string) => void;
  /** Handler when current step is rejected */
  onReject?: (stepKey: string) => void;
  /** Handler when current step is escalated */
  onEscalate?: (stepKey: string) => void;
  /** Whether action buttons are disabled */
  actionsDisabled?: boolean;
  /** Extra content rendered below the workflow */
  footer?: ReactNode;
}
