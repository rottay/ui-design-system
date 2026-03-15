/**
 * PlCompanySettings - All Presets
 */

export { FormPlCompanySettings } from './form';
export { TabsPlCompanySettings } from './tabs';

import type { PlCompanySettingsPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlCompanySettingsProps } from '../core';
import { FormPlCompanySettings } from './form';
import { TabsPlCompanySettings } from './tabs';

export const PL_COMPANY_SETTINGS_PRESETS: Record<PlCompanySettingsPreset, ComponentType<PlCompanySettingsProps>> = {
  form: FormPlCompanySettings,
  tabs: TabsPlCompanySettings,
};
