/**
 * BhProcessDesigner - Main Export
 * Visual workflow builder for hiring process templates.
 */

import type { BhProcessDesignerProps } from './core';
import { BH_PROCESS_DESIGNER_DEFAULTS } from './core';
import { BH_PROCESS_DESIGNER_PRESETS } from './presets';

export {
  type BhProcessDesignerProps,
  type BhProcessDesignerPreset,
  type StageType,
  type KnockoutRule,
  type ScoringRubric,
  type ProcessStage,
  type ProcessTemplate,
  BH_PROCESS_DESIGNER_DEFAULTS,
} from './core';
export * from './presets';

export function BhProcessDesigner(props: BhProcessDesignerProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCESS_DESIGNER_DEFAULTS.preset ?? 'visual';
  const PresetComponent = BH_PROCESS_DESIGNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProcessDesigner.displayName = 'BhProcessDesigner';

export { VisualBhProcessDesigner, CompactBhProcessDesigner } from './presets';
