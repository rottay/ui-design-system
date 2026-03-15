/**
 * EvZoneCapacity - Main Export
 * Zone capacity monitoring
 * Automatically selects preset based on props
 */

import type { EvZoneCapacityProps } from './core';
import { EV_ZONE_CAPACITY_DEFAULTS } from './core';
import { EV_ZONE_CAPACITY_PRESETS } from './presets';

export {
  type EvZoneCapacityProps,
  type EvZoneCapacityPreset,
  type ZoneInfo as EvZoneCapacityZoneInfo,
  type FlowData as EvZoneCapacityFlowData,
  EV_ZONE_CAPACITY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvZoneCapacity component
 * Renders the appropriate preset based on the preset prop
 */
export function EvZoneCapacity(props: EvZoneCapacityProps): React.ReactElement {
  const preset = props.preset ?? EV_ZONE_CAPACITY_DEFAULTS.preset ?? 'map';
  const PresetComponent = EV_ZONE_CAPACITY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvZoneCapacity.displayName = 'EvZoneCapacity';

export { MapEvZoneCapacity, DashboardEvZoneCapacity } from './presets';
