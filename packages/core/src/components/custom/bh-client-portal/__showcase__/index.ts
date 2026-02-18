/**
 * bh-client-portal - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ClientPipelineStage, ClientPosition, ClientInterview, ClientMetrics, ClientBillingOverview } from '../core';
import type { DBClient } from '@rottay/recruiter';

export const DEFAULT_CLIENT = {
  name: 'Acme Corporation',
  contactName: 'Jennifer Walsh',
  contactEmail: 'jennifer.walsh@acme.com',
} as unknown as DBClient;

export const DEFAULT_METRICS: ClientMetrics = {
  totalOpenPositions: 8,
  totalActiveCandidates: 47,
  avgTimeToFill: 34,
  fillRate: 78,
  upcomingInterviews: 12,
  offersExtended: 3,
  totalPlacements: 14,
  totalRevenue: 287_500,
  revenueCurrency: 'USD',
  avgCandidatesPerPosition: 15.2,
  clientSatisfactionScore: 4.6,
};

export const DEFAULT_PIPELINE: ClientPipelineStage[] = [
  { name: 'Applied', count: 47 },
  { name: 'Screening', count: 28 },
  { name: 'Interview', count: 16 },
  { name: 'Technical', count: 9 },
  { name: 'Final Round', count: 5 },
  { name: 'Offer', count: 3 },
];

export const DEFAULT_POSITIONS: ClientPosition[] = [
  { id: 'p-1', title: 'Senior Frontend Engineer', department: 'Engineering', status: 'open', totalCandidates: 18, activeCandidates: 12, interviewsScheduled: 4, daysOpen: 21, targetHireDate: '2026-03-15' },
  { id: 'p-2', title: 'Product Manager', department: 'Product', status: 'open', totalCandidates: 14, activeCandidates: 8, interviewsScheduled: 3, daysOpen: 35, targetHireDate: '2026-03-01' },
  { id: 'p-3', title: 'Staff Backend Engineer', department: 'Engineering', status: 'open', totalCandidates: 9, activeCandidates: 6, interviewsScheduled: 2, daysOpen: 14 },
  { id: 'p-4', title: 'UX Designer', department: 'Design', status: 'on_hold', totalCandidates: 7, activeCandidates: 3, interviewsScheduled: 0, daysOpen: 45 },
  { id: 'p-5', title: 'Data Analyst', department: 'Analytics', status: 'filled', totalCandidates: 22, activeCandidates: 0, interviewsScheduled: 0, daysOpen: 28 },
  { id: 'p-6', title: 'DevOps Engineer', department: 'Engineering', status: 'open', totalCandidates: 11, activeCandidates: 7, interviewsScheduled: 2, daysOpen: 18, targetHireDate: '2026-04-01' },
];

export const DEFAULT_INTERVIEWS: ClientInterview[] = [
  { id: 'iv-1', candidateName: 'Sarah Johnson', positionTitle: 'Senior Frontend Engineer', date: '2026-02-12', time: '10:00 AM', type: 'video', status: 'scheduled' },
  { id: 'iv-2', candidateName: 'Michael Chen', positionTitle: 'Product Manager', date: '2026-02-12', time: '2:00 PM', type: 'panel', status: 'scheduled' },
  { id: 'iv-3', candidateName: 'Emily Rodriguez', positionTitle: 'Senior Frontend Engineer', date: '2026-02-13', time: '11:00 AM', type: 'onsite', status: 'scheduled' },
  { id: 'iv-4', candidateName: 'James Kim', positionTitle: 'Staff Backend Engineer', date: '2026-02-14', time: '3:00 PM', type: 'phone', status: 'scheduled' },
  { id: 'iv-5', candidateName: 'Anna Kowalski', positionTitle: 'DevOps Engineer', date: '2026-02-14', time: '10:00 AM', type: 'video', status: 'scheduled' },
  { id: 'iv-6', candidateName: 'David Thompson', positionTitle: 'Product Manager', date: '2026-02-10', time: '9:00 AM', type: 'video', status: 'completed' },
];

/* ── Billing Overview ───────────────────────────────────────────────── */

export const DEFAULT_BILLING: ClientBillingOverview = {
  invoiceCount: 6,
  totalBilled: 72_500,
  totalPaid: 58_200,
  outstandingBalance: 14_300,
  currency: 'USD',
  nextInvoiceDate: '2026-03-01T00:00:00Z',
};
