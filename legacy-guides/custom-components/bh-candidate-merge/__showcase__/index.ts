/**
 * bh-candidate-merge - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { MergeField } from '../core';
import type { DBCandidate } from '@rottay/recruiter';

export const MOCK_CANDIDATES: DBCandidate[] = [
  { id: 'mc-1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.johnson@gmail.com', phone: '+1 (555) 123-4567', source: 'linkedin' } as DBCandidate,
  { id: 'mc-2', firstName: 'Sarah M.', lastName: 'Johnson', email: 's.johnson@yahoo.com', phone: '+1 (555) 123-4567', source: 'career_page' } as DBCandidate,
];

export const MOCK_FIELDS: MergeField[] = [
  { field: 'Name', values: ['Sarah Johnson', 'Sarah M. Johnson'], selectedIndex: 0 },
  { field: 'Email', values: ['sarah.johnson@gmail.com', 's.johnson@yahoo.com'], selectedIndex: 0 },
  { field: 'Phone', values: ['+1 (555) 123-4567', '+1 (555) 123-4567'], selectedIndex: 0 },
  { field: 'Source', values: ['LinkedIn', 'Career Page'], selectedIndex: 0 },
  { field: 'Applied', values: ['2026-01-10', '2026-01-15'], selectedIndex: 1 },
];
