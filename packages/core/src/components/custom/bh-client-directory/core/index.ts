/**
 * BhClientDirectory - Core Interface
 * Client Management Directory for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBClient[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DBClient } from '@rottay/recruiter';

export type BhClientDirectoryPreset = 'directory' | 'cards';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterClient = DBClient;

/**
 * DB-aligned status values for filtering.
 */
export type ClientStatusFilter = 'draft' | 'pending_approval' | 'active' | 'suspended' | 'terminated' | 'archived' | 'all';

/**
 * DB-aligned tier values for filtering.
 */
export type ClientTierFilter = 'standard' | 'premium' | 'enterprise' | 'strategic' | 'all';

/**
 * DB-aligned type values for filtering.
 */
export type ClientTypeFilter = 'individual' | 'company' | 'all';

export interface ClientFilter {
  type?: ClientTypeFilter;
  status?: ClientStatusFilter;
  tier?: ClientTierFilter;
  industry?: string;
  search?: string;

  /** Filter by contract type */
  contractType?: string;

  /** Filter by assigned recruiter */
  assignedRecruiterId?: string;

  /** Filter by minimum total revenue */
  minRevenue?: number;

  /** Filter to only clients with open positions */
  hasOpenPositions?: boolean;

  /** Sort field for results */
  sortBy?: 'name' | 'revenue' | 'lastActivity' | 'positions';
}

export type ViewMode = 'list' | 'grid';

export interface BhClientDirectoryProps extends EngineAwareProps {
  preset?: BhClientDirectoryPreset;

  /** Array of clients to display - accepts DBClient[] directly from @rottay/recruiter */
  clients?: DBClient[];

  /** Active filters for the directory */
  filters?: ClientFilter;

  /** Callback when filters change */
  onFilterChange?: (filters: ClientFilter) => void;

  /** Callback when a client is selected */
  onClientSelect?: (clientId: string) => void;

  /** Currently selected client ID */
  selectedClient?: string | null;

  /** Callback when add client is triggered */
  onAddClient?: (client: Partial<DBClient>) => void;

  /** Callback when edit client is triggered */
  onEditClient?: (clientId: string, updates: Partial<DBClient>) => void;

  /** Current view mode */
  viewMode?: ViewMode;

  /** Callback when view mode changes */
  onViewModeChange?: (mode: ViewMode) => void;

  /** Total number of clients matching filters (for pagination) */
  totalCount?: number;

  /** Number of clients per page */
  pageSize?: number;

  /** Current page index (1-based) */
  currentPage?: number;

  /** Callback when page changes */
  onPageChange?: (page: number) => void;

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

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use ClientTypeFilter instead */
export type ClientType = ClientTypeFilter;
/** @deprecated Use ClientStatusFilter instead */
export type ClientStatus = ClientStatusFilter;
/** @deprecated Use ClientTierFilter instead */
export type ClientTier = ClientTierFilter;
/** @deprecated Approval status is now part of ClientStatusFilter ('pending_approval') */
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
/** @deprecated Contact info is part of DBClient directly */
export interface ClientContact {
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}
/** @deprecated Use RecruiterClient (DBClient) instead */
export type ClientItem = RecruiterClient;
