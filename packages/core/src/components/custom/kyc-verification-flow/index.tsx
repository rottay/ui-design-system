/**
 * KycVerificationFlow - Main Export
 * Automatically selects preset based on props
 */

import type { KycVerificationFlowProps } from './core';
import { KYC_VERIFICATION_FLOW_DEFAULTS } from './core';
import { KYC_VERIFICATION_FLOW_PRESETS } from './presets';

export { type KycVerificationFlowProps, type KycVerificationFlowPreset, type KycVerification, type KycDocument, type KycCheck, type KycSubject, type KycStatus, type KycLevel, type VerificationStep, KYC_VERIFICATION_FLOW_DEFAULTS } from './core';
export { getKycStatusColors, getCheckStatusColors, getRiskColors, getStepLabel, STEP_ORDER } from './core';
export * from './presets';

/**
 * KycVerificationFlow component
 * Renders the appropriate preset based on the preset prop
 */
export function KycVerificationFlow(props: KycVerificationFlowProps): React.ReactElement {
  const preset = props.preset ?? KYC_VERIFICATION_FLOW_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = KYC_VERIFICATION_FLOW_PRESETS[preset];

  return <PresetComponent {...props} />;
}

KycVerificationFlow.displayName = 'KycVerificationFlow';

export { WizardKycVerificationFlow, ReviewKycVerificationFlow, StatusKycVerificationFlow } from './presets';
