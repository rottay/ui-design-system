/**
 * BhScorecardDetail - Main Export
 * Detailed scorecard view with dimension breakdowns for BitHire ATS platform
 */

import type { BhScorecardDetailProps } from './core';
import { BH_SCORECARD_DETAIL_DEFAULTS } from './core';
import { BH_SCORECARD_DETAIL_PRESETS } from './presets';

export {
  type BhScorecardDetailProps,
  type BhScorecardDetailPreset,
  type DimensionScore,
  type ScorecardDetail,
  BH_SCORECARD_DETAIL_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhScorecardDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhScorecardDetail(props: BhScorecardDetailProps): React.ReactElement {
  const preset = props.preset ?? BH_SCORECARD_DETAIL_DEFAULTS.preset ?? 'panel';
  const PresetComponent = BH_SCORECARD_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhScorecardDetail.displayName = 'BhScorecardDetail';

export { PanelBhScorecardDetail, CompactBhScorecardDetail, FullBhScorecardDetail, SummaryBhScorecardDetail } from './presets';
