/**
 * SearchBar - Core Interface
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type SearchBarPreset = 'basic' | 'suggestions' | 'command';

export interface SearchSuggestion {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
}

export interface SearchBarProps extends EngineAwareProps {
  preset?: SearchBarPreset;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: SearchSuggestion[];
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  loading?: boolean;
  showShortcut?: boolean;
  shortcutKey?: string;
  autoFocus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const SEARCH_BAR_DEFAULTS: Partial<SearchBarProps> = {
  preset: 'basic',
  placeholder: 'Search...',
  shortcutKey: 'K',
  size: 'md',
};
