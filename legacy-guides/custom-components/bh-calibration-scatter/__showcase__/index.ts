/**
 * bh-calibration-scatter - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ScatterPoint, CalibrationStats } from '../core';

export const MOCK_POINTS: ScatterPoint[] = [
  { id: 'sp-1', humanScore: 4.2, aiScore: 4.0, candidateName: 'Sarah Johnson', dimensionName: 'Technical', deviation: 0.2, calibrated: true },
  { id: 'sp-2', humanScore: 3.5, aiScore: 3.8, candidateName: 'Michael Chen', dimensionName: 'Problem Solving', deviation: -0.3, calibrated: true },
  { id: 'sp-3', humanScore: 2.8, aiScore: 3.5, candidateName: 'Emily Rodriguez', dimensionName: 'Communication', deviation: -0.7, calibrated: false },
  { id: 'sp-4', humanScore: 4.8, aiScore: 4.5, candidateName: 'James Kim', dimensionName: 'Leadership', deviation: 0.3, calibrated: true },
  { id: 'sp-5', humanScore: 1.5, aiScore: 2.8, candidateName: 'Anna Kowalski', dimensionName: 'Technical', deviation: -1.3, calibrated: false },
  { id: 'sp-6', humanScore: 3.0, aiScore: 3.2, candidateName: 'David Park', dimensionName: 'System Design', deviation: -0.2, calibrated: true },
  { id: 'sp-7', humanScore: 4.5, aiScore: 3.8, candidateName: 'Lisa Wang', dimensionName: 'Cultural Fit', deviation: 0.7, calibrated: false },
  { id: 'sp-8', humanScore: 2.0, aiScore: 2.2, candidateName: 'Tom Baker', dimensionName: 'Problem Solving', deviation: -0.2, calibrated: true },
  { id: 'sp-9', humanScore: 3.8, aiScore: 4.2, candidateName: 'Maria Garcia', dimensionName: 'Communication', deviation: -0.4, calibrated: true },
  { id: 'sp-10', humanScore: 4.0, aiScore: 2.5, candidateName: 'Robert Lee', dimensionName: 'Technical', deviation: 1.5, calibrated: false },
];

export const MOCK_STATS: CalibrationStats = {
  correlation: 0.78,
  meanDeviation: 0.52,
  sampleCount: 10,
  agreementRate: 0.72,
};
