/**
 * EvMerchStore - Core Interface
 * Merchandise store with product grid, variants, and inventory management
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvMerchStorePreset = 'storefront' | 'inventory';

export interface MerchProduct {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  image?: string;
  variants: MerchVariant[];
  totalStock: number;
  totalSold: number;
  status: 'active' | 'low-stock' | 'out-of-stock' | 'discontinued';
}

export interface MerchVariant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  sold: number;
  sku: string;
}

export interface EvMerchStoreProps extends EngineAwareProps {
  preset?: EvMerchStorePreset;
  products?: MerchProduct[];
  onProductClick?: (productId: string) => void;
  onAddToCart?: (productId: string, variantId: string) => void;
  onReorder?: (productId: string) => void;
  onTransferStock?: (productId: string, fromLocation: string, toLocation: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_MERCH_STORE_DEFAULTS: Partial<EvMerchStoreProps> = {
  preset: 'storefront',
};
