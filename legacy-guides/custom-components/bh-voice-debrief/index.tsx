/**
 * BhVoiceDebrief - Main Export
 * Dashboard widget showing voice debrief sessions at a glance.
 */

import type { BhVoiceDebriefProps } from './core';
import { BH_VOICE_DEBRIEF_DEFAULTS } from './core';
import { BH_VOICE_DEBRIEF_PRESETS } from './presets';

export {
  type BhVoiceDebriefProps,
  type BhVoiceDebriefPreset,
  type VoiceDebriefSession,
  type KeyMoment,
  BH_VOICE_DEBRIEF_DEFAULTS,
} from './core';
export * from './presets';

export function BhVoiceDebrief(props: BhVoiceDebriefProps): React.ReactElement {
  const preset = props.preset ?? BH_VOICE_DEBRIEF_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_VOICE_DEBRIEF_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhVoiceDebrief.displayName = 'BhVoiceDebrief';

export { CompactBhVoiceDebrief } from './presets';
