/**
 * bh-pipeline-stats-bar - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { StageConversion } from '../core';

export const MOCK_CONVERSIONS: StageConversion[] = [
  { fromStage: 'Applied', toStage: 'Screening', rate: 68, candidateCount: 156, trend: 'up' },
  { fromStage: 'Screening', toStage: 'Interview', rate: 52, candidateCount: 106, trend: 'flat' },
  { fromStage: 'Interview', toStage: 'Assessment', rate: 45, candidateCount: 55, trend: 'down' },
  { fromStage: 'Assessment', toStage: 'Offer', rate: 38, candidateCount: 25, trend: 'up' },
  { fromStage: 'Offer', toStage: 'Hired', rate: 82, candidateCount: 20, trend: 'up' },
];

export const MOCK_TIME_TO_HIRE = { days: 34, trend: 'down' as const, previousDays: 38 };
