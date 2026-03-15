/**
 * EvCommandCenter - All Presets
 */

export { FullscreenEvCommandCenter } from './fullscreen';
export { MobileEvCommandCenter } from './mobile';

import type { EvCommandCenterPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvCommandCenterProps } from '../core';
import { FullscreenEvCommandCenter } from './fullscreen';
import { MobileEvCommandCenter } from './mobile';

export const EV_COMMAND_CENTER_PRESETS: Record<EvCommandCenterPreset, ComponentType<EvCommandCenterProps>> = {
  fullscreen: FullscreenEvCommandCenter,
  mobile: MobileEvCommandCenter,
};
