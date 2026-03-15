import type { CartSummaryProps } from './core';
import { CART_SUMMARY_DEFAULTS } from './core';
import { PRESETS } from './presets';

export type { CartSummaryProps, CartSummaryPreset, CartItem } from './core';
export { CART_SUMMARY_DEFAULTS } from './core';

export function CartSummary(props: CartSummaryProps): React.ReactElement {
  const preset = props.preset ?? CART_SUMMARY_DEFAULTS.preset ?? 'panel';
  const PresetComponent = PRESETS[preset];
  return <PresetComponent {...props} />;
}

CartSummary.displayName = 'CartSummary';
