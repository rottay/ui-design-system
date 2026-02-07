/**
 * BhCalibrationView - All Presets
 */

import type { BhCalibrationViewPreset } from '../core';
import { SessionBhCalibrationView } from './session';
import { ResultsBhCalibrationView } from './results';

export { SessionBhCalibrationView } from './session';
export { ResultsBhCalibrationView } from './results';

export const BH_CALIBRATION_VIEW_PRESETS: Record<BhCalibrationViewPreset, React.ComponentType<any>> = {
  session: SessionBhCalibrationView,
  results: ResultsBhCalibrationView,
};
