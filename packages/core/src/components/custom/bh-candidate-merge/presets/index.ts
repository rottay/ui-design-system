/**
 * BhCandidateMerge - All Presets
 */

import type { BhCandidateMergePreset, BhCandidateMergeProps } from '../core';
import type { ComponentType } from 'react';
import { MergeBhCandidateMerge } from './merge';
import { CompactBhCandidateMerge } from './compact';

export { MergeBhCandidateMerge } from './merge';
export { CompactBhCandidateMerge } from './compact';

export const BH_CANDIDATE_MERGE_PRESETS: Record<BhCandidateMergePreset, ComponentType<BhCandidateMergeProps>> = {
  'merge': MergeBhCandidateMerge,
  'compact': CompactBhCandidateMerge,
};
