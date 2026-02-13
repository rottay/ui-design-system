/**
 * BhApprovalCenter - All Presets
 */

import type { BhApprovalCenterPreset } from '../core';
import { HubBhApprovalCenter } from './hub';
import { CompactBhApprovalCenter } from './compact';

export { HubBhApprovalCenter } from './hub';
export { CompactBhApprovalCenter } from './compact';

export const BH_APPROVAL_CENTER_PRESETS: Record<BhApprovalCenterPreset, React.ComponentType<any>> = {
  hub: HubBhApprovalCenter,
  compact: CompactBhApprovalCenter,
};
