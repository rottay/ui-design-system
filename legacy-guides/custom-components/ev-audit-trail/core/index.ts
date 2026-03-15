/**
 * EvAuditTrail - Core Interface
 * Audit log viewer
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvAuditTrailPreset = 'table' | 'timeline';

export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  actorRole: string;
  details: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface AuditFilter {
  entityType?: string;
  action?: string;
  actor?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface EvAuditTrailProps extends EngineAwareProps {
  preset?: EvAuditTrailPreset;
  entries?: AuditEntry[];
  filters?: AuditFilter;
  onEntryClick?: (id: string) => void;
  onFilterChange?: (filters: AuditFilter) => void;
  onExport?: () => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_AUDIT_TRAIL_DEFAULTS: Partial<EvAuditTrailProps> = {
  preset: 'table',

};
