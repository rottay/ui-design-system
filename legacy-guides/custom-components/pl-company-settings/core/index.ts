/**
 * PlCompanySettings - Core Interface
 * Configure company-specific settings, preferences, and integrations
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlCompanySettingsPreset = 'form' | 'tabs';

export interface CompanySettingsItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlCompanySettingsProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlCompanySettingsPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: CompanySettingsItem[];
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

export const PL_COMPANY_SETTINGS_DEFAULTS: Partial<PlCompanySettingsProps> = {
  preset: 'form',
};
