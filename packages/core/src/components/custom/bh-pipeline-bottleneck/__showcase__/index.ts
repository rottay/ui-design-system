/**
 * bh-pipeline-bottleneck - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { BottleneckStage } from '../core';

export const MOCK_STAGES: BottleneckStage[] = [
  { id: 's-1', name: 'Applied', candidateCount: 156, avgDaysInStage: 2, expectedDays: 3, isBottleneck: false },
  { id: 's-2', name: 'Screening', candidateCount: 106, avgDaysInStage: 4, expectedDays: 5, isBottleneck: false },
  { id: 's-3', name: 'Interview', candidateCount: 55, avgDaysInStage: 8, expectedDays: 7, isBottleneck: false },
  { id: 's-4', name: 'Assessment', candidateCount: 42, avgDaysInStage: 14, expectedDays: 5, isBottleneck: true },
  { id: 's-5', name: 'Offer', candidateCount: 20, avgDaysInStage: 3, expectedDays: 4, isBottleneck: false },
  { id: 's-6', name: 'Hired', candidateCount: 16, avgDaysInStage: 1, expectedDays: 2, isBottleneck: false },
];
