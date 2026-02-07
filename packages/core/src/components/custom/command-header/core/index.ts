import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type CommandHeaderPreset = 'full' | 'compact' | 'minimal';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface KeyMetric {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon?: ReactNode;
  trend?: TrendDirection;
  unit?: string;
  progress?: number;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type?: 'success' | 'primary' | 'info' | 'warning' | 'error';
  icon?: ReactNode;
  label?: string;
}

export interface QuickAction {
  key: string;
  label: string;
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
}

export interface AIInsight {
  title: string;
  message: string;
  icon?: ReactNode;
}

export interface SystemStatus {
  label: string;
  value: string;
  status?: 'ok' | 'warning' | 'error';
}

export interface CommandHeaderProps extends EngineAwareProps {
  preset?: CommandHeaderPreset;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  quickActions?: QuickAction[];
  metrics?: KeyMetric[];
  activities?: ActivityItem[];
  insight?: AIInsight;
  systemStatus?: SystemStatus[];
  primaryAction?: { label: string; icon?: ReactNode; onClick?: () => void };
  effects?: {
    particles?: boolean;
    aurora?: boolean;
    grid?: boolean;
  };
  className?: string;
  style?: CSSProperties;
}

export const COMMAND_HEADER_DEFAULTS: Partial<CommandHeaderProps> = {
  preset: 'full',
};
