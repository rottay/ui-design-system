/**
 * bh-manager-console - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { Team, TeamKpi, RecruiterWorkload, SlaItem, TaskCard, PerformanceAlert, SprintSummary } from '../core';

export const MOCK_TEAMS: Team[] = [
  { id: 't1', name: 'Engineering Hiring', memberCount: 6, lead: 'Sofia Martinez' },
  { id: 't2', name: 'Product & Design', memberCount: 4, lead: 'James Chen' },
  { id: 't3', name: 'GTM Recruiting', memberCount: 5, lead: 'Priya Sharma' },
];

export const MOCK_KPIS: TeamKpi[] = [
  { label: 'Open Requisitions', value: 24, trend: 'up', trendValue: '+3', sparklineData: [18, 20, 19, 22, 21, 24] },
  { label: 'Time to Fill', value: '28d', trend: 'down', trendValue: '-4d', sparklineData: [34, 32, 31, 30, 29, 28] },
  { label: 'Offer Acceptance', value: '87%', trend: 'up', trendValue: '+5%', sparklineData: [78, 80, 82, 84, 85, 87] },
  { label: 'Pipeline Coverage', value: '3.2x', trend: 'flat', trendValue: '0', sparklineData: [3.0, 3.1, 3.0, 3.2, 3.1, 3.2] },
];

export const MOCK_RECRUITERS: RecruiterWorkload[] = [
  { recruiterId: 'r1', name: 'Sofia Martinez', avatar: undefined, metrics: { Hires: 6, Screens: 28, 'Pass Rate': 72, 'Avg Days': 24, 'Quality': 88, 'Satisfaction': 4.6 } },
  { recruiterId: 'r2', name: 'James Chen', avatar: undefined, metrics: { Hires: 5, Screens: 22, 'Pass Rate': 68, 'Avg Days': 26, 'Quality': 84, 'Satisfaction': 4.4 } },
  { recruiterId: 'r3', name: 'Priya Sharma', avatar: undefined, metrics: { Hires: 4, Screens: 32, 'Pass Rate': 58, 'Avg Days': 32, 'Quality': 76, 'Satisfaction': 4.2 } },
  { recruiterId: 'r4', name: 'Marcus Williams', avatar: undefined, metrics: { Hires: 3, Screens: 18, 'Pass Rate': 82, 'Avg Days': 22, 'Quality': 90, 'Satisfaction': 4.8 } },
];

export const MOCK_SLA: SlaItem[] = [
  { stage: 'Resume Review', avgHours: 18, limitHours: 24, status: 'green' },
  { stage: 'Phone Screen', avgHours: 22, limitHours: 24, status: 'yellow' },
  { stage: 'Technical', avgHours: 42, limitHours: 48, status: 'yellow' },
  { stage: 'Offer', avgHours: 16, limitHours: 24, status: 'green' },
];

export const MOCK_TASKS: TaskCard[] = [
  { id: 'tk1', title: 'Review Sr. Engineer candidates', priority: 'urgent', assignee: 'Sofia Martinez', dueDate: '2026-02-13' },
  { id: 'tk2', title: 'Schedule panel for Data Analyst', priority: 'high', assignee: 'James Chen', dueDate: '2026-02-14' },
  { id: 'tk3', title: 'Prepare offer for UX Designer', priority: 'high', assignee: 'Priya Sharma', dueDate: '2026-02-14' },
  { id: 'tk4', title: 'Update job description: PM role', priority: 'medium', assignee: 'Marcus Williams', dueDate: '2026-02-16' },
];

export const MOCK_ALERTS: PerformanceAlert[] = [
  { id: 'a1', recruiterName: 'Priya Sharma', metric: 'Time to Fill', threshold: 30, actual: 32, severity: 'warning' },
  { id: 'a2', recruiterName: 'Sofia Martinez', metric: 'Screen Completion', threshold: 80, actual: 68, severity: 'critical' },
];

export const MOCK_SPRINT: SprintSummary = { total: 42, completed: 28, inProgress: 10, blocked: 4 };
