/**
 * EvDjDashboard - Main Export
 * DJ/Artist dashboard
 * Automatically selects preset based on props
 */

import type { EvDjDashboardProps } from './core';
import { EV_DJ_DASHBOARD_DEFAULTS } from './core';
import { EV_DJ_DASHBOARD_PRESETS } from './presets';

export {
  type EvDjDashboardProps,
  type EvDjDashboardPreset,
  type GigInfo as EvDjDashboardGigInfo,
  type SessionStat as EvDjDashboardSessionStat,
  type TipSummary as EvDjDashboardTipSummary,
  type RequestHistory as EvDjDashboardRequestHistory,
  EV_DJ_DASHBOARD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvDjDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function EvDjDashboard(props: EvDjDashboardProps): React.ReactElement {
  const preset = props.preset ?? EV_DJ_DASHBOARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = EV_DJ_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvDjDashboard.displayName = 'EvDjDashboard';

export { StandardEvDjDashboard, CompactEvDjDashboard } from './presets';
