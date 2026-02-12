import type { ReactNode } from 'react';
import type { PatternBaseProps, FilterDef } from '../../types';

export interface FilterPanelProps extends PatternBaseProps {
  filters: FilterDef[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onReset?: () => void;
  layout?: 'inline' | 'stacked' | 'sidebar';
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  title?: string;
  showReset?: boolean;
  showApply?: boolean;
  onApply?: (values: Record<string, unknown>) => void;
  activeCount?: number;
}

export type { FilterDef } from '../../types';
