/**
 * DashboardCard - Core Interface
 * Card for displaying dashboard metrics and statistics
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps } from '../../../../types';

export type DashboardCardPreset = 'compact' | 'trending' | 'chart' | 'detailed';

export type TrendDirection = 'up' | 'down' | 'neutral';

export interface DashboardCardProps extends EngineAwareProps {
  /** Preset to use */
  preset?: DashboardCardPreset;
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Optional subtitle or description */
  description?: string;
  /** Icon to display */
  icon?: ReactNode;
  /** Trend information */
  trend?: {
    direction: TrendDirection;
    value: number;
    label?: string;
  };
  /** Sparkline/chart data points */
  chartData?: number[];
  /** Breakdown items for detailed view */
  breakdown?: Array<{
    label: string;
    value: string | number;
    percentage?: number;
  }>;
  /** Card color theme */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  /** Click handler */
  onClick?: () => void;
  /** Loading state */
  loading?: boolean;
}

export const DASHBOARD_CARD_DEFAULTS: Partial<DashboardCardProps> = {
  preset: 'trending',
  color: 'default',
};
