/**
 * bh-transcript-viewer - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TranscriptMeta } from '../core';

export const MOCK_META: TranscriptMeta = {
  interviewId: 'int-1', candidateName: 'Sarah Chen', positionTitle: 'Senior Software Engineer',
  interviewDate: '2025-01-20', interviewType: 'Technical', duration: '45 min', overallScore: 82,
};
