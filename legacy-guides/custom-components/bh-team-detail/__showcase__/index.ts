/**
 * bh-team-detail - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TeamPosition } from '../core';

export const MOCK_MEMBERS = [
  { id: 'm1', name: 'Sofia Martinez', role: 'Team Lead', avatarInitial: 'S', hireDate: '2023-01-15' },
  { id: 'm2', name: 'Alex Kim', role: 'Sr. Recruiter', avatarInitial: 'A', hireDate: '2023-04-20' },
  { id: 'm3', name: 'Rachel Green', role: 'Recruiter', avatarInitial: 'R', hireDate: '2023-07-10' },
  { id: 'm4', name: 'Tom Baker', role: 'Jr. Recruiter', avatarInitial: 'T', hireDate: '2024-01-05' },
  { id: 'm5', name: 'Nina Patel', role: 'Sourcer', avatarInitial: 'N', hireDate: '2024-03-18' },
];

export const MOCK_POSITIONS: TeamPosition[] = [
  { id: 'p1', title: 'Senior Frontend Engineer', status: 'open', assignee: 'Alex Kim' },
  { id: 'p2', title: 'Backend Engineer', status: 'open', assignee: 'Rachel Green' },
  { id: 'p3', title: 'DevOps Engineer', status: 'filled', assignee: 'Sofia Martinez' },
  { id: 'p4', title: 'QA Engineer', status: 'open' },
  { id: 'p5', title: 'Product Manager', status: 'closed' },
  { id: 'p6', title: 'Data Scientist', status: 'open', assignee: 'Tom Baker' },
];

export const MOCK_METRICS = [
  { label: 'Hires This Quarter', value: 18, target: 24 },
  { label: 'Avg Time to Fill', value: 22, target: 30 },
  { label: 'Quality Score', value: 87, target: 90 },
  { label: 'Offer Acceptance', value: 92, target: 95 },
];
