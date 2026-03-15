/**
 * bh-diversity-dashboard - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { DiversityMetric } from '../core';

export const MOCK_METRICS: DiversityMetric[] = [
  {
    category: 'Gender',
    segments: [
      { label: 'Female', count: 456, percentage: 42 },
      { label: 'Male', count: 534, percentage: 49 },
      { label: 'Non-Binary', count: 67, percentage: 6 },
      { label: 'Prefer not to say', count: 33, percentage: 3 },
    ],
  },
  {
    category: 'Ethnicity',
    segments: [
      { label: 'White', count: 380, percentage: 35 },
      { label: 'Asian', count: 280, percentage: 26 },
      { label: 'Hispanic/Latino', count: 185, percentage: 17 },
      { label: 'Black', count: 142, percentage: 13 },
      { label: 'Other', count: 103, percentage: 9 },
    ],
  },
  {
    category: 'Age Group',
    segments: [
      { label: '18-25', count: 178, percentage: 16 },
      { label: '26-35', count: 456, percentage: 42 },
      { label: '36-45', count: 289, percentage: 27 },
      { label: '46-55', count: 120, percentage: 11 },
      { label: '56+', count: 47, percentage: 4 },
    ],
  },
  {
    category: 'Experience Level',
    segments: [
      { label: 'Junior', count: 312, percentage: 29 },
      { label: 'Mid-Level', count: 423, percentage: 39 },
      { label: 'Senior', count: 245, percentage: 22 },
      { label: 'Executive', count: 110, percentage: 10 },
    ],
  },
];
