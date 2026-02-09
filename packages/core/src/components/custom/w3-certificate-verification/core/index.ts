/**
 * W3CertificateVerification - Core Interface
 * Verify certificate authenticity on-chain with detailed verification results
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3CertificateVerificationPreset = 'verifier' | 'badge';

export interface CertificateVerificationItem {
  id: string;
  name: string;
  image?: string;
  collection?: string;
  tokenId: string;
  owner?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  status: 'minted' | 'pending' | 'burned';
}

export interface W3CertificateVerificationProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3CertificateVerificationPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: CertificateVerificationItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to mint */
  onMint?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_CERTIFICATE_VERIFICATION_DEFAULTS: Partial<W3CertificateVerificationProps> = {
  preset: 'verifier',
};
