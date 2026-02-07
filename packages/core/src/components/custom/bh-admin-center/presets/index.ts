/**
 * BhAdminCenter - All Presets
 */

import type { BhAdminCenterPreset } from '../core';
import { OverviewBhAdminCenter } from './overview';
import { BillingBhAdminCenter } from './billing';

export { OverviewBhAdminCenter } from './overview';
export { BillingBhAdminCenter } from './billing';

export const BH_ADMIN_CENTER_PRESETS: Record<BhAdminCenterPreset, React.ComponentType<any>> = {
  overview: OverviewBhAdminCenter,
  billing: BillingBhAdminCenter,
};
