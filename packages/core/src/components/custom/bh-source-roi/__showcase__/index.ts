/**
 * bh-source-roi - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SourceChannel, SourceTrend, SourceRoiSummary } from '../core';

export const MOCK_SOURCES: SourceChannel[] = [
  { id: 's1', name: 'LinkedIn Recruiter', type: 'linkedin', candidateCount: 482, hireCount: 38, hireRate: 7.9, totalCost: 48600, costPerHire: 1279, costPerCandidate: 101, avgTimeToHireDays: 32, qualityScore: 82, retentionRate90d: 91 },
  { id: 's2', name: 'Employee Referrals', type: 'referral', candidateCount: 214, hireCount: 42, hireRate: 19.6, totalCost: 21000, costPerHire: 500, costPerCandidate: 98, avgTimeToHireDays: 24, qualityScore: 88, retentionRate90d: 94 },
  { id: 's3', name: 'Indeed', type: 'job_board', candidateCount: 1240, hireCount: 56, hireRate: 4.5, totalCost: 36800, costPerHire: 657, costPerCandidate: 30, avgTimeToHireDays: 41, qualityScore: 68, retentionRate90d: 82 },
  { id: 's4', name: 'Robert Half Agency', type: 'agency', candidateCount: 86, hireCount: 18, hireRate: 20.9, totalCost: 94500, costPerHire: 5250, costPerCandidate: 1099, avgTimeToHireDays: 28, qualityScore: 79, retentionRate90d: 87 },
  { id: 's5', name: 'Careers Page', type: 'career_site', candidateCount: 892, hireCount: 34, hireRate: 3.8, totalCost: 4200, costPerHire: 124, costPerCandidate: 5, avgTimeToHireDays: 38, qualityScore: 71, retentionRate90d: 85 },
  { id: 's6', name: 'Twitter/X Campaigns', type: 'social', candidateCount: 156, hireCount: 8, hireRate: 5.1, totalCost: 12400, costPerHire: 1550, costPerCandidate: 79, avgTimeToHireDays: 44, qualityScore: 64, retentionRate90d: 78 },
  { id: 's7', name: 'Tech Meetup Events', type: 'event', candidateCount: 68, hireCount: 12, hireRate: 17.6, totalCost: 18000, costPerHire: 1500, costPerCandidate: 265, avgTimeToHireDays: 26, qualityScore: 85, retentionRate90d: 92 },
];

export const MOCK_TRENDS: SourceTrend[] = [
  { month: 'Sep', sourceId: 's1', hires: 6, cost: 7200 },
  { month: 'Oct', sourceId: 's1', hires: 8, cost: 9600 },
  { month: 'Nov', sourceId: 's1', hires: 7, cost: 8400 },
  { month: 'Dec', sourceId: 's1', hires: 9, cost: 10800 },
  { month: 'Sep', sourceId: 's2', hires: 10, cost: 5000 },
  { month: 'Oct', sourceId: 's2', hires: 12, cost: 6000 },
  { month: 'Nov', sourceId: 's2', hires: 8, cost: 4000 },
  { month: 'Dec', sourceId: 's2', hires: 12, cost: 6000 },
];

export const MOCK_SUMMARY: SourceRoiSummary = {
  totalSpend: 235500,
  totalHires: 208,
  avgCostPerHire: 1133,
  bestRoiSource: 'Careers Page',
  worstRoiSource: 'Robert Half Agency',
};
