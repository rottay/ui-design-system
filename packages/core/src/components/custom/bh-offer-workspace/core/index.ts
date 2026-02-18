/**
 * BhOfferWorkspace - Core Interface
 * Offer Management workspace for BitHire ATS platform
 *
 * Uses DBOffer from @rottay/recruiter as the single source of truth
 * for offer entity data.
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';
import type { DBOffer } from '@rottay/recruiter';

export type { DBOffer } from '@rottay/recruiter';

/** Convenience alias */
export type RecruiterOffer = DBOffer;

export type BhOfferWorkspacePreset = 'editor' | 'tracker';

/** DB offer status values */
export type OfferStatus = NonNullable<DBOffer['status']>;

export interface BenefitItem {
  name: string;
  included: boolean;
}

export interface BenefitCategory {
  category: string;
  items: BenefitItem[];
}

export interface ApprovalStep {
  step?: number;
  role: string;
  approverName: string;
  approverAvatar?: string;
  status: 'pending' | 'approved' | 'rejected';
  date?: string;
}

export interface NegotiationChange {
  field: string;
  oldValue: string;
  newValue: string;
}

export interface NegotiationVersion {
  version: number;
  date: string;
  changes: NegotiationChange[];
  counterOffer?: string;
}

export interface DocumentInfo {
  name: string;
  status: 'draft' | 'signed' | 'pending';
  uploadDate?: string;
}

export interface SignatureStatus {
  candidateSigned: boolean;
  companySigned: boolean;
  signedDate?: string;
}

export interface BhOfferWorkspaceProps extends EngineAwareProps {
  preset?: BhOfferWorkspacePreset;

  /** The DB offer entity - single source of truth */
  offer?: DBOffer;

  /** Candidate name (override or supplement) */
  candidateName?: string;

  /** Job title being offered (override or supplement) */
  jobTitle?: string;

  /** Current offer status (override - defaults to offer.status) */
  status?: OfferStatus;

  /** Benefits organized by category (UI-specific structure) */
  benefits?: BenefitCategory[];

  /** Approval chain steps (UI-specific structure) */
  approvalSteps?: ApprovalStep[];

  /** Negotiation history versions (UI-specific structure) */
  negotiationHistory?: NegotiationVersion[];

  /** Documents attached to the offer (UI-specific structure) */
  documents?: DocumentInfo[];

  /** Save callback */
  onSave?: () => void;

  /** Submit for approval callback */
  onSubmitApproval?: () => void;

  /** Send offer to candidate callback */
  onSendOffer?: () => void;

  /** Whether the form is in editing mode */
  isEditing?: boolean;

  /** Toggle editing mode */
  onEditToggle?: () => void;

  /** Current offer version number (override - defaults to offer.version) */
  currentVersion?: number;

  /** Whether negotiation history panel is visible */
  showNegotiationHistory?: boolean;

  /** Toggle negotiation history panel */
  onHistoryToggle?: () => void;

  /** Whether comparison view is active */
  showComparison?: boolean;

  /** Toggle comparison view */
  onComparisonToggle?: () => void;

  /** E-signature status */
  signatureStatus?: SignatureStatus;

  /** Equity type (e.g. options, rsu, percentage) */
  equityType?: string;

  /** Number of equity shares */
  equityShares?: number;

  /** Equity percentage (for percentage-based grants) */
  equityPercentage?: number;

  /** Equity vesting period in months */
  equityVestingMonths?: number;

  /** Equity cliff period in months */
  equityCliffMonths?: number;

  /** Signing bonus amount */
  signingBonus?: number;

  /** Annual bonus target as a percentage */
  annualBonusTargetPercentage?: number;

  /** Whether relocation is offered */
  relocationOffered?: boolean;

  /** Relocation allowance amount */
  relocationAmount?: number;

  /** Type of relocation package */
  relocationType?: string;

  /** Whether legal review is required */
  legalReviewRequired?: boolean;

  /** Legal review status */
  legalReviewStatus?: string;

  /** Contract type (e.g. full_time, contractor, part_time) */
  contractType?: string;

  /** Contract duration in months (for fixed-term) */
  contractDurationMonths?: number;

  /** Probation period in days */
  probationPeriodDays?: number;

  /** Offer version number */
  version?: number;

  /** Whether this is a counter offer */
  isCounterOffer?: boolean;

