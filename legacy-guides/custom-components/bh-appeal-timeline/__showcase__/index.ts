/**
 * bh-appeal-timeline - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { AppealTimelineEvent } from '../core';

export const MOCK_EVENTS: AppealTimelineEvent[] = [
  { id: 'e-1', type: 'submitted', description: 'Appeal submitted by hiring manager', date: new Date(Date.now() - 259200000), actor: 'Maria Garcia' },
  { id: 'e-2', type: 'assigned', description: 'Assigned to senior reviewer for evaluation', date: new Date(Date.now() - 172800000), actor: 'System' },
  { id: 'e-3', type: 'reviewed', description: 'Initial review completed, additional evidence requested', date: new Date(Date.now() - 86400000), actor: 'David Park' },
  { id: 'e-4', type: 'decision', description: 'Appeal approved after thorough review of evidence', date: new Date(Date.now() - 3600000), actor: 'David Park' },
  { id: 'e-5', type: 'notified', description: 'Candidate and hiring team notified of decision', date: new Date(Date.now() - 1800000), actor: 'System' },
];
