/**
 * BarOrderQueue - Core Interface
 * Real-time order queue with status columns
 * Tables: bar_orders
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarOrderQueuePreset = 'kanban' | 'list';

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'picked_up';

export interface QueueOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: { name: string; quantity: number }[];
  total: number;
  currency: string;
  customerName?: string;
  posStation?: string;
  createdAt: string;
  elapsedMinutes: number;
}

export interface BarOrderQueueProps extends EngineAwareProps {
  preset?: BarOrderQueuePreset;
  orders?: QueueOrder[];
  onStatusChange?: (orderId: string, status: OrderStatus) => void;
  onOrderSelect?: (orderId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_ORDER_QUEUE_DEFAULTS: Partial<BarOrderQueueProps> = {
  preset: 'kanban',
};
