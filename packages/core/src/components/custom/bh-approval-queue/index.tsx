/**
 * BhApprovalQueue - Main Export
 * Pending Approvals Queue for BitHire ATS platform
 */

import type { BhApprovalQueueProps } from './core';
import { BH_APPROVAL_QUEUE_DEFAULTS } from './core';
import { BH_APPROVAL_QUEUE_PRESETS } from './presets';

export {
  type BhApprovalQueueProps,
  type BhApprovalQueuePreset,
  type ApprovalCategory,
  type ApprovalItem,
  type ApprovalDetail,
  type ApprovalStats,
  type ApprovalHistory,
  BH_APPROVAL_QUEUE_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhApprovalQueue component
 * Renders the appropriate preset based on the preset prop
 */
export function BhApprovalQueue(props: BhApprovalQueueProps): React.ReactElement {
  const preset = props.preset ?? BH_APPROVAL_QUEUE_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_APPROVAL_QUEUE_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhApprovalQueue.displayName = 'BhApprovalQueue';

export { StandardBhApprovalQueue } from './presets';
