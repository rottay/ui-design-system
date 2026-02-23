/**
 * BhQuestionEffectiveness - All Presets
 */

import type { BhQuestionEffectivenessPreset, BhQuestionEffectivenessProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhQuestionEffectiveness } from './compact';

export { CompactBhQuestionEffectiveness } from './compact';

export const BH_QUESTION_EFFECTIVENESS_PRESETS: Record<BhQuestionEffectivenessPreset, ComponentType<BhQuestionEffectivenessProps>> = {
  compact: CompactBhQuestionEffectiveness,
};
