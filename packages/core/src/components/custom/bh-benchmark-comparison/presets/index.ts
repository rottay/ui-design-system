/**
 * BhBenchmarkComparison - All Presets
 */

import type { BhBenchmarkComparisonPreset, BhBenchmarkComparisonProps } from '../core';
import type { ComponentType } from 'react';
import { CompactBhBenchmarkComparison } from './compact';

export { CompactBhBenchmarkComparison } from './compact';

export const BH_BENCHMARK_COMPARISON_PRESETS: Record<BhBenchmarkComparisonPreset, ComponentType<BhBenchmarkComparisonProps>> = {
  compact: CompactBhBenchmarkComparison,
};
