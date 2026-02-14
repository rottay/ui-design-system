/**
 * BhAgentGallery - Core Interface
 * Agent Browse & Select for BitHire ATS platform
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 * DBAgent fields: id, tenantId, name, description, type, provider, config, isActive, isDefault, createdAt, updatedAt, createdBy, updatedBy
 * DBAgent.type enum: 'conversation' | 'phone' | 'chat'
 * DBAgent.provider enum: 'vapi' | 'retell' | 'bland' | 'elevenlabs' | 'openai' | 'anthropic' | 'groq' | 'google' | 'mistral' | 'azure'
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBAgent } from '@rottay/ia-chat';

export type BhAgentGalleryPreset = 'gallery' | 'list';

export type AgentTab = 'my' | 'team' | 'marketplace';

/** Display-level status derived from DBAgent.isActive + external logic */
export type AgentStatus = 'active' | 'inactive' | 'draft' | 'error';

/** Display-level agent role (mapped from DBAgent.type + config at the API layer) */
export type AgentType = 'screener' | 'interviewer' | 'scheduler' | 'outreach' | 'sourcer' | 'custom';

/**
 * Gallery card data - display-oriented projection of DBAgent
 * with computed/joined fields for the UI.
 */
export interface AgentSummary {
  /** DBAgent.id */
  id: string;
  /** DBAgent.name */
  name: string;
  /** Mapped from DBAgent.type + config */
  type: AgentType;
  language: string;
  /** DBAgent.provider */
  voiceProvider: string;
  status: AgentStatus;
  usageSparkline: number[];
  /** DBAgent.isDefault */
  isDefault: boolean;
  rating?: number;
  downloads?: number;
  author?: string;
  /** DBAgent.description */
  description?: string;
  lastUsed?: Date;
  tags?: string[];
}

export interface AgentPreview {
  configSummary: Record<string, string>;
  sampleConversation: string[];
  voicePreviewUrl?: string;
  estimatedCost: number;
}

export interface AgentFilter {
  type?: AgentType | 'all';
  language?: string | 'all';
  provider?: string | 'all';
  tone?: string | 'all';
  status?: AgentStatus | 'all';
  search?: string;
}

export type AgentViewMode = 'grid' | 'list';

export interface BhAgentGalleryProps extends EngineAwareProps {
  preset?: BhAgentGalleryPreset;

  /** List of agents to display */
  agents?: AgentSummary[];

  /** Currently active tab */
  activeTab?: AgentTab;

  /** Callback when the active tab changes */
  onTabChange?: (tab: AgentTab) => void;

  /** Current filter state */
  filters?: AgentFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: AgentFilter) => void;

  /** Currently selected agent ID */
  selectedAgent?: string | null;

  /** Callback when an agent is selected */
  onAgentSelect?: (agentId: string) => void;

  /** Callback to duplicate an agent */
  onDuplicate?: (agentId: string) => void;

  /** Callback to edit an agent */
  onEdit?: (agentId: string) => void;

  /** Callback to activate an agent */
  onActivate?: (agentId: string) => void;

  /** Callback to deactivate an agent */
  onDeactivate?: (agentId: string) => void;

  /** Callback to delete an agent */
  onDelete?: (agentId: string) => void;

  /** Current view mode */
  viewMode?: AgentViewMode;

  /** Callback when view mode changes */
  onViewModeChange?: (mode: AgentViewMode) => void;

  /** Whether to show the preview panel */
  showPreview?: boolean;

  /** Callback to toggle preview */
  onPreviewToggle?: (show: boolean) => void;

  /** Preview data for the selected agent */
  previewData?: AgentPreview | null;

  /** Agent counts per tab */
  tabCounts?: { my: number; team: number; marketplace: number };

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_AGENT_GALLERY_DEFAULTS: Partial<BhAgentGalleryProps> = {
  preset: 'gallery',
  activeTab: 'my',
  viewMode: 'grid',
  showPreview: false,
};
