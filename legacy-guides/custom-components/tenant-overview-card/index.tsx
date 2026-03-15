/**
 * TenantOverviewCard - Main Export
 * Automatically selects preset based on props
 */

import type { TenantOverviewCardProps } from './core';
import { TENANT_OVERVIEW_CARD_DEFAULTS } from './core';
import { TENANT_OVERVIEW_CARD_PRESETS } from './presets';

export {
  type TenantOverviewCardProps,
  type TenantOverviewCardPreset,
  type TenantPlan,
  type TenantStatus,
  type TenantOverview,
  TENANT_OVERVIEW_CARD_DEFAULTS,
  getPlanColors,
  getStatusColors,
  formatStorage,
  formatMrr,
  getUsagePercent,
  getUsageColor,
  formatPlanLabel,
  formatStatusLabel,
  getDaysRemaining,
} from './core';
export * from './presets';

/**
 * TenantOverviewCard component
 * Renders the appropriate preset based on the preset prop
 */
export function TenantOverviewCard(props: TenantOverviewCardProps): React.ReactElement {
  const preset = props.preset ?? TENANT_OVERVIEW_CARD_DEFAULTS.preset ?? 'standard';
  const PresetComponent = TENANT_OVERVIEW_CARD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

TenantOverviewCard.displayName = 'TenantOverviewCard';

export { StandardTenantOverviewCard, CompactTenantOverviewCard, AdminTenantOverviewCard } from './presets';
