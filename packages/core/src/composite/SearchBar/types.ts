export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category?: string;
  icon?: React.ReactNode;
  url?: string;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  onSelect?: (result: SearchResult) => void;
  results?: SearchResult[];
  recentSearches?: string[];
  loading?: boolean;
  showShortcut?: boolean;
  shortcutKey?: string;
  maxResults?: number;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  allowClear?: boolean;
}
