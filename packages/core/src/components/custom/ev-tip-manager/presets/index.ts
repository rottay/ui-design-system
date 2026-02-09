/**
 * EvTipManager - All Presets
 */

export { PerformerEvTipManager } from './performer';
export { AdminEvTipManager } from './admin';

import type { EvTipManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTipManagerProps } from '../core';
import { PerformerEvTipManager } from './performer';
import { AdminEvTipManager } from './admin';

export const EV_TIP_MANAGER_PRESETS: Record<EvTipManagerPreset, ComponentType<EvTipManagerProps>> = {
  performer: PerformerEvTipManager,
  admin: AdminEvTipManager,
};
