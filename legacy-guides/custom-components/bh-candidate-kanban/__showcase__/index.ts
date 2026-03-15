/**
 * bh-candidate-kanban - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { KanbanStage, KanbanCandidate } from '../core';

export const DEFAULT_STAGES: KanbanStage[] = [
  { id: 's-1', name: 'Applied', order: 1, slaHours: 48, candidateCount: 6 },
  { id: 's-2', name: 'Screening', order: 2, slaHours: 72, candidateCount: 4 },
  { id: 's-3', name: 'Interview', order: 3, slaHours: 96, candidateCount: 3 },
  { id: 's-4', name: 'Assessment', order: 4, slaHours: 72, candidateCount: 2 },
  { id: 's-5', name: 'Offer', order: 5, slaHours: 48, candidateCount: 1 },
];

export const DEFAULT_CANDIDATES: KanbanCandidate[] = [
  { id: 'c-1', name: 'Sarah Johnson', scorePercent: 95, daysInStage: 1, source: 'applied', tags: ['React', 'Senior'], aiRecommendation: 'advance', stageId: 's-3', email: 'sarah@google.com' },
  { id: 'c-2', name: 'Michael Chen', scorePercent: 88, daysInStage: 2, source: 'referral', tags: ['Full Stack', 'Go'], aiRecommendation: 'advance', stageId: 's-3', email: 'mchen@stripe.com' },
  { id: 'c-3', name: 'Emily Rodriguez', scorePercent: 92, daysInStage: 0, source: 'sourced', tags: ['Staff', 'System Design'], aiRecommendation: 'advance', stageId: 's-4', email: 'emily@meta.com' },
  { id: 'c-4', name: 'James Kim', scorePercent: 72, daysInStage: 3, source: 'applied', tags: ['ML', 'Python'], aiRecommendation: 'hold', stageId: 's-2', email: 'jkim@anthropic.com' },
  { id: 'c-5', name: 'Anna Kowalski', scorePercent: 78, daysInStage: 5, source: 'agency', tags: ['DevOps'], aiRecommendation: 'hold', stageId: 's-1', email: 'anna@vercel.com' },
  { id: 'c-6', name: 'David Thompson', scorePercent: 91, daysInStage: 1, source: 'referral', tags: ['VP Eng'], aiRecommendation: 'advance', stageId: 's-5', email: 'david@linear.app' },
  { id: 'c-7', name: 'Lisa Park', scorePercent: 65, daysInStage: 4, source: 'applied', tags: ['Junior', 'React'], aiRecommendation: 'reject', stageId: 's-1', email: 'lisa@figma.com' },
  { id: 'c-8', name: 'Robert Wilson', scorePercent: 83, daysInStage: 1, source: 'sourced', tags: ['Backend', 'Rust'], aiRecommendation: 'advance', stageId: 's-2', email: 'rwilson@cloudflare.com' },
];
