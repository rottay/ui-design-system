/**
 * BhVoiceDebriefPlayer - Main Export
 * Full debrief experience for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhVoiceDebriefPlayerProps } from './core';
import { BH_VOICE_DEBRIEF_PLAYER_DEFAULTS } from './core';
import { BH_VOICE_DEBRIEF_PLAYER_PRESETS } from './presets';

export {
  type BhVoiceDebriefPlayerProps,
  type BhVoiceDebriefPlayerPreset,
  type DebriefRecording,
  type TranscriptSegment,
  type KeyMoment,
  type SentimentTimeline,
  BH_VOICE_DEBRIEF_PLAYER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhVoiceDebriefPlayer component
 * Renders the appropriate preset based on the preset prop
 */
export function BhVoiceDebriefPlayer(props: BhVoiceDebriefPlayerProps): React.ReactElement {
  const preset = props.preset ?? BH_VOICE_DEBRIEF_PLAYER_DEFAULTS.preset ?? 'recorder';
  const PresetComponent = BH_VOICE_DEBRIEF_PLAYER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhVoiceDebriefPlayer.displayName = 'BhVoiceDebriefPlayer';

export { RecorderBhVoiceDebriefPlayer, ReviewBhVoiceDebriefPlayer } from './presets';
