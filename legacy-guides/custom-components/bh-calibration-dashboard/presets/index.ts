/**
 * BhCalibrationDashboard - All Presets
 */

import type { BhCalibrationDashboardPreset, BhCalibrationDashboardProps } from '../core';
import type { ComponentType } from 'react';
import { DashboardBhCalibrationDashboard } from './dashboard';
import { CompactBhCalibrationDashboard } from './compact';

export { DashboardBhCalibrationDashboard } from './dashboard';
export { CompactBhCalibrationDashboard } from './compact';

export const BH_CALIBRATION_DASHBOARD_PRESETS: Record<BhCalibrationDashboardPreset, ComponentType<BhCalibrationDashboardProps>> = {
  'dashboard': DashboardBhCalibrationDashboard,
  'compact': CompactBhCalibrationDashboard,
};
