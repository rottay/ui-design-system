/**
 * BhCandidateSearch - Main Export
 * Advanced Candidate Search for BitHire ATS platform
 */

import type { BhCandidateSearchProps } from './core';
import { BH_CANDIDATE_SEARCH_DEFAULTS } from './core';
import { BH_CANDIDATE_SEARCH_PRESETS } from './presets';

export {
  type BhCandidateSearchProps,
  type BhCandidateSearchPreset,
  type SearchResult,
  type SavedSearch,
  type SearchFilter,
  type FacetCount,
  BH_CANDIDATE_SEARCH_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCandidateSearch component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateSearch(props: BhCandidateSearchProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_SEARCH_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_CANDIDATE_SEARCH_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateSearch.displayName = 'BhCandidateSearch';

export { StandardBhCandidateSearch } from './presets';
