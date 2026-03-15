/**
 * StaffDirectory - Main Export
 * Staff member directory with skills, certifications, availability, rate
 */

import type { StaffDirectoryProps } from './core';
import { STAFF_DIRECTORY_DEFAULTS } from './core';
import { STAFF_DIRECTORY_PRESETS } from './presets';

export {
  type StaffDirectoryProps,
  type StaffDirectoryPreset,
  type StaffDirectoryMember,
  type StaffDirectoryFilter,
  STAFF_DIRECTORY_DEFAULTS,
} from './core';
export * from './presets';

export function StaffDirectory(props: StaffDirectoryProps): React.ReactElement {
  const preset = props.preset ?? STAFF_DIRECTORY_DEFAULTS.preset ?? 'cards';
  const PresetComponent = STAFF_DIRECTORY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

StaffDirectory.displayName = 'StaffDirectory';

export { CardsStaffDirectory, TableStaffDirectory } from './presets';
