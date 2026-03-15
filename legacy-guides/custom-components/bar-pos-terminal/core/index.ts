/**
 * BarPosTerminal - Core Interface
 * POS touch interface for ordering: product grid by category, cart, payment
 * Tables: bar_orders, bar_order_items, bar_products
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarPosTerminalPreset = 'compact' | 'full';

export interface PosProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface PosCategory {
  id: string;
  name: string;
  icon?: string;
  productCount: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface BarPosTerminalProps extends EngineAwareProps {
  preset?: BarPosTerminalPreset;
  products?: PosProduct[];
  categories?: PosCategory[];
  cart?: CartItem[];
  total?: number;
  activeCategory?: string | null;
  onAddToCart?: (productId: string) => void;
  onRemoveFromCart?: (productId: string) => void;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onCheckout?: () => void;
  onCategorySelect?: (categoryId: string) => void;
  onClearCart?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_POS_TERMINAL_DEFAULTS: Partial<BarPosTerminalProps> = {
  preset: 'compact',
};
