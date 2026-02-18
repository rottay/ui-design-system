/**
 * BhOfferNegotiationTracker - Core Interface
 * Visual negotiation timeline with salary progression.
 *
 * Uses DBOffer from @rottay/recruiter as the single source of truth.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBOffer } from '@rottay/recruiter';

export type { DBOffer } from '@rottay/recruiter';

/** Convenience alias */
export type RecruiterOffer = DBOffer;

export type BhOfferNegotiationTrackerPreset = 'timeline' | 'compact';

export interface NegotiationRound {
  id: string;
  date: string;
  offeredSalary: number;
  requestedSalary: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  notes?: string;

  /** Round number in the negotiation sequence */
  round?: number;

  /** Equity offered in this round */
  equityOffered?: number;

  /** Equity requested by candidate in this round */
  equityRequested?: number;

  /** Signing bonus offered in this round */
  signingBonusOffered?: number;

  /** Signing bonus requested by candidate in this round */
  signingBonusRequested?: number;

  /** Who initiated this round */
  initiatedBy?: 'company' | 'candidate';
}

export interface NegotiationSummary {
  /** Total number of negotiation rounds */
  totalRounds?: number;

  /** Days elapsed since negotiation started */
  daysInNegotiation?: number;

  /** Difference between final and initial salary */
  salaryDelta?: number;

  /** Whether a final agreement was reached */
  finalNegotiated?: boolean;
}

/**
 * Extract NegotiationRound[] from a DBOffer for timeline display.
 * Maps the negotiation_history JSONB + base salary into rounds.
 */
export function offerToNegotiationRounds(offer: DBOffer): NegotiationRound[] {
  const history = Array.isArray(offer.negotiationHistory) ? offer.negotiationHistory : [];
  const candidateCounter = offer.candidateCounter as Record<string, any> | null;

  const rounds: NegotiationRound[] = [];

  // Initial offer round
  rounds.push({
    id: `${offer.id}-r0`,
    date: offer.createdAt ? new Date(offer.createdAt).toISOString().split('T')[0] : '',
    offeredSalary: offer.salary ?? 0,
    requestedSalary: (candidateCounter as any)?.salary ?? offer.salary ?? 0,
    status: history.length > 0 ? 'countered' : mapOfferStatus(offer.status),
    notes: offer.internalNotes ?? undefined,
  });

  // Additional rounds from history
  history.forEach((entry: any, i: number) => {
    rounds.push({
      id: `${offer.id}-r${i + 1}`,
      date: entry?.date ?? '',
      offeredSalary: entry?.offeredSalary ?? entry?.compensation?.baseSalary ?? entry?.salary ?? 0,
      requestedSalary: entry?.requestedSalary ?? entry?.compensation?.baseSalary ?? entry?.salary ?? 0,
      status: entry?.status ?? (i === history.length - 1 ? mapOfferStatus(offer.status) : 'countered'),
      notes: entry?.notes ?? undefined,
    });
  });

  return rounds;
}

function mapOfferStatus(status: string): NegotiationRound['status'] {
  switch (status) {
    case 'accepted': return 'accepted';
    case 'declined': return 'rejected';
    case 'negotiating': return 'countered';
    default: return 'pending';
  }
}

export interface BhOfferNegotiationTrackerProps extends EngineAwareProps {
  preset?: BhOfferNegotiationTrackerPreset;

  /** The DB offer entity - single source of truth */
  offer?: DBOffer;

  /** Negotiation rounds (pre-mapped, overrides offer) */
  rounds?: NegotiationRound[];

  /** Candidate name */
  candidateName?: string;

  /** Position title */
  position?: string;

  /** Budget range min */
  budgetMin?: number;

  /** Budget range max */
  budgetMax?: number;

  /** Title */
  title?: string;

  /** Callback when a round is clicked */
  onRoundClick?: (roundId: string) => void;

  /** Currency symbol */
  currency?: string;

  /** Negotiation summary metrics */
  summary?: NegotiationSummary;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OFFER_NEGOTIATION_TRACKER_DEFAULTS: Partial<BhOfferNegotiationTrackerProps> = {
  preset: 'timeline',
  currency: '$',
};