  /** Reference to the previous offer ID (for counter offers) */
  previousOfferId?: string;

  /** URL to the generated offer letter */
  offerLetterUrl?: string;

  /** URL to the signed offer document */
  signedOfferUrl?: string;

  /** Timestamp when the offer was signed */
  signedAt?: string;

  /** Approval chain steps with step number */
  approvalChain?: Array<{ step: number; approverName?: string; status: string }>;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OFFER_WORKSPACE_DEFAULTS: Partial<BhOfferWorkspaceProps> = {
  preset: 'editor',
};

/**
 * Backward-compatible type aliases.
 * These interfaces were replaced by getOfferCompensation() but are still
 * referenced by consumers via the barrel re-exports.
 */
export interface CompensationData {
  baseSalary: number;
  currency: string;
  salaryPeriod: string;
  signingBonus: number;
  annualBonusPercent: number;
  commissionStructure?: string;
  equityShares: number;
  equityType?: string;
  equityPercentage?: number;
  equityStrikePrice?: number;
  vestingMonths: number;
  cliffMonths: number;
}

export interface EmploymentTerms {
  startDate?: string;
  employmentType?: string;
  workSchedule?: string;
  probationPeriod?: string;
  noticePeriod?: string;
  nonCompeteClause?: boolean;
}

export interface RelocationPackage {
  offered: boolean;
  amount?: number;
  currency?: string;
  coverMovingExpenses?: boolean;
  coverHousing?: boolean;
  duration?: string;
}

/**
 * Returns status display configuration (label + badge color key)
 */
export function getOfferStatusConfig(status: OfferStatus | string | undefined): { label: string; color: 'info' | 'warning' | 'success' | 'error' | 'primary' | 'secondary' } {
  const map: Record<string, { label: string; color: 'info' | 'warning' | 'success' | 'error' | 'primary' | 'secondary' }> = {
    draft: { label: 'Draft', color: 'secondary' },
    pending_approval: { label: 'Pending Approval', color: 'warning' },
    approved: { label: 'Approved', color: 'info' },
    sent: { label: 'Sent', color: 'primary' },
    viewed: { label: 'Viewed', color: 'primary' },
    accepted: { label: 'Accepted', color: 'success' },
    declined: { label: 'Declined', color: 'error' },
    negotiating: { label: 'Negotiating', color: 'warning' },
    expired: { label: 'Expired', color: 'error' },
    withdrawn: { label: 'Withdrawn', color: 'secondary' },
    superseded: { label: 'Superseded', color: 'secondary' },
  };
  return map[status ?? ''] ?? { label: 'Unknown', color: 'secondary' };
}

/**
 * Returns pipeline steps for the offer status tracker
 */
export function getOfferPipelineSteps(): Array<{ key: string; label: string }> {
  return [
    { key: 'draft', label: 'Draft' },
    { key: 'pending_approval', label: 'Approval' },
    { key: 'approved', label: 'Approved' },
    { key: 'sent', label: 'Sent' },
    { key: 'viewed', label: 'Viewed' },
    { key: 'accepted', label: 'Accepted' },
  ];
}

/**
 * Formats a currency value with symbol
 */
export function formatCurrency(amount: number | null | undefined, currency?: string): string {
  if (amount == null || isNaN(amount)) return '$0';
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    JPY: '\u00A5',
    CAD: 'CA$',
    AUD: 'AU$',
  };
  const symbol = symbols[currency ?? 'USD'] ?? (currency ?? '$');
  return `${symbol}${amount.toLocaleString()}`;
}

/**
 * Extract compensation display values from a DBOffer.
 * Provides a flat object with the fields presets need for rendering.
 */
export function getOfferCompensation(offer?: DBOffer) {
  return {
    baseSalary: offer?.salary ?? 0,
    currency: offer?.salaryCurrency ?? 'USD',
    salaryPeriod: offer?.salaryPeriod ?? 'annual',
    signingBonus: offer?.signingBonus ?? 0,
    annualBonusPercent: offer?.annualBonusTargetPercentage ?? 0,
    commissionStructure: offer?.commissionStructure ?? undefined,
    equityShares: offer?.equityShares ?? 0,
    equityType: offer?.equityType ?? undefined,
    vestingMonths: offer?.equityVestingMonths ?? 48,
    cliffMonths: offer?.equityCliffMonths ?? 12,
  };
}
