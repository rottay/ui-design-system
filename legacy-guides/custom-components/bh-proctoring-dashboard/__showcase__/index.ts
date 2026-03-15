/**
 * bh-proctoring-dashboard - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProctoringEventSummary, EventTypeCount } from '../core';

export const MOCK_STATS = {
  totalEvents: 127,
  unreviewedCount: 34,
  suspiciousCandidates: 8,
  averageRiskScore: 0.42,
};

export const MOCK_SEVERITY = [
  { severity: 'critical' as const, count: 5 },
  { severity: 'high' as const, count: 18 },
  { severity: 'medium' as const, count: 42 },
  { severity: 'low' as const, count: 62 },
];

export const MOCK_EVENTS: ProctoringEventSummary[] = [
  { id: 'pe-1', scorableId: 'int-1', candidateName: 'Sarah Johnson', eventType: 'screen_share', severity: 'critical', timestamp: new Date(Date.now() - 300000), reviewed: false, dismissed: false },
  { id: 'pe-2', scorableId: 'int-2', candidateName: 'Michael Chen', eventType: 'copy_paste', severity: 'high', timestamp: new Date(Date.now() - 900000), reviewed: false, dismissed: false },
  { id: 'pe-3', scorableId: 'int-3', candidateName: 'Emily Rodriguez', eventType: 'tab_switch', severity: 'medium', timestamp: new Date(Date.now() - 1800000), reviewed: true, dismissed: false },
  { id: 'pe-4', scorableId: 'int-4', candidateName: 'James Kim', eventType: 'unusual_typing', severity: 'medium', timestamp: new Date(Date.now() - 3600000), reviewed: false, dismissed: false },
  { id: 'pe-5', scorableId: 'int-1', candidateName: 'Sarah Johnson', eventType: 'tab_switch', severity: 'low', timestamp: new Date(Date.now() - 5400000), reviewed: true, dismissed: true },
  { id: 'pe-6', scorableId: 'int-5', candidateName: 'Anna Kowalski', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(Date.now() - 7200000), reviewed: false, dismissed: false },
];

export const MOCK_EVENT_TYPES: EventTypeCount[] = [
  { eventType: 'tab_switch', count: 45 },
  { eventType: 'browser_focus_lost', count: 32 },
  { eventType: 'copy_paste', count: 24 },
  { eventType: 'unusual_typing', count: 16 },
  { eventType: 'screen_share', count: 10 },
];
