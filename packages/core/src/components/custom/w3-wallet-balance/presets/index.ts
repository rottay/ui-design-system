/**
 * W3WalletBalance - All Presets
 */

export { PortfolioW3WalletBalance } from './portfolio';
export { ListW3WalletBalance } from './list';

import type { W3WalletBalancePreset } from '../core';
import type { ComponentType } from 'react';
import type { W3WalletBalanceProps } from '../core';
import { PortfolioW3WalletBalance } from './portfolio';
import { ListW3WalletBalance } from './list';

export const W3_WALLET_BALANCE_PRESETS: Record<W3WalletBalancePreset, ComponentType<W3WalletBalanceProps>> = {
  portfolio: PortfolioW3WalletBalance,
  list: ListW3WalletBalance,
};
