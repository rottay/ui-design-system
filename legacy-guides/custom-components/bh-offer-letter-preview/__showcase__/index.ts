/**
 * bh-offer-letter-preview - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { OfferLetterData } from '../core';

export const MOCK_LETTER: OfferLetterData = {
  candidateName: 'Sarah Johnson',
  position: 'Senior Frontend Engineer',
  salary: 137000,
  startDate: 'March 15, 2026',
  benefits: [
    'Health, dental, and vision insurance',
    '401(k) with 4% company match',
    '20 days PTO + 10 holidays',
    'Remote work flexibility',
    'Annual learning budget of $2,500',
  ],
  customFields: {
    'Signing Bonus': '$10,000',
    'RSU Grant': '2,000 shares vesting over 4 years',
    'Relocation': 'Up to $5,000 reimbursement',
  },
  equityType: 'rsu',
  equityShares: 2000,
  equityPercentage: undefined,
  equityVestingMonths: 48,
  equityCliffMonths: 12,
  relocationOffered: true,
  relocationAmount: 5000,
  relocationType: 'lump_sum',
  annualBonusTargetPercentage: 15,
  commissionPercentage: undefined,
  ptoDays: 20,
  sickDays: 10,
  parentalLeaveWeeks: 16,
  contractType: 'full_time',
  probationPeriodDays: 90,
  workLocation: 'San Francisco, CA',
  remoteType: 'hybrid',
};

export const MOCK_LETTER_FULLY_REMOTE: OfferLetterData = {
  candidateName: 'Michael Chen',
  position: 'Staff Software Engineer',
  salary: 185000,
  startDate: 'April 1, 2026',
  benefits: [
    'Health, dental, and vision insurance',
    '401(k) with 6% company match',
    'Unlimited PTO',
    '$3,000 home office stipend',
    'Annual learning budget of $5,000',
  ],
  customFields: {
    'Signing Bonus': '$25,000',
    'Stock Options': '5,000 shares vesting over 4 years',
  },
  equityType: 'options',
  equityShares: 5000,
  equityVestingMonths: 48,
  equityCliffMonths: 12,
  relocationOffered: false,
  annualBonusTargetPercentage: 20,
  ptoDays: 0,
  sickDays: 0,
  parentalLeaveWeeks: 20,
  contractType: 'full_time',
  probationPeriodDays: 60,
  workLocation: 'Remote - US',
  remoteType: 'fully_remote',
};

export const MOCK_LETTER_CONTRACTOR: OfferLetterData = {
  candidateName: 'Emily Rodriguez',
  position: 'Senior UX Consultant',
  salary: 95,
  startDate: 'March 1, 2026',
  benefits: [
    'Access to co-working space',
    'Conference attendance budget',
  ],
  equityType: undefined,
  relocationOffered: false,
  commissionPercentage: 5,
  contractType: 'contractor',
  probationPeriodDays: 30,
  workLocation: 'New York, NY',
  remoteType: 'on_site',
};
