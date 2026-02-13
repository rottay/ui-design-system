/**
 * BhRecruiterPerformance - Main Export
 * Radar chart, workload gauges, comparison table for BitHire ATS platform
 */

import type { BhRecruiterPerformanceProps } from './core';
import { BH_RECRUITER_PERFORMANCE_DEFAULTS } from './core';
import { BH_RECRUITER_PERFORMANCE_PRESETS } from './presets';

export {
  type BhRecruiterPerformanceProps,
  type BhRecruiterPerformancePreset,
  type RecruiterMetrics,
  BH_RECRUITER_PERFORMANCE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhRecruiterPerformance component
 * Renders the appropriate preset based on the preset prop
 */
export function BhRecruiterPerformance(props: BhRecruiterPerformanceProps): React.ReactElement {
  const preset = props.preset ?? BH_RECRUITER_PERFORMANCE_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_RECRUITER_PERFORMANCE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhRecruiterPerformance.displayName = 'BhRecruiterPerformance';

export { DashboardBhRecruiterPerformance, CompactBhRecruiterPerformance } from './presets';
