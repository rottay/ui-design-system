/**
 * StaffAvailabilityGrid - All Presets
 */

export { GridStaffAvailabilityGrid } from './grid';
export { CompactStaffAvailabilityGrid } from './compact';

import type { StaffAvailabilityGridPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffAvailabilityGridProps } from '../core';
import { GridStaffAvailabilityGrid } from './grid';
import { CompactStaffAvailabilityGrid } from './compact';

export const STAFF_AVAILABILITY_GRID_PRESETS: Record<StaffAvailabilityGridPreset, ComponentType<StaffAvailabilityGridProps>> = {
  grid: GridStaffAvailabilityGrid,
  compact: CompactStaffAvailabilityGrid,
};
