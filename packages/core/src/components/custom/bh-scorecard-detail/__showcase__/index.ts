/**
 * bh-scorecard-detail - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ScorecardDetail } from '../core';

export const MOCK_SCORECARD: ScorecardDetail = {
  id: 'sc-1',
  scorableId: 'int-1',
  candidateName: 'Sarah Johnson',
  jobTitle: 'Senior Frontend Engineer',
  overallScore: 4.2,
  maxScore: 5,
  dimensions: [
    { dimensionId: 'dim-1', dimensionName: 'Technical Knowledge', score: 4.5, maxScore: 5, weight: 0.25, confidence: 0.92, evidenceCount: 8, notes: 'Strong React and TypeScript skills' },
    { dimensionId: 'dim-2', dimensionName: 'Problem Solving', score: 4.0, maxScore: 5, weight: 0.20, confidence: 0.85, evidenceCount: 6 },
    { dimensionId: 'dim-3', dimensionName: 'Communication', score: 4.8, maxScore: 5, weight: 0.15, confidence: 0.90, evidenceCount: 5 },
    { dimensionId: 'dim-4', dimensionName: 'System Design', score: 3.5, maxScore: 5, weight: 0.20, confidence: 0.78, evidenceCount: 4 },
    { dimensionId: 'dim-5', dimensionName: 'Cultural Fit', score: 4.2, maxScore: 5, weight: 0.10, confidence: 0.88, evidenceCount: 3 },
    { dimensionId: 'dim-6', dimensionName: 'Leadership', score: 3.8, maxScore: 5, weight: 0.10, confidence: 0.72, evidenceCount: 2 },
  ],
  scoredBy: 'Alex Rivera',
  scoredAt: new Date(Date.now() - 3600000),
  calibrated: true,
  status: 'calibrated',
};
