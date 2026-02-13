/**
 * BhDiversityDashboard - Main Export
 * Diversity metrics and analytics dashboard for BitHire ATS platform
 */

import type { BhDiversityDashboardProps } from './core';
import { BH_DIVERSITY_DASHBOARD_DEFAULTS } from './core';
import { BH_DIVERSITY_DASHBOARD_PRESETS } from './presets';

export {
  type BhDiversityDashboardProps,
  type BhDiversityDashboardPreset,
  type DiversityMetric,
  type DiversitySegment,
  BH_DIVERSITY_DASHBOARD_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhDiversityDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhDiversityDashboard(props: BhDiversityDashboardProps): React.ReactElement {
  const preset = props.preset ?? BH_DIVERSITY_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_DIVERSITY_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhDiversityDashboard.displayName = 'BhDiversityDashboard';

export { DashboardBhDiversityDashboard, CompactBhDiversityDashboard } from './presets';
