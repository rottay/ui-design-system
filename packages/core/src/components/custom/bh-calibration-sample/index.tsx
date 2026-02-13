/**
 * BhCalibrationSample - Main Export
 * Calibration sample review for comparing human vs AI scoring
 * in the BitHire ATS platform
 */

import type { BhCalibrationSampleProps } from './core';
import { BH_CALIBRATION_SAMPLE_DEFAULTS } from './core';
import { BH_CALIBRATION_SAMPLE_PRESETS } from './presets';

export {
  type BhCalibrationSampleProps,
  type BhCalibrationSamplePreset,
  type CalibrationSample,
  type CalibrationSampleStatus,
  type DimensionComparison,
  BH_CALIBRATION_SAMPLE_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhCalibrationSample component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCalibrationSample(props: BhCalibrationSampleProps): React.ReactElement {
  const preset = props.preset ?? BH_CALIBRATION_SAMPLE_DEFAULTS.preset ?? 'review';
  const PresetComponent = BH_CALIBRATION_SAMPLE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCalibrationSample.displayName = 'BhCalibrationSample';

export { ReviewBhCalibrationSample, CompactBhCalibrationSample } from './presets';
