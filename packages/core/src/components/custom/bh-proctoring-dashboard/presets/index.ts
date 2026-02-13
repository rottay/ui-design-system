/**
 * BhProctoringDashboard - All Presets
 */

import type { BhProctoringDashboardPreset } from '../core';
import { DashboardBhProctoringDashboard } from './dashboard';
import { CompactBhProctoringDashboard } from './compact';

export { DashboardBhProctoringDashboard } from './dashboard';
export { CompactBhProctoringDashboard } from './compact';

export const BH_PROCTORING_DASHBOARD_PRESETS: Record<BhProctoringDashboardPreset, React.ComponentType<any>> = {
  'dashboard': DashboardBhProctoringDashboard,
  'compact': CompactBhProctoringDashboard,
};
