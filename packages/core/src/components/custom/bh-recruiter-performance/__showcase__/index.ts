/**
 * bh-recruiter-performance - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { RecruiterPerformanceItem } from '../core';

export const MOCK_RECRUITERS: RecruiterPerformanceItem[] = [
  { recruiterId: 'r-1', name: 'Alice Morgan', hires: 12, timeToFill: 28, qualityScore: 92, candidateSatisfaction: 88, pipelineVelocity: 85, activePositions: 6 },
  { recruiterId: 'r-2', name: 'Bob Chen', hires: 9, timeToFill: 35, qualityScore: 78, candidateSatisfaction: 82, pipelineVelocity: 72, activePositions: 8 },
  { recruiterId: 'r-3', name: 'Carla Ruiz', hires: 15, timeToFill: 22, qualityScore: 95, candidateSatisfaction: 91, pipelineVelocity: 90, activePositions: 5 },
  { recruiterId: 'r-4', name: 'Dan Patel', hires: 7, timeToFill: 42, qualityScore: 70, candidateSatisfaction: 75, pipelineVelocity: 60, activePositions: 10 },
];
