/**
 * EvKitchenDisplay - Core Interface
 * Kitchen Display System with order cards, timers, bump-to-complete, and all-day summary
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvKitchenDisplayPreset = 'station' | 'expo';

export interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableLabel: string;
  items: KitchenOrderItem[];
  priority: 'normal' | 'rush' | 'vip';
  orderedAt: Date;
  course?: number;
  server: string;
  status: 'new' | 'in-progress' | 'ready' | 'bumped';
}

export interface KitchenOrderItem {
  id: string;
  name: string;
  quantity: number;
  modifiers?: string[];
  station?: string;
  status: 'pending' | 'cooking' | 'plated';
}

export interface AllDayItem {
  name: string;
  totalOrdered: number;
  completed: number;
  pending: number;
}

export interface EvKitchenDisplayProps extends EngineAwareProps {
  preset?: EvKitchenDisplayPreset;
  orders?: KitchenOrder[];
  allDayItems?: AllDayItem[];
  stationFilter?: string;
  onBump?: (orderId: string) => void;
  onItemStatusChange?: (orderId: string, itemId: string, status: KitchenOrderItem['status']) => void;
  onRecall?: (orderId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_KITCHEN_DISPLAY_DEFAULTS: Partial<EvKitchenDisplayProps> = {
  preset: 'station',
};
