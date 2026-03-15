/**
 * bh-scoring-job-queue - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { QueueStats, ScoringJobView } from '../core';

export const MOCK_STATS: QueueStats = {
  totalJobs: 42,
  queued: 12,
  processing: 5,
  completed: 20,
  failed: 3,
  avgProcessingTime: 45000,
};

export const MOCK_JOBS: ScoringJobView[] = [
  { job: { id: 'sj-1', status: 'processing' as const, attempts: 0, createdAt: new Date(Date.now() - 120000), startedAt: new Date(Date.now() - 60000) } as any, candidateName: 'Sarah Johnson', jobTitle: 'Senior Frontend Engineer', rubricName: 'Technical Assessment v2', progress: 0.65, priorityLabel: 'urgent', estimatedDuration: 90000 },
  { job: { id: 'sj-2', status: 'processing' as const, attempts: 0, createdAt: new Date(Date.now() - 300000), startedAt: new Date(Date.now() - 120000) } as any, candidateName: 'Michael Chen', jobTitle: 'Backend Developer', rubricName: 'System Design Rubric', progress: 0.3, priorityLabel: 'high', estimatedDuration: 120000 },
  { job: { id: 'sj-3', status: 'pending' as const, attempts: 0, createdAt: new Date(Date.now() - 600000) } as any, candidateName: 'Emily Rodriguez', jobTitle: 'Full Stack Engineer', rubricName: 'Code Review Assessment', progress: 0, priorityLabel: 'normal' },
  { job: { id: 'sj-4', status: 'failed' as const, attempts: 2, createdAt: new Date(Date.now() - 1800000), startedAt: new Date(Date.now() - 1200000), errorMessage: 'Timeout: LLM provider did not respond within 60s' } as any, candidateName: 'James Kim', jobTitle: 'DevOps Engineer', rubricName: 'Infrastructure Rubric', progress: 0.45, priorityLabel: 'high' },
  { job: { id: 'sj-5', status: 'completed' as const, attempts: 0, createdAt: new Date(Date.now() - 3600000), startedAt: new Date(Date.now() - 3540000), completedAt: new Date(Date.now() - 3500000) } as any, candidateName: 'Anna Kowalski', jobTitle: 'Data Scientist', rubricName: 'ML Knowledge Assessment', progress: 1, priorityLabel: 'normal' },
  { job: { id: 'sj-6', status: 'pending' as const, attempts: 0, createdAt: new Date(Date.now() - 7200000), startedAt: new Date(Date.now() - 7000000) } as any, candidateName: 'David Park', jobTitle: 'Senior Frontend Engineer', rubricName: 'Technical Assessment v2', progress: 0.2, priorityLabel: 'low' },
  { job: { id: 'sj-7', status: 'pending' as const, attempts: 0, createdAt: new Date(Date.now() - 180000) } as any, candidateName: 'Lisa Wang', jobTitle: 'Product Manager', rubricName: 'PM Case Study Rubric', progress: 0, priorityLabel: 'urgent' },
];
