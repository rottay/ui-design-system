import type { ProductCardProps } from './core';
import { PRODUCT_CARD_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { ProductCardProps, ProductCardPreset } from './core';
export { PRODUCT_CARD_DEFAULTS } from './core';

export function ProductCard(props: ProductCardProps): React.ReactElement {
  const preset = props.preset ?? PRODUCT_CARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

ProductCard.displayName = 'ProductCard';
