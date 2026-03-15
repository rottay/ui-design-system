/**
 * PlAccessValidator - Core Interface
 * Test and validate access policies for specific users, roles, and resources
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlAccessValidatorPreset = 'checker' | 'report';

export interface AccessValidatorItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlAccessValidatorProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlAccessValidatorPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: AccessValidatorItem[];
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

export const PL_ACCESS_VALIDATOR_DEFAULTS: Partial<PlAccessValidatorProps> = {
  preset: 'checker',
};
