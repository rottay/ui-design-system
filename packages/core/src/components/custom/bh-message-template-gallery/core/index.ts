/**
 * BhMessageTemplateGallery - Core Interface
 * Browse/search templates with preview and usage stats for BitHire ATS platform
 *
 * DB Reference: DBMessageTemplate from @rottay/recruiter
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBMessageTemplate } from '@rottay/recruiter';

export type BhMessageTemplateGalleryPreset = 'gallery' | 'compact';

/** Re-export for consumer convenience */
export type { DBMessageTemplate };

export interface MessageTemplateItem {
  id?: string;
  name?: string;
  category?: string;
  subject?: string;
  preview?: string;
  usageCount?: number;
  lastUsed?: Date;
  tags?: string[];
}

export interface BhMessageTemplateGalleryProps extends EngineAwareProps {
  preset?: BhMessageTemplateGalleryPreset;

  /** List of message templates */
  templates?: MessageTemplateItem[];

  /** Current search query */
  searchQuery?: string;

  /** Currently selected category filter */
  selectedCategory?: string | null;

  /** Callback when a template is clicked */
  onTemplateClick?: (id: string) => void;

  /** Callback when search query changes */
  onSearchChange?: (q: string) => void;

  /** Callback when category filter changes */
  onCategoryChange?: (cat: string | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_MESSAGE_TEMPLATE_GALLERY_DEFAULTS: Partial<BhMessageTemplateGalleryProps> = {
  preset: 'gallery',
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use DBMessageTemplate instead */
export type MessageTemplate = DBMessageTemplate;
/** @deprecated Use BhMessageTemplateGalleryProps instead */
export type BhMessageTemplateItemGalleryProps = BhMessageTemplateGalleryProps;
