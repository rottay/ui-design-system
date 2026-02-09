/**
 * WalletPortfolio - Main Export
 */

import type { WalletPortfolioProps } from './core';
import { WALLET_PORTFOLIO_DEFAULTS } from './core';
import { WALLET_PORTFOLIO_PRESETS } from './presets';

export {
  type WalletPortfolioProps,
  type WalletPortfolioPreset,
  type Wallet,
  type WalletAsset,
  type WalletType,
  type ChainType,
  WALLET_PORTFOLIO_DEFAULTS,
} from './core';
export * from './presets';

export function WalletPortfolio(props: WalletPortfolioProps): React.ReactElement {
  const preset = props.preset ?? WALLET_PORTFOLIO_DEFAULTS.preset ?? 'overview';
  const PresetComponent = WALLET_PORTFOLIO_PRESETS[preset];
  return <PresetComponent {...props} />;
}

WalletPortfolio.displayName = 'WalletPortfolio';

export { OverviewWalletPortfolio, DetailedWalletPortfolio } from './presets';
