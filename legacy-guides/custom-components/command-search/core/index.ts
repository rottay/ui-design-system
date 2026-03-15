import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type CommandSearchPreset = 'palette' | 'inline';

export interface SearchResult {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
  status?: string;
  statusColor?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

export interface SearchCategory {
  key: string;
  label: string;
  icon?: ReactNode;
}

export interface QuickAction {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export interface CommandSearchProps extends EngineAwareProps {
  preset?: CommandSearchPreset;
  placeholder?: string;
  results?: SearchResult[];
  categories?: SearchCategory[];
  quickActions?: QuickAction[];
  recentSearches?: string[];
  onSearch?: (query: string) => void;
  onSelect?: (result: SearchResult) => void;
  onRecentSelect?: (query: string) => void;
  onClearRecent?: () => void;
  loading?: boolean;
  shortcutLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxResults?: number;
  className?: string;
  style?: CSSProperties;
}

export const COMMAND_SEARCH_DEFAULTS: Partial<CommandSearchProps> = {
  preset: 'palette',
  placeholder: 'Search...',
  shortcutLabel: '\u2318K',
  maxResults: 10,
};
