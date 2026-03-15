/**
 * BhProviderConfig - All Presets
 */

export { DashboardBhProviderConfig } from './dashboard';
export { DetailBhProviderConfig } from './detail';

import type { BhProviderConfigPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhProviderConfigProps } from '../core';
import { DashboardBhProviderConfig } from './dashboard';
import { DetailBhProviderConfig } from './detail';

export const BH_PROVIDER_CONFIG_PRESETS: Record<BhProviderConfigPreset, ComponentType<BhProviderConfigProps>> = {
  dashboard: DashboardBhProviderConfig,
  detail: DetailBhProviderConfig,
};
