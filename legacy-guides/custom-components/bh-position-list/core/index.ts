/**
 * BhPositionList - Core Interface
 * Position DataTable with filters for BitHire ATS platform
 *
 * Types are imported from @rottay/recruiter (single source of truth).
 * The component accepts DBPosition[] directly - no mapping needed.
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../types';
import type { DBPosition } from '@rottay/recruiter';

export type BhPositionListPreset = 'table' | 'cards';

/**
 * Re-export the DB type for convenience.
 */
export type RecruiterPosition = DBPosition;

/** Available position status values for filtering */
export type PositionStatusFilter = 'all' | 'open' | 'filled' | 'closed' | 'on_hold' | 'draft' | 'pending_approval' | 'cancelled' | 'archived';

/** Hiring urgency levels for positions */
export type PositionHiringUrgency = 'low' | 'normal' | 'high' | 'urgent' | 'critical';

export interface BhPositionListProps extends EngineAwareProps {
  preset?: BhPositionListPreset;

  /** Array of positions to display - accepts DBPosition[] directly from @rottay/recruiter */
  positions?: DBPosition[];

  /** Callback when a position is clicked */
  onPositionClick?: (positionId: string) => void;

  /** Currently selected position ID */
  selectedPositionId?: string | null;

  /** Current sort field */
  sortBy?: string;

  /** Callback when sort changes */
  onSortChange?: (field: string) => void;

  /** Loading state */
  loading?: boolean;

  /** Available status filter options */
  statusFilterOptions?: PositionStatusFilter[];

  /** Currently active status filter */
  statusFilter?: PositionStatusFilter;

  /** Callback when status filter changes */
  onStatusFilterChange?: (status: PositionStatusFilter) => void;

  /** Hiring urgency filter */
  urgencyFilter?: PositionHiringUrgency | null;

  /** Callback when urgency filter changes */
  onUrgencyFilterChange?: (urgency: PositionHiringUrgency | null) => void;

  /** Department filter value */
  departmentFilter?: string | null;

  /** Callback when department filter changes */
  onDepartmentFilterChange?: (department: string | null) => void;

  /** List of department names for the department filter dropdown */
  departments?: string[];

  /** Team filter value */
  teamFilter?: string | null;

  /** Callback when team filter changes */
  onTeamFilterChange?: (team: string | null) => void;

  /** List of team names for the team filter dropdown */
  teams?: string[];

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

export const BH_POSITION_LIST_DEFAULTS: Partial<BhPositionListProps> = {
  preset: 'table',
  loading: false,
};

// ---- Backward-compatible aliases (pre-DB-migration names) ----
/** @deprecated Use RecruiterPosition (DBPosition) instead */
export type PositionListItem = RecruiterPosition;
