/**
 * W3WalletDetail - All Presets
 */

export { OverviewW3WalletDetail } from './overview';
export { ActivityW3WalletDetail } from './activity';

import type { W3WalletDetailPreset } from '../core';
import type { ComponentType } from 'react';
import type { W3WalletDetailProps } from '../core';
import { OverviewW3WalletDetail } from './overview';
import { ActivityW3WalletDetail } from './activity';

export const W3_WALLET_DETAIL_PRESETS: Record<W3WalletDetailPreset, ComponentType<W3WalletDetailProps>> = {
  overview: OverviewW3WalletDetail,
  activity: ActivityW3WalletDetail,
};
