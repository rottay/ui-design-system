/**
 * bh-message-template-editor - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TemplateVariable } from '../core';

export const DEFAULT_VARIABLES: TemplateVariable[] = [
  { key: 'firstName', label: 'First Name', defaultValue: 'John' },
  { key: 'lastName', label: 'Last Name', defaultValue: 'Doe' },
  { key: 'company', label: 'Company', defaultValue: 'Acme Inc.' },
  { key: 'position', label: 'Position', defaultValue: 'Software Engineer' },
  { key: 'recruiterName', label: 'Recruiter Name', defaultValue: 'Sarah' },
];

/** Template metadata mock data */
export const MOCK_TEMPLATE_TYPE = 'email' as const;
export const MOCK_TARGET_AUDIENCE = 'Senior Engineers';
export const MOCK_USE_CASE = 'Initial Outreach';
export const MOCK_LANGUAGE = 'en';
export const MOCK_IS_SHARED = true;
export const MOCK_REQUIRES_APPROVAL = false;
export const MOCK_VERSION = 3;
export const MOCK_PLAIN_TEXT_BODY = 'Hi John,\n\nI came across your profile and was impressed by your experience. We have an exciting Software Engineer role at Acme Inc. that I think would be a great fit.\n\nWould you be open to a brief conversation?\n\nBest regards,\nSarah';
