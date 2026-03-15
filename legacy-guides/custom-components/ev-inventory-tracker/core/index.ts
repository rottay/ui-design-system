/**
 * EvInventoryTracker - Core Interface
 * Stock inventory tracking
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvInventoryTrackerPreset = 'overview' | 'detailed';

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentLevel: number;
  reorderPoint: number;
  unit: string;
  location: string;
  lastCounted: Date;
  expiryDate?: Date;
}

export interface StockAlert {
  id: string;
  itemName: string;
  type: "low_stock" | "out_of_stock" | "expiring";
  severity: "low" | "medium" | "high";
  currentLevel: number;
  threshold: number;
}

export interface StockMovement {
  id: string;
  itemName: string;
  type: "receipt" | "sale" | "transfer" | "waste" | "adjustment";
  quantity: number;
  date: Date;
  reference?: string;
}

export interface EvInventoryTrackerProps extends EngineAwareProps {
  preset?: EvInventoryTrackerPreset;
  items?: StockItem[];
  alerts?: StockAlert[];
  movements?: StockMovement[];
  onItemClick?: (id: string) => void;
  onAlertAcknowledge?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_INVENTORY_TRACKER_DEFAULTS: Partial<EvInventoryTrackerProps> = {
  preset: 'overview',

};
