/**
 * BhApprovalDetail - All Presets
 */

import type { BhApprovalDetailPreset, BhApprovalDetailProps } from '../core';
import type { ComponentType } from 'react';
import { DrawerBhApprovalDetail } from './drawer';
import { CompactBhApprovalDetail } from './compact';

export { DrawerBhApprovalDetail } from './drawer';
export { CompactBhApprovalDetail } from './compact';

export const BH_APPROVAL_DETAIL_PRESETS: Record<BhApprovalDetailPreset, ComponentType<BhApprovalDetailProps>> = {
  drawer: DrawerBhApprovalDetail,
  compact: CompactBhApprovalDetail,
};
