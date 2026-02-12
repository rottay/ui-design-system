/**
 * BarSalesDashboard - Core Interface
 * Sales analytics with StatsGrid + Charts
 * Aggregated data from bar_orders, bar_order_items
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarSalesDashboardPreset = 'dashboard' | 'compact';

export interface SalesStat {
  label: string;
  value: string;
  change?: number;
  changeLabel?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface SalesByCategory {
  category: string;
  amount: number;
  percentage: number;
  orderCount: number;
}

export interface SalesByHour {
  hour: string;
  amount: number;
  orderCount: number;
}

export interface TopProduct {
  name: string;
  category: string;
  revenue: number;
  quantity: number;
}

export interface BarSalesDashboardProps extends EngineAwareProps {
  preset?: BarSalesDashboardPreset;
  stats?: SalesStat[];
  salesByCategory?: SalesByCategory[];
  salesByHour?: SalesByHour[];
  topProducts?: TopProduct[];
  dateRange?: { from: string; to: string };
  onDateRangeChange?: (range: { from: string; to: string }) => void;
  onExport?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_SALES_DASHBOARD_DEFAULTS: Partial<BarSalesDashboardProps> = {
  preset: 'dashboard',
};
