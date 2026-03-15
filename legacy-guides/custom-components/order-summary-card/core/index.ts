import type { EngineAwareProps } from '../../../../types';

export type OrderSummaryCardPreset = 'confirmation' | 'tracking';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface TrackingStep {
  key: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: Date | string;
}

export interface OrderSummaryCardProps extends EngineAwareProps {
  preset?: OrderSummaryCardPreset;
  orderId: string;
  items: OrderItem[];
  total: number;
  status?: string;
  trackingSteps?: TrackingStep[];
  shippingAddress?: string;
  estimatedDelivery?: Date | string;
  className?: string;
  style?: React.CSSProperties;
}

export const ORDER_SUMMARY_CARD_DEFAULTS = {
  preset: 'confirmation' as OrderSummaryCardPreset,
};
