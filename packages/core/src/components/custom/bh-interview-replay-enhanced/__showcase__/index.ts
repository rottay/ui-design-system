/**
 * bh-interview-replay-enhanced - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TranscriptSegment, EvidenceMarker } from '../core';

export const MOCK_TRANSCRIPT: TranscriptSegment[] = [
  { id: 'seg-1', speaker: 'interviewer', text: 'Welcome to the interview. Could you start by telling me about your experience with distributed systems?', startTime: 0, endTime: 18, confidence: 0.97 },
  { id: 'seg-2', speaker: 'candidate', text: 'Sure. I spent the last three years building microservices at scale. Our platform handled about 50 million requests per day across 40 services.', startTime: 18, endTime: 42, confidence: 0.94 },
  { id: 'seg-3', speaker: 'interviewer', text: 'Interesting. How did you handle service discovery and load balancing?', startTime: 42, endTime: 56, confidence: 0.96 },
  { id: 'seg-4', speaker: 'candidate', text: 'We used Consul for service discovery with health checks, and Envoy as our service mesh proxy. For load balancing, we implemented weighted round-robin with circuit breakers using Hystrix patterns.', startTime: 56, endTime: 88, confidence: 0.92 },
  { id: 'seg-5', speaker: 'interviewer', text: 'What about data consistency across services? That can be quite challenging.', startTime: 88, endTime: 102, confidence: 0.95 },
  { id: 'seg-6', speaker: 'candidate', text: 'We adopted the saga pattern for distributed transactions. Each service published domain events through Kafka, and we had a compensation mechanism for rollbacks. We also used eventual consistency with CRDTs for less critical data.', startTime: 102, endTime: 148, confidence: 0.91 },
  { id: 'seg-7', speaker: 'interviewer', text: 'Can you describe a production incident you handled and how you resolved it?', startTime: 148, endTime: 162, confidence: 0.98 },
  { id: 'seg-8', speaker: 'candidate', text: 'We had a cascading failure where our payment service went down due to a database connection pool exhaustion. I led the incident response: we isolated the affected service, enabled circuit breakers, and implemented a queue-based retry mechanism to prevent data loss. The incident was resolved in 45 minutes.', startTime: 162, endTime: 218, confidence: 0.93 },
];

export const MOCK_EVIDENCE: EvidenceMarker[] = [
  { id: 'ev-1', time: 30, label: 'Scale experience', dimensionName: 'Technical Depth', score: 8 },
  { id: 'ev-2', time: 72, label: 'Infrastructure knowledge', dimensionName: 'System Design', score: 9 },
  { id: 'ev-3', time: 120, label: 'Distributed patterns', dimensionName: 'Technical Depth', score: 9 },
  { id: 'ev-4', time: 180, label: 'Incident leadership', dimensionName: 'Leadership', score: 8 },
  { id: 'ev-5', time: 200, label: 'Problem resolution', dimensionName: 'Problem Solving', score: 7 },
];

export const MOCK_WAVEFORM: number[] = Array.from({ length: 120 }, (_, i) =>
  Math.sin(i * 0.2) * 0.5 + Math.random() * 0.5
);
