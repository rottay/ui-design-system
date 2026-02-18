/**
 * bh-proctoring-timeline - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { TimelineEventView } from '../core';

const NOW = new Date();

export const MOCK_EVENTS: TimelineEventView[] = [
  { event: { id: 'vtl-1', eventType: 'screen_share', severity: 'critical', timestamp: new Date(NOW.getTime() - 15 * 60 * 1000) }, candidateName: 'Sarah Johnson', label: 'Screen share detected' },
  { event: { id: 'vtl-2', eventType: 'copy_paste', severity: 'high', timestamp: new Date(NOW.getTime() - 30 * 60 * 1000) }, candidateName: 'Michael Chen', label: 'Large paste detected' },
  { event: { id: 'vtl-3', eventType: 'tab_switch', severity: 'medium', timestamp: new Date(NOW.getTime() - 45 * 60 * 1000) }, candidateName: 'Emily Rodriguez' },
  { event: { id: 'vtl-4', eventType: 'unusual_typing', severity: 'medium', timestamp: new Date(NOW.getTime() - 55 * 60 * 1000) }, candidateName: 'James Kim' },
  { event: { id: 'vtl-5', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(NOW.getTime() - 70 * 60 * 1000) }, candidateName: 'Anna Kowalski' },
  { event: { id: 'vtl-6', eventType: 'tab_switch', severity: 'low', timestamp: new Date(NOW.getTime() - 85 * 60 * 1000) }, candidateName: 'David Park' },
  { event: { id: 'vtl-7', eventType: 'copy_paste', severity: 'high', timestamp: new Date(NOW.getTime() - 100 * 60 * 1000) }, candidateName: 'Lisa Martinez', label: 'Multiple pastes' },
  { event: { id: 'vtl-8', eventType: 'browser_focus_lost', severity: 'medium', timestamp: new Date(NOW.getTime() - 110 * 60 * 1000) }, candidateName: 'Robert Taylor' },
];
