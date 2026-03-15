/**
 * PlAdminUnitManager - Core Interface
 * Manage organizational units in a hierarchical structure
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset Type ─────────────────────────────────────────────────────────────

export type PlAdminUnitManagerPreset = 'tree' | 'table';

// ─── Unit Types ──────────────────────────────────────────────────────────────

export type UnitType = 'organization' | 'division' | 'department' | 'team' | 'group';

export type UnitStatus = 'active' | 'archived';

// ─── Unit Head ───────────────────────────────────────────────────────────────

export interface UnitHead {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
}

// ─── Admin Unit ──────────────────────────────────────────────────────────────

export interface AdminUnit {
  /** Unique identifier */
  id: string;

  /** Display name of the unit */
  name: string;

  /** Unit type in the hierarchy */
  type: UnitType;

  /** Parent unit ID (null/undefined for root) */
  parentId?: string | null;

  /** Full hierarchical path as ordered segments */
  path: string[];

  /** Optional description */
  description?: string;

  /** ID of the unit manager/head */
  managerId?: string;

  /** Display name of the unit manager/head */
  managerName?: string;

  /** Number of members in this unit */
  memberCount: number;

  /** Current status */
  status: UnitStatus;

  /** Nested child units */
  children: AdminUnit[];

  /** Date the unit was created */
  createdAt: Date;

  /** Optional short code for the unit */
  code?: string;

  /** Hierarchy depth level (0 = root) */
  level: number;

  /** Unit head details (avatar, title) */
  head?: UnitHead;

  /** Optional budget allocation */
  budget?: number;

  /** Optional cost center identifier */
  costCenter?: string;

  /** Legacy alias for memberCount */
  headCount: number;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface PlAdminUnitManagerProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlAdminUnitManagerPreset;

  /** Root organizational units (with nested children) */
  units: AdminUnit[];

  /** Callback when a unit is clicked/selected */
  onUnitClick?: (unitId: string) => void;

  /** Callback to create a new unit, optionally as child of parentId */
  onCreate?: (parentId?: string) => void;

  /** Callback when a unit is moved to a new parent */
  onMove?: (unitId: string, newParentId?: string) => void;

  /** Callback when a unit is deleted */
  onDelete?: (unitId: string) => void;

  /** Callback when a unit is archived */
  onArchive?: (unitId: string) => void;

  /** Callback when a unit is edited */
  onEdit?: (unitId: string) => void;

  /** Current search query */
  searchQuery?: string;

  /** Callback when search query changes */
  onSearchChange?: (query: string) => void;

  /** IDs of currently expanded tree nodes */
  expandedIds?: string[];

  /** Callback when a tree node is toggled */
  onToggleExpand?: (unitId: string) => void;

  /** Currently selected unit ID */
  selectedUnitId?: string;

  /** Callback when a unit is selected */
  onUnitSelect?: (unitId: string) => void;

  /** Filter by unit type */
  typeFilter?: UnitType | null;

  /** Callback when type filter changes */
  onTypeFilterChange?: (type: UnitType | null) => void;

  /** Filter by status */
  statusFilter?: UnitStatus | null;

  /** Callback when status filter changes */
  onStatusFilterChange?: (status: UnitStatus | null) => void;

  /** Whether to show archived units */
  showArchived?: boolean;

  /** Whether the component is in a loading state */
  loading?: boolean;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const PL_ADMIN_UNIT_MANAGER_DEFAULTS: Partial<PlAdminUnitManagerProps> = {
  preset: 'tree',
  showArchived: false,
  loading: false,
};
