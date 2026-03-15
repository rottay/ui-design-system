import type { ReactNode } from 'react';
import type { PatternBaseProps } from '../types';

export interface TimelineItem<T = unknown> {
  key: string;
  timestamp: string | Date;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  color?: string;
  data?: T;
  user?: { name: string; avatar?: string };
  type?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export interface TimelinePatternProps<T> extends PatternBaseProps {
  items: TimelineItem<T>[];
  renderItem?: (item: TimelineItem<T>, defaultRender: ReactNode) => ReactNode;
  onItemClick?: (item: TimelineItem<T>) => void;
  mode?: 'left' | 'right' | 'alternate';
  showTimestamp?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
  emptyState?: ReactNode;
  groupByDate?: boolean;
}
