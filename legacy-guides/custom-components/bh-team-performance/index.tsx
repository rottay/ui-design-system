/**
 * BhTeamPerformance - Main Export
 * BarChart comparing team performance metrics for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhTeamPerformanceProps } from './core';
import { BH_TEAM_PERFORMANCE_DEFAULTS } from './core';
import { BH_TEAM_PERFORMANCE_PRESETS } from './presets';

export {
  type BhTeamPerformanceProps,
  type BhTeamPerformancePreset,
  type TeamPerfData,
  BH_TEAM_PERFORMANCE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhTeamPerformance component
 * Renders the appropriate preset based on the preset prop
 */
export function BhTeamPerformance(props: BhTeamPerformanceProps): React.ReactElement {
  const preset = props.preset ?? BH_TEAM_PERFORMANCE_DEFAULTS.preset ?? 'chart';
  const PresetComponent = BH_TEAM_PERFORMANCE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhTeamPerformance.displayName = 'BhTeamPerformance';

export { ChartBhTeamPerformance, CompactBhTeamPerformance } from './presets';
