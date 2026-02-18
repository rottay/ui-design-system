/**
 * bh-email-composer - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { EmailTemplate, EmailVariable } from '../core';

export const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Interview Invitation',
    subject: 'Interview Invitation - {{position}} at {{company}}',
    body: 'Dear {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{position}} position at {{company}}.\n\nPlease find the details below:\n- Date: {{interviewDate}}\n- Time: {{interviewTime}}\n- Format: {{interviewFormat}}\n\nPlease confirm your availability at your earliest convenience.\n\nBest regards,\n{{recruiterName}}',
    variables: ['candidateName', 'position', 'company', 'interviewDate', 'interviewTime', 'interviewFormat', 'recruiterName'],
  },
  {
    id: 'tpl-2',
    name: 'Application Received',
    subject: 'Application Received - {{position}}',
    body: 'Dear {{candidateName}},\n\nThank you for applying for the {{position}} role at {{company}}. We have received your application and will review it shortly.\n\nBest regards,\n{{recruiterName}}',
    variables: ['candidateName', 'position', 'company', 'recruiterName'],
  },
  {
    id: 'tpl-3',
    name: 'Follow-up',
    subject: 'Following Up - {{position}} Application',
    body: 'Dear {{candidateName}},\n\nI wanted to follow up on your application for the {{position}} position. We are still reviewing candidates and will get back to you soon.\n\nBest regards,\n{{recruiterName}}',
    variables: ['candidateName', 'position', 'recruiterName'],
  },
];

export const MOCK_VARIABLES: EmailVariable[] = [
  { key: 'candidateName', label: 'Candidate Name', value: 'Sarah Johnson' },
  { key: 'position', label: 'Position', value: 'Senior Frontend Engineer' },
  { key: 'company', label: 'Company', value: 'Acme Corp' },
  { key: 'interviewDate', label: 'Interview Date', value: 'March 15, 2026' },
  { key: 'interviewTime', label: 'Interview Time', value: '2:00 PM EST' },
  { key: 'interviewFormat', label: 'Format', value: 'Video Call (Zoom)' },
  { key: 'recruiterName', label: 'Recruiter Name', value: 'Alex Thompson' },
];

/** CC/BCC recipients mock data */
export const MOCK_CC_RECIPIENTS = ['hiring-manager@acme.com', 'team-lead@acme.com'];
export const MOCK_BCC_RECIPIENTS = ['recruiting-ops@acme.com'];

/** Attachments mock data */
export const MOCK_ATTACHMENTS = [
  { name: 'Job_Description.pdf', url: '/files/jd.pdf', size: 245760 },
  { name: 'Company_Overview.pdf', url: '/files/overview.pdf', size: 512000 },
];

/** Schedule and tracking mock data */
export const MOCK_SCHEDULE_SEND_AT = '2026-03-15T09:00:00Z';
export const MOCK_TRACK_OPENS = true;
export const MOCK_TRACK_CLICKS = true;
