/**
 * BhScorecardDetail - Main Export
 * Individual Scorecard Detail for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhScorecardDetailProps } from './core';
import { BH_SCORECARD_DETAIL_DEFAULTS } from './core';
import { BH_SCORECARD_DETAIL_PRESETS } from './presets';

export {
  type BhScorecardDetailProps,
  type BhScorecardDetailPreset,
  type ScoreLevel,
  type ScorecardHeader,
  type ScorecardDimension,
  type DimensionEvidence,
  type OverrideInfo,
  type CohortComparison,
  type ScorecardSortBy,
  type ScorecardView,
  BH_SCORECARD_DETAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhScorecardDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhScorecardDetail(props: BhScorecardDetailProps): React.ReactElement {
  const preset = props.preset ?? BH_SCORECARD_DETAIL_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_SCORECARD_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhScorecardDetail.displayName = 'BhScorecardDetail';

export { FullBhScorecardDetail, SummaryBhScorecardDetail } from './presets';
