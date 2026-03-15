/**
 * PlAuthMethodManager - All Presets
 */

export { ListPlAuthMethodManager } from './list';
export { GridPlAuthMethodManager } from './grid';

import type { PlAuthMethodManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlAuthMethodManagerProps } from '../core';
import { ListPlAuthMethodManager } from './list';
import { GridPlAuthMethodManager } from './grid';

export const PL_AUTH_METHOD_MANAGER_PRESETS: Record<PlAuthMethodManagerPreset, ComponentType<PlAuthMethodManagerProps>> = {
  list: ListPlAuthMethodManager,
  grid: GridPlAuthMethodManager,
};
