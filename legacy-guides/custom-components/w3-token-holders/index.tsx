/**
 * W3TokenHolders - Main Export
 * View token holder distribution with top holders, concentration, and trends
 */

import type { W3TokenHoldersProps } from './core';
import { W3_TOKEN_HOLDERS_DEFAULTS } from './core';
import { W3_TOKEN_HOLDERS_PRESETS } from './presets';

export { type W3TokenHoldersProps, type W3TokenHoldersPreset, W3_TOKEN_HOLDERS_DEFAULTS } from './core';
export * from './presets';

export function W3TokenHolders(props: W3TokenHoldersProps): React.ReactElement {
  const preset = props.preset ?? W3_TOKEN_HOLDERS_DEFAULTS.preset ?? 'table';
  const PresetComponent = W3_TOKEN_HOLDERS_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3TokenHolders.displayName = 'W3TokenHolders';
