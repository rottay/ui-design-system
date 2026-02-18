/**
 * bh-evidence-browser - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { EvidenceItem, TranscriptSegment } from '../core';

export const MOCK_EVIDENCE: EvidenceItem[] = [
  { id: 'ev-1', quote: 'I start by identifying the key requirements and constraints', dimension: 'System Design', dimensionCode: 'SD', impact: 'positive', score: 8, transcriptSegmentId: 'ts-2', isValidated: true, timestamp: '00:15' },
  { id: 'ev-2', quote: 'focusing on scalability and reliability', dimension: 'Architecture', dimensionCode: 'ARCH', impact: 'positive', score: 9, transcriptSegmentId: 'ts-2', isValidated: true, timestamp: '00:22' },
  { id: 'ev-3', quote: 'For payment systems I prioritize consistency', dimension: 'Trade-off Analysis', dimensionCode: 'TA', impact: 'positive', score: 7, transcriptSegmentId: 'ts-4', isValidated: false, timestamp: '00:58' },
  { id: 'ev-4', quote: 'for social feeds I lean toward availability with eventual consistency', dimension: 'Trade-off Analysis', dimensionCode: 'TA', impact: 'neutral', score: 8, transcriptSegmentId: 'ts-4', isValidated: false, timestamp: '01:05' },
];

export const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { id: 'ts-1', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'Can you describe your approach to system design?', timestamp: '00:00' },
  { id: 'ts-2', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'I start by identifying the key requirements and constraints, then sketch out the high-level architecture focusing on scalability and reliability.', timestamp: '00:15', hasEvidence: true },
  { id: 'ts-3', speaker: 'interviewer', speakerName: 'AI Interviewer', text: 'How do you handle trade-offs between consistency and availability?', timestamp: '00:42' },
  { id: 'ts-4', speaker: 'candidate', speakerName: 'Sarah Chen', text: 'It depends on the use case. For payment systems I prioritize consistency, but for social feeds I lean toward availability with eventual consistency.', timestamp: '00:58', hasEvidence: true },
];
