/**
 * W3MultiChainBalance - All Presets
 */

export { DashboardW3MultiChainBalance } from './dashboard';
export { GridW3MultiChainBalance } from './grid';

import type { W3MultiChainBalancePreset } from '../core';
import type { ComponentType } from 'react';
import type { W3MultiChainBalanceProps } from '../core';
import { DashboardW3MultiChainBalance } from './dashboard';
import { GridW3MultiChainBalance } from './grid';

export const W3_MULTI_CHAIN_BALANCE_PRESETS: Record<W3MultiChainBalancePreset, ComponentType<W3MultiChainBalanceProps>> = {
  dashboard: DashboardW3MultiChainBalance,
  grid: GridW3MultiChainBalance,
};
