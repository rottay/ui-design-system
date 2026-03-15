/**
 * BhWorkflowAutomation - Main Export
 * Visual rule builder WHEN/IF/THEN for BitHire ATS platform
 */

import type { BhWorkflowAutomationProps } from './core';
import { BH_WORKFLOW_AUTOMATION_DEFAULTS } from './core';
import { BH_WORKFLOW_AUTOMATION_PRESETS } from './presets';

export {
  type BhWorkflowAutomationProps,
  type BhWorkflowAutomationPreset,
  type WorkflowRule,
  BH_WORKFLOW_AUTOMATION_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhWorkflowAutomation component
 * Renders the appropriate preset based on the preset prop
 */
export function BhWorkflowAutomation(props: BhWorkflowAutomationProps): React.ReactElement {
  const preset = props.preset ?? BH_WORKFLOW_AUTOMATION_DEFAULTS.preset ?? 'builder';
  const PresetComponent = BH_WORKFLOW_AUTOMATION_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhWorkflowAutomation.displayName = 'BhWorkflowAutomation';

export { BuilderBhWorkflowAutomation, CompactBhWorkflowAutomation } from './presets';
