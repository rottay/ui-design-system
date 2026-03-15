/**
 * BhCalibrationDrift - Main Export
 * Dashboard monitoring panel for interviewer scoring consistency.
 */

import type { BhCalibrationDriftProps } from './core';
import { BH_CALIBRATION_DRIFT_DEFAULTS } from './core';
import { BH_CALIBRATION_DRIFT_PRESETS } from './presets';

export {
  type BhCalibrationDriftProps,
  type BhCalibrationDriftPreset,
  type InterviewerDrift,
  type DriftAlert,
  type DriftDataPoint,
  type DriftControlLimits,
  type CalibrationSummary,
  BH_CALIBRATION_DRIFT_DEFAULTS,
  getDriftStatusColor,
  getDriftDirectionLabel,
  toControlChartData,
} from './core';
export * from './presets';

export function BhCalibrationDrift(props: BhCalibrationDriftProps): React.ReactElement {
  const preset = props.preset ?? BH_CALIBRATION_DRIFT_DEFAULTS.preset ?? 'monitoring';
  const PresetComponent = BH_CALIBRATION_DRIFT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCalibrationDrift.displayName = 'BhCalibrationDrift';

export { MonitoringBhCalibrationDrift } from './presets';
