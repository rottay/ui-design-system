/**
 * bh-pipeline-comparison - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ComparisonJob } from '../core';

export const MOCK_JOB_A: ComparisonJob = {
  id: 'j-1',
  title: 'Senior Software Engineer',
  department: 'Engineering',
  recruiter: 'Anna Smith',
  totalCandidates: 156,
  timeToHireDays: 34,
  overallConversionRate: 10,
  stages: [
    { name: 'Applied', candidateCount: 156, conversionRate: 68, avgDaysInStage: 2 },
    { name: 'Screening', candidateCount: 106, conversionRate: 52, avgDaysInStage: 4 },
    { name: 'Interview', candidateCount: 55, conversionRate: 45, avgDaysInStage: 8 },
    { name: 'Assessment', candidateCount: 25, conversionRate: 64, avgDaysInStage: 6 },
    { name: 'Offer', candidateCount: 16, conversionRate: 82, avgDaysInStage: 3 },
  ],
};

export const MOCK_JOB_B: ComparisonJob = {
  id: 'j-2',
  title: 'Product Manager',
  department: 'Product',
  recruiter: 'Bob Jones',
  totalCandidates: 98,
  timeToHireDays: 28,
  overallConversionRate: 14,
  stages: [
    { name: 'Applied', candidateCount: 98, conversionRate: 72, avgDaysInStage: 1 },
    { name: 'Screening', candidateCount: 71, conversionRate: 58, avgDaysInStage: 3 },
    { name: 'Interview', candidateCount: 41, conversionRate: 56, avgDaysInStage: 5 },
    { name: 'Assessment', candidateCount: 23, conversionRate: 61, avgDaysInStage: 4 },
    { name: 'Offer', candidateCount: 14, conversionRate: 86, avgDaysInStage: 2 },
  ],
};
