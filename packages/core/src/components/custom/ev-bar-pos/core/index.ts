/**
 * EvBarPos - Core Interface
 * Point of sale interface
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvBarPosPreset = 'cashier' | 'self-service';

export interface PosProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  isCombo: boolean;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
}

export interface PosCategory {
  id: string;
  name: string;
  icon?: string;
  productCount: number;
}

export interface EvBarPosProps extends EngineAwareProps {
  preset?: EvBarPosPreset;
  products?: PosProduct[];
  categories?: PosCategory[];
  cart?: CartItem[];
  total?: number;
  onAddToCart?: (productId: string) => void;
  onRemoveFromCart?: (productId: string) => void;
  onCheckout?: () => void;
  onCategorySelect?: (categoryId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_BAR_POS_DEFAULTS: Partial<EvBarPosProps> = {
  preset: 'cashier',

};
