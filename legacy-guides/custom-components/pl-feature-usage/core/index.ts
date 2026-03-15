/**
 * PlFeatureUsage - Core Interface
 * Track feature flag evaluation metrics and adoption rates over time
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlFeatureUsagePreset = 'dashboard' | 'table';

export interface FeatureUsageItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlFeatureUsageProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlFeatureUsagePreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: FeatureUsageItem[];
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

export const PL_FEATURE_USAGE_DEFAULTS: Partial<PlFeatureUsageProps> = {
  preset: 'dashboard',
};
