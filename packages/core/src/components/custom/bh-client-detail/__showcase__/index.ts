/**
 * bh-client-detail - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ClientPosition, RevenuePoint } from '../core';

export const MOCK_POSITIONS: ClientPosition[] = [
  { id: 'p1', title: 'Senior Frontend Engineer', status: 'open', candidates: 24, daysOpen: 15 },
  { id: 'p2', title: 'Backend Engineer', status: 'open', candidates: 18, daysOpen: 22 },
  { id: 'p3', title: 'DevOps Engineer', status: 'filled', candidates: 12, daysOpen: 0 },
  { id: 'p4', title: 'QA Lead', status: 'open', candidates: 8, daysOpen: 30 },
  { id: 'p5', title: 'Product Manager', status: 'closed', candidates: 20, daysOpen: 0 },
  { id: 'p6', title: 'Data Scientist', status: 'open', candidates: 15, daysOpen: 10 },
  { id: 'p7', title: 'UI/UX Designer', status: 'filled', candidates: 9, daysOpen: 0 },
];

export const MOCK_REVENUE: RevenuePoint[] = [
  { month: 'Jul', amount: 12000 },
  { month: 'Aug', amount: 15000 },
  { month: 'Sep', amount: 18000 },
  { month: 'Oct', amount: 14000 },
  { month: 'Nov', amount: 22000 },
  { month: 'Dec', amount: 19000 },
  { month: 'Jan', amount: 25000 },
];
