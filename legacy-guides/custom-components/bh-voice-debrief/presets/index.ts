/**
 * BhVoiceDebrief - All Presets
 */

import type { BhVoiceDebriefPreset, BhVoiceDebriefProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhVoiceDebrief } from './compact';

export { CompactBhVoiceDebrief } from './compact';

export const BH_VOICE_DEBRIEF_PRESETS: Record<BhVoiceDebriefPreset, ComponentType<BhVoiceDebriefProps>> = {
  compact: CompactBhVoiceDebrief,
};
