/**
 * PlCompanyManager - Core Interface
 * Manage companies with detailed metrics, health scores, and contact information
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlCompanyManagerPreset = 'table' | 'cards';

export type CompanyStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type Industry = 'technology' | 'finance' | 'healthcare' | 'education' | 'retail' | 'manufacturing' | 'other';

export interface Company {
  id: string;
  name: string;
  status: CompanyStatus;
  size: CompanySize;
  industry: Industry;
  website?: string;
  logo?: string;
  contactName: string;
  contactEmail: string;
  phone?: string;
  country: string;
  employeeCount: number;
  subscriptionPlan?: string;
  mrr?: number;
  createdAt: Date;
  lastActive?: Date;
  healthScore?: number;
}

export interface PlCompanyManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlCompanyManagerPreset;

  /** Companies to display */
  companies: Company[];

  /** Callback when a company is clicked */
  onCompanyClick?: (companyId: string) => void;

  /** Callback when create is clicked */
  onCreate?: () => void;

  /** Callback when delete is clicked */
  onDelete?: (companyId: string) => void;

  /** Controlled search query */
  searchQuery?: string;

  /** Callback when search changes */
  onSearchChange?: (query: string) => void;

  /** Controlled status filter */
  filterStatus?: CompanyStatus | null;

  /** Callback when status filter changes */
  onFilterStatus?: (status: CompanyStatus | null) => void;

  /** Loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const PL_COMPANY_MANAGER_DEFAULTS: Partial<PlCompanyManagerProps> = {
  preset: 'table',
};
