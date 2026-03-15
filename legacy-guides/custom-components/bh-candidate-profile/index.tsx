/**
 * BhCandidateProfile - Main Export
 * Comprehensive Candidate View for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhCandidateProfileProps } from './core';
import { BH_CANDIDATE_PROFILE_DEFAULTS } from './core';
import { BH_CANDIDATE_PROFILE_PRESETS } from './presets';

export {
  type BhCandidateProfileProps,
  type BhCandidateProfilePreset,
  type CandidateTab,
  type CandidateInfo,
  type CandidateSkill,
  type Experience,
  type Education,
  type CandidateApplication,
  type CandidateInterview,
  type ScoreCard,
  type CandidateNote,
  type CandidateEvent,
  type CandidateStats,
  BH_CANDIDATE_PROFILE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhCandidateProfile component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateProfile(props: BhCandidateProfileProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_PROFILE_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_CANDIDATE_PROFILE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateProfile.displayName = 'BhCandidateProfile';

export { FullBhCandidateProfile, CompactBhCandidateProfile } from './presets';
