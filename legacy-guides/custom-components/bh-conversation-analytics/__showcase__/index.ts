/**
 * bh-conversation-analytics - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { ConversationVolumePoint, AgentPerformance, ScoreDistribution } from '../core';

export const MOCK_VOLUME: ConversationVolumePoint[] = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  count: Math.floor(Math.random() * 100) + 50,
  completionRate: Math.round((70 + Math.random() * 25) * 100) / 100,
}));

export const MOCK_AGENTS: AgentPerformance[] = [
  { agentId: 'a1', agentName: 'Sarah Chen', totalConversations: 342, avgScore: 88, completionRate: 94, avgDuration: 28 },
  { agentId: 'a2', agentName: 'Marcus Williams', totalConversations: 298, avgScore: 82, completionRate: 91, avgDuration: 32 },
  { agentId: 'a3', agentName: 'Elena Rodriguez', totalConversations: 276, avgScore: 79, completionRate: 87, avgDuration: 35 },
  { agentId: 'a4', agentName: 'James Park', totalConversations: 254, avgScore: 75, completionRate: 85, avgDuration: 30 },
  { agentId: 'a5', agentName: 'Aisha Patel', totalConversations: 231, avgScore: 91, completionRate: 96, avgDuration: 25 },
];

export const MOCK_SCORE_DIST: ScoreDistribution[] = [
  { range: '0-20', count: 12 },
  { range: '21-40', count: 34 },
  { range: '41-60', count: 87 },
  { range: '61-80', count: 156 },
  { range: '81-100', count: 211 },
];
