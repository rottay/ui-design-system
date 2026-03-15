/**
 * PlNavigationFavorites - All Presets
 */

export { GridPlNavigationFavorites } from './grid';
export { ListPlNavigationFavorites } from './list';

import type { PlNavigationFavoritesPreset } from '../core';
import type { ComponentType } from 'react';
import type { PlNavigationFavoritesProps } from '../core';
import { GridPlNavigationFavorites } from './grid';
import { ListPlNavigationFavorites } from './list';

export const PL_NAVIGATION_FAVORITES_PRESETS: Record<PlNavigationFavoritesPreset, ComponentType<PlNavigationFavoritesProps>> = {
  grid: GridPlNavigationFavorites,
  list: ListPlNavigationFavorites,
};
