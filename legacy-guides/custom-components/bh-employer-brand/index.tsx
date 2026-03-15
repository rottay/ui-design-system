/**
 * BhEmployerBrand - Main Export
 * Dashboard widget displaying employer brand health metrics.
 */

import type { BhEmployerBrandProps } from './core';
import { BH_EMPLOYER_BRAND_DEFAULTS } from './core';
import { BH_EMPLOYER_BRAND_PRESETS } from './presets';

export {
  type BhEmployerBrandProps,
  type BhEmployerBrandPreset,
  type EmployerBrandData,
  BH_EMPLOYER_BRAND_DEFAULTS,
} from './core';
export * from './presets';

export function BhEmployerBrand(props: BhEmployerBrandProps): React.ReactElement {
  const preset = props.preset ?? BH_EMPLOYER_BRAND_DEFAULTS.preset ?? 'compact';
  const PresetComponent = BH_EMPLOYER_BRAND_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhEmployerBrand.displayName = 'BhEmployerBrand';

export { CompactBhEmployerBrand } from './presets';
