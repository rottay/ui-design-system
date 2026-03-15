/**
 * bh-client-list - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { RecruiterClient } from '../core';

export const MOCK_CLIENTS: RecruiterClient[] = [
  { id: 'c1', tenantId: 't', type: 'company', firstName: null, lastName: null, clientCompanyName: 'Acme Corporation', displayName: 'Acme Corporation', tier: 'enterprise', contractType: 'retained', status: 'active', openPositions: 12, totalPositions: 20, totalRevenue: '125000', isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 'c2', tenantId: 't', type: 'company', firstName: null, lastName: null, clientCompanyName: 'TechStart Inc.', displayName: 'TechStart Inc.', tier: 'standard', contractType: 'contingency', status: 'active', openPositions: 3, totalPositions: 5, totalRevenue: '15000', isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 'c3', tenantId: 't', type: 'company', firstName: null, lastName: null, clientCompanyName: 'GlobalBank Ltd.', displayName: 'GlobalBank Ltd.', tier: 'enterprise', contractType: 'exclusive', status: 'suspended', openPositions: 8, totalPositions: 15, totalRevenue: '98000', isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 'c4', tenantId: 't', type: 'company', firstName: null, lastName: null, clientCompanyName: 'Velocity Partners', displayName: 'Velocity Partners', tier: 'premium', contractType: 'contingency', status: 'active', openPositions: 6, totalPositions: 10, totalRevenue: '55000', isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 'c5', tenantId: 't', type: 'company', firstName: null, lastName: null, clientCompanyName: 'NovaTech Solutions', displayName: 'NovaTech Solutions', tier: 'premium', contractType: 'hybrid', status: 'terminated', openPositions: 0, totalPositions: 8, totalRevenue: '42000', isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 'c6', tenantId: 't', type: 'company', firstName: null, lastName: null, clientCompanyName: 'Pinnacle Health', displayName: 'Pinnacle Health', tier: 'enterprise', contractType: 'retained', status: 'active', openPositions: 15, totalPositions: 25, totalRevenue: '180000', isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
];
