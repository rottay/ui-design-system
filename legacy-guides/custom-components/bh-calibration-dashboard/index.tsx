/**
 * BhCalibrationDashboard - Main Export
 * Calibration session management dashboard for BitHire ATS platform
 */

import type { BhCalibrationDashboardProps } from './core';
import { BH_CALIBRATION_DASHBOARD_DEFAULTS } from './core';
import { BH_CALIBRATION_DASHBOARD_PRESETS } from './presets';

export {
  type BhCalibrationDashboardProps,
  type BhCalibrationDashboardPreset,
  type CalibrationSession,
  type CalibrationMetrics,
  BH_CALIBRATION_DASHBOARD_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCalibrationDashboard component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCalibrationDashboard(props: BhCalibrationDashboardProps): React.ReactElement {
  const preset = props.preset ?? BH_CALIBRATION_DASHBOARD_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = BH_CALIBRATION_DASHBOARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCalibrationDashboard.displayName = 'BhCalibrationDashboard';

export { DashboardBhCalibrationDashboard, CompactBhCalibrationDashboard } from './presets';
