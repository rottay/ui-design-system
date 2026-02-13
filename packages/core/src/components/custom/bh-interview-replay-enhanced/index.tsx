/**
 * BhInterviewReplayEnhanced - Main Export
 * Enhanced Interview Replay with split waveform, synced transcript,
 * evidence markers, and speed controls.
 */

import type { BhInterviewReplayEnhancedProps } from './core';
import { BH_INTERVIEW_REPLAY_ENHANCED_DEFAULTS } from './core';
import { BH_INTERVIEW_REPLAY_ENHANCED_PRESETS } from './presets';

export {
  type BhInterviewReplayEnhancedProps,
  type BhInterviewReplayEnhancedPreset,
  type TranscriptSegment,
  type EvidenceMarker,
  BH_INTERVIEW_REPLAY_ENHANCED_DEFAULTS,
} from './core';

export * from './presets';

export function BhInterviewReplayEnhanced(props: BhInterviewReplayEnhancedProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_REPLAY_ENHANCED_DEFAULTS.preset ?? 'split';
  const PresetComponent = BH_INTERVIEW_REPLAY_ENHANCED_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BhInterviewReplayEnhanced.displayName = 'BhInterviewReplayEnhanced';
