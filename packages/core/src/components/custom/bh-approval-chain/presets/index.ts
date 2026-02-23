/**
 * BhApprovalChain - All Presets
 */

import type { BhApprovalChainPreset, BhApprovalChainProps } from '../core';
import type { ComponentType } from 'react';
import { VerticalBhApprovalChain } from './vertical';
import { CompactBhApprovalChain } from './compact';

export { VerticalBhApprovalChain } from './vertical';
export { CompactBhApprovalChain } from './compact';

export const BH_APPROVAL_CHAIN_PRESETS: Record<BhApprovalChainPreset, ComponentType<BhApprovalChainProps>> = {
  vertical: VerticalBhApprovalChain,
  compact: CompactBhApprovalChain,
};
