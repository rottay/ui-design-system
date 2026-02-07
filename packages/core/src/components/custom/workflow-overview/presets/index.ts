/**
 * WorkflowOverview - All Presets
 */

import type { WorkflowOverviewPreset } from '../core';
import { CanvasWorkflowOverview } from './canvas';
import { ListWorkflowOverview } from './list';

export { CanvasWorkflowOverview } from './canvas';
export { ListWorkflowOverview } from './list';

export const WORKFLOW_OVERVIEW_PRESETS: Record<WorkflowOverviewPreset, React.ComponentType<any>> = {
  canvas: CanvasWorkflowOverview,
  list: ListWorkflowOverview,
};
