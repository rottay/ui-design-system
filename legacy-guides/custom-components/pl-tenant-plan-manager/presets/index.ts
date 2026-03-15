/**
 * PlTenantPlanManager - All Presets
 */

export { OverviewPlTenantPlanManager } from './overview';
export { ComparisonPlTenantPlanManager } from './comparison';

import type { PlTenantPlanManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlTenantPlanManagerProps } from '../core';
import { OverviewPlTenantPlanManager } from './overview';
import { ComparisonPlTenantPlanManager } from './comparison';

export const PL_TENANT_PLAN_MANAGER_PRESETS: Record<PlTenantPlanManagerPreset, ComponentType<PlTenantPlanManagerProps>> = {
  overview: OverviewPlTenantPlanManager,
  comparison: ComparisonPlTenantPlanManager,
};
