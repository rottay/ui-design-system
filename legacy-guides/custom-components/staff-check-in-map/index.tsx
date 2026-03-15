/**
 * StaffCheckInMap - Main Export
 * Map view with geolocation-based check-in/out tracking
 */

import type { StaffCheckInMapProps } from './core';
import { STAFF_CHECK_IN_MAP_DEFAULTS } from './core';
import { STAFF_CHECK_IN_MAP_PRESETS } from './presets';

export {
  type StaffCheckInMapProps,
  type StaffCheckInMapPreset,
  type CheckInRecord,
  STAFF_CHECK_IN_MAP_DEFAULTS,
} from './core';
export * from './presets';

export function StaffCheckInMap(props: StaffCheckInMapProps): React.ReactElement {
  const preset = props.preset ?? STAFF_CHECK_IN_MAP_DEFAULTS.preset ?? 'map';
  const PresetComponent = STAFF_CHECK_IN_MAP_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffCheckInMap.displayName = 'StaffCheckInMap';

export { MapStaffCheckInMap, ListStaffCheckInMap } from './presets';
