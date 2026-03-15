/**
 * BhClientDirectory - Main Export
 * Client Management Directory for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhClientDirectoryProps } from './core';
import { BH_CLIENT_DIRECTORY_DEFAULTS } from './core';
import { BH_CLIENT_DIRECTORY_PRESETS } from './presets';

export {
  type BhClientDirectoryProps,
  type BhClientDirectoryPreset,
  type ClientType,
  type ClientStatus,
  type ClientTier,
  type ApprovalStatus,
  type ClientContact,
  type ClientItem,
  type ClientFilter,
  type ViewMode,
  BH_CLIENT_DIRECTORY_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhClientDirectory component
 * Renders the appropriate preset based on the preset prop
 */
export function BhClientDirectory(props: BhClientDirectoryProps): React.ReactElement {
  const preset = props.preset ?? BH_CLIENT_DIRECTORY_DEFAULTS.preset ?? 'directory';
  const PresetComponent = BH_CLIENT_DIRECTORY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhClientDirectory.displayName = 'BhClientDirectory';

export { DirectoryBhClientDirectory, CardsBhClientDirectory } from './presets';
