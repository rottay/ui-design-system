/**
 * BhCalibrationSample - All Presets
 */

import type { BhCalibrationSamplePreset, BhCalibrationSampleProps } from '../core';
import type { ComponentType } from 'react';
import { ReviewBhCalibrationSample } from './review';
import { CompactBhCalibrationSample } from './compact';

export { ReviewBhCalibrationSample } from './review';
export { CompactBhCalibrationSample } from './compact';

export const BH_CALIBRATION_SAMPLE_PRESETS: Record<BhCalibrationSamplePreset, ComponentType<BhCalibrationSampleProps>> = {
  'review': ReviewBhCalibrationSample,
  'compact': CompactBhCalibrationSample,
};
