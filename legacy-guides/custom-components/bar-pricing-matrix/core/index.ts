/**
 * BarPricingMatrix - Core Interface
 * Zone/event pricing configuration grid
 * Tables: bar_price_configs
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarPricingMatrixPreset = 'grid' | 'table';

export interface PriceZone {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface PriceConfig {
  id: string;
  productName: string;
  productCategory: string;
  basePrice: number;
  currency: string;
  zonePrices: Record<string, number>;
  eventMultiplier?: number;
  happyHourPrice?: number;
  isActive: boolean;
}

export interface BarPricingMatrixProps extends EngineAwareProps {
  preset?: BarPricingMatrixPreset;
  zones?: PriceZone[];
  configs?: PriceConfig[];
  onConfigUpdate?: (configId: string, zoneId: string, price: number) => void;
  onConfigSelect?: (configId: string) => void;
  onZoneCreate?: () => void;
  onConfigCreate?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_PRICING_MATRIX_DEFAULTS: Partial<BarPricingMatrixProps> = {
  preset: 'grid',
};
