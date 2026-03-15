/**
 * BhSourceRoi - Main Export
 * Source channel analysis showing hire rate vs cost by source.
 */

import type { BhSourceRoiProps } from './core';
import { BH_SOURCE_ROI_DEFAULTS } from './core';
import { BH_SOURCE_ROI_PRESETS } from './presets';

export {
  type BhSourceRoiProps,
  type BhSourceRoiPreset,
  type SourceChannel,
  type SourceTrend,
  type SourceRoiSummary,
  BH_SOURCE_ROI_DEFAULTS,
} from './core';
export * from './presets';

export function BhSourceRoi(props: BhSourceRoiProps): React.ReactElement {
  const preset = props.preset ?? BH_SOURCE_ROI_DEFAULTS.preset ?? 'summary';
  const PresetComponent = BH_SOURCE_ROI_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhSourceRoi.displayName = 'BhSourceRoi';

export { SummaryBhSourceRoi, BreakdownBhSourceRoi } from './presets';
