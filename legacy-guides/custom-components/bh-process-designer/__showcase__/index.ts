/**
 * bh-process-designer - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProcessTemplate } from '../core';

export const MOCK_TEMPLATE: ProcessTemplate = {
  id: 'tpl-1',
  name: 'Standard Engineering Hiring',
  description: 'Full-loop process for engineering roles with technical and behavioral rounds.',
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-15T00:00:00Z',
  stages: [
    { id: 'stg-1', name: 'Application Review', type: 'application_review', order: 1, isRequired: true, durationDays: 3, description: 'Resume and portfolio screening' },
    { id: 'stg-2', name: 'Phone Screen', type: 'phone_screen', order: 2, isRequired: true, durationDays: 5, interviewerCount: 1, description: '30-min introductory call' },
    { id: 'stg-3', name: 'Technical Interview', type: 'technical_interview', order: 3, isRequired: true, durationDays: 7, interviewerCount: 2, description: 'Live coding and system design', scoringRubrics: [{ id: 'sr-1', dimensionName: 'Problem Solving', weight: 40, maxScore: 10 }, { id: 'sr-2', dimensionName: 'Code Quality', weight: 30, maxScore: 10 }, { id: 'sr-3', dimensionName: 'Communication', weight: 30, maxScore: 10 }] },
    { id: 'stg-4', name: 'Onsite Interview', type: 'onsite_interview', order: 4, isRequired: true, durationDays: 10, interviewerCount: 4, description: 'Full-day onsite with team' },
    { id: 'stg-5', name: 'Offer', type: 'offer', order: 5, isRequired: true, durationDays: 5, description: 'Compensation package and negotiation' },
  ],
};
