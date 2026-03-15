/**
 * BhCalibrationScatter - All Presets
 */

import type { BhCalibrationScatterPreset, BhCalibrationScatterProps } from '../core';
import type { ComponentType } from 'react';
import { ChartBhCalibrationScatter } from './chart';
import { CompactBhCalibrationScatter } from './compact';

export { ChartBhCalibrationScatter } from './chart';
export { CompactBhCalibrationScatter } from './compact';

export const BH_CALIBRATION_SCATTER_PRESETS: Record<BhCalibrationScatterPreset, ComponentType<BhCalibrationScatterProps>> = {
  'chart': ChartBhCalibrationScatter,
  'compact': CompactBhCalibrationScatter,
};
