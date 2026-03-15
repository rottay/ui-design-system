/**
 * EvDjDashboard - All Presets
 */

export { StandardEvDjDashboard } from './standard';
export { CompactEvDjDashboard } from './compact';

import type { EvDjDashboardPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvDjDashboardProps } from '../core';
import { StandardEvDjDashboard } from './standard';
import { CompactEvDjDashboard } from './compact';

export const EV_DJ_DASHBOARD_PRESETS: Record<EvDjDashboardPreset, ComponentType<EvDjDashboardProps>> = {
  standard: StandardEvDjDashboard,
  compact: CompactEvDjDashboard,
};
