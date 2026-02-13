/**
 * BhOfferExpiration - Core Interface
 * Cards grouped by urgency with countdown
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhOfferExpirationPreset = 'cards' | 'list';

export interface ExpiringOffer {
  id: string;
  candidateName: string;
  position: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'extended';
  daysRemaining: number;
}

export interface BhOfferExpirationProps extends EngineAwareProps {
  preset?: BhOfferExpirationPreset;

  /** Expiring offers */
  offers: ExpiringOffer[];

  /** Title */
  title?: string;

  /** Callback when an offer is clicked */
  onOfferClick?: (offerId: string) => void;

  /** Callback to extend an offer */
  onExtend?: (offerId: string) => void;

  /** Callback to send a reminder */
  onRemind?: (offerId: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OFFER_EXPIRATION_DEFAULTS: Partial<BhOfferExpirationProps> = {
  preset: 'cards',
};
