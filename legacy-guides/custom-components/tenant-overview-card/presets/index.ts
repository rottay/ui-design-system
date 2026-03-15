/**
 * TenantOverviewCard - All Presets
 */

import type { TenantOverviewCardPreset, TenantOverviewCardProps } from '../core';
import type { ComponentType } from 'react';
import { StandardTenantOverviewCard } from './standard';
import { CompactTenantOverviewCard } from './compact';
import { AdminTenantOverviewCard } from './admin';

export { StandardTenantOverviewCard } from './standard';
export { CompactTenantOverviewCard } from './compact';
export { AdminTenantOverviewCard } from './admin';

export const TENANT_OVERVIEW_CARD_PRESETS: Record<TenantOverviewCardPreset, ComponentType<TenantOverviewCardProps>> = {
  standard: StandardTenantOverviewCard,
  compact: CompactTenantOverviewCard,
  admin: AdminTenantOverviewCard,
};
