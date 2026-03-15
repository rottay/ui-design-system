/**
 * BarStockDashboard - Core Interface
 * Inventory overview with stock levels, alerts, trends
 * Tables: bar_stocks, bar_stock_items
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarStockDashboardPreset = 'dashboard' | 'compact';

export interface StockItem {
  id: string;
  name: string;
  category: string;
  currentLevel: number;
  minLevel: number;
  maxLevel: number;
  unit: string;
  lastRestocked: string;
  costPerUnit: number;
  status: 'ok' | 'low' | 'critical' | 'overstocked';
}

export interface StockAlert {
  id: string;
  itemName: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'overstock';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface BarStockDashboardProps extends EngineAwareProps {
  preset?: BarStockDashboardPreset;
  items?: StockItem[];
  alerts?: StockAlert[];
  totalValue?: number;
  totalItems?: number;
  lowStockCount?: number;
  onItemSelect?: (itemId: string) => void;
  onAlertDismiss?: (alertId: string) => void;
  onReorder?: (itemId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_STOCK_DASHBOARD_DEFAULTS: Partial<BarStockDashboardProps> = {
  preset: 'dashboard',
};
