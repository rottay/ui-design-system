/**
 * EvTableOrder - Core Interface
 * Per-table orders with timing, preparation status, and order history
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTableOrderPreset = 'timeline' | 'grid';

export interface TableOrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'ordered' | 'preparing' | 'ready' | 'served' | 'cancelled';
  orderedAt: Date;
  servedAt?: Date;
}

export interface TableOrder {
  id: string;
  tableId: string;
  tableLabel: string;
  server: string;
  items: TableOrderItem[];
  total: number;
  openedAt: Date;
  closedAt?: Date;
  status: 'open' | 'closed' | 'payment-pending';
  guestCount: number;
}

export interface EvTableOrderProps extends EngineAwareProps {
  preset?: EvTableOrderPreset;
  orders?: TableOrder[];
  onOrderClick?: (orderId: string) => void;
  onItemStatusChange?: (orderId: string, itemId: string, status: TableOrderItem['status']) => void;
  onCloseOrder?: (orderId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TABLE_ORDER_DEFAULTS: Partial<EvTableOrderProps> = {
  preset: 'timeline',
};
