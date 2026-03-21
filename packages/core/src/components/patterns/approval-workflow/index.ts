'use client';

/**
 * @fileoverview ApprovalWorkflow pattern -- multi-step approval chain with
 * status tracking, comments, and action buttons. Renders a vertical approval
 * pipeline where each step can be approved, rejected, or escalated.
 *
 * Used by: Offer approvals (bh), PurchaseOrders (bar), ShiftSwaps (staff), Refunds (pm).
 */

import { createEngineComponent } from '../../../runtime/engines/factory';
import type { ApprovalWorkflowProps } from './ApprovalWorkflow.types';

export type { ApprovalWorkflowProps, ApprovalStep, ApprovalStatus } from './ApprovalWorkflow.types';

export const PatternApprovalWorkflow = createEngineComponent<ApprovalWorkflowProps>(
  'PatternApprovalWorkflow',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
