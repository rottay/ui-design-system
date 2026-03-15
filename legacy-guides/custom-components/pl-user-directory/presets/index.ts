/**
 * PlUserDirectory - All Presets
 */

export { TablePlUserDirectory } from './table';
export { GridPlUserDirectory } from './grid';

import type { PlUserDirectoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlUserDirectoryProps } from '../core';
import { TablePlUserDirectory } from './table';
import { GridPlUserDirectory } from './grid';

export const PL_USER_DIRECTORY_PRESETS: Record<PlUserDirectoryPreset, ComponentType<PlUserDirectoryProps>> = {
  table: TablePlUserDirectory,
  grid: GridPlUserDirectory,
};
