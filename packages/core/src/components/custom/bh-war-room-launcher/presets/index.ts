/**
 * BhWarRoomLauncher - All Presets
 */

export { CompactBhWarRoomLauncher } from './compact';

import type { BhWarRoomLauncherPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhWarRoomLauncherProps } from '../core';
import { CompactBhWarRoomLauncher } from './compact';

export const BH_WAR_ROOM_LAUNCHER_PRESETS: Record<BhWarRoomLauncherPreset, ComponentType<BhWarRoomLauncherProps>> = {
  compact: CompactBhWarRoomLauncher,
};
