import type { EngineAwareProps } from '../../../../types';
import type { ReactNode } from 'react';

export type ProductCardPreset = 'standard' | 'compact' | 'horizontal';

export interface ProductCardProps extends EngineAwareProps {
  preset?: ProductCardPreset;
  title: string;
  price: string;
  originalPrice?: string;
  image?: string | ReactNode;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  description?: string;
  onAddToCart?: () => void;
  onClick?: () => void;
  inStock?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const PRODUCT_CARD_DEFAULTS = {
  preset: 'standard' as ProductCardPreset,
  inStock: true,
};
