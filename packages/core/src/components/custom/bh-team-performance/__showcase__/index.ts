/**
 * bh-team-performance - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TeamPerfData } from '../core';

export const MOCK_TEAMS: TeamPerfData[] = [
  { teamName: 'Engineering', hires: 24, timeToFill: 28, qualityScore: 88, satisfaction: 4.5 },
  { teamName: 'Product', hires: 16, timeToFill: 22, qualityScore: 82, satisfaction: 4.2 },
  { teamName: 'GTM', hires: 20, timeToFill: 35, qualityScore: 74, satisfaction: 3.8 },
  { teamName: 'Executive', hires: 8, timeToFill: 45, qualityScore: 91, satisfaction: 4.7 },
  { teamName: 'Campus', hires: 30, timeToFill: 18, qualityScore: 79, satisfaction: 4.0 },
  { teamName: 'Remote', hires: 18, timeToFill: 25, qualityScore: 85, satisfaction: 4.3 },
];
