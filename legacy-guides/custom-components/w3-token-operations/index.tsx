/**
 * W3TokenOperations - Main Export
 * Execute token operations including mint, burn, transfer, and approve
 */

import type { W3TokenOperationsProps } from './core';
import { W3_TOKEN_OPERATIONS_DEFAULTS } from './core';
import { W3_TOKEN_OPERATIONS_PRESETS } from './presets';

export { type W3TokenOperationsProps, type W3TokenOperationsPreset, W3_TOKEN_OPERATIONS_DEFAULTS } from './core';
export * from './presets';

export function W3TokenOperations(props: W3TokenOperationsProps): React.ReactElement {
  const preset = props.preset ?? W3_TOKEN_OPERATIONS_DEFAULTS.preset ?? 'panel';
  const PresetComponent = W3_TOKEN_OPERATIONS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TokenOperations.displayName = 'W3TokenOperations';
