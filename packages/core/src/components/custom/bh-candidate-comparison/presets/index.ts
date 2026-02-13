/**
 * BhCandidateComparison - All Presets
 */

import type { BhCandidateComparisonPreset } from '../core';
import { SideBySideBhCandidateComparison } from './side-by-side';
import { OverlayBhCandidateComparison } from './overlay';

export { SideBySideBhCandidateComparison } from './side-by-side';
export { OverlayBhCandidateComparison } from './overlay';

export const BH_CANDIDATE_COMPARISON_PRESETS: Record<BhCandidateComparisonPreset, React.ComponentType<any>> = {
  'side-by-side': SideBySideBhCandidateComparison,
  'overlay': OverlayBhCandidateComparison,
};
