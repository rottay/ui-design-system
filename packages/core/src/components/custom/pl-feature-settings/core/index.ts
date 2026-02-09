/**
 * PlFeatureSettings - Core Interface
 * Configure feature flag settings per tenant and environment with overrides
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlFeatureSettingsPreset = 'form' | 'matrix';

export interface FeatureSettingsItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlFeatureSettingsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlFeatureSettingsPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: FeatureSettingsItem[];
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

export const PL_FEATURE_SETTINGS_DEFAULTS: Partial<PlFeatureSettingsProps> = {
  preset: 'form',
};
