import type { ProductCardProps, ProductCardPreset } from '../core';
import { StandardPreset } from './standard';
import { CompactPreset } from './compact';
import { HorizontalPreset } from './horizontal';

export const PRESETS: Record<ProductCardPreset, React.ComponentType<ProductCardProps>> = {
  standard: StandardPreset,
  compact: CompactPreset,
  horizontal: HorizontalPreset,
};
