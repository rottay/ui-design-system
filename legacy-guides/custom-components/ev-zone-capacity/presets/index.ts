/**
 * EvZoneCapacity - All Presets
 */

export { MapEvZoneCapacity } from './map';
export { DashboardEvZoneCapacity } from './dashboard';

import type { EvZoneCapacityPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvZoneCapacityProps } from '../core';
import { MapEvZoneCapacity } from './map';
import { DashboardEvZoneCapacity } from './dashboard';

export const EV_ZONE_CAPACITY_PRESETS: Record<EvZoneCapacityPreset, ComponentType<EvZoneCapacityProps>> = {
  map: MapEvZoneCapacity,
  dashboard: DashboardEvZoneCapacity,
};
