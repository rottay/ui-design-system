/**
 * bh-proctoring-activity - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ProctoringActivityEvent } from '../core';

export const MOCK_EVENTS: ProctoringActivityEvent[] = [
  { id: 'pa-1', candidateName: 'Sarah Johnson', eventType: 'screen_share', severity: 'critical', timestamp: new Date(Date.now() - 120000), description: 'Screen sharing detected during coding section' },
  { id: 'pa-2', candidateName: 'Michael Chen', eventType: 'copy_paste', severity: 'high', timestamp: new Date(Date.now() - 480000), description: 'Multiple clipboard paste operations in quick succession' },
  { id: 'pa-3', candidateName: 'Emily Rodriguez', eventType: 'tab_switch', severity: 'medium', timestamp: new Date(Date.now() - 900000), description: 'Switched to external browser tab for 12 seconds' },
  { id: 'pa-4', candidateName: 'James Kim', eventType: 'unusual_typing', severity: 'medium', timestamp: new Date(Date.now() - 1500000), description: 'Typing speed anomaly detected: 180 WPM burst' },
  { id: 'pa-5', candidateName: 'Anna Kowalski', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(Date.now() - 2400000), description: 'Browser lost focus for 3 seconds' },
  { id: 'pa-6', candidateName: 'Sarah Johnson', eventType: 'tab_switch', severity: 'low', timestamp: new Date(Date.now() - 3600000), description: 'Brief tab switch, returned within 2 seconds' },
  { id: 'pa-7', candidateName: 'David Brown', eventType: 'copy_paste', severity: 'high', timestamp: new Date(Date.now() - 5400000), description: 'Large text block pasted from external source' },
  { id: 'pa-8', candidateName: 'Michael Chen', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(Date.now() - 7200000), description: 'Window minimized briefly' },
];
