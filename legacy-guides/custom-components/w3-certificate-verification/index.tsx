/**
 * W3CertificateVerification - Main Export
 * Verify certificate authenticity on-chain with detailed verification results
 */

import type { W3CertificateVerificationProps } from './core';
import { W3_CERTIFICATE_VERIFICATION_DEFAULTS } from './core';
import { W3_CERTIFICATE_VERIFICATION_PRESETS } from './presets';

export { type W3CertificateVerificationProps, type W3CertificateVerificationPreset, W3_CERTIFICATE_VERIFICATION_DEFAULTS } from './core';
export * from './presets';

export function W3CertificateVerification(props: W3CertificateVerificationProps): React.ReactElement {
  const preset = props.preset ?? W3_CERTIFICATE_VERIFICATION_DEFAULTS.preset ?? 'verifier';
  const PresetComponent = W3_CERTIFICATE_VERIFICATION_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3CertificateVerification.displayName = 'W3CertificateVerification';
