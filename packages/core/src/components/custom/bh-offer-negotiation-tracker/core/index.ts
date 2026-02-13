/**
 * BhOfferNegotiationTracker - Core Interface
 * Visual negotiation timeline with salary progression
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhOfferNegotiationTrackerPreset = 'timeline' | 'compact';

export interface NegotiationRound {
  id: string;
  date: string;
  offeredSalary: number;
  requestedSalary: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  notes?: string;
}

export interface BhOfferNegotiationTrackerProps extends EngineAwareProps {
  preset?: BhOfferNegotiationTrackerPreset;

  /** Negotiation rounds */
  rounds: NegotiationRound[];

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
