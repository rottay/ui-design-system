/**
 * bh-proctoring-event-card - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProctoringEventCardView } from '../core';

export const MOCK_EVENT: ProctoringEventCardView = {
  event: {
    id: 'pe-detail-1',
    eventType: 'screen_share',
    severity: 'critical',
    timestamp: new Date(Date.now() - 300000),
    metadata: {
      screenShareTarget: 'Discord',
      tabSwitchCount: 3,
      focusLostDuration: 45,
      ipAddress: '192.168.1.42',
      userAgent: 'Chrome 120 / macOS',
      notes: 'Detected active screen share to Discord for 45 seconds during coding challenge.',
    },
    reviewed: false,
    dismissed: false,
  },
  candidateName: 'Sarah Johnson',
};
