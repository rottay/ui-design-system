/**
 * BarStockMovements - Core Interface
 * Timeline of stock movements (receipt/sale/transfer/waste)
 * Tables: bar_stock_movements
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarStockMovementsPreset = 'timeline' | 'table';

export type MovementType = 'receipt' | 'sale' | 'transfer' | 'waste' | 'adjustment';

export interface StockMovement {
  id: string;
  type: MovementType;
  itemName: string;
  quantity: number;
  unit: string;
  reference?: string;
  notes?: string;
  performedBy: string;
  createdAt: string;
  fromLocation?: string;
  toLocation?: string;
}

export interface BarStockMovementsProps extends EngineAwareProps {
  preset?: BarStockMovementsPreset;
  movements?: StockMovement[];
  onMovementSelect?: (movementId: string) => void;
  onCreateMovement?: () => void;
  typeFilter?: MovementType | null;
  onTypeFilterChange?: (type: MovementType | null) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_STOCK_MOVEMENTS_DEFAULTS: Partial<BarStockMovementsProps> = {
  preset: 'timeline',
};
