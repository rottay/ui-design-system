/**
 * bh-offer-workspace - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type {
  BhOfferWorkspaceProps,
  BenefitCategory,
  ApprovalStep,
  NegotiationVersion,
  DocumentInfo,
  SignatureStatus,
  DBOffer,
} from '../core';

/* -- Mock DBOffer entity -------------------------------------------------- */

export const MOCK_OFFER = {
  id: 'offer-001',
  tenantId: 'tenant-001',
  candidateId: 'cand-001',
  positionId: 'pos-001',
  recruiterId: 'rec-001',
  status: 'sent',
  salary: 185000,
  salaryCurrency: 'USD',
  salaryPeriod: 'annual',
  signingBonus: 15000,
  annualBonusTargetPercentage: 15,
  commissionStructure: 'Standard Q1-Q4 commission plan',
  equityShares: 5000,
  equityType: 'stock_options',
  equityPercentage: 0.25,
  equityVestingMonths: 48,
  equityCliffMonths: 12,
  equityStrikePrice: 12.50,
  relocationOffered: true,
  relocationAmount: 10000,
  relocationType: 'domestic',
  startDate: '2026-04-01',
  expiresAt: new Date('2026-03-15T23:59:59Z'),
  contractType: 'full_time',
  contractDurationMonths: null,
  probationPeriodDays: 90,
  workSchedule: 'hybrid',
  legalReviewRequired: true,
  legalReviewStatus: 'approved',
  version: 2,
  isCounterOffer: true,
  previousOfferId: 'offer-000',
  offerLetterUrl: 'https://docs.example.com/offers/offer-001-letter.pdf',
  signedOfferUrl: null,
  signedAt: null,
  isActive: true,
  createdAt: new Date('2026-02-10T09:00:00Z'),
  updatedAt: new Date('2026-02-14T16:30:00Z'),
  createdBy: 'rec-001',
  updatedBy: 'rec-001',
} as unknown as DBOffer;

/* -- Benefits ------------------------------------------------------------- */

export const MOCK_BENEFITS: BenefitCategory[] = [
  {
    category: 'Health & Wellness',
    items: [
      { name: 'Medical Insurance (PPO)', included: true },
      { name: 'Dental Insurance', included: true },
      { name: 'Vision Insurance', included: true },
      { name: 'Mental Health Support', included: true },
      { name: 'Gym Membership', included: false },
    ],
  },
  {
    category: 'Financial',
    items: [
      { name: '401(k) Match (6%)', included: true },
      { name: 'Life Insurance (2x salary)', included: true },
      { name: 'HSA Contribution', included: true },
      { name: 'Financial Planning', included: false },
    ],
  },
  {
    category: 'Time Off',
    items: [
      { name: 'Unlimited PTO', included: true },
      { name: 'Paid Parental Leave (16 weeks)', included: true },
      { name: 'Sabbatical (after 5 years)', included: true },
    ],
  },
  {
    category: 'Professional Development',
    items: [
      { name: 'Conference Budget ($3,000/yr)', included: true },
      { name: 'Learning Stipend ($1,500/yr)', included: true },
      { name: 'Tuition Reimbursement', included: false },
    ],
  },
];

/* -- Approval Steps ------------------------------------------------------- */

export const MOCK_APPROVAL_STEPS: ApprovalStep[] = [
  {
    step: 1,
    role: 'Hiring Manager',
    approverName: 'Sarah Chen',
    status: 'approved',
    date: '2026-02-11',
  },
  {
    step: 2,
    role: 'VP Engineering',
    approverName: 'Marcus Johnson',
    status: 'approved',
    date: '2026-02-12',
  },
  {
    step: 3,
    role: 'Finance Director',
    approverName: 'Emily Rodriguez',
    status: 'approved',
    date: '2026-02-13',
  },
  {
    step: 4,
    role: 'Legal Review',
    approverName: 'David Kim',
    status: 'approved',
    date: '2026-02-14',
  },
];

/* -- Negotiation History -------------------------------------------------- */

export const MOCK_NEGOTIATION_HISTORY: NegotiationVersion[] = [
  {
    version: 1,
    date: '2026-02-10',
    changes: [
      { field: 'Base Salary', oldValue: '$0', newValue: '$175,000' },
      { field: 'Equity', oldValue: '0 shares', newValue: '4,000 options' },
      { field: 'Signing Bonus', oldValue: '$0', newValue: '$10,000' },
    ],
  },
  {
    version: 2,
    date: '2026-02-14',
    changes: [
      { field: 'Base Salary', oldValue: '$175,000', newValue: '$185,000' },
      { field: 'Equity', oldValue: '4,000 options', newValue: '5,000 options' },
      { field: 'Signing Bonus', oldValue: '$10,000', newValue: '$15,000' },
      { field: 'Relocation', oldValue: 'Not offered', newValue: '$10,000 domestic' },
    ],
    counterOffer: 'Candidate requested higher base and relocation support',
  },
];

/* -- Documents ------------------------------------------------------------ */

export const MOCK_DOCUMENTS: DocumentInfo[] = [
  { name: 'Offer Letter v2.pdf', status: 'pending', uploadDate: '2026-02-14' },
  { name: 'Equity Agreement.pdf', status: 'draft', uploadDate: '2026-02-14' },
  { name: 'Benefits Summary.pdf', status: 'signed', uploadDate: '2026-02-10' },
  { name: 'Non-Compete Agreement.pdf', status: 'draft', uploadDate: '2026-02-14' },
];

