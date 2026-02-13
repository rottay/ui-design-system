/**
 * BhApprovalCenter - Main Export
 * Central hub for approvals grouped by entity type in BitHire ATS platform
 */

import type { BhApprovalCenterProps } from './core';
import { BH_APPROVAL_CENTER_DEFAULTS } from './core';
import { BH_APPROVAL_CENTER_PRESETS } from './presets';

export {
  type BhApprovalCenterProps,
  type BhApprovalCenterPreset,
  type ApprovalItem,
  BH_APPROVAL_CENTER_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhApprovalCenter component
 * Renders the appropriate preset based on the preset prop
 */
export function BhApprovalCenter(props: BhApprovalCenterProps): React.ReactElement {
  const preset = props.preset ?? BH_APPROVAL_CENTER_DEFAULTS.preset ?? 'hub';
  const PresetComponent = BH_APPROVAL_CENTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhApprovalCenter.displayName = 'BhApprovalCenter';
