/**
 * EvStaffDirectory - Main Export
 * Staff member directory
 * Automatically selects preset based on props
 */

import type { EvStaffDirectoryProps } from './core';
import { EV_STAFF_DIRECTORY_DEFAULTS } from './core';
import { EV_STAFF_DIRECTORY_PRESETS } from './presets';

export {
  type EvStaffDirectoryProps,
  type EvStaffDirectoryPreset,
  type StaffMember as EvStaffDirectoryStaffMember,
  type StaffFilter as EvStaffDirectoryStaffFilter,
  EV_STAFF_DIRECTORY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvStaffDirectory component
 * Renders the appropriate preset based on the preset prop
 */
export function EvStaffDirectory(props: EvStaffDirectoryProps): React.ReactElement {
  const preset = props.preset ?? EV_STAFF_DIRECTORY_DEFAULTS.preset ?? 'cards';
  const PresetComponent = EV_STAFF_DIRECTORY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvStaffDirectory.displayName = 'EvStaffDirectory';

export { CardsEvStaffDirectory, TableEvStaffDirectory } from './presets';
