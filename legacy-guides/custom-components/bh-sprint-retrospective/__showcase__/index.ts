/**
 * bh-sprint-retrospective - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { RetroItem } from '../core';

export const MOCK_ITEMS: RetroItem[] = [
  { id: 'r1', text: 'AI screening reduced time-to-shortlist by 40%', category: 'good', votes: 5, author: 'Sarah Chen' },
  { id: 'r2', text: 'Team collaboration on candidate reviews was excellent', category: 'good', votes: 3, author: 'Mike Wilson' },
  { id: 'r3', text: 'Automated scheduling saved hours of coordinator time', category: 'good', votes: 4, author: 'Lisa Park' },
  { id: 'r4', text: 'Interview rubric calibration needs improvement', category: 'improve', votes: 6, author: 'John Davis' },
  { id: 'r5', text: 'Pipeline visibility for hiring managers was lacking', category: 'improve', votes: 4, author: 'Sarah Chen' },
  { id: 'r6', text: 'Candidate feedback loop was too slow', category: 'improve', votes: 2, author: 'Mike Wilson' },
  { id: 'r7', text: 'Create standardized rubric templates for each role type', category: 'action', votes: 7, author: 'Lisa Park' },
  { id: 'r8', text: 'Implement real-time pipeline dashboard for hiring managers', category: 'action', votes: 5, author: 'John Davis' },
  { id: 'r9', text: 'Set up automated candidate status notifications', category: 'action', votes: 3, author: 'Sarah Chen' },
];

/** Sprint goals mock data */
export const MOCK_GOALS = [
  'Fill 5 senior engineering positions',
  'Reduce average time-to-hire to under 30 days',
  'Achieve 90%+ candidate satisfaction score',
];

/** Sprint completion percentage */
export const MOCK_COMPLETION_PERCENTAGE = 72;

/** Team member snapshot mock data */
export const MOCK_MEMBER_SNAPSHOT = [
  { recruiterId: 'rec-1', name: 'Sarah Chen', placementsMade: 3 },
  { recruiterId: 'rec-2', name: 'Mike Wilson', placementsMade: 2 },
  { recruiterId: 'rec-3', name: 'Lisa Park', placementsMade: 4 },
  { recruiterId: 'rec-4', name: 'John Davis', placementsMade: 1 },
];
