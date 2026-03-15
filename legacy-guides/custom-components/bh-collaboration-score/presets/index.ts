/**
 * BhCollaborationScore - All Presets
 */

import type { BhCollaborationScorePreset, BhCollaborationScoreProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhCollaborationScore } from './compact';

export { CompactBhCollaborationScore } from './compact';

export const BH_COLLABORATION_SCORE_PRESETS: Record<BhCollaborationScorePreset, ComponentType<BhCollaborationScoreProps>> = {
  compact: CompactBhCollaborationScore,
};
