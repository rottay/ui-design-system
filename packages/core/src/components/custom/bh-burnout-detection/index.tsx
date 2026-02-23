/**
 * BhBurnoutDetection - Main Export
 * Dashboard widget for monitoring recruiter burnout risk and team health.
 */

import type { BhBurnoutDetectionProps } from './core';
import { BH_BURNOUT_DETECTION_DEFAULTS } from './core';
import { BH_BURNOUT_DETECTION_PRESETS } from './presets';

export {
  type BhBurnoutDetectionProps,
  type BhBurnoutDetectionPreset,
  type BurnoutData,
  type BurnoutRecruiter,
  BH_BURNOUT_DETECTION_DEFAULTS,
  getBurnoutColor,
  getBurnoutIcon,
} from './core';
export * from './presets';

export function BhBurnoutDetection(props: BhBurnoutDetectionProps): React.ReactElement {
  const preset = props.preset ?? BH_BURNOUT_DETECTION_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_BURNOUT_DETECTION_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhBurnoutDetection.displayName = 'BhBurnoutDetection';

export { CompactBhBurnoutDetection } from './presets';
