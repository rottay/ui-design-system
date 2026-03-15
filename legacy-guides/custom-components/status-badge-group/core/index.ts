import type { EngineAwareProps } from '../../../../types';

export type StatusBadgeGroupPreset = 'dots' | 'pills';

export interface StatusBadge {
  key: string;
  label: string;
  status: 'healthy' | 'degraded' | 'down' | 'maintenance';
  description?: string;
}

export interface StatusBadgeGroupProps extends EngineAwareProps {
  preset?: StatusBadgeGroupPreset;
  badges: StatusBadge[];
  title?: string;
  lastUpdated?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const STATUS_BADGE_GROUP_DEFAULTS = {
  preset: 'dots' as StatusBadgeGroupPreset,
};
