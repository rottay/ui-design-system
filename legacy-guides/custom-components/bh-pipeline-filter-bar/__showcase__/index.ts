/**
 * bh-pipeline-filter-bar - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { FilterConfig, ActiveFilter, SavedPreset } from '../core';

export const MOCK_FILTERS: FilterConfig[] = [
  { id: 'job', label: 'Job', type: 'select', options: [{ value: 'swe', label: 'Software Engineer', count: 24 }, { value: 'pm', label: 'Product Manager', count: 12 }, { value: 'design', label: 'UX Designer', count: 8 }], placeholder: 'Select job...' },
  { id: 'recruiter', label: 'Recruiter', type: 'select', options: [{ value: 'anna', label: 'Anna Smith', count: 18 }, { value: 'bob', label: 'Bob Jones', count: 14 }, { value: 'carol', label: 'Carol Lee', count: 12 }], placeholder: 'Select recruiter...' },
  { id: 'dateRange', label: 'Date Range', type: 'daterange', placeholder: 'Select dates...' },
  { id: 'priority', label: 'Priority', type: 'multiselect', options: [{ value: 'critical', label: 'Critical', count: 3 }, { value: 'high', label: 'High', count: 10 }, { value: 'medium', label: 'Medium', count: 22 }, { value: 'low', label: 'Low', count: 9 }], placeholder: 'Select priority...' },
  { id: 'source', label: 'Source', type: 'select', options: [{ value: 'linkedin', label: 'LinkedIn', count: 30 }, { value: 'referral', label: 'Referral', count: 14 }, { value: 'careers', label: 'Careers Page', count: 8 }], placeholder: 'Select source...' },
];

export const MOCK_ACTIVE: ActiveFilter[] = [
  { filterId: 'job', value: 'swe', label: 'Software Engineer' },
  { filterId: 'priority', value: ['high', 'critical'], label: 'High, Critical' },
];

export const MOCK_PRESETS: SavedPreset[] = [
  { id: 'sp-1', name: 'Engineering Pipeline', filters: [{ filterId: 'job', value: 'swe', label: 'Software Engineer' }], createdAt: new Date(Date.now() - 86400000 * 3) },
  { id: 'sp-2', name: 'Urgent Hires', filters: [{ filterId: 'priority', value: ['critical', 'high'], label: 'Critical, High' }], createdAt: new Date(Date.now() - 86400000 * 7) },
];
