/**
 * BhVoiceDebriefPlayer - All Presets
 */

export { RecorderBhVoiceDebriefPlayer } from './recorder';
export { ReviewBhVoiceDebriefPlayer } from './review';

import type { BhVoiceDebriefPlayerPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhVoiceDebriefPlayerProps } from '../core';
import { RecorderBhVoiceDebriefPlayer } from './recorder';
import { ReviewBhVoiceDebriefPlayer } from './review';

export const BH_VOICE_DEBRIEF_PLAYER_PRESETS: Record<BhVoiceDebriefPlayerPreset, ComponentType<BhVoiceDebriefPlayerProps>> = {
  recorder: RecorderBhVoiceDebriefPlayer,
  review: ReviewBhVoiceDebriefPlayer,
};
