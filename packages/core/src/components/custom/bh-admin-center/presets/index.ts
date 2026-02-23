/**
 * BhAdminCenter - All Presets
 */

import type { BhAdminCenterPreset, BhAdminCenterProps } from '../core';
import type { ComponentType } from 'react';
import { OverviewBhAdminCenter } from './overview';
import { BillingBhAdminCenter } from './billing';

export { OverviewBhAdminCenter } from './overview';
export { BillingBhAdminCenter } from './billing';

export const BH_ADMIN_CENTER_PRESETS: Record<BhAdminCenterPreset, ComponentType<BhAdminCenterProps>> = {
  overview: OverviewBhAdminCenter,
  billing: BillingBhAdminCenter,
};
