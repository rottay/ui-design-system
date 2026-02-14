/**
 * BhInterviewPlayer - Main Export
 * Interview Replay player for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhInterviewPlayerProps } from './core';
import { BH_INTERVIEW_PLAYER_DEFAULTS } from './core';
import { BH_INTERVIEW_PLAYER_PRESETS } from './presets';

export {
  type BhInterviewPlayerProps,
  type BhInterviewPlayerPreset,
  type RecruiterInterview,
  type TranscriptLine,
  type EvidenceHighlight,
  type ScorecardDimension,
  type InterviewScorecard,
  type TimestampedNote,
  type AiInsight,
  type InterviewInfo,
  BH_INTERVIEW_PLAYER_DEFAULTS,
  getLevelColors,
  getInsightCategoryColors,
  formatTime,
  generateWaveformPoints,
  getDimensionScoreColor,
  getDimensionScoreGradient,
} from './core';
export * from './presets';

/**
 * BhInterviewPlayer component
 * Renders the appropriate preset based on the preset prop
 */
export function BhInterviewPlayer(props: BhInterviewPlayerProps): React.ReactElement {
  const preset = props.preset ?? BH_INTERVIEW_PLAYER_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_INTERVIEW_PLAYER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhInterviewPlayer.displayName = 'BhInterviewPlayer';

export { FullBhInterviewPlayer, TranscriptOnlyBhInterviewPlayer } from './presets';
