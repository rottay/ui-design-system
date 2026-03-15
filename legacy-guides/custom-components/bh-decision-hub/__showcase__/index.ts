/**
 * bh-decision-hub - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type {
  DecisionCandidate,
  DecisionRecord,
  CompareSlot,
  BulkDecisionEntry,
  RejectReasonData,
  AdvanceStepData,
  DecisionFormData,
} from '../core';

export const DEFAULT_CANDIDATES: DecisionCandidate[] = [
  { id: 'dc-1', name: 'Sarah Johnson', rank: 1, scorePercent: 92, highlights: ['Deep React expertise', '6 yrs at Google', 'System design lead'], aiRecommendation: 'Strong advance. Top-tier technical skills with proven leadership at scale. Rare profile.', pros: ['Expert-level React & TypeScript', 'Led 40-person engineering org', 'Published speaker'], cons: ['Above budget by 12%', 'Notice period: 3 months'], riskFactors: ['Compensation gap'] },
  { id: 'dc-2', name: 'Michael Chen', rank: 2, scorePercent: 88, highlights: ['Full-stack at Stripe', 'Y Combinator alum', 'Open source contributor'], aiRecommendation: 'Advance recommended. Exceptional full-stack depth and startup resilience. Culture fit is strong.', pros: ['Stripe payments infrastructure', 'Founded YC startup', 'Strong culture alignment'], cons: ['Shorter tenure history (avg 1.5yr)', 'No direct management exp'], riskFactors: ['Tenure pattern'] },
  { id: 'dc-3', name: 'Emily Rodriguez', rank: 3, scorePercent: 85, highlights: ['Meta infra team', 'Distributed systems', 'PhD CS Stanford'], aiRecommendation: 'Consider advance. Deep technical background but interview performance was mixed on behavioral.', pros: ['PhD-level distributed systems', 'Meta scale experience'], cons: ['Behavioral interview below threshold', 'Prefers IC track only'], riskFactors: ['Behavioral score', 'IC-only preference'] },
  { id: 'dc-4', name: 'James Kim', rank: 4, scorePercent: 79, highlights: ['Anthropic ML engineer', 'AI safety research', 'Berkeley CS'], aiRecommendation: 'Hold recommended. Strong technical but role mismatch -- better fit for ML-focused position.', pros: ['Cutting-edge AI/ML skills', 'Published research'], cons: ['Role mismatch (ML vs frontend)', 'Limited web development'], riskFactors: ['Role alignment'] },
  { id: 'dc-5', name: 'Anna Kowalski', rank: 5, scorePercent: 74, highlights: ['Vercel DX team', 'Next.js contributor', 'Design systems'], aiRecommendation: 'Advance with reservations. Good DX skills but seniority level may be below target.', pros: ['Next.js core knowledge', 'Design system experience'], cons: ['3 years total experience', 'No team lead history'], riskFactors: ['Seniority gap'] },
  { id: 'dc-6', name: 'David Thompson', rank: 6, scorePercent: 67, highlights: ['Linear frontend', 'Product sense', 'CSS architecture'], aiRecommendation: 'Reject recommended. While product skills are good, technical depth insufficient for senior role.', pros: ['Strong product instincts', 'Clean CSS architecture'], cons: ['Technical depth below bar', 'Algorithm struggles', 'No system design experience'], riskFactors: ['Technical depth', 'Seniority'] },
];

export const DEFAULT_HISTORY: DecisionRecord[] = [
  { candidateId: 'c-4', decision: 'advance', reason: 'Strong technical skills', decidedBy: 'Jane Doe', decidedAt: '2025-01-15T10:00:00Z' },
  { candidateId: 'c-5', decision: 'reject', rejectCategory: 'not_qualified', reason: 'Below technical threshold', decidedBy: 'Jane Doe', decidedAt: '2025-01-14T15:30:00Z' },
  { candidateId: 'c-6', decision: 'hold', reason: 'Waiting for references', decidedBy: 'John Smith', decidedAt: '2025-01-14T09:00:00Z' },
];

export const MOCK_COMPARE_SLOTS: CompareSlot[] = [
  { candidateId: 'dc-1', position: 1 },
  { candidateId: 'dc-2', position: 2 },
];

export const MOCK_BULK_DECISIONS: BulkDecisionEntry[] = [
  { candidateId: 'dc-1', decision: 'advance' },
  { candidateId: 'dc-2', decision: 'advance' },
  { candidateId: 'dc-3', decision: 'hold', reason: 'Need additional behavioral assessment before proceeding' },
  { candidateId: 'dc-4', decision: 'hold', reason: 'Exploring ML-focused role internally for better fit' },
  { candidateId: 'dc-5', decision: 'reject', rejectCategory: 'not_qualified', reason: 'Seniority level below minimum bar for Staff role' },
  { candidateId: 'dc-6', decision: 'reject', rejectCategory: 'not_qualified', reason: 'Technical depth insufficient for senior engineering position' },
];

export const MOCK_REJECT_REASON: RejectReasonData = {
  category: 'compensation',
  reason: 'Expected compensation exceeds approved budget range by more than 15%. Unable to accommodate within current headcount plan.',
  followupDate: '2026-06-01',
};

export const MOCK_ADVANCE_STEP: AdvanceStepData = {
  nextStep: 'Final Panel Interview',
};

export const MOCK_DECISION_FORM: DecisionFormData = {
  action: 'advance',
  advanceStep: 'Technical Interview',
  rejectCategory: undefined,
  rejectReason: undefined,
  holdReason: undefined,
  followupDate: undefined,
};
