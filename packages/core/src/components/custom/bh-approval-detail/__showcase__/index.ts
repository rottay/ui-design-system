/**
 * bh-approval-detail - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ApprovalDetailData } from '../core';

export const MOCK_APPROVAL: ApprovalDetailData = {
  id: 'ap-1',
  entityType: 'offer',
  entityTitle: 'Offer for Sarah Johnson - Senior Frontend Engineer',
  requestedBy: 'Tom Walsh',
  requestedAt: new Date('2026-02-10T14:30:00'),
  description: 'Offer package for Senior Frontend Engineer position at Acme Corp. Includes base salary of $180,000, signing bonus of $15,000, and standard benefits package. Candidate has 8 years of experience and is currently interviewing at two other companies.',
  priority: 'high',
  status: 'pending',
  chain: [
    { approverName: 'Sarah Kim', status: 'approved', decidedAt: new Date('2026-02-11T10:00:00') },
    { approverName: 'Tom Walsh', status: 'approved', decidedAt: new Date('2026-02-11T14:30:00') },
    { approverName: 'Lisa Park', status: 'pending' },
    { approverName: 'Mark Rivera', status: 'pending' },
  ],
  attachments: [
    { name: 'offer_letter_v2.pdf', type: 'pdf' },
    { name: 'compensation_breakdown.xlsx', type: 'spreadsheet' },
    { name: 'candidate_profile.pdf', type: 'pdf' },
  ],
};
