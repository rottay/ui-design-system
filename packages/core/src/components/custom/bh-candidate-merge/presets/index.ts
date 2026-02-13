/**
 * BhCandidateMerge - All Presets
 */

import type { BhCandidateMergePreset } from '../core';
import { MergeBhCandidateMerge } from './merge';
import { CompactBhCandidateMerge } from './compact';

export { MergeBhCandidateMerge } from './merge';
export { CompactBhCandidateMerge } from './compact';

export const BH_CANDIDATE_MERGE_PRESETS: Record<BhCandidateMergePreset, React.ComponentType<any>> = {
  'merge': MergeBhCandidateMerge,
  'compact': CompactBhCandidateMerge,
};
