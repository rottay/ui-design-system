/**
 * BhAgentVersionHistory - Core Interface
 * Timeline of agent versions with diff view
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhAgentVersionHistoryPreset = 'timeline' | 'compact';

export interface AgentVersion {
  id: string;
  version: string;
  createdAt: Date;
  author: string;
  changeDescription: string;
  status: 'active' | 'deprecated' | 'draft';
  metrics?: { avgScore: number; completionRate: number };
}

export interface BhAgentVersionHistoryProps extends EngineAwareProps {
  preset?: BhAgentVersionHistoryPreset;
  versions: AgentVersion[];
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
