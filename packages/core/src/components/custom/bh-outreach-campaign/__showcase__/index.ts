/**
 * bh-outreach-campaign - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { CampaignData } from '../core';

export const MOCK_CAMPAIGNS: CampaignData[] = [
  { id: 'c-1', name: 'Senior Engineers Q1', status: 'active', sent: 245, opened: 178, replied: 42, startDate: new Date(Date.now() - 7 * 86400000) },
  { id: 'c-2', name: 'Product Designers Outreach', status: 'active', sent: 120, opened: 89, replied: 23, startDate: new Date(Date.now() - 14 * 86400000) },
  { id: 'c-3', name: 'Data Science Passive Sourcing', status: 'paused', sent: 340, opened: 201, replied: 34, startDate: new Date(Date.now() - 30 * 86400000) },
  { id: 'c-4', name: 'DevOps Re-engagement', status: 'completed', sent: 180, opened: 145, replied: 52, startDate: new Date(Date.now() - 45 * 86400000) },
  { id: 'c-5', name: 'Marketing VP Search', status: 'draft', sent: 0, opened: 0, replied: 0, startDate: new Date() },
];
