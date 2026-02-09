/**
 * EvPromoEngine - Core Interface
 * Promotion engine with code builder, flash sales, bundles, referrals, and campaign tracking
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvPromoEnginePreset = 'builder' | 'tracker';

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'bogo' | 'bundle' | 'referral';
  value: number;
  description: string;
  status: 'active' | 'scheduled' | 'expired' | 'paused';
  usageCount: number;
  usageLimit?: number;
  startDate: Date;
  endDate?: Date;
  revenueGenerated: number;
  redemptionRate: number;
}

export interface EvPromoEngineProps extends EngineAwareProps {
  preset?: EvPromoEnginePreset;
  promos?: PromoCode[];
  onPromoClick?: (promoId: string) => void;
  onCreatePromo?: () => void;
  onToggleStatus?: (promoId: string, active: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_PROMO_ENGINE_DEFAULTS: Partial<EvPromoEngineProps> = {
  preset: 'builder',
};
