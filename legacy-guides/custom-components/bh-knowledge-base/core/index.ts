/**
 * BhKnowledgeBase - Core Interface
 * Knowledge base wiki for BitHire ATS platform - articles, categories,
 * and collaborative knowledge sharing for recruiting teams.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhKnowledgeBasePreset = 'wiki';

// =============================================================================
// KNOWLEDGE BASE DATA TYPES
// =============================================================================

/**
 * A knowledge base article.
 */
export interface WikiArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  lastUpdatedBy: string;
  lastUpdatedAt: Date;
  viewCount: number;
  helpful: number;
  notHelpful: number;
}

/**
 * A category in the knowledge base.
 */
export interface WikiCategory {
  name: string;
  articleCount: number;
  icon?: string;
}

/**
 * Data structure for the knowledge base component.
 */
export interface KnowledgeBaseData {
  articles: WikiArticle[];
  categories: WikiCategory[];
  featuredArticles: WikiArticle[];
  recentlyUpdated: WikiArticle[];
  totalArticles: number;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface BhKnowledgeBaseProps extends EngineAwareProps {
  preset?: BhKnowledgeBasePreset;

  /** Knowledge base data */
  data?: KnowledgeBaseData;

  /** Currently selected article for detail view */
  selectedArticle?: WikiArticle | null;

  /** Whether data is loading */
  loading?: boolean;

  /** Callback when an article is selected */
  onSelectArticle?: (articleId: string) => void;

  /** Callback to create a new article */
  onCreateArticle?: () => void;

  /** Callback to edit an article */
  onEditArticle?: (articleId: string) => void;

  /** Callback when search query changes */
  onSearch?: (query: string) => void;

  /** Current search query */
  searchQuery?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_KNOWLEDGE_BASE_DEFAULTS: Partial<BhKnowledgeBaseProps> = {
  preset: 'wiki',
};
