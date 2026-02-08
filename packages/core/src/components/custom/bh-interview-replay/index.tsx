/**
 * BhInterviewReplay - Main Export
 * Transcript player + score overlay
 */

import type { BhInterviewReplayProps } from './core';
import { BH_INTERVIEW_REPLAY_DEFAULTS } from './core';
import { BH_INTERVIEW_REPLAY_PRESETS } from './presets';

export { type BhInterviewReplayProps, type BhInterviewReplayPreset, type TranscriptEntry, type ScoreOverlayPoint, type EvidenceMarker, type PersonaInfo, type ReplayScoreSummary, type SpeakerRole, BH_INTERVIEW_REPLAY_DEFAULTS } from './core';
export * from './presets';

export function BhInterviewReplay(props: BhInterviewReplayProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_REPLAY_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_INTERVIEW_REPLAY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewReplay.displayName = 'BhInterviewReplay';

export { FullBhInterviewReplay, CompactBhInterviewReplay } from './presets';
