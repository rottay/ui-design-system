/**
 * EvRevenueMonitor - Main Export
 * Revenue monitoring
 * Automatically selects preset based on props
 */

import type { EvRevenueMonitorProps } from './core';
import { EV_REVENUE_MONITOR_DEFAULTS } from './core';
import { EV_REVENUE_MONITOR_PRESETS } from './presets';

export {
  type EvRevenueMonitorProps,
  type EvRevenueMonitorPreset,
  type RevenueStream as EvRevenueMonitorRevenueStream,
  type RevenueTrend as EvRevenueMonitorRevenueTrend,
  EV_REVENUE_MONITOR_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvRevenueMonitor component
 * Renders the appropriate preset based on the preset prop
 */
export function EvRevenueMonitor(props: EvRevenueMonitorProps): React.ReactElement {
  const preset = props.preset ?? EV_REVENUE_MONITOR_DEFAULTS.preset ?? 'realtime';
  const PresetComponent = EV_REVENUE_MONITOR_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvRevenueMonitor.displayName = 'EvRevenueMonitor';

export { RealtimeEvRevenueMonitor, HistoricalEvRevenueMonitor } from './presets';
