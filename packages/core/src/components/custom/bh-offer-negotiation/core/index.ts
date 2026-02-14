/**
 * BhOfferNegotiation - Core Interface
 * Visual timeline of offer negotiation process.
 *
 * Uses DBOffer from @rottay/recruiter as the single source of truth.
 * The negotiation_history JSONB field on DBOffer stores the history.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBOffer } from '@rottay/recruiter';

export type { DBOffer } from '@rottay/recruiter';

/** Convenience alias */
export type RecruiterOffer = DBOffer;

export type BhOfferNegotiationPreset = 'timeline' | 'comparison';

export type NegotiationStepType = 'initial_offer' | 'counter_offer' | 'revised_offer' | 'final_agreement' | 'rejected' | 'withdrawn';

export interface CompensationPackage {
  baseSalary: number;
  equity?: number;
  equityType?: 'options' | 'rsu' | 'percentage';
  signingBonus?: number;
  annualBonus?: number;
  annualBonusPercent?: number;
  relocation?: number;
  otherBenefits?: string[];
}

export interface NegotiationStep {
  id: string;
  type: NegotiationStepType;
  date: string;
  initiatedBy: 'company' | 'candidate';
  compensation: CompensationPackage;
  notes?: string;
  expiresAt?: string;
}

export interface OfferNegotiation {
  id: string;
  candidateName: string;
  candidateAvatar?: string;
  positionTitle: string;
  department: string;
  currentStep: number;
  steps: NegotiationStep[];
  status: 'in_progress' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  createdAt: string;
}

/**
 * Extract an OfferNegotiation from a DBOffer for timeline display.
 * Maps DB fields to the UI-friendly OfferNegotiation shape.
 */
export function offerToNegotiation(offer: DBOffer, candidateName?: string): OfferNegotiation {
  const history = Array.isArray(offer.negotiationHistory) ? offer.negotiationHistory : [];

  const steps: NegotiationStep[] = [
    {
      id: `${offer.id}-initial`,
      type: 'initial_offer',
      date: offer.createdAt ? new Date(offer.createdAt).toISOString().split('T')[0] : '',
      initiatedBy: 'company',
      compensation: {
        baseSalary: offer.salary ?? 0,
        signingBonus: offer.signingBonus ?? undefined,
        equity: offer.equityShares ?? undefined,
        equityType: offer.equityType === 'rsu' ? 'rsu' : offer.equityType === 'stock_options' ? 'options' : undefined,
        annualBonusPercent: offer.annualBonusTargetPercentage ?? undefined,
        relocation: offer.relocationAmount ?? undefined,
      },
      notes: offer.internalNotes ?? undefined,
    },
    ...history.map((entry: any, i: number) => ({
      id: `${offer.id}-step-${i}`,
      type: (entry?.type ?? 'counter_offer') as NegotiationStepType,
      date: entry?.date ?? '',
      initiatedBy: (entry?.initiatedBy ?? 'candidate') as 'company' | 'candidate',
      compensation: {
        baseSalary: entry?.compensation?.baseSalary ?? entry?.salary ?? 0,
        signingBonus: entry?.compensation?.signingBonus ?? entry?.signingBonus ?? undefined,
        equity: entry?.compensation?.equity ?? entry?.equityShares ?? undefined,
        annualBonus: entry?.compensation?.annualBonus ?? undefined,
      },
      notes: entry?.notes ?? undefined,
    })),
  ];

  const statusMap: Record<string, OfferNegotiation['status']> = {
    negotiating: 'in_progress',
    accepted: 'accepted',
    declined: 'rejected',
    expired: 'expired',
    withdrawn: 'withdrawn',
  };

  return {
    id: offer.id,
    candidateName: candidateName ?? '',
    positionTitle: offer.jobTitleOffered ?? '',
    department: offer.department ?? '',
    currentStep: steps.length - 1,
    steps,
    status: statusMap[offer.status] ?? 'in_progress',
    createdAt: offer.createdAt ? new Date(offer.createdAt).toISOString() : '',
  };
}

export interface BhOfferNegotiationProps extends EngineAwareProps {
  preset?: BhOfferNegotiationPreset;

  /** The DB offer entity - single source of truth */
  offer?: DBOffer;

  /** Multiple DB offers for comparison view */
  offers?: DBOffer[];

  /** The negotiation data (pre-mapped, overrides offer) */
  negotiation?: OfferNegotiation;

  /** Multiple negotiations for comparison view (pre-mapped, overrides offers) */
  negotiations?: OfferNegotiation[];

  /** Candidate name (used when mapping from DBOffer) */
  candidateName?: string;

  /** Selected step index for detail */
  selectedStep?: number | null;

  /** Callback when step is selected */
  onStepSelect?: (stepIndex: number | null) => void;

  /** Callback to approve/send a counter */
  onAction?: (action: 'approve' | 'counter' | 'withdraw', negotiationId: string) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OFFER_NEGOTIATION_DEFAULTS: Partial<BhOfferNegotiationProps> = {
  preset: 'timeline',
};
