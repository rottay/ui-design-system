/**
 * BhInterviewReplayEnhanced - All Presets
 */

import type { BhInterviewReplayEnhancedPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhInterviewReplayEnhancedProps } from '../core';
import { SplitBhInterviewReplayEnhanced } from './split';
import { CompactBhInterviewReplayEnhanced } from './compact';

export { SplitBhInterviewReplayEnhanced } from './split';
export { CompactBhInterviewReplayEnhanced } from './compact';

export const BH_INTERVIEW_REPLAY_ENHANCED_PRESETS: Record<BhInterviewReplayEnhancedPreset, ComponentType<BhInterviewReplayEnhancedProps>> = {
  split: SplitBhInterviewReplayEnhanced,
  compact: CompactBhInterviewReplayEnhanced,
};
