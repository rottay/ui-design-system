/**
 * BhApprovalDetail - Main Export
 * Approval detail drawer/panel for BitHire ATS platform
 */

import type { BhApprovalDetailProps } from './core';
import { BH_APPROVAL_DETAIL_DEFAULTS } from './core';
import { BH_APPROVAL_DETAIL_PRESETS } from './presets';

export {
  type BhApprovalDetailProps,
  type BhApprovalDetailPreset,
  type ApprovalDetailData,
  BH_APPROVAL_DETAIL_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhApprovalDetail component
 * Renders the appropriate preset based on the preset prop
 */
export function BhApprovalDetail(props: BhApprovalDetailProps): React.ReactElement {
  const preset = props.preset ?? BH_APPROVAL_DETAIL_DEFAULTS.preset ?? 'drawer';
  const PresetComponent = BH_APPROVAL_DETAIL_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhApprovalDetail.displayName = 'BhApprovalDetail';
