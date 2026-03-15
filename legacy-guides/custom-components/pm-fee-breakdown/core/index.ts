/**
 * PmFeeBreakdown - Core Interface
 * Display detailed fee breakdown with platform, processing, and tax components
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PmFeeBreakdownPreset = 'panel' | 'inline';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'crypto';
export interface FeeBreakdownItem {
  id: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  customer?: string;
  description?: string;
  createdAt: string;
  reference?: string;
}

export interface PmFeeBreakdownProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PmFeeBreakdownPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: FeeBreakdownItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to create */
  onCreate?: () => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PM_FEE_BREAKDOWN_DEFAULTS: Partial<PmFeeBreakdownProps> = {
  preset: 'panel',
};
