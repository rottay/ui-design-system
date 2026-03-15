/**
 * bh-offer-negotiation - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { OfferNegotiation } from '../core';

export const MOCK_NEGOTIATIONS: OfferNegotiation[] = [
  {
    id: 'neg-1', candidateName: 'Sarah Chen', positionTitle: 'Senior Engineer', department: 'Engineering',
    currentStep: 2, status: 'in_progress', createdAt: '2025-01-10T00:00:00Z',
    steps: [
      { id: 'ns-1', type: 'initial_offer', date: '2025-01-10', initiatedBy: 'company', compensation: { baseSalary: 165000, equity: 50000, equityType: 'rsu', signingBonus: 15000 } },
      { id: 'ns-2', type: 'counter_offer', date: '2025-01-14', initiatedBy: 'candidate', compensation: { baseSalary: 185000, equity: 75000, equityType: 'rsu', signingBonus: 25000 } },
    ],
  },
  {
    id: 'neg-2', candidateName: 'Alex Rivera', positionTitle: 'Staff Engineer', department: 'Platform',
    currentStep: 1, status: 'accepted', createdAt: '2025-01-08T00:00:00Z',
    steps: [
      { id: 'ns-3', type: 'initial_offer', date: '2025-01-08', initiatedBy: 'company', compensation: { baseSalary: 195000, equity: 80000, equityType: 'rsu', signingBonus: 20000 } },
      { id: 'ns-4', type: 'final_agreement', date: '2025-01-12', initiatedBy: 'candidate', compensation: { baseSalary: 195000, equity: 80000, equityType: 'rsu', signingBonus: 20000 } },
    ],
  },
];

export const MOCK_NEGOTIATION: OfferNegotiation = {
  id: 'neg-1',
  candidateName: 'Sarah Chen',
  positionTitle: 'Senior Software Engineer',
  department: 'Engineering',
  currentStep: 2,
  status: 'in_progress',
  createdAt: '2025-01-10T00:00:00Z',
  steps: [
    { id: 'ns-1', type: 'initial_offer', date: '2025-01-10', initiatedBy: 'company', compensation: { baseSalary: 165000, equity: 50000, equityType: 'rsu', signingBonus: 15000, annualBonus: 20000 }, notes: 'Initial offer based on L5 band' },
    { id: 'ns-2', type: 'counter_offer', date: '2025-01-14', initiatedBy: 'candidate', compensation: { baseSalary: 185000, equity: 75000, equityType: 'rsu', signingBonus: 25000, annualBonus: 25000 }, notes: 'Candidate requested higher base and equity' },
    { id: 'ns-3', type: 'revised_offer', date: '2025-01-17', initiatedBy: 'company', compensation: { baseSalary: 178000, equity: 65000, equityType: 'rsu', signingBonus: 20000, annualBonus: 22000 }, notes: 'Revised offer with increased equity' },
  ],
};
