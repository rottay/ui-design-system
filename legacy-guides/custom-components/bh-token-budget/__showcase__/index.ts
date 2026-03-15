/**
 * bh-token-budget - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { BudgetAllocation } from '../core';

export const MOCK_ALLOCATIONS: BudgetAllocation[] = [
  { teamId: 't-1', teamName: 'Engineering', allocated: 5000, used: 3200, alertThreshold: 80 },
  { teamId: 't-2', teamName: 'Product', allocated: 3000, used: 2700, alertThreshold: 75 },
  { teamId: 't-3', teamName: 'Design', allocated: 2000, used: 800, alertThreshold: 90 },
  { teamId: 't-4', teamName: 'Marketing', allocated: 1500, used: 1400, alertThreshold: 85 },
  { teamId: 't-5', teamName: 'Sales', allocated: 2500, used: 1100, alertThreshold: 80 },
];

/** Lifetime token metrics mock data */
export const MOCK_LIFETIME_PURCHASED = 85000;
export const MOCK_LIFETIME_CONSUMED = 62400;
export const MOCK_LIFETIME_EXPIRED = 3200;

/** Auto-purchase configuration mock data */
export const MOCK_AUTO_PURCHASE_ENABLED = true;
export const MOCK_AUTO_PURCHASE_THRESHOLD = 500;
export const MOCK_AUTO_PURCHASE_AMOUNT = 5000;
export const MOCK_LAST_PURCHASE_AT = '2026-02-10T14:30:00Z';
export const MOCK_LOW_BALANCE_ALERT_SENT = false;
