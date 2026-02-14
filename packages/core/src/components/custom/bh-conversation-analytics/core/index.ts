/**
 * BhConversationAnalytics - Core Interface
 * Conversation volume trends, score distribution, completion rates, and agent performance.
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBUsage fields: requestCount, successCount, errorCount, periodStart, periodEnd, etc.
 * DBAgent fields: id, name, type, provider, etc.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBAgent, DBUsage } from '@rottay/ia-chat';

export type BhConversationAnalyticsPreset = 'dashboard' | 'compact';

export interface ConversationVolumePoint {
  /** DBUsage.periodStart */
  date: string;
  /** DBUsage.requestCount */
  count: number;
  /** Computed: successCount / requestCount */
  completionRate: number;
}

export interface ScoreDistribution {
  range: string;
  count: number;
}

/**
 * Agent performance metrics - computed from DBUsage aggregations per DBAgent.
 */
export interface AgentPerformance {
  /** DBAgent.id */
  agentId: string;
  /** DBAgent.name */
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
