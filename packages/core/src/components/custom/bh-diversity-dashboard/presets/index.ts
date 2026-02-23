/**
 * BhDiversityDashboard - All Presets
 */

import type { BhDiversityDashboardPreset, BhDiversityDashboardProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhDiversityDashboard } from './dashboard';
import { CompactBhDiversityDashboard } from './compact';

export { DashboardBhDiversityDashboard } from './dashboard';
export { CompactBhDiversityDashboard } from './compact';

export const BH_DIVERSITY_DASHBOARD_PRESETS: Record<BhDiversityDashboardPreset, ComponentType<BhDiversityDashboardProps>> = {
  'dashboard': DashboardBhDiversityDashboard,
  'compact': CompactBhDiversityDashboard,
};