/* -- Signature Status ----------------------------------------------------- */

export const MOCK_SIGNATURE_STATUS: SignatureStatus = {
  candidateSigned: false,
  companySigned: true,
  signedDate: '2026-02-14',
};

/* -- Full Props ----------------------------------------------------------- */

export const MOCK_EDITOR_PROPS: BhOfferWorkspaceProps = {
  preset: 'editor',
  offer: MOCK_OFFER,
  candidateName: 'Alexandra Martinez',
  jobTitle: 'Senior Software Engineer',
  status: 'sent',
  benefits: MOCK_BENEFITS,
  approvalSteps: MOCK_APPROVAL_STEPS,
  negotiationHistory: MOCK_NEGOTIATION_HISTORY,
  documents: MOCK_DOCUMENTS,
  signatureStatus: MOCK_SIGNATURE_STATUS,
  isEditing: false,
  currentVersion: 2,
  showNegotiationHistory: false,
  showComparison: false,
  equityType: 'stock_options',
  equityCliffMonths: 12,
  equityPercentage: 0.25,
  legalReviewRequired: true,
  legalReviewStatus: 'approved',
  contractType: 'full_time',
  contractDurationMonths: undefined,
  probationPeriodDays: 90,
  relocationType: 'domestic',
  isCounterOffer: true,
  previousOfferId: 'offer-000',
  offerLetterUrl: 'https://docs.example.com/offers/offer-001-letter.pdf',
  signedOfferUrl: undefined,
  signedAt: undefined,
  version: 2,
  approvalChain: [
    { step: 1, approverName: 'Sarah Chen', status: 'approved' },
    { step: 2, approverName: 'Marcus Johnson', status: 'approved' },
    { step: 3, approverName: 'Emily Rodriguez', status: 'approved' },
    { step: 4, approverName: 'David Kim', status: 'approved' },
  ],
};

export const MOCK_TRACKER_PROPS: BhOfferWorkspaceProps = {
  preset: 'tracker',
  offer: MOCK_OFFER,
  candidateName: 'Alexandra Martinez',
  jobTitle: 'Senior Software Engineer',
  status: 'sent',
  signatureStatus: MOCK_SIGNATURE_STATUS,
  equityType: 'stock_options',
  equityCliffMonths: 12,
  equityPercentage: 0.25,
  legalReviewRequired: true,
  legalReviewStatus: 'approved',
  contractType: 'full_time',
  contractDurationMonths: undefined,
  relocationType: 'domestic',
  isCounterOffer: true,
  previousOfferId: 'offer-000',
  offerLetterUrl: 'https://docs.example.com/offers/offer-001-letter.pdf',
  signedOfferUrl: undefined,
  signedAt: undefined,
  version: 2,
};

/** Signed offer variant for testing signed state */
export const MOCK_SIGNED_OFFER: DBOffer = {
  ...MOCK_OFFER,
  id: 'offer-002',
  status: 'accepted',
  signedOfferUrl: 'https://docs.example.com/offers/offer-002-signed.pdf',
  signedAt: new Date('2026-02-16T14:22:00Z'),
} as unknown as DBOffer;

export const MOCK_SIGNED_PROPS: BhOfferWorkspaceProps = {
  preset: 'editor',
  offer: MOCK_SIGNED_OFFER,
  candidateName: 'Alexandra Martinez',
  jobTitle: 'Senior Software Engineer',
  status: 'accepted',
  benefits: MOCK_BENEFITS,
  approvalSteps: MOCK_APPROVAL_STEPS.map((s) => ({ ...s, status: 'approved' as const })),
  documents: MOCK_DOCUMENTS.map((d) => ({ ...d, status: 'signed' as const })),
  signatureStatus: { candidateSigned: true, companySigned: true, signedDate: '2026-02-16' },
  isEditing: false,
  equityType: 'stock_options',
  equityCliffMonths: 12,
  equityPercentage: 0.25,
  legalReviewRequired: true,
  legalReviewStatus: 'approved',
  contractType: 'full_time',
  isCounterOffer: true,
  previousOfferId: 'offer-000',
  offerLetterUrl: 'https://docs.example.com/offers/offer-002-letter.pdf',
  signedOfferUrl: 'https://docs.example.com/offers/offer-002-signed.pdf',
  signedAt: '2026-02-16T14:22:00Z',
  version: 2,
};

/** Fixed-term contract variant */
export const MOCK_FIXED_TERM_PROPS: BhOfferWorkspaceProps = {
  preset: 'tracker',
  offer: {
    ...MOCK_OFFER,
    id: 'offer-003',
    contractType: 'fixed_term',
    contractDurationMonths: 18,
    isCounterOffer: false,
    previousOfferId: null,
  } as DBOffer,
  candidateName: 'James O\'Brien',
  jobTitle: 'Contract Data Engineer',
  status: 'pending_approval',
  contractType: 'fixed_term',
  contractDurationMonths: 18,
  legalReviewRequired: true,
  legalReviewStatus: 'in_review',
  isCounterOffer: false,
  version: 1,
};
