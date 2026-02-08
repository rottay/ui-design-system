/**
 * BhInterviewReplay - All Presets
 */

import type { BhInterviewReplayPreset } from '../core';
import { FullBhInterviewReplay } from './full';
import { CompactBhInterviewReplay } from './compact';

export { FullBhInterviewReplay } from './full';
export { CompactBhInterviewReplay } from './compact';

export const BH_INTERVIEW_REPLAY_PRESETS: Record<BhInterviewReplayPreset, React.ComponentType<any>> = {
  full: FullBhInterviewReplay,
  compact: CompactBhInterviewReplay,
};
