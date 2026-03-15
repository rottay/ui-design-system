/**
 * bh-proctoring-severity - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SeverityCount } from '../core';

export const MOCK_SEVERITY: SeverityCount[] = [
  { severity: 'critical', count: 5 },
  { severity: 'high', count: 18 },
  { severity: 'medium', count: 42 },
  { severity: 'low', count: 62 },
];
