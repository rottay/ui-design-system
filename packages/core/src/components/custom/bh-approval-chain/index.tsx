/**
 * BhApprovalChain - Main Export
 * Vertical approval chain visualizer for BitHire ATS platform
 */

import type { BhApprovalChainProps } from './core';
import { BH_APPROVAL_CHAIN_DEFAULTS } from './core';
import { BH_APPROVAL_CHAIN_PRESETS } from './presets';

export {
  type BhApprovalChainProps,
  type BhApprovalChainPreset,
  type ApprovalChainStep,
  BH_APPROVAL_CHAIN_DEFAULTS,
} from './core';

export * from './presets';

/**
 * BhApprovalChain component
 * Renders the appropriate preset based on the preset prop
 */
export function BhApprovalChain(props: BhApprovalChainProps): React.ReactElement {
  const preset = props.preset ?? BH_APPROVAL_CHAIN_DEFAULTS.preset ?? 'vertical';
  const PresetComponent = BH_APPROVAL_CHAIN_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhApprovalChain.displayName = 'BhApprovalChain';
