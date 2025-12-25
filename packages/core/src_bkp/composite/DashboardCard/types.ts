import type { ReactNode } from 'react';

export type DashboardCardColor = 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface DashboardCardTrend {
  value: number;
  direction: 'up' | 'down';
  label?: string;
}

export interface DashboardCardProps {
  title: string;
  value: string | number;
  trend?: DashboardCardTrend;
  icon?: ReactNode;
  color?: DashboardCardColor;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}
