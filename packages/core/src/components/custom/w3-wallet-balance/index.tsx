/**
 * W3WalletBalance - Main Export
 * Display wallet balances across tokens with portfolio allocation and value changes
 */

import type { W3WalletBalanceProps } from './core';
import { W3_WALLET_BALANCE_DEFAULTS } from './core';
import { W3_WALLET_BALANCE_PRESETS } from './presets';

export { type W3WalletBalanceProps, type W3WalletBalancePreset, W3_WALLET_BALANCE_DEFAULTS } from './core';
export * from './presets';

export function W3WalletBalance(props: W3WalletBalanceProps): React.ReactElement {
  const preset = props.preset ?? W3_WALLET_BALANCE_DEFAULTS.preset ?? 'portfolio';
  const PresetComponent = W3_WALLET_BALANCE_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3WalletBalance.displayName = 'W3WalletBalance';
