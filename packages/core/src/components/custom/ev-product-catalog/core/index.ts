/**
 * EvProductCatalog - Core Interface
 * Product catalog management
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvProductCatalogPreset = 'grid' | 'editor';

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  stockLevel: number;
  description?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon?: string;
  productCount: number;
  isVisible: boolean;
}

export interface ComboItem {
  id: string;
  name: string;
  products: Array<{ name: string;
  quantity: number }>;
  comboPrice: number;
  savings: number;
}

export interface EvProductCatalogProps extends EngineAwareProps {
  preset?: EvProductCatalogPreset;
  products?: CatalogProduct[];
  categories?: ProductCategory[];
  combos?: ComboItem[];
  onProductClick?: (id: string) => void;
  onCategoryClick?: (id: string) => void;
  onToggleAvailability?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_PRODUCT_CATALOG_DEFAULTS: Partial<EvProductCatalogProps> = {
  preset: 'grid',

};
