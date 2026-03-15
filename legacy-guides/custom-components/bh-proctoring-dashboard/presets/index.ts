/**
 * BhProctoringDashboard - All Presets
 */

import type { BhProctoringDashboardPreset, BhProctoringDashboardProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhProctoringDashboard } from './dashboard';
import { CompactBhProctoringDashboard } from './compact';

export { DashboardBhProctoringDashboard } from './dashboard';
export { CompactBhProctoringDashboard } from './compact';

export const BH_PROCTORING_DASHBOARD_PRESETS: Record<BhProctoringDashboardPreset, ComponentType<BhProctoringDashboardProps>> = {
  'dashboard': DashboardBhProctoringDashboard,
  'compact': CompactBhProctoringDashboard,
};
