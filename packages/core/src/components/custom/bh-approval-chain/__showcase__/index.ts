/**
 * bh-approval-chain - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ApprovalChainStep } from '../core';

export const MOCK_STEPS: ApprovalChainStep[] = [
  { id: 'step-1', approverName: 'Sarah Kim', approverRole: 'Hiring Manager', status: 'approved', decidedAt: new Date('2026-02-08T10:00:00'), comment: 'Looks great, strong candidate.', order: 1 },
  { id: 'step-2', approverName: 'Tom Walsh', approverRole: 'VP Engineering', status: 'approved', decidedAt: new Date('2026-02-09T14:30:00'), comment: 'Approved. Within budget.', order: 2 },
  { id: 'step-3', approverName: 'Lisa Park', approverRole: 'HR Director', status: 'pending', order: 3 },
  { id: 'step-4', approverName: 'Mark Rivera', approverRole: 'CFO', status: 'pending', order: 4 },
];
