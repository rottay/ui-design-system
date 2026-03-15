/**
 * BhCandidateComparison - All Presets
 */

import type { BhCandidateComparisonPreset, BhCandidateComparisonProps } from '../core';
import type { ComponentType } from 'react';
import { SideBySideBhCandidateComparison } from './side-by-side';
import { OverlayBhCandidateComparison } from './overlay';

export { SideBySideBhCandidateComparison } from './side-by-side';
export { OverlayBhCandidateComparison } from './overlay';

export const BH_CANDIDATE_COMPARISON_PRESETS: Record<BhCandidateComparisonPreset, ComponentType<BhCandidateComparisonProps>> = {
  'side-by-side': SideBySideBhCandidateComparison,
  'overlay': OverlayBhCandidateComparison,
};
