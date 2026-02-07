/**
 * BhCandidateOutreach - All Presets
 */

import type { BhCandidateOutreachPreset } from '../core';
import { ComposerBhCandidateOutreach } from './composer';
import { TrackerBhCandidateOutreach } from './tracker';

export { ComposerBhCandidateOutreach } from './composer';
export { TrackerBhCandidateOutreach } from './tracker';

export const BH_CANDIDATE_OUTREACH_PRESETS: Record<BhCandidateOutreachPreset, React.ComponentType<any>> = {
  composer: ComposerBhCandidateOutreach,
  tracker: TrackerBhCandidateOutreach,
};
