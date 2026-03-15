import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type FilterBuilderPreset = 'panel' | 'bar';

export type FilterFieldType = 'text' | 'select' | 'multiselect' | 'date' | 'number-range' | 'boolean';

export interface FilterFieldOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

export interface FilterFieldConfig {
  key: string;
  label: string;
  type: FilterFieldType;
  options?: FilterFieldOption[];
  placeholder?: string;
  primary?: boolean;
  minWidth?: number;
}

export interface QuickPreset {
  key: string;
  label: string;
  icon?: ReactNode;
  filters: Record<string, unknown>;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, unknown>;
}

export interface FilterBuilderProps extends EngineAwareProps {
  preset?: FilterBuilderPreset;
  filterConfig: FilterFieldConfig[];
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  quickPresets?: QuickPreset[];
  savedFilters?: SavedFilter[];
  onSaveFilter?: (name: string) => void;
  onDeleteSavedFilter?: (id: string) => void;
  onLoadSavedFilter?: (filter: SavedFilter) => void;
  totalCount?: number;
  filteredCount?: number;
  searchKey?: string;
  searchIcon?: ReactNode;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const FILTER_BUILDER_DEFAULTS: Partial<FilterBuilderProps> = {
  preset: 'panel',
  searchKey: 'search',
};
