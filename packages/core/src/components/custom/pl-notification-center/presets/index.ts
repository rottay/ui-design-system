/**
 * PlNotificationCenter - All Presets
 */

export { PanelPlNotificationCenter } from './panel';
export { PopoverPlNotificationCenter } from './popover';

import type { PlNotificationCenterPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlNotificationCenterProps } from '../core';
import { PanelPlNotificationCenter } from './panel';
import { PopoverPlNotificationCenter } from './popover';

export const PL_NOTIFICATION_CENTER_PRESETS: Record<PlNotificationCenterPreset, ComponentType<PlNotificationCenterProps>> = {
  panel: PanelPlNotificationCenter,
  popover: PopoverPlNotificationCenter,
};
