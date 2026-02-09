/**
 * TenantOverviewCard - All Presets
 */

import type { TenantOverviewCardPreset } from '../core';
import { StandardTenantOverviewCard } from './standard';
import { CompactTenantOverviewCard } from './compact';
import { AdminTenantOverviewCard } from './admin';

export { StandardTenantOverviewCard } from './standard';
export { CompactTenantOverviewCard } from './compact';
export { AdminTenantOverviewCard } from './admin';

export const TENANT_OVERVIEW_CARD_PRESETS: Record<TenantOverviewCardPreset, React.ComponentType<any>> = {
  standard: StandardTenantOverviewCard,
  compact: CompactTenantOverviewCard,
  admin: AdminTenantOverviewCard,
};
