/**
 * PlFeatureToggle - Core Interface
 * Quick toggle interface for enabling and disabling feature flags per environment
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlFeatureTogglePreset = 'panel' | 'compact';

export interface FeatureToggleItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlFeatureToggleProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlFeatureTogglePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: FeatureToggleItem[];
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

export const PL_FEATURE_TOGGLE_DEFAULTS: Partial<PlFeatureToggleProps> = {
  preset: 'panel',
};
