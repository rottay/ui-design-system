/**
 * BhBenchmarkComparison - Main Export
 * Dashboard widget comparing recruitment metrics against industry benchmarks.
 */

import type { BhBenchmarkComparisonProps } from './core';
import { BH_BENCHMARK_COMPARISON_DEFAULTS } from './core';
import { BH_BENCHMARK_COMPARISON_PRESETS } from './presets';

export {
  type BhBenchmarkComparisonProps,
  type BhBenchmarkComparisonPreset,
  type BenchmarkData,
  type BenchmarkMetric,
  BH_BENCHMARK_COMPARISON_DEFAULTS,
  getBenchmarkColor,
} from './core';
export * from './presets';

export function BhBenchmarkComparison(props: BhBenchmarkComparisonProps): React.ReactElement {
  const preset = props.preset ?? BH_BENCHMARK_COMPARISON_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_BENCHMARK_COMPARISON_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhBenchmarkComparison.displayName = 'BhBenchmarkComparison';

export { CompactBhBenchmarkComparison } from './presets';
