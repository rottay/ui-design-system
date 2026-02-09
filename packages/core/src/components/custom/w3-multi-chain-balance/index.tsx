/**
 * W3MultiChainBalance - Main Export
 * View aggregated balances across multiple blockchain networks and protocols
 */

import type { W3MultiChainBalanceProps } from './core';
import { W3_MULTI_CHAIN_BALANCE_DEFAULTS } from './core';
import { W3_MULTI_CHAIN_BALANCE_PRESETS } from './presets';

export { type W3MultiChainBalanceProps, type W3MultiChainBalancePreset, W3_MULTI_CHAIN_BALANCE_DEFAULTS } from './core';
export * from './presets';

export function W3MultiChainBalance(props: W3MultiChainBalanceProps): React.ReactElement {
  const preset = props.preset ?? W3_MULTI_CHAIN_BALANCE_DEFAULTS.preset ?? 'dashboard';
  const PresetComponent = W3_MULTI_CHAIN_BALANCE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3MultiChainBalance.displayName = 'W3MultiChainBalance';
