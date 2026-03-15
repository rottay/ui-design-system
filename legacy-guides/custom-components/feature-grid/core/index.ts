/**
 * FeatureGrid - Core Interface
 * Grid of features with icons, titles, descriptions
 */

import type { ReactNode } from 'react';
import type { EngineAwareProps, BaseComponentProps } from '../../../../types';

export type FeatureGridPreset = 'grid' | 'list' | 'bento';

export interface FeatureItem {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: ReactNode;
  link?: {
    label: string;
    onClick?: () => void;
  };
}

export interface FeatureGridProps extends EngineAwareProps, BaseComponentProps {
  /** Preset to use */
  preset?: FeatureGridPreset;
  /** List of features */
  features: FeatureItem[];
  /** Number of columns for grid layout */
  columns?: 2 | 3 | 4;
  /** Optional section title */
  title?: string;
  /** Optional section description */
  description?: string;
}

export const FEATURE_GRID_DEFAULTS: Partial<FeatureGridProps> = {
  preset: 'grid',
  columns: 3,
};
