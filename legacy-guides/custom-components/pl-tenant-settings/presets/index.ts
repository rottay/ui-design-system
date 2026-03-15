/**
 * PlTenantSettings - All Presets
 */

export { FormPlTenantSettings } from './form';
export { TabsPlTenantSettings } from './tabs';

import type { PlTenantSettingsPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlTenantSettingsProps } from '../core';
import { FormPlTenantSettings } from './form';
import { TabsPlTenantSettings } from './tabs';

export const PL_TENANT_SETTINGS_PRESETS: Record<PlTenantSettingsPreset, ComponentType<PlTenantSettingsProps>> = {
  form: FormPlTenantSettings,
  tabs: TabsPlTenantSettings,
};
