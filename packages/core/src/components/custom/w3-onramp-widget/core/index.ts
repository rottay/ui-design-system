/**
 * W3OnrampWidget - Core Interface
 * Convert fiat currency to crypto with provider selection and rate comparison
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type W3OnrampWidgetPreset = 'widget' | 'form';

export type CryptoPaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
export interface OnrampWidgetItem {
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

export interface W3OnrampWidgetProps extends EngineAwareProps {
  /** Preset to use */
  preset?: W3OnrampWidgetPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: OnrampWidgetItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback to initiate */
  onInitiate?: () => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const W3_ONRAMP_WIDGET_DEFAULTS: Partial<W3OnrampWidgetProps> = {
  preset: 'widget',
};
