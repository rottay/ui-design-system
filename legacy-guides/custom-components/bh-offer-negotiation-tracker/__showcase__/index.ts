/**
 * bh-offer-negotiation-tracker - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { NegotiationRound } from '../core';

export const MOCK_ROUNDS: NegotiationRound[] = [
  { id: 'nr-1', date: '2026-01-15', offeredSalary: 120000, requestedSalary: 145000, status: 'countered', notes: 'Initial offer based on market data' },
  { id: 'nr-2', date: '2026-01-20', offeredSalary: 130000, requestedSalary: 140000, status: 'countered', notes: 'Increased base, added signing bonus discussion' },
  { id: 'nr-3', date: '2026-01-25', offeredSalary: 135000, requestedSalary: 138000, status: 'countered', notes: 'Near agreement, discussing equity' },
  { id: 'nr-4', date: '2026-01-28', offeredSalary: 137000, requestedSalary: 137000, status: 'accepted', notes: 'Final agreement with RSU package' },
];
