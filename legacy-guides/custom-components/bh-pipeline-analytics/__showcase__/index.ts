/**
 * bh-pipeline-analytics - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { PipelineStage, PipelineSummary, PipelineBottleneck, PipelineTrend } from '../core';

export const MOCK_STAGES: PipelineStage[] = [
  { id: 'ps-1', name: 'Applied', status: 'new', count: 342, previousPeriodCount: 310, conversionRate: 100, avgTimeInStageDays: 1.2, dropoffCount: 0 },
  { id: 'ps-2', name: 'Screening', status: 'screening', count: 186, previousPeriodCount: 164, conversionRate: 54.4, avgTimeInStageDays: 3.5, slaLimitDays: 5, dropoffCount: 156 },
  { id: 'ps-3', name: 'Phone Screen', status: 'phone_screen', count: 98, previousPeriodCount: 91, conversionRate: 52.7, avgTimeInStageDays: 4.2, slaLimitDays: 7, dropoffCount: 88 },
  { id: 'ps-4', name: 'Technical Interview', status: 'technical_interview', count: 54, previousPeriodCount: 48, conversionRate: 55.1, avgTimeInStageDays: 6.8, slaLimitDays: 10, dropoffCount: 44 },
  { id: 'ps-5', name: 'Onsite Interview', status: 'onsite_interview', count: 28, previousPeriodCount: 22, conversionRate: 51.9, avgTimeInStageDays: 5.1, dropoffCount: 26 },
  { id: 'ps-6', name: 'Offer Extended', status: 'offer_extended', count: 16, previousPeriodCount: 14, conversionRate: 57.1, avgTimeInStageDays: 3.2, dropoffCount: 12 },
  { id: 'ps-7', name: 'Hired', status: 'hired', count: 12, previousPeriodCount: 10, conversionRate: 75.0, avgTimeInStageDays: 2.1, dropoffCount: 4 },
];

export const MOCK_SUMMARY: PipelineSummary = {
  totalActive: 342, totalHired: 12, avgTimeToHireDays: 26.1, overallConversionRate: 3.5, bottleneckCount: 2,
};

export const MOCK_BOTTLENECKS: PipelineBottleneck[] = [
  {
    stageId: 'ps-4',
    stageName: 'Technical Interview',
    severity: 'high',
    reason: 'Average time in stage exceeds SLA by 68%. Limited interviewer availability causing scheduling delays.',
    avgDelayDays: 3.2,
    impactedCandidates: 18,
  },
  {
    stageId: 'ps-5',
    stageName: 'Onsite Interview',
    severity: 'medium',
    reason: 'Panel coordination taking longer than expected. Cross-timezone scheduling with 4+ interviewers.',
    avgDelayDays: 1.8,
    impactedCandidates: 9,
  },
  {
    stageId: 'ps-6',
    stageName: 'Offer Extended',
    severity: 'low',
    reason: 'Compensation committee review cycle adds latency for offers above L5 band.',
    avgDelayDays: 0.9,
    impactedCandidates: 4,
  },
];

export const MOCK_TRENDS: PipelineTrend[] = [
  { date: '2025-09', applications: 280, hires: 8, interviews: 42, offers: 11, costPerHire: 4200 },
  { date: '2025-10', applications: 305, hires: 9, interviews: 48, offers: 13, costPerHire: 3950 },
  { date: '2025-11', applications: 290, hires: 7, interviews: 44, offers: 10, costPerHire: 4400 },
  { date: '2025-12', applications: 260, hires: 6, interviews: 38, offers: 9, costPerHire: 4600 },
  { date: '2026-01', applications: 310, hires: 10, interviews: 52, offers: 14, costPerHire: 3800 },
  { date: '2026-02', applications: 342, hires: 12, interviews: 54, offers: 16, costPerHire: 3650 },
];
