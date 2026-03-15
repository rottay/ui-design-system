import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type StatWidgetPreset = 'standard' | 'ring' | 'compact';

export interface StatWidgetProps extends EngineAwareProps {
  preset?: StatWidgetPreset;
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: number;
    label?: string;
  };
  /** Progress percentage 0-100 for ring preset */
  progress?: number;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const STAT_WIDGET_DEFAULTS: Partial<StatWidgetProps> = {
  preset: 'standard',
  color: 'primary',
};
