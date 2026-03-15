/**
 * BhCandidateSearch - All Presets
 */

import type { BhCandidateSearchPreset, BhCandidateSearchProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhCandidateSearch } from './standard';

export { StandardBhCandidateSearch } from './standard';

export const BH_CANDIDATE_SEARCH_PRESETS: Record<BhCandidateSearchPreset, ComponentType<BhCandidateSearchProps>> = {
  standard: StandardBhCandidateSearch,
};
