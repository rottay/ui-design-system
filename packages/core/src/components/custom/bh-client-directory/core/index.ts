/**
 * BhClientDirectory - Core Interface
 * Client Management Directory for BitHire ATS platform
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type BhClientDirectoryPreset = 'directory' | 'cards';

export type ClientType = 'individual' | 'company';

export type ClientStatus = 'active' | 'inactive' | 'pending_approval' | 'suspended';

export type ClientTier = 'standard' | 'premium' | 'enterprise';

export type ApprovalStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface ClientContact {
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ClientItem {
  id: string;
  name: string;
  type: ClientType;
  status: ClientStatus;
  tier: ClientTier;
  industry: string;
  positionsCount: number;
  revenue: number;
  approvalStatus: ApprovalStatus;
  contacts: ClientContact[];
  contractInfo?: {
    terms: string;
    startDate: string;
    endDate: string;
  };
  feeStructure?: {
    type: 'percentage' | 'fixed' | 'retainer';
    value: number;
    currency?: string;
  };
}

export interface ClientFilter {
  type?: ClientType | 'all';
  status?: ClientStatus | 'all';
  tier?: ClientTier | 'all';
  industry?: string;
  search?: string;
}

export type ViewMode = 'list' | 'grid';

export interface BhClientDirectoryProps extends EngineAwareProps {
  preset?: BhClientDirectoryPreset;

  /** Array of client items to display */
  clients: ClientItem[];

  /** Active filters for the directory */
  filters?: ClientFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: ClientFilter) => void;

  /** Callback when a client is selected */
  onClientSelect?: (clientId: string) => void;

  /** Currently selected client ID */
  selectedClient?: string | null;

  /** Callback when add client is triggered */
  onAddClient?: (client: Partial<ClientItem>) => void;

  /** Callback when edit client is triggered */
  onEditClient?: (clientId: string, updates: Partial<ClientItem>) => void;

  /** Current view mode */
  viewMode?: ViewMode;

  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_CLIENT_DIRECTORY_DEFAULTS: Partial<BhClientDirectoryProps> = {
  preset: 'directory',
  viewMode: 'list',
  filters: {
    type: 'all',
    status: 'all',
    tier: 'all',
    industry: '',
    search: '',
  },
};
