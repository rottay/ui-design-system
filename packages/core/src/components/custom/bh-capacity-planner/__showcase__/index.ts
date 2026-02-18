/**
 * bh-capacity-planner - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { RecruiterCapacity, RebalanceSuggestion, CapacitySummary } from '../core';

export const DEFAULT_RECRUITERS: RecruiterCapacity[] = [
  { id: 'r-1', name: 'Sarah Johnson', department: 'Engineering', currentAssignments: 14, maxCapacity: 12, utilizationPercent: 117, activePositions: 4, activeCandidates: 14, avgTimePerCandidate: 3.2, status: 'overloaded' },
  { id: 'r-2', name: 'Michael Chen', department: 'Engineering', currentAssignments: 9, maxCapacity: 12, utilizationPercent: 75, activePositions: 3, activeCandidates: 9, avgTimePerCandidate: 4.1, status: 'optimal' },
  { id: 'r-3', name: 'Emily Rodriguez', department: 'Product', currentAssignments: 11, maxCapacity: 12, utilizationPercent: 92, activePositions: 3, activeCandidates: 11, avgTimePerCandidate: 3.8, status: 'optimal' },
  { id: 'r-4', name: 'James Kim', department: 'Design', currentAssignments: 4, maxCapacity: 10, utilizationPercent: 40, activePositions: 2, activeCandidates: 4, avgTimePerCandidate: 5.0, status: 'underutilized' },
  { id: 'r-5', name: 'Anna Kowalski', department: 'Sales', currentAssignments: 13, maxCapacity: 10, utilizationPercent: 130, activePositions: 5, activeCandidates: 13, avgTimePerCandidate: 2.8, status: 'overloaded' },
  { id: 'r-6', name: 'David Thompson', department: 'Engineering', currentAssignments: 8, maxCapacity: 12, utilizationPercent: 67, activePositions: 2, activeCandidates: 8, avgTimePerCandidate: 4.5, status: 'optimal' },
];

export const DEFAULT_SUGGESTIONS: RebalanceSuggestion[] = [
  { fromRecruiterId: 'r-1', fromRecruiterName: 'Sarah Johnson', toRecruiterId: 'r-4', toRecruiterName: 'James Kim', candidateCount: 3, reason: 'Sarah is overloaded at 117% while James has capacity at 40%. Cross-trained in design-adjacent roles.' },
  { fromRecruiterId: 'r-5', fromRecruiterName: 'Anna Kowalski', toRecruiterId: 'r-6', toRecruiterName: 'David Thompson', candidateCount: 2, reason: 'Anna is at 130% utilization. David has bandwidth and overlapping department experience.' },
];

export const DEFAULT_SUMMARY: CapacitySummary = {
  totalRecruiters: 6,
  avgUtilization: 87,
  overloadedCount: 2,
  underutilizedCount: 1,
  totalOpenReqs: 19,
};

export const MOCK_RECRUITERS: RecruiterCapacity[] = [
  { id: 'r-1', name: 'Sarah Johnson', department: 'Engineering', currentAssignments: 14, maxCapacity: 12, utilizationPercent: 117, activePositions: 4, activeCandidates: 14, avgTimePerCandidate: 3.2, status: 'overloaded' },
  { id: 'r-2', name: 'Michael Chen', department: 'Engineering', currentAssignments: 9, maxCapacity: 12, utilizationPercent: 75, activePositions: 3, activeCandidates: 9, avgTimePerCandidate: 4.1, status: 'optimal' },
  { id: 'r-3', name: 'Emily Rodriguez', department: 'Product', currentAssignments: 11, maxCapacity: 12, utilizationPercent: 92, activePositions: 3, activeCandidates: 11, avgTimePerCandidate: 3.8, status: 'optimal' },
  { id: 'r-4', name: 'James Kim', department: 'Design', currentAssignments: 4, maxCapacity: 10, utilizationPercent: 40, activePositions: 2, activeCandidates: 4, avgTimePerCandidate: 5.0, status: 'underutilized' },
];

export const MOCK_SUMMARY: CapacitySummary = {
  totalRecruiters: 4, avgUtilization: 81, overloadedCount: 1, underutilizedCount: 1, totalOpenReqs: 12,
};
