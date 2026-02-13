/**
 * BhPipelineFilterBar - Core Interface
 * Pipeline filter bar with filters for job, recruiter, date range,
 * priority, source, and saved presets for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type BhPipelineFilterBarPreset = 'horizontal' | 'dropdown';

export type FilterType = 'select' | 'multiselect' | 'daterange' | 'search' | 'toggle';

export type FilterPriority = 'critical' | 'high' | 'medium' | 'low';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
}

export interface ActiveFilter {
  filterId: string;
  value: string | string[];
  label: string;
}

export interface SavedPreset {
  id: string;
  name: string;
  filters: ActiveFilter[];
  createdAt: Date;
}

export interface BhPipelineFilterBarProps extends EngineAwareProps {
  preset?: BhPipelineFilterBarPreset;

  /** Available filter configurations */
  filters?: FilterConfig[];

  /** Currently active filters */
  activeFilters?: ActiveFilter[];

  /** Saved filter presets */
  savedPresets?: SavedPreset[];

  /** Callback when a filter changes */
  onFilterChange?: (filterId: string, value: string | string[]) => void;

  /** Callback when a filter is removed */
  onFilterRemove?: (filterId: string) => void;

  /** Callback to save current filters as a preset */
  onPresetSave?: (name: string) => void;

  /** Callback to load a saved preset */
  onPresetLoad?: (presetId: string) => void;

  /** Callback to clear all filters */
  onClear?: () => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_PIPELINE_FILTER_BAR_DEFAULTS: Partial<BhPipelineFilterBarProps> = {
  preset: 'horizontal',
};
