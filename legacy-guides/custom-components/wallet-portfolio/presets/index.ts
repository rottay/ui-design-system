/**
 * WalletPortfolio Presets
 */

export { OverviewWalletPortfolio } from './overview';
export { DetailedWalletPortfolio } from './detailed';

import type { WalletPortfolioPreset } from '../core';
import type { ComponentType } from 'react';
import type { WalletPortfolioProps } from '../core';
import { OverviewWalletPortfolio } from './overview';
import { DetailedWalletPortfolio } from './detailed';

export const WALLET_PORTFOLIO_PRESETS: Record<WalletPortfolioPreset, ComponentType<WalletPortfolioProps>> = {
  overview: OverviewWalletPortfolio,
  detailed: DetailedWalletPortfolio,
};
