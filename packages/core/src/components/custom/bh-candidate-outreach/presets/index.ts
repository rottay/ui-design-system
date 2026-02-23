/**
 * BhCandidateOutreach - All Presets
 */

import type { BhCandidateOutreachPreset, BhCandidateOutreachProps } from '../core';
import type { ComponentType } from 'react';
import { ComposerBhCandidateOutreach } from './composer';
import { TrackerBhCandidateOutreach } from './tracker';

export { ComposerBhCandidateOutreach } from './composer';
export { TrackerBhCandidateOutreach } from './tracker';

export const BH_CANDIDATE_OUTREACH_PRESETS: Record<BhCandidateOutreachPreset, ComponentType<BhCandidateOutreachProps>> = {
  composer: ComposerBhCandidateOutreach,
  tracker: TrackerBhCandidateOutreach,
};
