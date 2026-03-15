/**
 * bh-hiring-funnel - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { FunnelStage } from '../core';

export const MOCK_STAGES: FunnelStage[] = [
  { name: 'Applied', count: 1240, conversionRate: 100 },
  { name: 'Screened', count: 620, conversionRate: 50 },
  { name: 'Interviewed', count: 248, conversionRate: 40 },
  { name: 'Technical', count: 124, conversionRate: 50 },
  { name: 'Offer', count: 37, conversionRate: 30 },
  { name: 'Hired', count: 28, conversionRate: 76 },
];
