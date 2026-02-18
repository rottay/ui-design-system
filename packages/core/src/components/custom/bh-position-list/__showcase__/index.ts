/**
 * bh-position-list - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { RecruiterPosition } from '../core';

import type { PositionStatusFilter, PositionHiringUrgency } from '../core';

export const MOCK_POSITIONS: RecruiterPosition[] = [
  { id: 'pl-1', tenantId: 't', clientId: 'c1', code: 'FE-01', title: 'Senior Frontend Engineer', status: 'open', priority: 'high', openings: 1, filledCount: 0, createdAt: new Date(Date.now() - 12 * 86400000) } as any,
  { id: 'pl-2', tenantId: 't', clientId: 'c2', code: 'PM-01', title: 'Product Manager', status: 'open', priority: 'normal', openings: 1, filledCount: 0, createdAt: new Date(Date.now() - 25 * 86400000) } as any,
  { id: 'pl-3', tenantId: 't', clientId: 'c3', code: 'UX-01', title: 'UX Designer', status: 'on_hold', priority: 'low', openings: 1, filledCount: 0, createdAt: new Date(Date.now() - 45 * 86400000) } as any,
  { id: 'pl-4', tenantId: 't', clientId: 'c1', code: 'BE-01', title: 'Backend Developer', status: 'open', priority: 'high', openings: 2, filledCount: 0, createdAt: new Date(Date.now() - 5 * 86400000) } as any,
  { id: 'pl-5', tenantId: 't', clientId: 'c4', code: 'DA-01', title: 'Data Analyst', status: 'filled', priority: 'normal', openings: 1, filledCount: 1, createdAt: new Date(Date.now() - 60 * 86400000) } as any,
  { id: 'pl-6', tenantId: 't', clientId: 'c1', code: 'DO-01', title: 'DevOps Lead', status: 'closed', priority: 'low', openings: 1, filledCount: 1, createdAt: new Date(Date.now() - 90 * 86400000) } as any,
];

/** Filter options mock data */
export const MOCK_STATUS_FILTER_OPTIONS: PositionStatusFilter[] = ['all', 'open', 'filled', 'closed', 'on_hold', 'draft'];
export const MOCK_DEPARTMENTS: string[] = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales'];
export const MOCK_TEAMS: string[] = ['Frontend', 'Backend', 'Platform', 'Growth', 'Enterprise'];
export const MOCK_STATUS_FILTER: PositionStatusFilter = 'all';
export const MOCK_DEPARTMENT_FILTER: string | null = null;
export const MOCK_TEAM_FILTER: string | null = null;
export const MOCK_URGENCY_FILTER: PositionHiringUrgency | null = null;
