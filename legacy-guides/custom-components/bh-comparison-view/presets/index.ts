/**
 * BhComparisonView - All Presets
 */

import type { BhComparisonViewPreset, BhComparisonViewProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhComparisonView } from './standard';

export { StandardBhComparisonView } from './standard';

export const BH_COMPARISON_VIEW_PRESETS: Record<BhComparisonViewPreset, ComponentType<BhComparisonViewProps>> = {
  standard: StandardBhComparisonView,
};
