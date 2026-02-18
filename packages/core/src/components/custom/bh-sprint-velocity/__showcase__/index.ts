/**
 * bh-sprint-velocity - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SprintVelocityData } from '../core';

export const MOCK_SPRINTS: SprintVelocityData[] = [
  { sprintName: 'Sprint 7', planned: 32, completed: 28, carryOver: 4 },
  { sprintName: 'Sprint 8', planned: 35, completed: 30, carryOver: 5 },
  { sprintName: 'Sprint 9', planned: 30, completed: 30, carryOver: 0 },
  { sprintName: 'Sprint 10', planned: 38, completed: 32, carryOver: 6 },
  { sprintName: 'Sprint 11', planned: 36, completed: 34, carryOver: 2 },
  { sprintName: 'Sprint 12', planned: 40, completed: 25, carryOver: 0 },
];
