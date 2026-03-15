/**
 * BhCandidateProfile - All Presets
 */

export { FullBhCandidateProfile } from './full';
export { CompactBhCandidateProfile } from './compact';

import type { BhCandidateProfilePreset } from '../core';
import type { ComponentType } from 'react';
import type { BhCandidateProfileProps } from '../core';
import { FullBhCandidateProfile } from './full';
import { CompactBhCandidateProfile } from './compact';

export const BH_CANDIDATE_PROFILE_PRESETS: Record<BhCandidateProfilePreset, ComponentType<BhCandidateProfileProps>> = {
  full: FullBhCandidateProfile,
  compact: CompactBhCandidateProfile,
};
