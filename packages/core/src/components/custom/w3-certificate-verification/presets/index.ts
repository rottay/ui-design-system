/**
 * W3CertificateVerification - All Presets
 */

export { VerifierW3CertificateVerification } from './verifier';
export { BadgeW3CertificateVerification } from './badge';

import type { W3CertificateVerificationPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3CertificateVerificationProps } from '../core';
import { VerifierW3CertificateVerification } from './verifier';
import { BadgeW3CertificateVerification } from './badge';

export const W3_CERTIFICATE_VERIFICATION_PRESETS: Record<W3CertificateVerificationPreset, ComponentType<W3CertificateVerificationProps>> = {
  verifier: VerifierW3CertificateVerification,
  badge: BadgeW3CertificateVerification,
};
