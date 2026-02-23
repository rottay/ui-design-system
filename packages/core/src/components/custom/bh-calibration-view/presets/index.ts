/**
 * BhCalibrationView - All Presets
 */

import type { BhCalibrationViewPreset, BhCalibrationViewProps } from '../core';
import type { ComponentType } from 'react';
import { SessionBhCalibrationView } from './session';
import { ResultsBhCalibrationView } from './results';

export { SessionBhCalibrationView } from './session';
export { ResultsBhCalibrationView } from './results';

export const BH_CALIBRATION_VIEW_PRESETS: Record<BhCalibrationViewPreset, ComponentType<BhCalibrationViewProps>> = {
  session: SessionBhCalibrationView,
  results: ResultsBhCalibrationView,
};
