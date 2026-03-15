/**
 * PlTenantPlanManager - Main Export
 * View and manage tenant subscription plans with feature comparisons and usage limits
 */

import type { PlTenantPlanManagerProps } from './core';
import { PL_TENANT_PLAN_MANAGER_DEFAULTS } from './core';
import { PL_TENANT_PLAN_MANAGER_PRESETS } from './presets';

export { type PlTenantPlanManagerProps, type PlTenantPlanManagerPreset, PL_TENANT_PLAN_MANAGER_DEFAULTS } from './core';
export * from './presets';

export function PlTenantPlanManager(props: PlTenantPlanManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_TENANT_PLAN_MANAGER_DEFAULTS.preset ?? 'overview';
  const PresetComponent = PL_TENANT_PLAN_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlTenantPlanManager.displayName = 'PlTenantPlanManager';
