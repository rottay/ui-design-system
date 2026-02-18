/**
 * bh-proctoring-review - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProctoringReviewEventView } from '../core';

export const MOCK_EVENT: ProctoringReviewEventView = {
  event: {
    id: 'pe-1',
    scorableId: 'int-1',
    eventType: 'screen_share',
    severity: 'critical',
    timestamp: new Date(Date.now() - 300000),
    metadata: { duration: 45, application: 'Discord', detectedAt: 'question_3' },
    reviewed: false,
    dismissed: false,
  },
  candidateName: 'Sarah Johnson',
  description: 'Candidate initiated a screen sharing session with an external application during the coding assessment. The screen share lasted approximately 45 seconds before being automatically terminated.',
  sessionDuration: 2400,
};
