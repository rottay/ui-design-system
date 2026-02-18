/**
 * bh-recruiter-home - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { KpiStat, PipelineJob, UpcomingInterview, Notification, QuickAction, ActivityItem, AISuggestion, PerformanceMetric, TeamPerformance } from '../core';

export const DEFAULT_KPI: KpiStat[] = [
  { label: 'Open Roles', value: 12, trend: 'up', trendValue: 8 },
  { label: 'Active Candidates', value: 248, trend: 'up', trendValue: 15 },
  { label: 'Interviews This Week', value: 9, trend: 'down', trendValue: 3 },
  { label: 'Avg. Time-to-Fill', value: '28d', trend: 'up', trendValue: 5 },
];

export const DEFAULT_PIPELINE: PipelineJob[] = [
  { id: 'j-1', title: 'Senior Frontend Engineer', stages: [{ name: 'Applied', count: 34 }, { name: 'Screen', count: 12 }, { name: 'Interview', count: 5 }, { name: 'Offer', count: 1 }], conversionRate: 2.9, slaBreachCount: 1, slaAtRiskCount: 2, daysOpen: 21 },
  { id: 'j-2', title: 'Product Designer', stages: [{ name: 'Applied', count: 21 }, { name: 'Screen', count: 8 }, { name: 'Interview', count: 3 }, { name: 'Offer', count: 0 }], conversionRate: 0, slaBreachCount: 0, slaAtRiskCount: 1, daysOpen: 14 },
  { id: 'j-3', title: 'Backend Engineer', stages: [{ name: 'Applied', count: 45 }, { name: 'Screen', count: 15 }, { name: 'Interview', count: 7 }, { name: 'Offer', count: 2 }], conversionRate: 4.4, slaBreachCount: 2, slaAtRiskCount: 3, daysOpen: 35 },
];

export const DEFAULT_INTERVIEWS: UpcomingInterview[] = [
  { id: 'i-1', candidateName: 'Sarah Johnson', jobTitle: 'Sr Frontend Engineer', stageName: 'Technical Round', time: new Date(Date.now() + 2 * 3600_000), isAI: false },
  { id: 'i-2', candidateName: 'Michael Chen', jobTitle: 'Sr Frontend Engineer', stageName: 'AI Screening', time: new Date(Date.now() + 5 * 3600_000), isAI: true },
  { id: 'i-3', candidateName: 'Emily Rodriguez', jobTitle: 'Product Designer', stageName: 'Portfolio Review', time: new Date(Date.now() + 24 * 3600_000) },
];

export const DEFAULT_NOTIFS: Notification[] = [
  { id: 'n-1', type: 'breach', message: '3 candidates pending review past SLA (48h)', time: new Date(Date.now() - 1 * 3600_000) },
  { id: 'n-2', type: 'approval', message: 'Offer for David Park awaiting approval', time: new Date(Date.now() - 3 * 3600_000) },
  { id: 'n-3', type: 'candidate', message: '5 new high-match candidates in your pipeline', time: new Date(Date.now() - 6 * 3600_000) },
];

export const DEFAULT_ACTIONS: QuickAction[] = [
  { key: 'post-job', label: 'Post New Job', description: 'Create a new job listing' },
  { key: 'search', label: 'Search Candidates', description: 'Find talent in your pool' },
  { key: 'outreach', label: 'Send Outreach', description: 'Reach out to candidates' },
  { key: 'reports', label: 'View Reports', description: 'Analytics & insights' },
];

export const DEFAULT_ACTIVITY: ActivityItem[] = [
  { id: 'a-1', type: 'applied', message: 'Sarah Johnson applied for Senior Frontend Engineer', time: new Date(Date.now() - 30 * 60_000), entityType: 'candidate', entityName: 'Sarah Johnson' },
  { id: 'a-2', type: 'interview', message: 'Technical interview completed for Michael Chen', time: new Date(Date.now() - 2 * 3600_000), entityType: 'interview' },
  { id: 'a-3', type: 'offer', message: 'Offer extended to David Park for Backend Engineer', time: new Date(Date.now() - 5 * 3600_000), entityType: 'offer', entityName: 'David Park' },
  { id: 'a-4', type: 'stage-change', message: 'Emily Rodriguez moved to Interview stage', time: new Date(Date.now() - 8 * 3600_000), entityType: 'candidate' },
  { id: 'a-5', type: 'hired', message: 'James Kim accepted offer for Product Designer', time: new Date(Date.now() - 24 * 3600_000), entityType: 'candidate', entityName: 'James Kim' },
];

export const DEFAULT_SUGGESTIONS: AISuggestion[] = [
  { id: 's-1', action: 'Review Sarah Johnson\'s application', confidence: 95, reason: '98% match score, profile has been waiting 36h' },
  { id: 's-2', action: 'Schedule follow-up with Michael Chen', confidence: 88, reason: 'Technical round completed, strong positive signals' },
  { id: 's-3', action: 'Reach out to Emily Rodriguez', confidence: 82, reason: 'High-value passive candidate, recently updated profile' },
];

export const DEFAULT_PERF: PerformanceMetric[] = [
  { label: 'Offers Accepted', value: 8, target: 10, trend: 'up', changePercent: 14.3 },
  { label: 'Candidates Sourced', value: 45, target: 50, trend: 'up', changePercent: 8.7 },
  { label: 'Avg Response Time', value: 4, target: 2, trend: 'down', changePercent: -12.5 },
  { label: 'Pipeline Velocity', value: 72, target: 85, trend: 'up', changePercent: 5.2 },
];

/* ── Team Performance ───────────────────────────────────────────────── */

export const DEFAULT_TEAM_PERF: TeamPerformance[] = [
  { recruiterId: 'r-1', recruiterName: 'Sofia Martinez', hires: 6, hireTarget: 8, avgTimeToFill: 24, conversionRate: 18.5, slaBreachCount: 1 },
  { recruiterId: 'r-2', recruiterName: 'James Chen', hires: 9, hireTarget: 8, avgTimeToFill: 19, conversionRate: 22.3, slaBreachCount: 0 },
  { recruiterId: 'r-3', recruiterName: 'Priya Sharma', hires: 4, hireTarget: 7, avgTimeToFill: 31, conversionRate: 12.8, slaBreachCount: 3 },
  { recruiterId: 'r-4', recruiterName: 'Marcus Williams', hires: 7, hireTarget: 8, avgTimeToFill: 22, conversionRate: 20.1, slaBreachCount: 1 },
  { recruiterId: 'r-5', recruiterName: 'Emily Rodriguez', hires: 5, hireTarget: 6, avgTimeToFill: 27, conversionRate: 15.6, slaBreachCount: 2 },
];
