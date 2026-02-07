/**
 * BhPositionDetail - Main Export
 * Position / Client Requisition Detail for BitHire ATS platform
 * Automatically selects preset based on props
 */

import type { BhPositionDetailProps } from './core';
import { BH_POSITION_DETAIL_DEFAULTS } from './core';
import { BH_POSITION_DETAIL_PRESETS } from './presets';

export {
  type BhPositionDetailProps,
  type BhPositionDetailPreset,
  type PositionInfo,
  type RequirementSummary,
  type LinkedJob,
  type TeamAssignment,
  type FinancialTracker,
  type SlaMonitor,
  type SlaMilestone,
  type PositionEvent,
  type PositionStatus,
  type FeeStructure,
  type PositionEventType,
  type PositionTab,
  BH_POSITION_DETAIL_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhPositionDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhPositionDetail(props: BhPositionDetailProps): React.ReactElement {
  const preset = props.preset ?? BH_POSITION_DETAIL_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_POSITION_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhPositionDetail.displayName = 'BhPositionDetail';

export { StandardBhPositionDetail } from './presets';
