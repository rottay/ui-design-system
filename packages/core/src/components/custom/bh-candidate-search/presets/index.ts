/**
 * BhCandidateSearch - All Presets
 */

import type { BhCandidateSearchPreset } from '../core';
import { StandardBhCandidateSearch } from './standard';

export { StandardBhCandidateSearch } from './standard';

export const BH_CANDIDATE_SEARCH_PRESETS: Record<BhCandidateSearchPreset, React.ComponentType<any>> = {
  standard: StandardBhCandidateSearch,
};
