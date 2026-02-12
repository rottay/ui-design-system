/**
 * StaffCheckInMap - All Presets
 */

export { MapStaffCheckInMap } from './map';
export { ListStaffCheckInMap } from './list';

import type { StaffCheckInMapPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffCheckInMapProps } from '../core';
import { MapStaffCheckInMap } from './map';
import { ListStaffCheckInMap } from './list';

export const STAFF_CHECK_IN_MAP_PRESETS: Record<StaffCheckInMapPreset, ComponentType<StaffCheckInMapProps>> = {
  map: MapStaffCheckInMap,
  list: ListStaffCheckInMap,
};
