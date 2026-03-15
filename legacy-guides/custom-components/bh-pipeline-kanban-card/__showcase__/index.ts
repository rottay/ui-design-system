/**
 * bh-pipeline-kanban-card - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { KanbanCandidate } from '../core';

export const MOCK_CANDIDATE: KanbanCandidate = {
  id: 'kan-1',
  name: 'Sarah Johnson',
  avatarInitial: 'SJ',
  score: 85,
  stage: 'Technical Interview',
  appliedAt: new Date(Date.now() - 86400000 * 3),
  tags: ['Senior', 'Remote', 'Referred'],
};
