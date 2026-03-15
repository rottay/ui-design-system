/**
 * PlPermissionAudit - Core Interface
 * Audit trail of permission changes with before/after comparison and rollback
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type PlPermissionAuditPreset = 'timeline' | 'table';

export interface PermissionAuditItem {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'pending';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlPermissionAuditProps extends EngineAwareProps {
  /** Preset to use */
  preset?: PlPermissionAuditPreset;

  /** Loading state */
  loading?: boolean;
  /** Items to display */
  items: PermissionAuditItem[];
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

export const PL_PERMISSION_AUDIT_DEFAULTS: Partial<PlPermissionAuditProps> = {
  preset: 'timeline',
};
