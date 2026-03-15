/**
 * W3WalletManager - Main Export
 * Manage connected wallets with balance summaries, networks, and transaction access
 */

import type { W3WalletManagerProps } from './core';
import { W3_WALLET_MANAGER_DEFAULTS } from './core';
import { W3_WALLET_MANAGER_PRESETS } from './presets';

export { type W3WalletManagerProps, type W3WalletManagerPreset, W3_WALLET_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function W3WalletManager(props: W3WalletManagerProps): React.ReactElement {
  const preset = props.preset ?? W3_WALLET_MANAGER_DEFAULTS.preset ?? 'cards';
  const PresetComponent = W3_WALLET_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3WalletManager.displayName = 'W3WalletManager';
