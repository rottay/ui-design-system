/**
 * PlFeatureRules - Core Interface
 * Build targeting rules for feature flags based on user attributes and segments
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlFeatureRulesPreset = 'builder' | 'table';

export interface FeatureRulesItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlFeatureRulesProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlFeatureRulesPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: FeatureRulesItem[];
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

export const PL_FEATURE_RULES_DEFAULTS: Partial<PlFeatureRulesProps> = {
  preset: 'builder',
};
