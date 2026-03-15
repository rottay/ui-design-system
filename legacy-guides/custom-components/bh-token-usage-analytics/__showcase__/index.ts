/**
 * bh-token-usage-analytics - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TokenUsagePoint, TokenCategory } from '../core';

export const MOCK_USAGE: TokenUsagePoint[] = [
  { date: '2026-01-06', tokens: 124000, cost: 3.72 },
  { date: '2026-01-13', tokens: 156000, cost: 4.68 },
  { date: '2026-01-20', tokens: 189000, cost: 5.67 },
  { date: '2026-01-27', tokens: 142000, cost: 4.26 },
  { date: '2026-02-03', tokens: 198000, cost: 5.94 },
  { date: '2026-02-10', tokens: 221000, cost: 6.63 },
];

export const MOCK_CATEGORIES: TokenCategory[] = [
  { category: 'Resume Parsing', tokens: 420000, percentage: 35 },
  { category: 'Interview Analysis', tokens: 264000, percentage: 22 },
  { category: 'Job Description', tokens: 192000, percentage: 16 },
  { category: 'Candidate Matching', tokens: 156000, percentage: 13 },
  { category: 'Email Generation', tokens: 108000, percentage: 9 },
  { category: 'Other', tokens: 60000, percentage: 5 },
];
