import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  group?: string;
  onSelect: () => void;
  disabled?: boolean;
}

export interface CommandPaletteProps extends PatternBaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandItem[];
  placeholder?: string;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
  footer?: ReactNode;
  recentItems?: CommandItem[];
  maxHeight?: number | string;
}
