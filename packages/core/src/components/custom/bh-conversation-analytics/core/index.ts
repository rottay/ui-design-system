/**
 * BhConversationAnalytics - Core Interface
 * Conversation volume trends, score distribution, completion rates, and agent performance.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhConversationAnalyticsPreset = 'dashboard' | 'compact';

export interface ConversationVolumePoint {
  date: string;
  count: number;
  completionRate: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  totalConversations: number;
  avgScore: number;
  completionRate: number;
  avgDuration: number;
}

export interface BhConversationAnalyticsProps extends EngineAwareProps {
  preset?: BhConversationAnalyticsPreset;
  volumeData?: ConversationVolumePoint[];
  scoreDistribution?: ScoreDistribution[];
  agentPerformance?: AgentPerformance[];
  totalConversations?: number;
  avgScore?: number;
  avgCompletionRate?: number;
  avgDuration?: number;
  period?: string;
  onAgentClick?: (agentId: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CONVERSATION_ANALYTICS_DEFAULTS: Partial<BhConversationAnalyticsProps> = {
  preset: 'dashboard',
  period: 'Last 30 days',
};
