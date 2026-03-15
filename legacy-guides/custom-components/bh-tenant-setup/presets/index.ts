/**
 * BhTenantSetup - All Presets
 */

import type { BhTenantSetupPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhTenantSetupProps } from '../core';
import { FullBhTenantSetup } from './full';
import { QuickBhTenantSetup } from './quick';

export { FullBhTenantSetup } from './full';
export { QuickBhTenantSetup } from './quick';

export const BH_TENANT_SETUP_PRESETS: Record<BhTenantSetupPreset, ComponentType<BhTenantSetupProps>> = {
  full: FullBhTenantSetup,
  quick: QuickBhTenantSetup,
};
