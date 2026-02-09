/**
 * PlFeatureRollout - Core Interface
 * Plan and execute gradual feature rollouts with percentage-based targeting
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlFeatureRolloutPreset = 'wizard' | 'timeline';

export interface FeatureRolloutItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlFeatureRolloutProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlFeatureRolloutPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: FeatureRolloutItem[];
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

export const PL_FEATURE_ROLLOUT_DEFAULTS: Partial<PlFeatureRolloutProps> = {
  preset: 'wizard',
};
