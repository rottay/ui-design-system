/**
 * PlUserDirectory - Main Export
 * Browse and search the user directory with filtering, sorting, and bulk actions
 */

import type { PlUserDirectoryProps } from './core';
import { PL_USER_DIRECTORY_DEFAULTS } from './core';
import { PL_USER_DIRECTORY_PRESETS } from './presets';

export { type PlUserDirectoryProps, type PlUserDirectoryPreset, PL_USER_DIRECTORY_DEFAULTS } from './core';
export * from './presets';

export function PlUserDirectory(props: PlUserDirectoryProps): React.ReactElement {
  const preset = props.preset ?? PL_USER_DIRECTORY_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_USER_DIRECTORY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlUserDirectory.displayName = 'PlUserDirectory';
