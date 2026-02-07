/**
 * ApprovalWorkflow - All Presets
 */

import type { ApprovalWorkflowPreset } from '../core';
import { EditorApprovalWorkflow } from './editor';
import { SummaryApprovalWorkflow } from './summary';

export { EditorApprovalWorkflow } from './editor';
export { SummaryApprovalWorkflow } from './summary';

export const APPROVAL_WORKFLOW_PRESETS: Record<ApprovalWorkflowPreset, React.ComponentType<any>> = {
  editor: EditorApprovalWorkflow,
  summary: SummaryApprovalWorkflow,
};
