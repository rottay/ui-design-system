/**
 * bh-approval-center - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ApprovalItem } from '../core';

export const MOCK_APPROVALS: ApprovalItem[] = [
  { id: 'ap-1', entityType: 'offer', entityTitle: 'Offer for Sarah Johnson - Sr. Engineer', requestedBy: 'Tom Walsh', requestedAt: new Date('2026-02-10T14:30:00'), priority: 'high', status: 'pending' },
  { id: 'ap-2', entityType: 'position', entityTitle: 'New DevOps Lead Position', requestedBy: 'Emily Chen', requestedAt: new Date('2026-02-11T09:00:00'), priority: 'medium', status: 'pending' },
  { id: 'ap-3', entityType: 'budget', entityTitle: 'Q2 Recruiting Budget Increase', requestedBy: 'Mark Rivera', requestedAt: new Date('2026-02-09T16:00:00'), priority: 'high', status: 'pending' },
  { id: 'ap-4', entityType: 'job', entityTitle: 'Senior Data Scientist Job Posting', requestedBy: 'Lisa Park', requestedAt: new Date('2026-02-11T11:30:00'), priority: 'low', status: 'pending' },
  { id: 'ap-5', entityType: 'offer', entityTitle: 'Offer for Mike Lee - Product Manager', requestedBy: 'Tom Walsh', requestedAt: new Date('2026-02-08T10:00:00'), priority: 'medium', status: 'approved' },
  { id: 'ap-6', entityType: 'position', entityTitle: 'Junior Frontend Developer', requestedBy: 'Sarah Kim', requestedAt: new Date('2026-02-07T08:30:00'), priority: 'low', status: 'rejected' },
];
