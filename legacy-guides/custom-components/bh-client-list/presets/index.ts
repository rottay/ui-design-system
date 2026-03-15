/**
 * BhClientList - All Presets
 */

export { TableBhClientList } from './table';
export { GridBhClientList } from './grid';

import type { BhClientListPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhClientListProps } from '../core';
import { TableBhClientList } from './table';
import { GridBhClientList } from './grid';

export const BH_CLIENT_LIST_PRESETS: Record<BhClientListPreset, ComponentType<BhClientListProps>> = {
  table: TableBhClientList,
  grid: GridBhClientList,
};
