/**
 * bh-recruiter-workload - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { RecruiterWorkloadItem } from '../core';

export const MOCK_RECRUITERS: RecruiterWorkloadItem[] = [
  { recruiterId: 'r-1', name: 'Alice Morgan', activePositions: 6, capacity: 8, interviews: 12, pendingTasks: 5 },
  { recruiterId: 'r-2', name: 'Bob Chen', activePositions: 8, capacity: 8, interviews: 15, pendingTasks: 10 },
  { recruiterId: 'r-3', name: 'Carla Ruiz', activePositions: 4, capacity: 8, interviews: 8, pendingTasks: 3 },
  { recruiterId: 'r-4', name: 'Dan Patel', activePositions: 10, capacity: 8, interviews: 20, pendingTasks: 14 },
  { recruiterId: 'r-5', name: 'Eve Kim', activePositions: 3, capacity: 8, interviews: 6, pendingTasks: 2 },
];
