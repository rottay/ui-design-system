/**
 * W3OfframpWidget - Core Interface
 * Convert crypto to fiat currency with bank transfer and withdrawal options
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3OfframpWidgetPreset = 'widget' | 'form';

export type CryptoPaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
export interface OfframpWidgetItem {
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

export interface W3OfframpWidgetProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3OfframpWidgetPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: OfframpWidgetItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to initiate */
  onInitiate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_OFFRAMP_WIDGET_DEFAULTS: Partial<W3OfframpWidgetProps> = {
  preset: 'widget',
};
