/**
 * W3PaymentSession - Core Interface
 * Track crypto payment session progress from initiation to confirmation
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3PaymentSessionPreset = 'tracker' | 'card';

export type CryptoPaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
export interface PaymentSessionItem {
  id: string;
  amount: string;
  currency: string;
  cryptoAmount?: string;
  cryptoCurrency?: string;
  status: CryptoPaymentStatus;
  rate?: string;
  provider?: string;
  createdAt: string;
}

export interface W3PaymentSessionProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3PaymentSessionPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PaymentSessionItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to initiate */
  onInitiate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_PAYMENT_SESSION_DEFAULTS: Partial<W3PaymentSessionProps> = {
  preset: 'tracker',
};
