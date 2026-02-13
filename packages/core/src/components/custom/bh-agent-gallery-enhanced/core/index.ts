/**
 * BhAgentGalleryEnhanced - Core Interface
 * Enhanced agent card gallery with search, filters, usage stats for BitHire ATS
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhAgentGalleryEnhancedPreset = 'gallery' | 'compact';

export interface AgentCard {
  id: string;
  name: string;
  description: string;
  category: string;
  usageCount: number;
  avgScore: number;
  status: 'active' | 'draft' | 'archived';
  lastUsed: Date;
  tags: string[];
}

export interface BhAgentGalleryEnhancedProps extends EngineAwareProps {
  preset?: BhAgentGalleryEnhancedPreset;
  agents: AgentCard[];
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
