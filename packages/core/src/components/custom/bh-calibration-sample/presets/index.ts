/**
 * BhCalibrationSample - All Presets
 */

import type { BhCalibrationSamplePreset } from '../core';
import { ReviewBhCalibrationSample } from './review';
import { CompactBhCalibrationSample } from './compact';

export { ReviewBhCalibrationSample } from './review';
export { CompactBhCalibrationSample } from './compact';

export const BH_CALIBRATION_SAMPLE_PRESETS: Record<BhCalibrationSamplePreset, React.ComponentType<any>> = {
  'review': ReviewBhCalibrationSample,
  'compact': CompactBhCalibrationSample,
};
