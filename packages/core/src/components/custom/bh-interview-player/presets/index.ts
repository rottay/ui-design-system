/**
 * BhInterviewPlayer - All Presets
 */

export { FullBhInterviewPlayer } from './full';
export { TranscriptOnlyBhInterviewPlayer } from './transcript-only';

import type { BhInterviewPlayerPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhInterviewPlayerProps } from '../core';
import { FullBhInterviewPlayer } from './full';
import { TranscriptOnlyBhInterviewPlayer } from './transcript-only';

export const BH_INTERVIEW_PLAYER_PRESETS: Record<BhInterviewPlayerPreset, ComponentType<BhInterviewPlayerProps>> = {
  full: FullBhInterviewPlayer,
  'transcript-only': TranscriptOnlyBhInterviewPlayer,
};
