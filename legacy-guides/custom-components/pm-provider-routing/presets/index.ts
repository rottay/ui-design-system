/**
 * PmProviderRouting - All Presets
 */

export { EditorPmProviderRouting } from './editor';
export { TablePmProviderRouting } from './table';

import type { PmProviderRoutingPreset } from '../core';
import type { ComponentType } from 'react';
import type { PmProviderRoutingProps } from '../core';
import { EditorPmProviderRouting } from './editor';
import { TablePmProviderRouting } from './table';

export const PM_PROVIDER_ROUTING_PRESETS: Record<PmProviderRoutingPreset, ComponentType<PmProviderRoutingProps>> = {
  editor: EditorPmProviderRouting,
  table: TablePmProviderRouting,
};
