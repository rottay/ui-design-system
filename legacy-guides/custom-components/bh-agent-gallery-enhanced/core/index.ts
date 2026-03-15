/**
 * BhAgentGalleryEnhanced - Core Interface
 * Enhanced agent card gallery with search, filters, usage stats for BitHire ATS
 *
 * Types imported from @rottay/ia-chat (single source of truth).
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBAgent } from '@rottay/ia-chat';

export type BhAgentGalleryEnhancedPreset = 'gallery' | 'compact';

/**
 * Enhanced agent card data - display-oriented projection of DBAgent
 * with computed/joined fields for the UI.
 */
export interface AgentCard {
  /** DBAgent.id */
  id: string;
  /** DBAgent.name */
  name: string;
  /** DBAgent.description */
  description: string;
  /** Derived from DBAgent.type or config */
  category: string;
  /** Computed usage count */
  usageCount: number;
  /** Computed average score */
  avgScore: number;
  /** Derived from DBAgent.isActive */
  status: 'active' | 'draft' | 'archived';
  /** DBAgent.updatedAt or last usage timestamp */
  lastUsed: Date;
  tags: string[];
}

export interface BhAgentGalleryEnhancedProps extends EngineAwareProps {
  preset?: BhAgentGalleryEnhancedPreset;
  agents?: AgentCard[];
  categories?: string[];
  searchQuery?: string;
  selectedCategory?: string | null;
  onAgentClick?: (agentId: string) => void;
  onSearchChange?: (query: string) => void;
  onCategoryChange?: (category: string | null) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_AGENT_GALLERY_ENHANCED_DEFAULTS: Partial<BhAgentGalleryEnhancedProps> = {
  preset: 'gallery',
};
