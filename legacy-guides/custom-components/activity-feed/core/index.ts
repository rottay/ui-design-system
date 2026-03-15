import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type ActivityFeedPreset = 'timeline' | 'compact';

export type ActivityEventType = 'success' | 'info' | 'warning' | 'error' | 'primary';

export interface ActivityActor {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface ActivityEvent {
  id: string;
  text: string;
  type?: ActivityEventType;
  actor?: ActivityActor;
  timestamp: string;
  icon?: ReactNode;
  resource?: {
    type: string;
    name?: string;
  };
}

export interface ActivityFeedProps extends EngineAwareProps {
  preset?: ActivityFeedPreset;
  events: ActivityEvent[];
  title?: string;
  onEventClick?: (event: ActivityEvent) => void;
  onRefresh?: () => void;
  maxItems?: number;
  loading?: boolean;
  emptyIcon?: ReactNode;
  emptyMessage?: string;
  headerActions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const ACTIVITY_FEED_DEFAULTS: Partial<ActivityFeedProps> = {
  preset: 'timeline',
  title: 'Recent Activity',
  maxItems: 20,
  emptyMessage: 'No activity to display.',
};
