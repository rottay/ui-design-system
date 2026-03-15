/**
 * bh-calibration-dashboard - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { CalibrationSession, CalibrationMetrics } from '../core';

export const MOCK_SESSIONS: CalibrationSession[] = [
  {
    id: 'cs-1', rubricName: 'Senior Engineer Rubric', status: 'active', progress: 0.65,
    totalSamples: 20, completedSamples: 13, participants: ['Alex R.', 'Maria G.', 'Tom B.', 'Lisa W.'],
    agreementRate: 0.78, startedAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: 'cs-2', rubricName: 'Product Manager Rubric', status: 'active', progress: 0.30,
    totalSamples: 15, completedSamples: 5, participants: ['David P.', 'Anna K.'],
    agreementRate: 0.65, startedAt: new Date(Date.now() - 86400000),
  },
  {
    id: 'cs-3', rubricName: 'Design Lead Rubric', status: 'completed', progress: 1.0,
    totalSamples: 12, completedSamples: 12, participants: ['Sarah J.', 'Michael C.', 'Emily R.'],
    agreementRate: 0.92, startedAt: new Date(Date.now() - 86400000 * 7), completedAt: new Date(Date.now() - 86400000 * 1),
  },
  {
    id: 'cs-4', rubricName: 'Data Scientist Rubric', status: 'paused', progress: 0.45,
    totalSamples: 10, completedSamples: 5, participants: ['James K.', 'Robert L.'],
    agreementRate: 0.55, startedAt: new Date(Date.now() - 86400000 * 5),
  },
  {
    id: 'cs-5', rubricName: 'DevOps Engineer Rubric', status: 'completed', progress: 1.0,
    totalSamples: 18, completedSamples: 18, participants: ['Tom B.', 'Lisa W.', 'Anna K.', 'David P.'],
    agreementRate: 0.85, startedAt: new Date(Date.now() - 86400000 * 14), completedAt: new Date(Date.now() - 86400000 * 3),
  },
];

export const MOCK_METRICS: CalibrationMetrics = {
  activeSessions: 2,
  totalCompleted: 12,
  avgAgreementRate: 0.78,
  avgDeviation: 0.42,
  topPerformingRubric: 'Design Lead Rubric',
  worstPerformingRubric: 'Data Scientist Rubric',
};
