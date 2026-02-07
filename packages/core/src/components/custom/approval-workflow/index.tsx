/**
 * ApprovalWorkflow - Main Export
 * Automatically selects preset based on props
 */

import type { ApprovalWorkflowProps } from './core';
import { APPROVAL_WORKFLOW_DEFAULTS } from './core';
import { APPROVAL_WORKFLOW_PRESETS } from './presets';

export { type ApprovalWorkflowProps, type ApprovalWorkflowPreset, type Approver, type Transition, type WorkflowStatus, type ApprovalOutcome, type ApprovalRule, type StatusCategory, APPROVAL_WORKFLOW_DEFAULTS } from './core';
export { getOutcomeColors, getStatusCategoryColors, getCategoryOptions, formatApproverDisplay } from './core';
export * from './presets';

/**
 * ApprovalWorkflow component
 * Renders the appropriate preset based on the preset prop
 */
export function ApprovalWorkflow(props: ApprovalWorkflowProps): React.ReactElement {
  const preset = props.preset ?? APPROVAL_WORKFLOW_DEFAULTS.preset ?? 'editor';
  const PresetComponent = APPROVAL_WORKFLOW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

ApprovalWorkflow.displayName = 'ApprovalWorkflow';

export { EditorApprovalWorkflow, SummaryApprovalWorkflow } from './presets';
