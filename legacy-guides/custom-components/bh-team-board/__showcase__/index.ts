/**
 * bh-team-board - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { RecruiterTeam, TeamMember, TeamKpiData, SprintData, TeamTarget } from '../core';

export const MOCK_TEAMS: RecruiterTeam[] = [
  { id: 't1', tenantId: 't', companyId: 'c', name: 'Engineering Hiring', code: 'ENG', type: 'technical', description: null, leaderId: 'l1', managerId: null, directorId: null, members: [], activeMemberCount: 6, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 12, currentUtilization: 78, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 88 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't2', tenantId: 't', companyId: 'c', name: 'Product & Design', code: 'PD', type: 'general', description: null, leaderId: 'l2', managerId: null, directorId: null, members: [], activeMemberCount: 4, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 8, currentUtilization: 65, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 82 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't3', tenantId: 't', companyId: 'c', name: 'GTM Recruiting', code: 'GTM', type: 'volume', description: null, leaderId: 'l3', managerId: null, directorId: null, members: [], activeMemberCount: 5, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 10, currentUtilization: 92, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 74 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't4', tenantId: 't', companyId: 'c', name: 'Executive Search', code: 'EXEC', type: 'executive', description: null, leaderId: 'l4', managerId: null, directorId: null, members: [], activeMemberCount: 3, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 4, currentUtilization: 56, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 91 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't5', tenantId: 't', companyId: 'c', name: 'Campus & Intern', code: 'CAMP', type: 'specialized', description: null, leaderId: 'l5', managerId: null, directorId: null, members: [], activeMemberCount: 3, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 80, currentActivePositions: 6, currentUtilization: 42, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 79 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
  { id: 't6', tenantId: 't', companyId: 'c', name: 'Remote Talent', code: 'REM', type: 'general', description: null, leaderId: 'l6', managerId: null, directorId: null, members: [], activeMemberCount: 4, specializations: [], industries: [], locations: [], seniorityLevels: [], capacity: {}, maxActivePositions: 100, currentActivePositions: 7, currentUtilization: 88, assignedClientIds: [], primaryClientIds: [], performanceMetrics: { score: 85 }, kpiTargets: null, kpiActuals: null, monthlyPlacementTarget: 5, quarterlyRevenueTarget: '100000', status: 'active', tags: [], internalNotes: null, isActive: true, createdBy: 'u1', updatedBy: 'u1', createdAt: new Date(), updatedAt: new Date() } as any,
];

export const MOCK_MEMBERS: TeamMember[] = [
  { id: 'm1', name: 'Sofia Martinez', role: 'Team Lead', allocationPercent: 80, activeJobs: 4, hires: 6 },
  { id: 'm2', name: 'Alex Kim', role: 'Sr. Recruiter', allocationPercent: 95, activeJobs: 5, hires: 4 },
  { id: 'm3', name: 'Rachel Green', role: 'Recruiter', allocationPercent: 70, activeJobs: 3, hires: 3 },
  { id: 'm4', name: 'Tom Baker', role: 'Jr. Recruiter', allocationPercent: 60, activeJobs: 2, hires: 2 },
  { id: 'm5', name: 'Nina Patel', role: 'Sourcer', allocationPercent: 85, activeJobs: 3, hires: 2 },
  { id: 'm6', name: 'Dave Johnson', role: 'Coordinator', allocationPercent: 40, activeJobs: 1, hires: 1 },
];

export const MOCK_KPIS: TeamKpiData = {
  hiresVsTarget: { actual: 18, target: 24 },
  velocityTrend: [12, 14, 11, 16, 18, 15, 20, 22, 18, 24],
  slaCompliance: 87,
  satisfactionScore: 4.3,
};

export const MOCK_SPRINT: SprintData = {
  total: 32,
  completed: 18,
  inProgress: 9,
  blocked: 5,
  burndownData: [32, 30, 28, 25, 22, 20, 18, 17, 15, 14, 12, 9],
};

export const MOCK_TARGETS: TeamTarget[] = [
  { metric: 'Engineering Hires', period: 'Q1 2026', value: 24, current: 18 },
  { metric: 'Time to Fill Target', period: 'Q1 2026', value: 25, current: 28 },
  { metric: 'Candidate NPS', period: 'Q1 2026', value: 80, current: 76 },
  { metric: 'Offer Accept Rate', period: 'Q1 2026', value: 90, current: 87 },
];
