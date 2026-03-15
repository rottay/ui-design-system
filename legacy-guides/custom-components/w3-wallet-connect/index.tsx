/**
 * W3WalletConnect - Main Export
 * Connect external wallets via WalletConnect, MetaMask, or other providers
 */

import type { W3WalletConnectProps } from './core';
import { W3_WALLET_CONNECT_DEFAULTS } from './core';
import { W3_WALLET_CONNECT_PRESETS } from './presets';

export { type W3WalletConnectProps, type W3WalletConnectPreset, W3_WALLET_CONNECT_DEFAULTS } from './core';
export * from './presets';

export function W3WalletConnect(props: W3WalletConnectProps): React.ReactElement {
  const preset = props.preset ?? W3_WALLET_CONNECT_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = W3_WALLET_CONNECT_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3WalletConnect.displayName = 'W3WalletConnect';
