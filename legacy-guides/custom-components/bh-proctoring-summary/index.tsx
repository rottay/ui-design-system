/**
 * BhProctoringSummary - Main Export
 * Per-candidate summary card with risk score, event breakdown, review status
 */

import type { BhProctoringSummaryProps } from './core';
import { BH_PROCTORING_SUMMARY_DEFAULTS } from './core';
import { BH_PROCTORING_SUMMARY_PRESETS } from './presets';

export {
  type BhProctoringSummaryProps,
  type BhProctoringSummaryPreset,
  type ProctoringEventSeverity,
  type ProctoringEventSeverityValue,
  type SeverityEventCounts,
  BH_PROCTORING_SUMMARY_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhProctoringSummary component
 * Renders the appropriate preset based on the preset prop
 */
export function BhProctoringSummary(props: BhProctoringSummaryProps): React.ReactElement {
  const preset = props.preset ?? BH_PROCTORING_SUMMARY_DEFAULTS.preset ?? 'card';
  const PresetComponent = BH_PROCTORING_SUMMARY_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhProctoringSummary.displayName = 'BhProctoringSummary';

export { CardBhProctoringSummary, InlineBhProctoringSummary } from './presets';
