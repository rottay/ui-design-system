/**
 * BhAdminCenter - Main Export
 * Admin Manager Dashboard for BitHire ATS platform
 */

import type { BhAdminCenterProps } from './core';
import { BH_ADMIN_CENTER_DEFAULTS } from './core';
import { BH_ADMIN_CENTER_PRESETS } from './presets';

export {
  type BhAdminCenterProps,
  type BhAdminCenterPreset,
  type SystemHealthStatus,
  type ProviderHealth,
  type ProviderStatusType,
  type CircuitBreakerState,
  type BillingMetrics,
  type GlobalKpi,
  type UserSummary,
  type SystemEvent,
  type SystemEventType,
  type EventSeverity,
  type CostBreakdown,
  type ComplianceStatus,
  type ComplianceLevel,
  type AdminQuickAction,
  type DateRangeValue,
  BH_ADMIN_CENTER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhAdminCenter component
 * Renders the appropriate preset based on the preset prop
 */
export function BhAdminCenter(props: BhAdminCenterProps): React.ReactElement {
  const preset = props.preset ?? BH_ADMIN_CENTER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = BH_ADMIN_CENTER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhAdminCenter.displayName = 'BhAdminCenter';

export { OverviewBhAdminCenter, BillingBhAdminCenter } from './presets';
