/**
 * bh-candidate-comparison - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ComparisonCandidate } from '../core';
import type { DBCandidate } from '@rottay/recruiter';

export const MOCK_CANDIDATES: ComparisonCandidate[] = [
  {
    candidate: {
      id: 'c-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      currentTitle: 'Senior Frontend Engineer',
      currentCompany: 'Google',
      yearsOfExperience: 8,
    } as unknown as DBCandidate,
    scores: {
      'Technical': 92,
      'Communication': 85,
      'Leadership': 78,
      'Problem Solving': 90,
      'Culture Fit': 88,
    },
    currentSalary: 165000,
    expectedSalaryMin: 180000,
    expectedSalaryMax: 210000,
    expectedSalaryCurrency: 'USD',
    availableFrom: new Date('2026-04-01'),
    noticePeriodDays: 14,
    aiMatchScore: 91,
    workAuthorization: 'citizen',
    requiresVisaSponsorship: false,
  },
  {
    candidate: {
      id: 'c-2',
      firstName: 'Michael',
      lastName: 'Chen',
      currentTitle: 'Full Stack Developer',
      currentCompany: 'Stripe',
      yearsOfExperience: 6,
    } as unknown as DBCandidate,
    scores: {
      'Technical': 88,
      'Communication': 92,
      'Leadership': 85,
      'Problem Solving': 82,
      'Culture Fit': 90,
    },
    currentSalary: 145000,
    expectedSalaryMin: 160000,
    expectedSalaryMax: 190000,
    expectedSalaryCurrency: 'USD',
    availableFrom: new Date('2026-03-15'),
    noticePeriodDays: 30,
    aiMatchScore: 87,
    workAuthorization: 'permanent_resident',
    requiresVisaSponsorship: false,
  },
  {
    candidate: {
      id: 'c-3',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      currentTitle: 'Staff Engineer',
      currentCompany: 'Meta',
      yearsOfExperience: 10,
    } as unknown as DBCandidate,
    scores: {
      'Technical': 95,
      'Communication': 78,
      'Leadership': 72,
      'Problem Solving': 94,
      'Culture Fit': 80,
    },
    currentSalary: 210000,
    expectedSalaryMin: 220000,
    expectedSalaryMax: 260000,
    expectedSalaryCurrency: 'USD',
    availableFrom: new Date('2026-05-01'),
    noticePeriodDays: 60,
    aiMatchScore: 84,
    workAuthorization: 'visa',
    requiresVisaSponsorship: true,
  },
];
