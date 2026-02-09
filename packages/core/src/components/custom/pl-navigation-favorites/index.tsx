/**
 * PlNavigationFavorites - Main Export
 * Manage user navigation favorites and bookmarked pages with quick access
 */

import type { PlNavigationFavoritesProps } from './core';
import { PL_NAVIGATION_FAVORITES_DEFAULTS } from './core';
import { PL_NAVIGATION_FAVORITES_PRESETS } from './presets';

export { type PlNavigationFavoritesProps, type PlNavigationFavoritesPreset, PL_NAVIGATION_FAVORITES_DEFAULTS } from './core';
export * from './presets';

export function PlNavigationFavorites(props: PlNavigationFavoritesProps): React.ReactElement {
  const preset = props.preset ?? PL_NAVIGATION_FAVORITES_DEFAULTS.preset ?? 'grid';
  const PresetComponent = PL_NAVIGATION_FAVORITES_PRESETS[preset];
  return <PresetComponent {...props} />;
}

PlNavigationFavorites.displayName = 'PlNavigationFavorites';
