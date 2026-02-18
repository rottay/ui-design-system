/**
 * BhTemplateLibrary - Core Interface
 * Template Browse & Select screen for BitHire ATS platform
 */

/**
 * DB Reference: DBHiringProcessTemplate from @rottay/recruiter
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBHiringProcessTemplate } from '@rottay/recruiter';

export type BhTemplateLibraryPreset = 'cards' | 'table';

/** Re-export for consumer convenience */
export type { DBHiringProcessTemplate };

/* ── Template Data ──────────────────────────────────────────────────── */

export interface TemplateStage {
  name: string;
  type: string;
}

export interface TemplateItem {
  id: string;
  name: string;
  industry: string;
  category: string;
  status: 'active' | 'draft' | 'disabled';
  stageCount: number;
  usageCount: number;
  version: string;
  agentNames: string[];
  rubricNames: string[];
  estimatedDuration: string;
  stages: TemplateStage[];

  /** Description of this template */
  description?: string;
  /** Whether auto-advance is enabled between stages */
  autoAdvanceEnabled?: boolean;
  /** Whether auto-reject is enabled */
  autoRejectEnabled?: boolean;
  /** Average time to hire in days using this template */
  avgTimeToHireDays?: number;
  /** Whether this is the default template */
  isDefault?: boolean;
  /** Total number of times this template has been used */
  timesUsed?: number;
  /** User who created this template */
  createdBy?: string;
  /** ISO date when this template was created */
  createdAt?: string;
  /** Tags for categorization */
  tags?: string[];
}

/* ── Filters ────────────────────────────────────────────────────────── */

export interface TemplateFilter {
  industry: string;
  category: string;
  status: string;
  search: string;

  /** Filter by automation-enabled templates */
  hasAutomation?: boolean;
  /** Filter by creator */
  createdBy?: string;
  /** Sort order for results */
  sortBy?: 'name' | 'usage' | 'created' | 'performance';
}

/* ── Industry Grouping ──────────────────────────────────────────────── */

export interface IndustryGroup {
  industry: string;
  templates: TemplateItem[];

  /** Number of templates in this group */
  templateCount?: number;
  /** Average performance score for this industry group */
  avgPerformance?: number;
}

/* ── Main Props ─────────────────────────────────────────────────────── */

export interface BhTemplateLibraryProps extends EngineAwareProps {
  preset?: BhTemplateLibraryPreset;

  /** All available templates */
  templates?: TemplateItem[];

  /** Current filter state */
  filters?: TemplateFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: TemplateFilter) => void;

  /** Currently selected template */
  selectedTemplate?: TemplateItem | null;

  /** Callback when a template is selected */
  onTemplateSelect?: (template: TemplateItem) => void;

  /** Callback when clone action is triggered */
  onClone?: (template: TemplateItem) => void;

  /** Callback when compare action is triggered */
  onCompare?: (template: TemplateItem) => void;

  /** Callback when view history action is triggered */
  onViewHistory?: (template: TemplateItem) => void;

  /** Whether the detail preview panel is visible */
  showPreview?: boolean;

  /** Callback to toggle preview panel */
  onPreviewToggle?: (show: boolean) => void;

  /** Current view mode (cards or table) */
  viewMode?: 'cards' | 'table';

  /** Callback when view mode changes */
  onViewModeChange?: (mode: 'cards' | 'table') => void;

  /** Templates grouped by industry */
  industryGroups?: IndustryGroup[];

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_TEMPLATE_LIBRARY_DEFAULTS: Partial<BhTemplateLibraryProps> = {
  preset: 'cards',
  templates: [],
  showPreview: false,
  viewMode: 'cards',
};
