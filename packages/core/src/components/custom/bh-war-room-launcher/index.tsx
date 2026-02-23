/**
 * BhWarRoomLauncher - Main Export
 * Quick-access widget for war room sessions
 */

import type { BhWarRoomLauncherProps } from './core';
import { BH_WAR_ROOM_LAUNCHER_DEFAULTS } from './core';
import { BH_WAR_ROOM_LAUNCHER_PRESETS } from './presets';

export {
  type BhWarRoomLauncherProps,
  type BhWarRoomLauncherPreset,
  type LauncherSession,
  BH_WAR_ROOM_LAUNCHER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhWarRoomLauncher component
 * Renders the appropriate preset based on the preset prop
 */
export function BhWarRoomLauncher(props: BhWarRoomLauncherProps): React.ReactElement {
  const preset = props.preset ?? BH_WAR_ROOM_LAUNCHER_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_WAR_ROOM_LAUNCHER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhWarRoomLauncher.displayName = 'BhWarRoomLauncher';

export { CompactBhWarRoomLauncher } from './presets';
