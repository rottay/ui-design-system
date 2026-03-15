/**
 * PlNavigationFavorites - Core Interface
 * Manage user navigation favorites and bookmarked pages with quick access
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlNavigationFavoritesPreset = 'grid' | 'list';

export interface NavigationFavoritesItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlNavigationFavoritesProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlNavigationFavoritesPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NavigationFavoritesItem[];
  /** Callback when an item is selected */
  onItemClick?: (id: string) => void;
  /** Callback when an item is created */
  onCreate?: () => void;
  /** Search query */
  searchQuery?: string;
  /** Callback when search changes */
  onSearchChange?: (query: string) => void;
  /** Additional CSS class name(s) */
  className?: string;
  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_NAVIGATION_FAVORITES_DEFAULTS: Partial<PlNavigationFavoritesProps> = {
  preset: 'grid',
};
