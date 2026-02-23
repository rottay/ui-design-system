/**
 * BhCalibrationDrift - All Presets
 */

import type { BhCalibrationDriftPreset, BhCalibrationDriftProps } from '../core';
import type { ComponentType } from 'react';
import { MonitoringBhCalibrationDrift } from './monitoring';

export { MonitoringBhCalibrationDrift } from './monitoring';

export const BH_CALIBRATION_DRIFT_PRESETS: Record<BhCalibrationDriftPreset, ComponentType<BhCalibrationDriftProps>> = {
  monitoring: MonitoringBhCalibrationDrift,
};
