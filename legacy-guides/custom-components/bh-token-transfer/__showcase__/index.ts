/**
 * bh-token-transfer - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TokenTransfer } from '../core';

export const MOCK_TRANSFERS: TokenTransfer[] = [
  {
    id: 'tt-1',
    fromTeam: { id: 'team-eng', name: 'Engineering' },
    toTeam: { id: 'team-design', name: 'Design' },
    amount: 500,
    reason: 'Design sprint support for Q1 product launch',
    status: 'completed',
    requestedBy: 'Sarah Kim',
    requestedAt: new Date('2026-01-15T09:00:00'),
    approvedBy: 'Tom Walsh',
    approvedAt: new Date('2026-01-15T11:30:00'),
  },
  {
    id: 'tt-2',
    fromTeam: { id: 'team-hr', name: 'HR' },
    toTeam: { id: 'team-eng', name: 'Engineering' },
    amount: 1200,
    reason: 'Senior developer hiring campaign tokens',
    status: 'approved',
    requestedBy: 'Lisa Park',
    requestedAt: new Date('2026-01-20T14:00:00'),
    approvedBy: 'Mark Rivera',
    approvedAt: new Date('2026-01-21T10:00:00'),
    notes: 'Approved for Q1 hiring budget',
  },
  {
    id: 'tt-3',
    fromTeam: { id: 'team-marketing', name: 'Marketing' },
    toTeam: { id: 'team-sales', name: 'Sales' },
    amount: 800,
    reason: 'Lead generation outreach campaign',
    status: 'pending',
    requestedBy: 'James Chen',
    requestedAt: new Date('2026-02-05T16:00:00'),
  },
  {
    id: 'tt-4',
    fromTeam: { id: 'team-eng', name: 'Engineering' },
    toTeam: { id: 'team-qa', name: 'QA' },
    amount: 300,
    reason: 'Automated testing infrastructure tokens',
    status: 'rejected',
    requestedBy: 'Anna Lee',
    requestedAt: new Date('2026-02-01T08:30:00'),
    approvedBy: 'Tom Walsh',
    approvedAt: new Date('2026-02-01T15:00:00'),
    notes: 'Budget exceeded for this quarter',
  },
  {
    id: 'tt-5',
    fromTeam: { id: 'team-sales', name: 'Sales' },
    toTeam: { id: 'team-support', name: 'Support' },
    amount: 450,
    reason: 'Customer onboarding assistance tokens',
    status: 'pending',
    requestedBy: 'David Park',
    requestedAt: new Date('2026-02-10T10:00:00'),
    notes: 'Urgent - new enterprise client onboarding',
  },
  {
    id: 'tt-6',
    fromTeam: { id: 'team-design', name: 'Design' },
    toTeam: { id: 'team-marketing', name: 'Marketing' },
    amount: 250,
    reason: 'Brand refresh creative assets',
    status: 'completed',
    requestedBy: 'Maria Lopez',
    requestedAt: new Date('2026-01-28T11:00:00'),
    approvedBy: 'Lisa Park',
    approvedAt: new Date('2026-01-28T14:00:00'),
  },
];
