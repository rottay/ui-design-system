/**
 * BhClientDetail - Core Interface
 * Client dashboard with positions and revenue for BitHire ATS platform
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhClientDetailPreset = 'dashboard' | 'compact';

export interface ClientPosition {
  id: string;
  title: string;
  status: 'open' | 'filled' | 'closed';
  candidates: number;
  daysOpen: number;
}

export interface RevenuePoint {
  month: string;
  amount: number;
}

export interface BhClientDetailProps extends EngineAwareProps {
  preset?: BhClientDetailPreset;
  clientName: string;
  tier: 'enterprise' | 'business' | 'starter';
  contractStatus: 'active' | 'expiring' | 'expired';
  positions: ClientPosition[];
  revenueHistory: RevenuePoint[];
  totalRevenue: number;
  currency?: string;
  onPositionClick?: (positionId: string) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BH_CLIENT_DETAIL_DEFAULTS: Partial<BhClientDetailProps> = {
  preset: 'dashboard',
  currency: 'USD',
  loading: false,
};
