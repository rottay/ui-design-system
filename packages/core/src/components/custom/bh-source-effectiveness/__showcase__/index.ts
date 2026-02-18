/**
 * bh-source-effectiveness - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SourceMetrics } from '../core';

export const MOCK_SOURCES: SourceMetrics[] = [
  { source: 'LinkedIn', applicants: 420, qualified: 168, hired: 34, hireRate: 8.1, qualityScore: 82 },
  { source: 'Indeed', applicants: 680, qualified: 136, hired: 22, hireRate: 3.2, qualityScore: 58 },
  { source: 'Referrals', applicants: 95, qualified: 62, hired: 28, hireRate: 29.5, qualityScore: 94 },
  { source: 'Career Page', applicants: 310, qualified: 124, hired: 18, hireRate: 5.8, qualityScore: 72 },
  { source: 'University', applicants: 180, qualified: 90, hired: 15, hireRate: 8.3, qualityScore: 76 },
];
