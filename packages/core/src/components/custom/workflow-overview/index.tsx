/**
 * WorkflowOverview - Main Export
 * Automatically selects preset based on props
 */

import type { WorkflowOverviewProps } from './core';
import { WORKFLOW_OVERVIEW_DEFAULTS } from './core';
import { WORKFLOW_OVERVIEW_PRESETS } from './presets';

export { type WorkflowOverviewProps, type WorkflowOverviewPreset, type WorkflowNode, type NodeConnection, type NodeAction, type NodeType, type NodeStatus, type WorkflowTab, WORKFLOW_OVERVIEW_DEFAULTS } from './core';
export * from './presets';

/**
 * WorkflowOverview component
 * Renders the appropriate preset based on the preset prop
 */
export function WorkflowOverview(props: WorkflowOverviewProps): React.ReactElement {
  const preset = props.preset ?? WORKFLOW_OVERVIEW_DEFAULTS.preset ?? 'canvas';
  const PresetComponent = WORKFLOW_OVERVIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

WorkflowOverview.displayName = 'WorkflowOverview';

export { CanvasWorkflowOverview, ListWorkflowOverview } from './presets';
