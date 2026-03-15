/**
 * bh-client-directory - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ClientItem, ViewMode } from '../core';
import type { DBClient } from '@rottay/recruiter';

export const DEFAULT_CLIENTS: ClientItem[] = [
  { id: 'cl-1', name: 'Acme Corporation', type: 'company', status: 'active', tier: 'enterprise', industry: 'Technology', positionsCount: 12, revenue: 450000, approvalStatus: 'approved', contacts: [{ name: 'Lisa Park', email: 'lisa@acme.co', phone: '+1 (555) 100-2000', role: 'VP Engineering' }, { name: 'Tom Walsh', email: 'tom@acme.co', phone: '+1 (555) 100-2001', role: 'Hiring Manager' }], contractInfo: { terms: 'Annual', startDate: '2025-01-15', endDate: '2026-01-14' }, feeStructure: { type: 'percentage', value: 20 } } as unknown as DBClient,
  { id: 'cl-2', name: 'Horizon Labs', type: 'company', status: 'active', tier: 'premium', industry: 'Healthcare', positionsCount: 5, revenue: 180000, approvalStatus: 'approved', contacts: [{ name: 'Mark Rivera', email: 'mark@horizon.io', phone: '+1 (555) 200-3000', role: 'HR Director' }], feeStructure: { type: 'retainer', value: 8000 } } as unknown as DBClient,
  { id: 'cl-3', name: 'Nova Ventures', type: 'company', status: 'pending_approval', tier: 'standard', industry: 'Finance', positionsCount: 3, revenue: 75000, approvalStatus: 'pending', contacts: [{ name: 'Sam Ortiz', email: 'sam@nova.vc', phone: '+1 (555) 300-4000', role: 'Talent Lead' }], feeStructure: { type: 'fixed', value: 25000 } } as unknown as DBClient,
  { id: 'cl-4', name: 'David Chen', type: 'individual', status: 'active', tier: 'standard', industry: 'Consulting', positionsCount: 1, revenue: 15000, approvalStatus: 'approved', contacts: [{ name: 'David Chen', email: 'david@chen.consulting', phone: '+1 (555) 400-5000', role: 'Owner' }] } as unknown as DBClient,
  { id: 'cl-5', name: 'Meridian Group', type: 'company', status: 'archived', tier: 'premium', industry: 'Real Estate', positionsCount: 0, revenue: 95000, approvalStatus: 'approved', contacts: [{ name: 'Kate Yu', email: 'kate@meridian.com', phone: '+1 (555) 500-6000', role: 'COO' }] } as unknown as DBClient,
];

/** Pagination mock data */
export const MOCK_TOTAL_COUNT = 47;
export const MOCK_PAGE_SIZE = 10;
export const MOCK_CURRENT_PAGE = 1;
export const MOCK_VIEW_MODE: ViewMode = 'list';
