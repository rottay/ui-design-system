/**
 * BhCandidateComparison - Main Export
 * Side-by-side 2-4 candidates, radar overlay, delta table
 */

import type { BhCandidateComparisonProps } from './core';
import { BH_CANDIDATE_COMPARISON_DEFAULTS } from './core';
import { BH_CANDIDATE_COMPARISON_PRESETS } from './presets';

export {
  type BhCandidateComparisonProps,
  type BhCandidateComparisonPreset,
  type ComparisonCandidate,
  BH_CANDIDATE_COMPARISON_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCandidateComparison component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateComparison(props: BhCandidateComparisonProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_COMPARISON_DEFAULTS.preset ?? 'side-by-side';
  const PresetComponent = BH_CANDIDATE_COMPARISON_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateComparison.displayName = 'BhCandidateComparison';
