/**
 * BhOfferLetterPreview - Core Interface
 * A4 letter preview with variable highlighting.
 *
 * Uses DBOffer from @rottay/recruiter as the single source of truth.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBOffer } from '@rottay/recruiter';

export type { DBOffer } from '@rottay/recruiter';

/** Convenience alias */
export type RecruiterOffer = DBOffer;

export type BhOfferLetterPreviewPreset = 'preview' | 'compact';

export interface OfferLetterData {
  candidateName: string;
  position: string;
  salary: number;
  startDate: string;
  benefits: string[];
  customFields?: Record<string, string>;

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

  /** Equity strike price per share */
  equityStrikePrice?: number;

  /** Whether relocation is offered */
  relocationOffered?: boolean;

  /** Relocation allowance amount */
  relocationAmount?: number;

  /** Type of relocation package */
  relocationType?: string;

  /** Additional relocation details */
  relocationDetails?: string;

  /** Annual bonus target as a percentage */
  annualBonusTargetPercentage?: number;

  /** Commission percentage */
  commissionPercentage?: number;

  /** Paid time off days per year */
  ptoDays?: number;

  /** Sick days per year */
  sickDays?: number;

  /** Parental leave in weeks */
  parentalLeaveWeeks?: number;

  /** Remote work stipend amount */
  remoteWorkStipend?: number;

  /** Learning/development budget amount */
  learningBudget?: number;

  /** Contract type (e.g. full_time, contractor, part_time) */
  contractType?: string;

  /** Probation period in days */
  probationPeriodDays?: number;

  /** Work location */
  workLocation?: string;

  /** Remote work type (e.g. fully_remote, hybrid, on_site) */
  remoteType?: string;

  /** The job title being offered (may differ from position req title) */
  jobTitleOffered?: string;
}

/**
 * Extract OfferLetterData from a DBOffer.
 */
export function offerToLetterData(offer: DBOffer, candidateName?: string): OfferLetterData {
  const benefits: string[] = [];

  if (offer.ptoDays) benefits.push(`${offer.ptoDays} days PTO`);
  if (offer.sickDays) benefits.push(`${offer.sickDays} sick days`);
  if (offer.parentalLeaveWeeks) benefits.push(`${offer.parentalLeaveWeeks} weeks parental leave`);
  if (offer.remoteWorkStipend) benefits.push(`$${offer.remoteWorkStipend.toLocaleString()} remote work stipend`);
  if (offer.learningBudget) benefits.push(`$${offer.learningBudget.toLocaleString()} learning budget`);

  const dbBenefits = Array.isArray(offer.benefits) ? offer.benefits : [];
  dbBenefits.forEach((b: any) => {
    if (typeof b === 'string') benefits.push(b);
    else if (b?.name) benefits.push(String(b.name));
  });

  const customFields: Record<string, string> = {};
  if (offer.signingBonus) customFields['Signing Bonus'] = `$${offer.signingBonus.toLocaleString()}`;
  if (offer.equityShares) {
    const vestingYears = Math.round((offer.equityVestingMonths ?? 48) / 12);
    customFields['Equity'] = `${offer.equityShares.toLocaleString()} shares vesting over ${vestingYears} years`;
  }
  if (offer.relocationOffered && offer.relocationAmount) {
    customFields['Relocation'] = `$${offer.relocationAmount.toLocaleString()}`;
  }
  if (offer.annualBonusTargetPercentage) {
    customFields['Annual Bonus Target'] = `${offer.annualBonusTargetPercentage}%`;
  }

  const startDate = offer.proposedStartDate
    ? new Date(offer.proposedStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return {
    candidateName: candidateName ?? '',
    position: offer.jobTitleOffered ?? '',
    salary: offer.salary ?? 0,
    startDate,
    benefits,
    customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
  };
}

export interface BhOfferLetterPreviewProps extends EngineAwareProps {
  preset?: BhOfferLetterPreviewPreset;

  /** The DB offer entity - single source of truth */
  offer?: DBOffer;

  /** Offer letter data (pre-mapped, overrides offer) */
  letterData?: OfferLetterData;

  /** Candidate name (used when mapping from DBOffer) */
  candidateName?: string;

  /** Company name */
  companyName?: string;

  /** Currency symbol */
  currency?: string;

  /** Whether to highlight variables */
  highlightVariables?: boolean;

  /** Callback when download is clicked */
  onDownload?: () => void;

  /** Callback when print is clicked */
  onPrint?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_OFFER_LETTER_PREVIEW_DEFAULTS: Partial<BhOfferLetterPreviewProps> = {
  preset: 'preview',
  currency: '$',
  highlightVariables: true,
};
