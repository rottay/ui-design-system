/**
 * bh-proctoring-event-list - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProctoringEventListItem } from '../core';

export const MOCK_EVENTS: ProctoringEventListItem[] = [
  { event: { id: 'pe-1', eventType: 'screen_share', severity: 'critical', timestamp: new Date(Date.now() - 300000), reviewed: false, dismissed: false }, candidateName: 'Sarah Johnson' },
  { event: { id: 'pe-2', eventType: 'copy_paste', severity: 'high', timestamp: new Date(Date.now() - 900000), reviewed: false, dismissed: false }, candidateName: 'Michael Chen' },
  { event: { id: 'pe-3', eventType: 'tab_switch', severity: 'medium', timestamp: new Date(Date.now() - 1800000), reviewed: true, dismissed: false }, candidateName: 'Emily Rodriguez' },
  { event: { id: 'pe-4', eventType: 'unusual_typing', severity: 'medium', timestamp: new Date(Date.now() - 3600000), reviewed: false, dismissed: false }, candidateName: 'James Kim' },
  { event: { id: 'pe-5', eventType: 'tab_switch', severity: 'low', timestamp: new Date(Date.now() - 5400000), reviewed: true, dismissed: true }, candidateName: 'Sarah Johnson' },
  { event: { id: 'pe-6', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(Date.now() - 7200000), reviewed: false, dismissed: false }, candidateName: 'Anna Kowalski' },
  { event: { id: 'pe-7', eventType: 'copy_paste', severity: 'critical', timestamp: new Date(Date.now() - 8400000), reviewed: false, dismissed: false }, candidateName: 'David Park' },
  { event: { id: 'pe-8', eventType: 'screen_share', severity: 'high', timestamp: new Date(Date.now() - 10800000), reviewed: true, dismissed: false }, candidateName: 'Lisa Martinez' },
  { event: { id: 'pe-9', eventType: 'browser_focus_lost', severity: 'medium', timestamp: new Date(Date.now() - 14400000), reviewed: false, dismissed: false }, candidateName: 'Robert Taylor' },
  { event: { id: 'pe-10', eventType: 'unusual_typing', severity: 'low', timestamp: new Date(Date.now() - 18000000), reviewed: false, dismissed: false }, candidateName: 'Jennifer Wu' },
];
