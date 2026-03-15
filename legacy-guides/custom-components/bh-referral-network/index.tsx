/**
 * BhReferralNetwork - Main Export
 * SVG force-directed graph for visualizing referral networks.
 */

import type { BhReferralNetworkProps } from './core';
import { BH_REFERRAL_NETWORK_DEFAULTS } from './core';
import { BH_REFERRAL_NETWORK_PRESETS } from './presets';

export {
  type BhReferralNetworkProps,
  type BhReferralNetworkPreset,
  type NetworkNode,
  type NetworkEdge,
  type NetworkData,
  BH_REFERRAL_NETWORK_DEFAULTS,
} from './core';
export * from './presets';

export function BhReferralNetwork(props: BhReferralNetworkProps): React.ReactElement {
  const preset = props.preset ?? BH_REFERRAL_NETWORK_DEFAULTS.preset ?? 'standard';
  const PresetComponent = BH_REFERRAL_NETWORK_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhReferralNetwork.displayName = 'BhReferralNetwork';

export { StandardBhReferralNetwork } from './presets';
