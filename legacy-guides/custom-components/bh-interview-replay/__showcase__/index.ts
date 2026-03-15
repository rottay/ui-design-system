/**
 * bh-interview-replay - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type {
  TranscriptEntry,
  ScoreOverlayPoint,
  EvidenceMarker,
  PersonaInfo,
  ReplayScoreSummary,
} from '../core';

export const MOCK_TRANSCRIPT: TranscriptEntry[] = [
  { id: 't-1', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'Welcome! Could you walk me through a challenging technical project you led recently?', timestamp: '00:00', durationMs: 8200, confidence: 0.98 },
  { id: 't-2', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'Sure. I led the migration of our monolithic API to a microservices architecture. We had about 2 million daily active users, so zero-downtime was critical.', timestamp: '00:12', durationMs: 18500, confidence: 0.95, hasEvidence: true },
  { id: 't-3', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'What was the biggest technical challenge you faced during the migration?', timestamp: '00:45', durationMs: 7800, confidence: 0.97 },
  { id: 't-4', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'Data consistency across services was the hardest part. We implemented an event-sourcing pattern with eventual consistency, and built a reconciliation system to catch discrepancies.', timestamp: '01:02', durationMs: 22400, confidence: 0.92, hasEvidence: true },
  { id: 't-5', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'How did you handle team coordination across the different service teams?', timestamp: '01:38', durationMs: 9100, confidence: 0.96 },
  { id: 't-6', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'I set up weekly architecture review meetings and created shared API contracts using OpenAPI specs. Each team owned their service but followed common patterns we established together.', timestamp: '01:55', durationMs: 20300, confidence: 0.94, hasEvidence: true },
];

export const MOCK_SCORE_OVERLAY: ScoreOverlayPoint[] = [
  { timestamp: '00:12', dimension: 'Technical Depth', dimensionCode: 'TECH', score: 8, maxScore: 10, evidenceId: 'ev-1' },
  { timestamp: '00:45', dimension: 'Communication', dimensionCode: 'COMM', score: 7, maxScore: 10 },
  { timestamp: '01:02', dimension: 'Technical Depth', dimensionCode: 'TECH', score: 9, maxScore: 10, evidenceId: 'ev-2' },
  { timestamp: '01:02', dimension: 'Problem Solving', dimensionCode: 'PROB', score: 8, maxScore: 10, evidenceId: 'ev-3' },
  { timestamp: '01:38', dimension: 'Communication', dimensionCode: 'COMM', score: 8, maxScore: 10 },
  { timestamp: '01:55', dimension: 'Leadership', dimensionCode: 'LEAD', score: 9, maxScore: 10, evidenceId: 'ev-4' },
  { timestamp: '01:55', dimension: 'Collaboration', dimensionCode: 'COLL', score: 8, maxScore: 10, evidenceId: 'ev-5' },
];

export const MOCK_EVIDENCE: EvidenceMarker[] = [
  { id: 'ev-1', transcriptEntryId: 't-2', quote: '2 million daily active users, so zero-downtime was critical', dimension: 'Technical Depth', impact: 'positive', score: 8 },
  { id: 'ev-2', transcriptEntryId: 't-4', quote: 'event-sourcing pattern with eventual consistency', dimension: 'Technical Depth', impact: 'positive', score: 9 },
  { id: 'ev-3', transcriptEntryId: 't-4', quote: 'built a reconciliation system to catch discrepancies', dimension: 'Problem Solving', impact: 'positive', score: 8 },
  { id: 'ev-4', transcriptEntryId: 't-6', quote: 'weekly architecture review meetings', dimension: 'Leadership', impact: 'positive', score: 9 },
  { id: 'ev-5', transcriptEntryId: 't-6', quote: 'Each team owned their service but followed common patterns we established together', dimension: 'Collaboration', impact: 'neutral', score: 8 },
];

export const MOCK_PERSONA: PersonaInfo = {
  name: 'Nova',
  tone: 'Professional and encouraging',
  style: 'Structured behavioral with technical deep-dives',
  voiceProvider: 'elevenlabs',
};

export const MOCK_SCORE_SUMMARY: ReplayScoreSummary = {
  overall: 82,
  maxScore: 100,
  dimensions: [
    { name: 'Technical Depth', code: 'TECH', score: 17, maxScore: 20 },
    { name: 'Problem Solving', code: 'PROB', score: 16, maxScore: 20 },
    { name: 'Communication', code: 'COMM', score: 15, maxScore: 20 },
    { name: 'Leadership', code: 'LEAD', score: 18, maxScore: 20 },
    { name: 'Collaboration', code: 'COLL', score: 16, maxScore: 20 },
  ],
  strengths: [
    'Strong systems architecture knowledge with real-world scale experience',
    'Excellent leadership in cross-team coordination',
    'Clear articulation of technical trade-offs',
  ],
  weaknesses: [
    'Could elaborate more on failure scenarios and rollback strategies',
    'Did not mention monitoring or observability practices',
  ],
};
