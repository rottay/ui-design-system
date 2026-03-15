import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type CartSummaryPreset = 'panel' | 'compact';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string | ReactNode;
  variant?: string;
}

export interface CartSummaryProps extends EngineAwareProps {
  preset?: CartSummaryPreset;
  items: CartItem[];
  currency?: string;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  total?: number;
  onQuantityChange?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  onCheckout?: () => void;
  promoCode?: string;
  onPromoApply?: (code: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const CART_SUMMARY_DEFAULTS = {
  preset: 'panel' as CartSummaryPreset,
  currency: '$',
};
