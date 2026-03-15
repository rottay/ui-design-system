/**
 * bh-analytics-hub - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { FunnelStage, RecruiterPerformance, SourceEffectiveness, TrendComparison, TimeToHireData, PipelineVelocity, CostAnalysis } from '../core';

export const MOCK_FUNNEL: FunnelStage[] = [
  { name: 'Applied', count: 1240, conversionPercent: 100, prevPeriodCount: 1100 },
  { name: 'Screened', count: 620, conversionPercent: 50, prevPeriodCount: 550 },
  { name: 'Phone Screen', count: 410, conversionPercent: 66, prevPeriodCount: 380 },
  { name: 'Technical', count: 248, conversionPercent: 60, prevPeriodCount: 220 },
  { name: 'Onsite', count: 124, conversionPercent: 50, prevPeriodCount: 110 },
  { name: 'Offered', count: 62, conversionPercent: 50, prevPeriodCount: 55 },
  { name: 'Hired', count: 48, conversionPercent: 77, prevPeriodCount: 42 },
];

export const MOCK_RECRUITERS: RecruiterPerformance[] = [
  { name: 'Sarah Chen', hires: 12, velocity: 18, pipelineValue: 340000, satisfaction: 94, sparkline: [8, 9, 10, 11, 10, 12, 12] },
  { name: 'Marcus Williams', hires: 10, velocity: 22, pipelineValue: 280000, satisfaction: 91, sparkline: [6, 7, 8, 9, 10, 9, 10] },
  { name: 'Elena Rodriguez', hires: 9, velocity: 20, pipelineValue: 260000, satisfaction: 88, sparkline: [5, 6, 7, 8, 8, 9, 9] },
  { name: 'James Park', hires: 8, velocity: 25, pipelineValue: 220000, satisfaction: 86, sparkline: [4, 5, 6, 7, 7, 8, 8] },
  { name: 'Aisha Patel', hires: 7, velocity: 19, pipelineValue: 200000, satisfaction: 92, sparkline: [3, 4, 5, 6, 6, 7, 7] },
];

export const MOCK_SOURCES: SourceEffectiveness[] = [
  { source: 'LinkedIn', candidateCount: 420, qualityScore: 82 },
  { source: 'Referrals', candidateCount: 180, qualityScore: 91 },
  { source: 'Indeed', candidateCount: 310, qualityScore: 65 },
  { source: 'Career Site', candidateCount: 210, qualityScore: 74 },
  { source: 'Agencies', candidateCount: 120, qualityScore: 78 },
  { source: 'Events', candidateCount: 80, qualityScore: 70 },
];

export const MOCK_TREND: TrendComparison[] = [
  { date: 'Jan', current: 38, previous: 32 },
  { date: 'Feb', current: 42, previous: 35 },
  { date: 'Mar', current: 45, previous: 38 },
  { date: 'Apr', current: 41, previous: 40 },
  { date: 'May', current: 48, previous: 42 },
  { date: 'Jun', current: 52, previous: 44 },
];

export const MOCK_TTH: TimeToHireData[] = [
  { job: 'Sr. Frontend Engineer', avgDays: 28, stages: [{ name: 'Screen', avgDays: 3 }, { name: 'Technical', avgDays: 7 }, { name: 'Onsite', avgDays: 10 }, { name: 'Offer', avgDays: 5 }, { name: 'Close', avgDays: 3 }] },
  { job: 'Product Manager', avgDays: 34, stages: [{ name: 'Screen', avgDays: 4 }, { name: 'Interview', avgDays: 12 }, { name: 'Final', avgDays: 8 }, { name: 'Offer', avgDays: 6 }, { name: 'Close', avgDays: 4 }] },
  { job: 'DevOps Lead', avgDays: 22, stages: [{ name: 'Screen', avgDays: 2 }, { name: 'Technical', avgDays: 6 }, { name: 'Onsite', avgDays: 8 }, { name: 'Offer', avgDays: 4 }, { name: 'Close', avgDays: 2 }] },
  { job: 'Data Scientist', avgDays: 31, stages: [{ name: 'Screen', avgDays: 3 }, { name: 'Take-Home', avgDays: 9 }, { name: 'Onsite', avgDays: 10 }, { name: 'Offer', avgDays: 5 }, { name: 'Close', avgDays: 4 }] },
];

export const MOCK_VELOCITY: PipelineVelocity[] = [
  { stage: 'Application Review', avgDays: 2.1, slaLimit: 3 },
  { stage: 'Phone Screen', avgDays: 3.4, slaLimit: 5 },
  { stage: 'Technical Interview', avgDays: 6.8, slaLimit: 7 },
  { stage: 'Onsite Panel', avgDays: 8.2, slaLimit: 10 },
  { stage: 'Offer Generation', avgDays: 4.1, slaLimit: 3 },
  { stage: 'Offer Close', avgDays: 3.5, slaLimit: 5 },
];

export const MOCK_COST: CostAnalysis[] = [
  { category: 'Job Boards', costPerHire: 1200, breakdown: [{ item: 'LinkedIn', cost: 680 }, { item: 'Indeed', cost: 320 }, { item: 'Glassdoor', cost: 200 }] },
  { category: 'Agencies', costPerHire: 3400, breakdown: [{ item: 'TechRecruit Pro', cost: 2100 }, { item: 'Staffing Plus', cost: 1300 }] },
  { category: 'Referral Bonuses', costPerHire: 800, breakdown: [{ item: 'Employee referrals', cost: 800 }] },
  { category: 'Events', costPerHire: 600, breakdown: [{ item: 'Career fairs', cost: 350 }, { item: 'Meetups', cost: 250 }] },
];
