/**
 * BhCandidateMerge - Main Export
 * Duplicate detection with field-level merge UI
 */

import type { BhCandidateMergeProps } from './core';
import { BH_CANDIDATE_MERGE_DEFAULTS } from './core';
import { BH_CANDIDATE_MERGE_PRESETS } from './presets';

export {
  type BhCandidateMergeProps,
  type BhCandidateMergePreset,
  type MergeCandidate,
  type MergeField,
  BH_CANDIDATE_MERGE_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCandidateMerge component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCandidateMerge(props: BhCandidateMergeProps): React.ReactElement {
  const preset = props.preset ?? BH_CANDIDATE_MERGE_DEFAULTS.preset ?? 'merge';
  const PresetComponent = BH_CANDIDATE_MERGE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCandidateMerge.displayName = 'BhCandidateMerge';
