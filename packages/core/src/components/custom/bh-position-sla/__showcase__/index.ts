/**
 * bh-position-sla - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { PositionSlaData } from '../core';

export const MOCK_POSITIONS: PositionSlaData[] = [
  { id: 'ps-1', positionTitle: 'Senior Backend Engineer', clientName: 'Acme Corp', slaDeadline: new Date('2026-02-20'), daysRemaining: 8, status: 'on-track', currentStage: 'Technical Interview', candidateCount: 12 },
  { id: 'ps-2', positionTitle: 'Product Manager', clientName: 'Horizon Labs', slaDeadline: new Date('2026-02-15'), daysRemaining: 3, status: 'at-risk', currentStage: 'Final Round', candidateCount: 4 },
  { id: 'ps-3', positionTitle: 'UX Designer', clientName: 'Nova Ventures', slaDeadline: new Date('2026-02-10'), daysRemaining: -2, status: 'breached', currentStage: 'Sourcing', candidateCount: 2 },
  { id: 'ps-4', positionTitle: 'DevOps Lead', clientName: 'Acme Corp', slaDeadline: new Date('2026-02-25'), daysRemaining: 13, status: 'on-track', currentStage: 'Screen', candidateCount: 8 },
  { id: 'ps-5', positionTitle: 'Data Scientist', clientName: 'Meridian Group', slaDeadline: new Date('2026-02-14'), daysRemaining: 2, status: 'at-risk', currentStage: 'Offer', candidateCount: 1 },
];
