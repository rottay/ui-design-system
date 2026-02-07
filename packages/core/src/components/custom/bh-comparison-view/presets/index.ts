/**
 * BhComparisonView - All Presets
 */

import type { BhComparisonViewPreset } from '../core';
import { StandardBhComparisonView } from './standard';

export { StandardBhComparisonView } from './standard';

export const BH_COMPARISON_VIEW_PRESETS: Record<BhComparisonViewPreset, React.ComponentType<any>> = {
  standard: StandardBhComparisonView,
};
