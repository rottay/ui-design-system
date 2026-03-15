/**
 * BhOfferExpiration - Core Interface
 * Cards grouped by urgency with countdown.
 *
 * Uses DBOffer from @rottay/recruiter as the single source of truth.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBOffer } from '@rottay/recruiter';

export type { DBOffer } from '@rottay/recruiter';

/** Convenience alias */
export type RecruiterOffer = DBOffer;

export type BhOfferExpirationPreset = 'cards' | 'list';

export interface ExpiringOffer {
  id: string;
  candidateName: string;
  position: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'extended';
  daysRemaining: number;

  /** Department name */
  department?: string;

  /** Offered salary amount */
  salary?: number;

  /** Currency code for salary */
  currency?: string;

  /** Equity type (e.g. options, rsu, percentage) */
  equityType?: string;

  /** When the offer was sent to the candidate */
  sentAt?: string;

  /** When the candidate first viewed the offer */
  viewedAt?: string;

  /** Offer version number */
  version?: number;

  /** Whether this is a counter offer */
  isCounterOffer?: boolean;

  /** Legal review status */
  legalReviewStatus?: string;
}

/**
 * Convert a DBOffer into an ExpiringOffer for expiration tracking.
 */
export function offerToExpiringOffer(offer: DBOffer, candidateName?: string): ExpiringOffer {
  const expiresAt = offer.extendedValidUntil ?? offer.offerValidUntil;
  const expiresDate = expiresAt ? new Date(expiresAt) : new Date();
  const now = new Date();
  const diffMs = expiresDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let status: ExpiringOffer['status'] = 'pending';
  if (offer.status === 'accepted') status = 'accepted';
  else if (offer.status === 'expired') status = 'expired';
  else if (offer.extendedValidUntil) status = 'extended';
  else if (daysRemaining <= 0) status = 'expired';

  return {
    id: offer.id,
    candidateName: candidateName ?? '',
    position: offer.jobTitleOffered ?? '',
    expiresAt: expiresDate.toISOString().split('T')[0],
    status,
    daysRemaining,
  };
}

/**
 * Convert multiple DBOffer[] to ExpiringOffer[].
 */
export function offersToExpiringOffers(
  offers: DBOffer[],
  candidateNames?: Record<string, string>,
): ExpiringOffer[] {
  return offers.map((o) => offerToExpiringOffer(o, candidateNames?.[o.candidateId] ?? undefined));
}

export interface BhOfferExpirationProps extends EngineAwareProps {
  preset?: BhOfferExpirationPreset;

  /** DB offer entities - single source of truth */
  dbOffers?: DBOffer[];

  /** Candidate name map (candidateId -> name) for DB offer mapping */
  candidateNames?: Record<string, string>;

  /** Expiring offers (pre-mapped, overrides dbOffers) */
  offers?: ExpiringOffer[];

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
