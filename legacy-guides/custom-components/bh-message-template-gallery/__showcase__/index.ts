/**
 * bh-message-template-gallery - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { MessageTemplateItem } from '../core';

export const MOCK_TEMPLATES: MessageTemplateItem[] = [
  { id: 'mt-1', name: 'Initial Outreach', category: 'Sourcing', subject: 'Exciting opportunity at {{company}}', preview: 'Hi {{firstName}}, I came across your profile and was impressed by...', usageCount: 342, lastUsed: new Date(Date.now() - 86400000), tags: ['sourcing', 'cold-outreach'] },
  { id: 'mt-2', name: 'Interview Invitation', category: 'Scheduling', subject: 'Interview invitation - {{position}}', preview: 'Dear {{firstName}}, We are pleased to invite you for an interview...', usageCount: 256, lastUsed: new Date(Date.now() - 172800000), tags: ['scheduling', 'interview'] },
  { id: 'mt-3', name: 'Rejection - Post Interview', category: 'Rejection', subject: 'Update on your application', preview: 'Dear {{firstName}}, Thank you for taking the time to interview...', usageCount: 189, lastUsed: new Date(Date.now() - 43200000), tags: ['rejection', 'post-interview'] },
  { id: 'mt-4', name: 'Offer Letter', category: 'Offers', subject: 'Offer of employment - {{position}}', preview: 'Dear {{firstName}}, We are excited to extend an offer for the position...', usageCount: 98, lastUsed: new Date(Date.now() - 259200000), tags: ['offer', 'hiring'] },
  { id: 'mt-5', name: 'Follow-up Reminder', category: 'Sourcing', subject: 'Following up - {{position}}', preview: 'Hi {{firstName}}, I wanted to follow up on my previous message...', usageCount: 210, lastUsed: new Date(Date.now() - 604800000), tags: ['sourcing', 'follow-up'] },
  { id: 'mt-6', name: 'Screening Questions', category: 'Screening', subject: 'A few questions about your background', preview: 'Hi {{firstName}}, Before we proceed, could you answer a few...', usageCount: 145, tags: ['screening', 'questions'] },
];
