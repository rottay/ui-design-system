/**
 * PlNavigationHistory - Core Interface
 * View user navigation history with breadcrumb trails and page analytics
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlNavigationHistoryPreset = 'timeline' | 'list';

export interface NavigationHistoryItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlNavigationHistoryProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlNavigationHistoryPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: NavigationHistoryItem[];
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

export const PL_NAVIGATION_HISTORY_DEFAULTS: Partial<PlNavigationHistoryProps> = {
  preset: 'timeline',
};
