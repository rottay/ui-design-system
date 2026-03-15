/**
 * BhComparisonView - Main Export
 * Side-by-side candidate comparison with radar chart and decision actions for BitHire ATS
 */

import type { BhComparisonViewProps } from './core';
import { BH_COMPARISON_VIEW_DEFAULTS } from './core';
import { BH_COMPARISON_VIEW_PRESETS } from './presets';

export {
  type BhComparisonViewProps,
  type BhComparisonViewPreset,
  type ComparisonCandidate,
  type ComparisonRow,
  type CandidateDecision,
  BH_COMPARISON_VIEW_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhComparisonView component
 * Renders the appropriate preset based on the preset prop
 */
export function BhComparisonView(props: BhComparisonViewProps): React.ReactElement {
  const preset = props.preset ?? BH_COMPARISON_VIEW_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_COMPARISON_VIEW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhComparisonView.displayName = 'BhComparisonView';

export { StandardBhComparisonView } from './presets';
