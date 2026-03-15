/**
 * bh-pipeline-global-kanban - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { KanbanStage } from '../core';

export const MOCK_STAGES: KanbanStage[] = [
  {
    id: 'applied',
    name: 'Applied',
    limit: 30,
    candidates: [
      { id: 'c-1', name: 'Sarah Johnson', avatarInitial: 'SJ', score: 85, appliedAt: new Date(Date.now() - 86400000 * 1), tags: ['Referred'] },
      { id: 'c-2', name: 'Michael Chen', avatarInitial: 'MC', score: 72, appliedAt: new Date(Date.now() - 86400000 * 2), tags: ['Senior'] },
      { id: 'c-3', name: 'Emily Rodriguez', avatarInitial: 'ER', score: 91, appliedAt: new Date(Date.now() - 86400000 * 1), tags: ['Remote'] },
      { id: 'c-4', name: 'David Park', avatarInitial: 'DP', score: 68, appliedAt: new Date(Date.now() - 86400000 * 3) },
    ],
  },
  {
    id: 'screening',
    name: 'Phone Screen',
    limit: 15,
    candidates: [
      { id: 'c-5', name: 'Anna Kowalski', avatarInitial: 'AK', score: 78, appliedAt: new Date(Date.now() - 86400000 * 4), tags: ['Mid-level'] },
      { id: 'c-6', name: 'James Kim', avatarInitial: 'JK', score: 65, appliedAt: new Date(Date.now() - 86400000 * 5) },
      { id: 'c-7', name: 'Lisa Wang', avatarInitial: 'LW', score: 88, appliedAt: new Date(Date.now() - 86400000 * 3), tags: ['Senior', 'Referred'] },
    ],
  },
  {
    id: 'technical',
    name: 'Technical Interview',
    limit: 8,
    candidates: [
      { id: 'c-8', name: 'Robert Taylor', avatarInitial: 'RT', score: 82, appliedAt: new Date(Date.now() - 86400000 * 7), tags: ['Lead'] },
      { id: 'c-9', name: 'Maria Santos', avatarInitial: 'MS', score: 94, appliedAt: new Date(Date.now() - 86400000 * 6) },
    ],
  },
  {
    id: 'final',
    name: 'Final Round',
    limit: 5,
    candidates: [
      { id: 'c-10', name: 'Thomas Brown', avatarInitial: 'TB', score: 89, appliedAt: new Date(Date.now() - 86400000 * 10), tags: ['Senior'] },
    ],
  },
  {
    id: 'offer',
    name: 'Offer',
    limit: 3,
    candidates: [],
  },
];
