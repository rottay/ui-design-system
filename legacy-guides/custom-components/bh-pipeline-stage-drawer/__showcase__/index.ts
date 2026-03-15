/**
 * bh-pipeline-stage-drawer - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { StageDetail } from '../core';

export const MOCK_STAGE: StageDetail = {
  name: 'Technical Interview',
  candidateCount: 12,
  avgDays: 4.5,
  conversionRate: 0.67,
  candidates: [
    { id: 'c-1', name: 'Sarah Johnson', avatarInitial: 'SJ', status: 'active', appliedAt: new Date(Date.now() - 86400000 * 2), score: 85 },
    { id: 'c-2', name: 'Michael Chen', avatarInitial: 'MC', status: 'new', appliedAt: new Date(Date.now() - 86400000), score: 72 },
    { id: 'c-3', name: 'Emily Rodriguez', avatarInitial: 'ER', status: 'active', appliedAt: new Date(Date.now() - 86400000 * 5), score: 91 },
    { id: 'c-4', name: 'James Kim', avatarInitial: 'JK', status: 'on_hold', appliedAt: new Date(Date.now() - 86400000 * 3), score: 65 },
    { id: 'c-5', name: 'Anna Kowalski', avatarInitial: 'AK', status: 'active', appliedAt: new Date(Date.now() - 86400000 * 7), score: 78 },
    { id: 'c-6', name: 'David Park', avatarInitial: 'DP', status: 'new', appliedAt: new Date(Date.now() - 3600000 * 6), score: 88 },
  ],
};

export const MOCK_TREND = [55, 62, 58, 70, 65, 72, 67];
