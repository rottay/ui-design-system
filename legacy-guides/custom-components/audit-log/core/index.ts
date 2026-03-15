import type { EngineAwareProps } from '../../../../types';

export type AuditLogPreset = 'table' | 'timeline';

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  target?: string;
  timestamp: string;
  details?: string;
  ip?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditLogProps extends EngineAwareProps {
  preset?: AuditLogPreset;
  entries: AuditEntry[];
  onFilter?: (filters: Record<string, any>) => void;
  filters?: Record<string, any>;
  searchable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AUDIT_LOG_DEFAULTS = {
  preset: 'table' as AuditLogPreset,
  entries: [],
  searchable: false,
};
