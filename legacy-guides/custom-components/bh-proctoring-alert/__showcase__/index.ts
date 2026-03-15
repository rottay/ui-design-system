/**
 * bh-proctoring-alert - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProctoringEventType, ProctoringEventSeverity } from '../core';

interface ResolvedAlertEvent {
  id: string;
  candidateName: string;
  eventType: ProctoringEventType;
  severity: ProctoringEventSeverity;
  timestamp: Date;
  summary: string;
}

export const MOCK_EVENT: ResolvedAlertEvent = {
  id: 'pe-alert-1',
  candidateName: 'Sarah Johnson',
  eventType: 'screen_share',
  severity: 'critical',
  timestamp: new Date(Date.now() - 30000),
  summary: 'Screen sharing detected during active coding assessment',
};
