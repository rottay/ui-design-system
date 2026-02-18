/**
 * bh-workflow-notification - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { NotificationRule } from '../core';

export const MOCK_RULES: NotificationRule[] = [
  { id: 'n-1', event: 'Candidate Applied', channel: 'email', recipients: ['recruiter@company.com', 'hiring-mgr@company.com'], enabled: true, template: 'new-application' },
  { id: 'n-2', event: 'Interview Scheduled', channel: 'slack', recipients: ['#hiring-updates'], enabled: true, template: 'interview-scheduled' },
  { id: 'n-3', event: 'Offer Extended', channel: 'email', recipients: ['hr@company.com'], enabled: true, template: 'offer-notification' },
  { id: 'n-4', event: 'Assessment Completed', channel: 'in-app', recipients: ['panel-members'], enabled: false, template: 'assessment-complete' },
  { id: 'n-5', event: 'Appeal Submitted', channel: 'email', recipients: ['compliance@company.com'], enabled: true, template: 'appeal-alert' },
  { id: 'n-6', event: 'SLA Breach Warning', channel: 'slack', recipients: ['#ops-alerts'], enabled: true },
];
