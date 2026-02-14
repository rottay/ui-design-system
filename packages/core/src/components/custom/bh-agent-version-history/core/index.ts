/**
 * BhAgentVersionHistory - Core Interface
 * Timeline of agent versions with diff view
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBAgent } from '@rottay/ia-chat';

export type BhAgentVersionHistoryPreset = 'timeline' | 'compact';

/**
 * Agent version entry - references DBAgent snapshots over time.
 * Fields like createdAt and createdBy map to DBAgent audit fields.
 */
export interface AgentVersion {
  /** Version record ID */
  id: string;
  /** Version label */
  version: string;
  /** DBAgent.createdAt */
  createdAt: Date;
  /** DBAgent.createdBy */
  author: string;
  changeDescription: string;
  /** Derived from DBAgent.isActive */
  status: 'active' | 'deprecated' | 'draft';
  metrics?: { avgScore: number; completionRate: number };
}

export interface BhAgentVersionHistoryProps extends EngineAwareProps {
  preset?: BhAgentVersionHistoryPreset;
  versions?: AgentVersion[];
  /** DBAgent.name */
  agentName?: string;
  selectedVersionId?: string | null;
  onVersionClick?: (versionId: string) => void;
  onRollback?: (versionId: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_AGENT_VERSION_HISTORY_DEFAULTS: Partial<BhAgentVersionHistoryProps> = {
  preset: 'timeline',
};
