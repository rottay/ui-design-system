/**
 * BhInterviewReplay - All Presets
 */

import type { BhInterviewReplayPreset, BhInterviewReplayProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhInterviewReplay } from './full';
import { CompactBhInterviewReplay } from './compact';

export { FullBhInterviewReplay } from './full';
export { CompactBhInterviewReplay } from './compact';

export const BH_INTERVIEW_REPLAY_PRESETS: Record<BhInterviewReplayPreset, ComponentType<BhInterviewReplayProps>> = {
  full: FullBhInterviewReplay,
  compact: CompactBhInterviewReplay,
};
