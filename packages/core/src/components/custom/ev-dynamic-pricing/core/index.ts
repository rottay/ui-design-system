/**
 * EvDynamicPricing - Core Interface
 * AI-driven dynamic pricing with demand curves, simulators, and live price monitoring
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvDynamicPricingPreset = 'control' | 'monitor';

export interface PricingTier {
  id: string;
  name: string;
  basePrice: number;
  currentPrice: number;
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  demand: number;
  sold: number;
  capacity: number;
  autoEnabled: boolean;
}

export interface PriceHistory {
  timestamp: Date;
  tierId: string;
  price: number;
  demand: number;
}

export interface EvDynamicPricingProps extends EngineAwareProps {
  preset?: EvDynamicPricingPreset;
  tiers?: PricingTier[];
  history?: PriceHistory[];
  onPriceOverride?: (tierId: string, newPrice: number) => void;
  onToggleAuto?: (tierId: string, enabled: boolean) => void;
  onSimulate?: (params: { tierId: string; price: number }) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_DYNAMIC_PRICING_DEFAULTS: Partial<EvDynamicPricingProps> = {
  preset: 'control',
};
