/**
 * W3TokenSupply - Main Export
 * Track token supply metrics with circulating, total, and max supply visualization
 */

import type { W3TokenSupplyProps } from './core';
import { W3_TOKEN_SUPPLY_DEFAULTS } from './core';
import { W3_TOKEN_SUPPLY_PRESETS } from './presets';

export { type W3TokenSupplyProps, type W3TokenSupplyPreset, W3_TOKEN_SUPPLY_DEFAULTS } from './core';
export * from './presets';

export function W3TokenSupply(props: W3TokenSupplyProps): React.ReactElement {
  const preset = props.preset ?? W3_TOKEN_SUPPLY_DEFAULTS.preset ?? 'overview';
  const PresetComponent = W3_TOKEN_SUPPLY_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TokenSupply.displayName = 'W3TokenSupply';
