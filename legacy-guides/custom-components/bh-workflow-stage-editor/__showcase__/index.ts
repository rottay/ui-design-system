/**
 * bh-workflow-stage-editor - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { WorkflowStage } from '../core';

export const MOCK_STAGES: WorkflowStage[] = [
  { id: 'ws-1', name: 'Application Review', type: 'manual', order: 1, color: undefined, actions: ['Screen resume', 'Check qualifications'] },
  { id: 'ws-2', name: 'AI Screening', type: 'automated', order: 2, color: undefined, actions: ['Score resume', 'Match skills', 'Generate summary'] },
  { id: 'ws-3', name: 'Phone Screen', type: 'manual', order: 3, color: undefined, actions: ['Schedule call', 'Conduct screen', 'Rate candidate'] },
  { id: 'ws-4', name: 'Manager Approval', type: 'approval', order: 4, color: undefined, actions: ['Review profile', 'Approve/Reject'] },
  { id: 'ws-5', name: 'Technical Interview', type: 'manual', order: 5, color: undefined, actions: ['Send coding challenge', 'Conduct interview', 'Submit scorecard'] },
  { id: 'ws-6', name: 'Offer Generation', type: 'automated', order: 6, color: undefined, actions: ['Generate offer letter', 'Calculate compensation'] },
];
