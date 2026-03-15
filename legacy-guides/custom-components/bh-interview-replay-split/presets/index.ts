/**
 * BhInterviewReplaySplit - All Presets
 */

export { SplitBhInterviewReplaySplit } from './split';
export { CompactBhInterviewReplaySplit } from './compact';

import type { BhInterviewReplaySplitPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhInterviewReplaySplitProps } from '../core';
import { SplitBhInterviewReplaySplit } from './split';
import { CompactBhInterviewReplaySplit } from './compact';

export const BH_INTERVIEW_REPLAY_SPLIT_PRESETS: Record<BhInterviewReplaySplitPreset, ComponentType<BhInterviewReplaySplitProps>> = {
  split: SplitBhInterviewReplaySplit,
  compact: CompactBhInterviewReplaySplit,
};
