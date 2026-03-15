/**
 * W3WalletDetail - Main Export
 * Detailed wallet view with balance breakdown, recent activity, and token holdings
 */

import type { W3WalletDetailProps } from './core';
import { W3_WALLET_DETAIL_DEFAULTS } from './core';
import { W3_WALLET_DETAIL_PRESETS } from './presets';

export { type W3WalletDetailProps, type W3WalletDetailPreset, W3_WALLET_DETAIL_DEFAULTS } from './core';
export * from './presets';

export function W3WalletDetail(props: W3WalletDetailProps): React.ReactElement {
  const preset = props.preset ?? W3_WALLET_DETAIL_DEFAULTS.preset ?? 'overview';
  const PresetComponent = W3_WALLET_DETAIL_PRESETS[preset];
  return <PresetComponent {...props} />;
}

W3WalletDetail.displayName = 'W3WalletDetail';
