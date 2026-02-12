/**
 * StaffAvailabilityGrid - Main Export
 * Weekly availability grid per staff member
 */

import type { StaffAvailabilityGridProps } from './core';
import { STAFF_AVAILABILITY_GRID_DEFAULTS } from './core';
import { STAFF_AVAILABILITY_GRID_PRESETS } from './presets';

export {
  type StaffAvailabilityGridProps,
  type StaffAvailabilityGridPreset,
  type StaffAvailabilityEntry,
  type AvailabilitySlot,
  STAFF_AVAILABILITY_GRID_DEFAULTS,
} from './core';
export * from './presets';

export function StaffAvailabilityGrid(props: StaffAvailabilityGridProps): React.ReactElement {
  const preset = props.preset ?? STAFF_AVAILABILITY_GRID_DEFAULTS.preset ?? 'grid';
  const PresetComponent = STAFF_AVAILABILITY_GRID_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffAvailabilityGrid.displayName = 'StaffAvailabilityGrid';

export { GridStaffAvailabilityGrid, CompactStaffAvailabilityGrid } from './presets';
