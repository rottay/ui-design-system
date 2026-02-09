/**
 * KycVerificationFlow - All Presets
 */

import type { KycVerificationFlowPreset } from '../core';
import { WizardKycVerificationFlow } from './wizard';
import { ReviewKycVerificationFlow } from './review';
import { StatusKycVerificationFlow } from './status';

export { WizardKycVerificationFlow } from './wizard';
export { ReviewKycVerificationFlow } from './review';
export { StatusKycVerificationFlow } from './status';

export const KYC_VERIFICATION_FLOW_PRESETS: Record<KycVerificationFlowPreset, React.ComponentType<any>> = {
  wizard: WizardKycVerificationFlow,
  review: ReviewKycVerificationFlow,
  status: StatusKycVerificationFlow,
};
