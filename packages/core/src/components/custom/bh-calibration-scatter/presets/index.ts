/**
 * BhCalibrationScatter - All Presets
 */

import type { BhCalibrationScatterPreset } from '../core';
import { ChartBhCalibrationScatter } from './chart';
import { CompactBhCalibrationScatter } from './compact';

export { ChartBhCalibrationScatter } from './chart';
export { CompactBhCalibrationScatter } from './compact';

export const BH_CALIBRATION_SCATTER_PRESETS: Record<BhCalibrationScatterPreset, React.ComponentType<any>> = {
  'chart': ChartBhCalibrationScatter,
  'compact': CompactBhCalibrationScatter,
};
