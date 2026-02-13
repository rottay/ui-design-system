/**
 * BhApprovalDetail - All Presets
 */

import type { BhApprovalDetailPreset } from '../core';
import { DrawerBhApprovalDetail } from './drawer';
import { CompactBhApprovalDetail } from './compact';

export { DrawerBhApprovalDetail } from './drawer';
export { CompactBhApprovalDetail } from './compact';

export const BH_APPROVAL_DETAIL_PRESETS: Record<BhApprovalDetailPreset, React.ComponentType<any>> = {
  drawer: DrawerBhApprovalDetail,
  compact: CompactBhApprovalDetail,
};
