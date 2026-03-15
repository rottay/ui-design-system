/**
 * bh-appeal-list - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { AppealListItem } from '../core';

export const MOCK_APPEALS: AppealListItem[] = [
  { id: 'a-1', candidateName: 'Sarah Johnson', positionTitle: 'Senior Frontend Engineer', status: 'pending', submittedAt: new Date(Date.now() - 3600000), priority: 'high' },
  { id: 'a-2', candidateName: 'Michael Chen', positionTitle: 'Staff Backend Developer', status: 'under-review', submittedAt: new Date(Date.now() - 86400000), priority: 'medium' },
  { id: 'a-3', candidateName: 'Emily Rodriguez', positionTitle: 'Data Scientist', status: 'approved', submittedAt: new Date(Date.now() - 172800000), priority: 'low' },
  { id: 'a-4', candidateName: 'James Kim', positionTitle: 'DevOps Engineer', status: 'denied', submittedAt: new Date(Date.now() - 259200000), priority: 'medium' },
  { id: 'a-5', candidateName: 'Anna Kowalski', positionTitle: 'Product Manager', status: 'pending', submittedAt: new Date(Date.now() - 7200000), priority: 'high' },
];
