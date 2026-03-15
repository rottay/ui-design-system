import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type ChartCardPreset = 'area' | 'bar' | 'donut' | 'line';

export type ChartTrendDirection = 'up' | 'down' | 'neutral';

export interface ChartCardProps extends EngineAwareProps {
  preset?: ChartCardPreset;
  title: string;
  value: string | number;
  description?: string;
  data: number[];
  labels?: string[];
  trend?: {
    direction: ChartTrendDirection;
    value: number;
    label?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  icon?: ReactNode;
  onClick?: () => void;
  loading?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CHART_CARD_DEFAULTS: Partial<ChartCardProps> = {
  preset: 'area',
  color: 'primary',
};
