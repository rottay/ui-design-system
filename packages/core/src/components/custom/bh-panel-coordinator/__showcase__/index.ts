/**
 * bh-panel-coordinator - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { InterviewStage, PanelMember } from '../core';

export const MOCK_STAGES: InterviewStage[] = [
  { id: 's-1', name: 'Technical Screen', order: 1, status: 'completed', aggregationStrategy: 'average', aggregatedScore: 82, maxScore: 100, completedDate: '2025-01-15', panelMemberIds: ['m-1', 'm-2'] },
  { id: 's-2', name: 'System Design', order: 2, status: 'completed', aggregationStrategy: 'weighted_average', aggregatedScore: 75, maxScore: 100, completedDate: '2025-01-18', panelMemberIds: ['m-3'] },
  { id: 's-3', name: 'Behavioral', order: 3, status: 'in_progress', aggregationStrategy: 'consensus', maxScore: 100, scheduledDate: '2025-01-22', panelMemberIds: ['m-4'] },
  { id: 's-4', name: 'Hiring Manager', order: 4, status: 'pending', aggregationStrategy: 'average', maxScore: 100, panelMemberIds: [] },
];

export const MOCK_MEMBERS: PanelMember[] = [
  { id: 'm-1', name: 'Alex Rivera', role: 'Senior Engineer', stageId: 's-1', overallScore: 85, recommendation: 'hire', submittedAt: '2025-01-15T14:00:00Z', dimensionScores: [{ dimension: 'Problem Solving', score: 9, maxScore: 10 }, { dimension: 'Code Quality', score: 8, maxScore: 10 }], notes: 'Strong problem-solving skills. Clean code approach.' },
  { id: 'm-2', name: 'Jordan Park', role: 'Staff Engineer', stageId: 's-1', overallScore: 79, recommendation: 'hire', submittedAt: '2025-01-15T16:00:00Z', dimensionScores: [{ dimension: 'Problem Solving', score: 8, maxScore: 10 }, { dimension: 'Code Quality', score: 7, maxScore: 10 }] },
  { id: 'm-3', name: 'Morgan Lee', role: 'Principal Architect', stageId: 's-2', overallScore: 75, recommendation: 'hire', submittedAt: '2025-01-18T11:00:00Z', dimensionScores: [{ dimension: 'System Design', score: 8, maxScore: 10 }, { dimension: 'Scalability', score: 7, maxScore: 10 }] },
  { id: 'm-4', name: 'Casey Kim', role: 'Engineering Manager', stageId: 's-3' },
];
