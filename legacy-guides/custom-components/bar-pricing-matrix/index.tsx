/**
 * BarPricingMatrix - Main Export
 * Zone/event pricing configuration grid
 */

import type { BarPricingMatrixProps } from './core';
import { BAR_PRICING_MATRIX_DEFAULTS } from './core';
import { BAR_PRICING_MATRIX_PRESETS } from './presets';

export {
  type BarPricingMatrixProps,
  type BarPricingMatrixPreset,
  type PriceConfig as BarPriceConfig,
  type PriceZone as BarPriceZone,
  BAR_PRICING_MATRIX_DEFAULTS,
} from './core';
export * from './presets';

export function BarPricingMatrix(props: BarPricingMatrixProps): React.ReactElement {
  const preset = props.preset ?? BAR_PRICING_MATRIX_DEFAULTS.preset ?? 'grid';
  const PresetComponent = BAR_PRICING_MATRIX_PRESETS[preset];
  return <PresetComponent {...props} />;
}

BarPricingMatrix.displayName = 'BarPricingMatrix';

export { GridBarPricingMatrix, TableBarPricingMatrix } from './presets';
