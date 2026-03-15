/**
 * KycVerificationFlow - All Presets
 */

import type { KycVerificationFlowPreset, KycVerificationFlowProps } from '../core';
import type { ComponentType } from 'react';
import { WizardKycVerificationFlow } from './wizard';
import { ReviewKycVerificationFlow } from './review';
import { StatusKycVerificationFlow } from './status';

export { WizardKycVerificationFlow } from './wizard';
export { ReviewKycVerificationFlow } from './review';
export { StatusKycVerificationFlow } from './status';

export const KYC_VERIFICATION_FLOW_PRESETS: Record<KycVerificationFlowPreset, ComponentType<KycVerificationFlowProps>> = {
  wizard: WizardKycVerificationFlow,
  review: ReviewKycVerificationFlow,
  status: StatusKycVerificationFlow,
};
