/**
 * bh-workflow-automation - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { WorkflowRule } from '../core';

export const MOCK_RULES: WorkflowRule[] = [
  { id: 'wr-1', name: 'Auto-reject low scores', trigger: 'WHEN candidate score < 30', conditions: ['IF no interview scheduled', 'IF application age > 14 days'], actions: ['THEN send rejection email', 'THEN archive candidate'], enabled: true, lastTriggered: new Date(Date.now() - 3600000) },
  { id: 'wr-2', name: 'Fast-track top candidates', trigger: 'WHEN candidate score > 85', conditions: ['IF position is urgent'], actions: ['THEN schedule interview', 'THEN notify hiring manager'], enabled: true, lastTriggered: new Date(Date.now() - 7200000) },
  { id: 'wr-3', name: 'Follow-up reminder', trigger: 'WHEN no response after 3 days', conditions: ['IF candidate in active pipeline'], actions: ['THEN send follow-up email'], enabled: false },
  { id: 'wr-4', name: 'Diversity flag review', trigger: 'WHEN pipeline diversity < threshold', conditions: ['IF sourcing active'], actions: ['THEN flag for review', 'THEN adjust sourcing strategy'], enabled: true, lastTriggered: new Date(Date.now() - 86400000) },
];
