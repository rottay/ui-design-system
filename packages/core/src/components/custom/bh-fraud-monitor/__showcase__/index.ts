/**
 * bh-fraud-monitor - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProctoringEvent } from '../core';

export const MOCK_EVENTS: ProctoringEvent[] = [
  { id: 'fe-1', type: 'tab_switch', severity: 'high', timestamp: '2025-01-20T10:15:00Z', description: 'Candidate switched to external browser tab during coding challenge', scorableId: 'sc-1', candidateName: 'John Doe', reviewStatus: 'pending' },
  { id: 'fe-2', type: 'copy_paste', severity: 'critical', timestamp: '2025-01-20T10:18:00Z', description: 'Large code block pasted from clipboard during technical assessment', scorableId: 'sc-1', candidateName: 'John Doe', reviewStatus: 'flagged' },
  { id: 'fe-3', type: 'focus_loss', severity: 'medium', timestamp: '2025-01-20T10:22:00Z', description: 'Browser window lost focus for 45 seconds', scorableId: 'sc-2', candidateName: 'Jane Smith', reviewStatus: 'pending' },
  { id: 'fe-4', type: 'suspicious_timing', severity: 'low', timestamp: '2025-01-20T10:30:00Z', description: 'Answer submitted unusually fast for question complexity', scorableId: 'sc-3', candidateName: 'Alex Johnson', reviewStatus: 'dismissed' },
  { id: 'fe-5', type: 'similarity_flag', severity: 'high', timestamp: '2025-01-20T11:00:00Z', description: '87% similarity detected with another candidate submission', scorableId: 'sc-4', candidateName: 'Sam Wilson', reviewStatus: 'escalated' },
];
