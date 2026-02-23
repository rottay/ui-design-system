/**
 * BhQuestionEffectiveness - Main Export
 * Dashboard widget showing question effectiveness metrics for interviewers.
 */

import type { BhQuestionEffectivenessProps } from './core';
import { BH_QUESTION_EFFECTIVENESS_DEFAULTS } from './core';
import { BH_QUESTION_EFFECTIVENESS_PRESETS } from './presets';

export {
  type BhQuestionEffectivenessProps,
  type BhQuestionEffectivenessPreset,
  type QuestionEffectivenessData,
  type EffectiveQuestion,
  type DimensionEffectiveness,
  BH_QUESTION_EFFECTIVENESS_DEFAULTS,
  getEffectivenessColor,
  getEffectivenessBadgeColor,
} from './core';
export * from './presets';

export function BhQuestionEffectiveness(props: BhQuestionEffectivenessProps): React.ReactElement {
  const preset = props.preset ?? BH_QUESTION_EFFECTIVENESS_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_QUESTION_EFFECTIVENESS_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhQuestionEffectiveness.displayName = 'BhQuestionEffectiveness';

export { CompactBhQuestionEffectiveness } from './presets';
