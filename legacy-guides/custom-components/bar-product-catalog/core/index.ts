/**
 * BarProductCatalog - Core Interface
 * Product management CRUD with categories, pricing, availability
 * Tables: bar_products, bar_product_categories
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BarProductCatalogPreset = 'grid' | 'table';

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  currency: string;
  imageUrl?: string;
  isAvailable: boolean;
  stockLevel: number;
  sku?: string;
  description?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  productCount: number;
  isActive: boolean;
}

export interface BarProductCatalogProps extends EngineAwareProps {
  preset?: BarProductCatalogPreset;
  products?: CatalogProduct[];
  categories?: ProductCategory[];
  onProductSelect?: (productId: string) => void;
  onProductCreate?: () => void;
  onProductEdit?: (productId: string) => void;
  onProductDelete?: (productId: string) => void;
  onToggleAvailability?: (productId: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const BAR_PRODUCT_CATALOG_DEFAULTS: Partial<BarProductCatalogProps> = {
  preset: 'grid',
};
