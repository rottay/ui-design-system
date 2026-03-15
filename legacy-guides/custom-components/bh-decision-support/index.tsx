/**
 * BhDecisionSupport - Main Export
 * Dashboard widget providing AI-driven hiring decision support.
 */

import type { BhDecisionSupportProps } from './core';
import { BH_DECISION_SUPPORT_DEFAULTS } from './core';
import { BH_DECISION_SUPPORT_PRESETS } from './presets';

export {
  type BhDecisionSupportProps,
  type BhDecisionSupportPreset,
  type DecisionSupportData,
  type CandidateComparison,
  BH_DECISION_SUPPORT_DEFAULTS,
  getConfidenceColor,
  getProbabilityColor,
} from './core';
export * from './presets';

export function BhDecisionSupport(props: BhDecisionSupportProps): React.ReactElement {
  const preset = props.preset ?? BH_DECISION_SUPPORT_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_DECISION_SUPPORT_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhDecisionSupport.displayName = 'BhDecisionSupport';

export { CompactBhDecisionSupport } from './presets';
