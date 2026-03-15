/**
 * bh-candidate-outreach - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { OutreachRecipient, OutreachTemplate, CampaignMetrics, ABVariant } from '../core';
import type { DBCandidate } from '@rottay/recruiter';

export const DEFAULT_RECIPIENTS: OutreachRecipient[] = [
  { candidate: { id: 'r-1', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@google.com' } as DBCandidate },
  { candidate: { id: 'r-2', firstName: 'Michael', lastName: 'Chen', email: 'mchen@stripe.com' } as DBCandidate },
  { candidate: { id: 'r-3', firstName: 'Emily', lastName: 'Rodriguez', email: 'emily@meta.com' } as DBCandidate },
  { candidate: { id: 'r-4', firstName: 'James', lastName: 'Kim', email: 'jkim@anthropic.com' } as DBCandidate },
  { candidate: { id: 'r-5', firstName: 'Anna', lastName: 'Kowalski', email: 'anna@vercel.com' } as DBCandidate },
  { candidate: { id: 'r-6', firstName: 'David', lastName: 'Thompson', email: 'david@linear.app' } as DBCandidate },
];

export const DEFAULT_TEMPLATES: OutreachTemplate[] = [
  { id: 't-1', name: 'Initial Outreach', category: 'First Touch', content: 'Hi {firstName}, I came across your profile and was impressed by your work at {company}...', variables: ['firstName', 'company'], effectiveness: 68 },
  { id: 't-2', name: 'Follow Up', category: 'Nurture', content: 'Hi {firstName}, I wanted to follow up on my previous message about the {role} opportunity...', variables: ['firstName', 'role'], effectiveness: 42 },
  { id: 't-3', name: 'Referral Intro', category: 'Warm Lead', content: 'Hi {firstName}, {referrer} suggested I reach out to you regarding...', variables: ['firstName', 'referrer'], effectiveness: 82 },
];

export const DEFAULT_METRICS: CampaignMetrics = { sent: 156, opened: 98, replied: 34, bounced: 5 };

export const DEFAULT_VARIANTS: ABVariant[] = [
  { id: 'v-a', name: 'Variant A', content: 'Personalized opening...', splitPercent: 50, metrics: { sent: 78, opened: 52, replied: 19, bounced: 2 } },
  { id: 'v-b', name: 'Variant B', content: 'Direct value prop...', splitPercent: 50, metrics: { sent: 78, opened: 46, replied: 15, bounced: 3 } },
];
