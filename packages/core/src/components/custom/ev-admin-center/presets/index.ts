/**
 * EvAdminCenter - All Presets
 */

export { OverviewEvAdminCenter } from './overview';
export { SystemEvAdminCenter } from './system';

import type { EvAdminCenterPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvAdminCenterProps } from '../core';
import { OverviewEvAdminCenter } from './overview';
import { SystemEvAdminCenter } from './system';

export const EV_ADMIN_CENTER_PRESETS: Record<EvAdminCenterPreset, ComponentType<EvAdminCenterProps>> = {
  overview: OverviewEvAdminCenter,
  system: SystemEvAdminCenter,
};
