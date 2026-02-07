/**
 * BhDecisionHub - Main Export
 * Hiring Decision Center for the BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhDecisionHubProps } from './core';
import { BH_DECISION_HUB_DEFAULTS } from './core';
import { BH_DECISION_HUB_PRESETS } from './presets';

export {
  type BhDecisionHubProps,
  type BhDecisionHubPreset,
  type DecisionCandidate,
  type DecisionAction,
  type RejectCategory,
  type DecisionRecord,
  type CompareSlot,
  type BulkDecisionEntry,
  type RejectReasonData,
  type AdvanceStepData,
  type DecisionFormData,
  type HistoryFilter,
  BH_DECISION_HUB_DEFAULTS,
} from './core';
export {
  getDecisionActionConfig,
  getRejectCategoryLabel,
  getHistoryFilterOptions,
  getCandidateInitials,
  formatScoreDisplay,
  getScoreColor,
  getScoreTrackColor,
} from './core';
export * from './presets';

/**
 * BhDecisionHub component
 * Renders the appropriate preset based on the preset prop
 */
export function BhDecisionHub(props: BhDecisionHubProps): React.ReactElement {
  const preset = props.preset ?? BH_DECISION_HUB_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_DECISION_HUB_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhDecisionHub.displayName = 'BhDecisionHub';

export { StandardBhDecisionHub, BulkBhDecisionHub } from './presets';
