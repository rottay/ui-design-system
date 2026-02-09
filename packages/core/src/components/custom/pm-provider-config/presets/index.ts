/**
 * PmProviderConfig - All Presets
 */

export { TablePmProviderConfig } from './table';
export { CardsPmProviderConfig } from './cards';

import type { PmProviderConfigPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmProviderConfigProps } from '../core';
import { TablePmProviderConfig } from './table';
import { CardsPmProviderConfig } from './cards';

export const PM_PROVIDER_CONFIG_PRESETS: Record<PmProviderConfigPreset, ComponentType<PmProviderConfigProps>> = {
  table: TablePmProviderConfig,
  cards: CardsPmProviderConfig,
};
