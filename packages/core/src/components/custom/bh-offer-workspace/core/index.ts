/**
 * BhOfferWorkspace - Core Interface
 * Offer Management workspace for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhOfferWorkspacePreset = 'editor' | 'tracker';

export type OfferStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'sent'
  | 'viewed'
  | 'accepted'
  | 'declined'
  | 'negotiating';

export interface CompensationData {
  baseSalary: number;
  marketRangeMin: number;
  marketRangeMax: number;
  currency: string;
  signingBonus: number;
  annualBonusPercent: number;
  commissionStructure?: string;
  equityShares?: number;
  vestingYears?: number;
}

export interface BenefitItem {
  name: string;
  included: boolean;
}

export interface BenefitCategory {
  category: string;
  items: BenefitItem[];
}

export interface ApprovalStep {
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

export interface EmploymentTerms {
  startDate: string;
  probationPeriod: string;
  noticePeriod: string;
  workArrangement: 'onsite' | 'remote' | 'hybrid';
}

export interface RelocationPackage {
  budget: number;
  movingAllowance: number;
  tempHousing: boolean;
}

export interface SignatureStatus {
  candidateSigned: boolean;
  companySigned: boolean;
  signedDate?: string;
}

export interface BhOfferWorkspaceProps extends EngineAwareProps {
  preset?: BhOfferWorkspacePreset;

  /** Candidate name for the offer */
  candidateName: string;

  /** Job title being offered */
  jobTitle: string;

  /** Current offer status */
  status: OfferStatus;

  /** Compensation details */
  compensation: CompensationData;

  /** Benefits organized by category */
  benefits: BenefitCategory[];

  /** Optional relocation package */
  relocationPackage?: RelocationPackage;

  /** Employment terms */
  employmentTerms: EmploymentTerms;

  /** Approval chain steps */
  approvalSteps: ApprovalStep[];

  /** Negotiation history versions */
  negotiationHistory: NegotiationVersion[];

  /** Documents attached to the offer */
  documents: DocumentInfo[];

  /** Save callback */
  onSave?: () => void;

  /** Submit for approval callback */
  onSubmitApproval?: () => void;

  /** Send offer to candidate callback */
  onSendOffer?: () => void;

  /** Whether the form is in editing mode */
  isEditing: boolean;

  /** Toggle editing mode */
  onEditToggle?: () => void;

  /** Current offer version number */
  currentVersion: number;

  /** Whether negotiation history panel is visible */
  showNegotiationHistory: boolean;

  /** Toggle negotiation history panel */
  onHistoryToggle?: () => void;

  /** Whether comparison view is active */
  showComparison: boolean;

  /** Toggle comparison view */
  onComparisonToggle?: () => void;

  /** E-signature status */
  signatureStatus: SignatureStatus;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OFFER_WORKSPACE_DEFAULTS: Partial<BhOfferWorkspaceProps> = {
  preset: 'editor',
};

/**
 * Returns status display configuration (label + badge color key)
 */
export function getOfferStatusConfig(status: OfferStatus): { label: string; color: 'info' | 'warning' | 'success' | 'error' | 'primary' | 'secondary' } {
  const map: Record<OfferStatus, { label: string; color: 'info' | 'warning' | 'success' | 'error' | 'primary' | 'secondary' }> = {
    draft: { label: 'Draft', color: 'secondary' },
    pending_approval: { label: 'Pending Approval', color: 'warning' },
    approved: { label: 'Approved', color: 'info' },
    sent: { label: 'Sent', color: 'primary' },
    viewed: { label: 'Viewed', color: 'primary' },
    accepted: { label: 'Accepted', color: 'success' },
    declined: { label: 'Declined', color: 'error' },
    negotiating: { label: 'Negotiating', color: 'warning' },
  };
  return map[status];
}

/**
 * Returns pipeline steps for the offer status tracker
 */
export function getOfferPipelineSteps(): Array<{ key: OfferStatus; label: string }> {
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
export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '\u20AC',
    GBP: '\u00A3',
    JPY: '\u00A5',
    CAD: 'CA$',
    AUD: 'AU$',
  };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${amount.toLocaleString()}`;
}
