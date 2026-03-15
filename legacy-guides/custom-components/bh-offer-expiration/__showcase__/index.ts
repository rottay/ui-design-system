/**
 * bh-offer-expiration - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ExpiringOffer } from '../core';

export const MOCK_OFFERS: ExpiringOffer[] = [
  { id: 'oe-1', candidateName: 'Sarah Johnson', position: 'Senior Frontend Engineer', expiresAt: '2026-02-14', status: 'pending', daysRemaining: 2 },
  { id: 'oe-2', candidateName: 'Michael Chen', position: 'Backend Developer', expiresAt: '2026-02-15', status: 'pending', daysRemaining: 3 },
  { id: 'oe-3', candidateName: 'Emily Rodriguez', position: 'Product Designer', expiresAt: '2026-02-18', status: 'pending', daysRemaining: 6 },
  { id: 'oe-4', candidateName: 'James Kim', position: 'DevOps Engineer', expiresAt: '2026-02-20', status: 'extended', daysRemaining: 8 },
  { id: 'oe-5', candidateName: 'Anna Kowalski', position: 'Data Analyst', expiresAt: '2026-02-10', status: 'expired', daysRemaining: -2 },
];
