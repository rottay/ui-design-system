/**
 * BhCalibrationDashboard - All Presets
 */

import type { BhCalibrationDashboardPreset } from '../core';
import { DashboardBhCalibrationDashboard } from './dashboard';
import { CompactBhCalibrationDashboard } from './compact';

export { DashboardBhCalibrationDashboard } from './dashboard';
export { CompactBhCalibrationDashboard } from './compact';

export const BH_CALIBRATION_DASHBOARD_PRESETS: Record<BhCalibrationDashboardPreset, React.ComponentType<any>> = {
  'dashboard': DashboardBhCalibrationDashboard,
  'compact': CompactBhCalibrationDashboard,
};
