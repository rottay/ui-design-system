/**
 * BhDiversityDashboard - All Presets
 */

import type { BhDiversityDashboardPreset } from '../core';
import { DashboardBhDiversityDashboard } from './dashboard';
import { CompactBhDiversityDashboard } from './compact';

export { DashboardBhDiversityDashboard } from './dashboard';
export { CompactBhDiversityDashboard } from './compact';

export const BH_DIVERSITY_DASHBOARD_PRESETS: Record<BhDiversityDashboardPreset, React.ComponentType<any>> = {
  'dashboard': DashboardBhDiversityDashboard,
  'compact': CompactBhDiversityDashboard,
};
