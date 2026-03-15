/**
 * BhApprovalCenter - All Presets
 */

import type { BhApprovalCenterPreset, BhApprovalCenterProps } from '../core';
import type { ComponentType } from 'react';
import { HubBhApprovalCenter } from './hub';
import { CompactBhApprovalCenter } from './compact';

export { HubBhApprovalCenter } from './hub';
export { CompactBhApprovalCenter } from './compact';

export const BH_APPROVAL_CENTER_PRESETS: Record<BhApprovalCenterPreset, ComponentType<BhApprovalCenterProps>> = {
  hub: HubBhApprovalCenter,
  compact: CompactBhApprovalCenter,
};
