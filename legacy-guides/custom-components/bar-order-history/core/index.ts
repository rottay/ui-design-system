/**
 * BarOrderHistory - Core Interface
 * DataTable of past orders with filters by date, POS, status
 * Tables: bar_orders
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarOrderHistoryPreset = 'table' | 'compact';

export interface HistoryOrder {
  id: string;
  orderNumber: string;
  status: 'completed' | 'cancelled' | 'refunded';
  items: { name: string; quantity: number }[];
  total: number;
  currency: string;
  customerName?: string;
  posStation: string;
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
}

export interface BarOrderHistoryProps extends EngineAwareProps {
  preset?: BarOrderHistoryPreset;
  orders?: HistoryOrder[];
  dateRange?: { from: string; to: string };
  statusFilter?: string;
  posFilter?: string;
  onOrderSelect?: (orderId: string) => void;
  onExport?: () => void;
  onDateRangeChange?: (range: { from: string; to: string }) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_ORDER_HISTORY_DEFAULTS: Partial<BarOrderHistoryProps> = {
  preset: 'table',
};
