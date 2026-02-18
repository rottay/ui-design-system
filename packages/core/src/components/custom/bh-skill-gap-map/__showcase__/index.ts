/**
 * bh-skill-gap-map - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SkillGapItem, DimensionHeatmapCell } from '../core';

export const DEFAULT_GAPS: SkillGapItem[] = [
  { id: 'g-1', dimension: 'System Design', dimensionCode: 'SD', currentLevel: 3, requiredLevel: 5, gapSize: 2, priority: 'critical', candidateCount: 4, recommendation: 'Focus hiring on candidates with distributed systems experience at scale.' },
  { id: 'g-2', dimension: 'React Advanced', dimensionCode: 'RA', currentLevel: 4, requiredLevel: 5, gapSize: 1, priority: 'high', candidateCount: 3, recommendation: 'Look for RSC and server component expertise.' },
  { id: 'g-3', dimension: 'Leadership', dimensionCode: 'LD', currentLevel: 3, requiredLevel: 4, gapSize: 1, priority: 'high', candidateCount: 5, recommendation: 'Prioritize tech lead or engineering manager backgrounds.' },
  { id: 'g-4', dimension: 'TypeScript', dimensionCode: 'TS', currentLevel: 4, requiredLevel: 5, gapSize: 1, priority: 'medium', candidateCount: 2 },
  { id: 'g-5', dimension: 'Testing', dimensionCode: 'QA', currentLevel: 3, requiredLevel: 4, gapSize: 1, priority: 'medium', candidateCount: 3 },
  { id: 'g-6', dimension: 'Communication', dimensionCode: 'CM', currentLevel: 4, requiredLevel: 4, gapSize: 0, priority: 'low', candidateCount: 1 },
];

export const DEFAULT_HEATMAP: DimensionHeatmapCell[] = [
  { dimension: 'System Design', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 90, maxScore: 100, gapSize: 0 },
  { dimension: 'React Advanced', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 95, maxScore: 100, gapSize: 0 },
  { dimension: 'TypeScript', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 88, maxScore: 100, gapSize: 0 },
  { dimension: 'Leadership', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 85, maxScore: 100, gapSize: 0 },
  { dimension: 'Testing', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 72, maxScore: 100, gapSize: 1 },
  { dimension: 'Communication', candidate: 'Sarah Johnson', candidateId: 'c-1', score: 88, maxScore: 100, gapSize: 0 },
  { dimension: 'System Design', candidate: 'Michael Chen', candidateId: 'c-2', score: 78, maxScore: 100, gapSize: 1 },
  { dimension: 'React Advanced', candidate: 'Michael Chen', candidateId: 'c-2', score: 82, maxScore: 100, gapSize: 0 },
  { dimension: 'TypeScript', candidate: 'Michael Chen', candidateId: 'c-2', score: 90, maxScore: 100, gapSize: 0 },
  { dimension: 'Leadership', candidate: 'Michael Chen', candidateId: 'c-2', score: 60, maxScore: 100, gapSize: 2 },
  { dimension: 'Testing', candidate: 'Michael Chen', candidateId: 'c-2', score: 85, maxScore: 100, gapSize: 0 },
  { dimension: 'Communication', candidate: 'Michael Chen', candidateId: 'c-2', score: 91, maxScore: 100, gapSize: 0 },
  { dimension: 'System Design', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 95, maxScore: 100, gapSize: 0 },
  { dimension: 'React Advanced', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 65, maxScore: 100, gapSize: 2 },
  { dimension: 'TypeScript', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 75, maxScore: 100, gapSize: 1 },
  { dimension: 'Leadership', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 55, maxScore: 100, gapSize: 2 },
  { dimension: 'Testing', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 70, maxScore: 100, gapSize: 1 },
  { dimension: 'Communication', candidate: 'Emily Rodriguez', candidateId: 'c-3', score: 62, maxScore: 100, gapSize: 1 },
  { dimension: 'System Design', candidate: 'James Kim', candidateId: 'c-4', score: 45, maxScore: 100, gapSize: 3 },
  { dimension: 'React Advanced', candidate: 'James Kim', candidateId: 'c-4', score: 40, maxScore: 100, gapSize: 3 },
  { dimension: 'TypeScript', candidate: 'James Kim', candidateId: 'c-4', score: 70, maxScore: 100, gapSize: 1 },
  { dimension: 'Leadership', candidate: 'James Kim', candidateId: 'c-4', score: 50, maxScore: 100, gapSize: 2 },
  { dimension: 'Testing', candidate: 'James Kim', candidateId: 'c-4', score: 80, maxScore: 100, gapSize: 0 },
  { dimension: 'Communication', candidate: 'James Kim', candidateId: 'c-4', score: 75, maxScore: 100, gapSize: 1 },
];

export const DEFAULT_SUMMARY = { totalGaps: 6, criticalGaps: 1, averageGapSize: 1.0, mostCommonDimension: 'Leadership' };
