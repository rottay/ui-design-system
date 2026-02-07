/**
 * BhCalibrationView - Main Export
 * Human-AI Calibration for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhCalibrationViewProps } from './core';
import { BH_CALIBRATION_VIEW_DEFAULTS } from './core';
import { BH_CALIBRATION_VIEW_PRESETS } from './presets';

export {
  type BhCalibrationViewProps,
  type BhCalibrationViewPreset,
  type CalibrationSample,
  type TranscriptLine,
  type AlignmentMetrics,
  type DimensionAdjustment,
  BH_CALIBRATION_VIEW_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhCalibrationView component
 * Renders the appropriate preset based on the preset prop
 */
export function BhCalibrationView(props: BhCalibrationViewProps): React.ReactElement {
  const preset = props.preset ?? BH_CALIBRATION_VIEW_DEFAULTS.preset ?? 'session';
  const PresetComponent = BH_CALIBRATION_VIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhCalibrationView.displayName = 'BhCalibrationView';

export { SessionBhCalibrationView, ResultsBhCalibrationView } from './presets';
