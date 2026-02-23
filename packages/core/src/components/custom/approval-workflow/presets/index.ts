/**
 * ApprovalWorkflow - All Presets
 */

import type { ApprovalWorkflowPreset, ApprovalWorkflowProps } from '../core';
import type { ComponentType } from 'react';
import { EditorApprovalWorkflow } from './editor';
import { SummaryApprovalWorkflow } from './summary';

export { EditorApprovalWorkflow } from './editor';
export { SummaryApprovalWorkflow } from './summary';

export const APPROVAL_WORKFLOW_PRESETS: Record<ApprovalWorkflowPreset, ComponentType<ApprovalWorkflowProps>> = {
  editor: EditorApprovalWorkflow,
  summary: SummaryApprovalWorkflow,
};
