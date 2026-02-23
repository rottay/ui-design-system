/**
 * WorkflowOverview - All Presets
 */

import type { WorkflowOverviewPreset, WorkflowOverviewProps } from '../core';
import type { ComponentType } from 'react';
import { CanvasWorkflowOverview } from './canvas';
import { ListWorkflowOverview } from './list';

export { CanvasWorkflowOverview } from './canvas';
export { ListWorkflowOverview } from './list';

export const WORKFLOW_OVERVIEW_PRESETS: Record<WorkflowOverviewPreset, ComponentType<WorkflowOverviewProps>> = {
  canvas: CanvasWorkflowOverview,
  list: ListWorkflowOverview,
};
