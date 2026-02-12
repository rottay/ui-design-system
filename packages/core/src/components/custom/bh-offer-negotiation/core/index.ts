/**
 * BhOfferNegotiation - Core Interface
 * Visual timeline of offer negotiation process.
 * Tables: recruiting_offers (negotiation_history JSONB field)
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

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

export interface BhOfferNegotiationProps extends EngineAwareProps {
  preset?: BhOfferNegotiationPreset;

  /** The negotiation data */
  negotiation?: OfferNegotiation;

  /** Multiple negotiations for comparison view */
  negotiations?: OfferNegotiation[];

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
