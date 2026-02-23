/**
 * BhEngagementSparkline - Main Export
 * SVG-based sparkline for displaying engagement score history.
 */

import type { BhEngagementSparklineProps } from './core';
import { BH_ENGAGEMENT_SPARKLINE_DEFAULTS } from './core';
import { BH_ENGAGEMENT_SPARKLINE_PRESETS } from './presets';

export {
  type BhEngagementSparklineProps,
  type BhEngagementSparklinePreset,
  type SparklineDataPoint,
  BH_ENGAGEMENT_SPARKLINE_DEFAULTS,
} from './core';
export * from './presets';

export function BhEngagementSparkline(props: BhEngagementSparklineProps): React.ReactElement {
  const preset = props.preset ?? BH_ENGAGEMENT_SPARKLINE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_ENGAGEMENT_SPARKLINE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhEngagementSparkline.displayName = 'BhEngagementSparkline';

export { StandardBhEngagementSparkline } from './presets';
