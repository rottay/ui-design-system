/**
 * bh-team-card - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TeamMetric } from '../core';

export const MOCK_METRICS: TeamMetric[] = [
  { label: 'Hires', value: 18, target: 24 },
  { label: 'Time to Fill', value: 22, target: 30 },
  { label: 'Quality Score', value: 87, target: 90 },
  { label: 'Satisfaction', value: 4.3, target: 5 },
];
