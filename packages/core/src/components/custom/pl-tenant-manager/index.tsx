/**
 * PlTenantManager - Main Export
 * Comprehensive tenant management for multi-tenant SaaS platforms.
 */

import type { PlTenantManagerProps } from './core';
import { PL_TENANT_MANAGER_DEFAULTS } from './core';
import { PL_TENANT_MANAGER_PRESETS } from './presets';

export {
  type PlTenantManagerProps,
  type PlTenantManagerPreset,
  type Tenant,
  type TenantStatus,
  type TenantPlan,
  PL_TENANT_MANAGER_DEFAULTS,
} from './core';
export * from './presets';

export function PlTenantManager(props: PlTenantManagerProps): React.ReactElement {
  const preset = props.preset ?? PL_TENANT_MANAGER_DEFAULTS.preset ?? 'table';
  const PresetComponent = PL_TENANT_MANAGER_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlTenantManager.displayName = 'PlTenantManager';
