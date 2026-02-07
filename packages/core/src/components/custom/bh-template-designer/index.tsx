/**
 * BhTemplateDesigner - Main Export
 * Evaluation Template Builder for BitHire ATS platform
 */

import type { BhTemplateDesignerProps } from './core';
import { BH_TEMPLATE_DESIGNER_DEFAULTS } from './core';
import { BH_TEMPLATE_DESIGNER_PRESETS } from './presets';

export {
  type BhTemplateDesignerProps,
  type BhTemplateDesignerPreset,
  type TemplateStage,
  type StageType,
  type AutomationRule,
  type TemplateVersion,
  type ValidationItem,
  type ValidationStatus,
  type AvailableAgent,
  type AvailableRubric,
  type TemplateStatus,
  BH_TEMPLATE_DESIGNER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTemplateDesigner component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTemplateDesigner(props: BhTemplateDesignerProps): React.ReactElement {
  const preset = props.preset ?? BH_TEMPLATE_DESIGNER_DEFAULTS.preset ?? 'canvas';
  const PresetComponent = BH_TEMPLATE_DESIGNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTemplateDesigner.displayName = 'BhTemplateDesigner';

export { CanvasBhTemplateDesigner, FormBhTemplateDesigner } from './presets';
