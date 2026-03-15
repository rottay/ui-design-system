/**
 * BhReferralNetwork - All Presets
 */

import type { BhReferralNetworkPreset, BhReferralNetworkProps } from '../core';
import type { ComponentType } from 'react';
import { StandardBhReferralNetwork } from './standard';

export { StandardBhReferralNetwork } from './standard';

export const BH_REFERRAL_NETWORK_PRESETS: Record<BhReferralNetworkPreset, ComponentType<BhReferralNetworkProps>> = {
  standard: StandardBhReferralNetwork,
};
