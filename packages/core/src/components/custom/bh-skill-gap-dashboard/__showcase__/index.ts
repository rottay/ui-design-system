/**
 * bh-skill-gap-dashboard - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { SkillGapData } from '../core';

export const MOCK_SKILLS: SkillGapData[] = [
  { skill: 'React/TypeScript', required: 95, current: 72, gap: 23, priority: 'high', candidatePool: 145 },
  { skill: 'System Design', required: 90, current: 65, gap: 25, priority: 'high', candidatePool: 89 },
  { skill: 'Cloud Architecture', required: 85, current: 70, gap: 15, priority: 'medium', candidatePool: 112 },
  { skill: 'Machine Learning', required: 80, current: 45, gap: 35, priority: 'high', candidatePool: 67 },
  { skill: 'DevOps/CI-CD', required: 75, current: 68, gap: 7, priority: 'low', candidatePool: 198 },
  { skill: 'Data Engineering', required: 70, current: 52, gap: 18, priority: 'medium', candidatePool: 134 },
  { skill: 'API Design', required: 85, current: 78, gap: 7, priority: 'low', candidatePool: 221 },
];
