/**
 * BhApprovalChain - All Presets
 */

import type { BhApprovalChainPreset } from '../core';
import { VerticalBhApprovalChain } from './vertical';
import { CompactBhApprovalChain } from './compact';

export { VerticalBhApprovalChain } from './vertical';
export { CompactBhApprovalChain } from './compact';

export const BH_APPROVAL_CHAIN_PRESETS: Record<BhApprovalChainPreset, React.ComponentType<any>> = {
  vertical: VerticalBhApprovalChain,
  compact: CompactBhApprovalChain,
};
