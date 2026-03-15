/**
 * BhCalibrationScatter - Main Export
 * Human vs AI score scatter plot for calibration analysis in BitHire ATS platform
 */

import type { BhCalibrationScatterProps } from './core';
import { BH_CALIBRATION_SCATTER_DEFAULTS } from './core';
import { BH_CALIBRATION_SCATTER_PRESETS } from './presets';

export {
  type BhCalibrationScatterProps,
  type BhCalibrationScatterPreset,
  type ScatterPoint,
  type CalibrationStats,
  BH_CALIBRATION_SCATTER_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCalibrationScatter component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCalibrationScatter(props: BhCalibrationScatterProps): React.ReactElement {
  const preset = props.preset ?? BH_CALIBRATION_SCATTER_DEFAULTS.preset ?? 'chart';
  const PresetComponent = BH_CALIBRATION_SCATTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCalibrationScatter.displayName = 'BhCalibrationScatter';

export { ChartBhCalibrationScatter, CompactBhCalibrationScatter } from './presets';
