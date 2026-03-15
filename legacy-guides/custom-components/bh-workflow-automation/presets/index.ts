/**
 * BhWorkflowAutomation - All Presets
 */

export { BuilderBhWorkflowAutomation } from './builder';
export { CompactBhWorkflowAutomation } from './compact';

import type { BhWorkflowAutomationPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhWorkflowAutomationProps } from '../core';
import { BuilderBhWorkflowAutomation } from './builder';
import { CompactBhWorkflowAutomation } from './compact';

export const BH_WORKFLOW_AUTOMATION_PRESETS: Record<BhWorkflowAutomationPreset, ComponentType<BhWorkflowAutomationProps>> = {
  builder: BuilderBhWorkflowAutomation,
  compact: CompactBhWorkflowAutomation,
};
