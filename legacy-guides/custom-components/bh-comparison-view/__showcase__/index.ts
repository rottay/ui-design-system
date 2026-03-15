/**
 * bh-comparison-view - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ComparisonCandidate, ComparisonRow } from '../core';

export const DEFAULT_CANDIDATES: ComparisonCandidate[] = [
  { id: 'c-1', name: 'Sarah Johnson', overallScore: 92, rank: 1, dimensionScores: [{ dimension: 'Technical', score: 95 }, { dimension: 'Leadership', score: 88 }, { dimension: 'Communication', score: 90 }, { dimension: 'Culture Fit', score: 94 }, { dimension: 'Experience', score: 91 }], strengths: ['Deep React expertise', 'Strong system design', 'Google-level experience'], weaknesses: ['Limited backend experience'] },
  { id: 'c-2', name: 'Michael Chen', overallScore: 88, rank: 2, dimensionScores: [{ dimension: 'Technical', score: 90 }, { dimension: 'Leadership', score: 85 }, { dimension: 'Communication', score: 82 }, { dimension: 'Culture Fit', score: 91 }, { dimension: 'Experience', score: 88 }], strengths: ['Full-stack capability', 'Startup experience at Stripe'], weaknesses: ['Needs mentorship on architecture', 'Shorter tenure history'] },
  { id: 'c-3', name: 'Emily Rodriguez', overallScore: 85, rank: 3, dimensionScores: [{ dimension: 'Technical', score: 88 }, { dimension: 'Leadership', score: 92 }, { dimension: 'Communication', score: 86 }, { dimension: 'Culture Fit', score: 80 }, { dimension: 'Experience', score: 82 }], strengths: ['Staff engineer at Meta', 'Strong leadership skills'], weaknesses: ['Culture fit concerns', 'Salary expectations high'] },
];

export const DEFAULT_ROWS: ComparisonRow[] = [
  { dimension: 'Technical', scores: [{ candidateId: 'c-1', score: 95 }, { candidateId: 'c-2', score: 90 }, { candidateId: 'c-3', score: 88 }] },
  { dimension: 'Leadership', scores: [{ candidateId: 'c-1', score: 88 }, { candidateId: 'c-2', score: 85 }, { candidateId: 'c-3', score: 92 }] },
  { dimension: 'Communication', scores: [{ candidateId: 'c-1', score: 90 }, { candidateId: 'c-2', score: 82 }, { candidateId: 'c-3', score: 86 }] },
  { dimension: 'Culture Fit', scores: [{ candidateId: 'c-1', score: 94 }, { candidateId: 'c-2', score: 91 }, { candidateId: 'c-3', score: 80 }] },
  { dimension: 'Experience', scores: [{ candidateId: 'c-1', score: 91 }, { candidateId: 'c-2', score: 88 }, { candidateId: 'c-3', score: 82 }] },
];
