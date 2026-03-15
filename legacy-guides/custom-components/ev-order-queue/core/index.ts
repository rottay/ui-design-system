/**
 * EvOrderQueue - Core Interface
 * Bar order queue
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvOrderQueuePreset = 'kitchen' | 'bartender';

export interface BarOrder {
  id: string;
  orderNumber: string;
  items: Array<{ name: string;
  quantity: number;
  notes?: string }>;
  status: "pending" | "preparing" | "ready" | "picked_up";
  qrCode?: string;
  customerName?: string;
  createdAt: Date;
  priority: "normal" | "rush";
}

export interface EvOrderQueueProps extends EngineAwareProps {
  preset?: EvOrderQueuePreset;
  orders?: BarOrder[];
  onStartPreparing?: (orderId: string) => void;
  onMarkReady?: (orderId: string) => void;
  onConfirmPickup?: (orderId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_ORDER_QUEUE_DEFAULTS: Partial<EvOrderQueueProps> = {
  preset: 'kitchen',

};
