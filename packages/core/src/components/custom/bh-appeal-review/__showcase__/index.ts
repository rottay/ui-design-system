/**
 * bh-appeal-review - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { AppealData } from '../core';

export const MOCK_APPEAL: AppealData = {
  id: 'appeal-1',
  candidateName: 'Sarah Johnson',
  positionTitle: 'Senior Frontend Engineer',
  originalDecision: 'Rejected',
  reason: 'The candidate demonstrated strong technical skills during the live coding session that were not reflected in the automated scoring. The system may have had connectivity issues during the assessment.',
  evidence: 'Video recording timestamp 14:32 shows correct solution implementation. Network logs indicate packet loss during submission window. Two panel members noted strong performance in their independent evaluations.',
  submittedAt: new Date(Date.now() - 86400000),
  status: 'under-review',
  reviewerNotes: 'Initial review shows merit. Checking system logs for connectivity issues.',
};
