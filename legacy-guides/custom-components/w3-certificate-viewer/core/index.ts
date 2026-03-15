/**
 * W3CertificateViewer - Core Interface
 * View blockchain-verified certificates with QR codes and verification status
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3CertificateViewerPreset = 'card' | 'document';

export interface CertificateViewerItem {
  id: string;
  name: string;
  image?: string;
  collection?: string;
  tokenId: string;
  owner?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  status: 'minted' | 'pending' | 'burned';
}

export interface W3CertificateViewerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3CertificateViewerPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: CertificateViewerItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to mint */
  onMint?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_CERTIFICATE_VIEWER_DEFAULTS: Partial<W3CertificateViewerProps> = {
  preset: 'card',
};
