import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type IncidentTrackerPreset = 'board' | 'table' | 'detail';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'identified' | 'mitigating' | 'resolved' | 'closed';

export interface IncidentUpdate {
  id: string;
  timestamp: Date;
  message: string;
  author: string;
  status?: IncidentStatus;
}

export interface Incident {
  id: string;
  title: string;
  description?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  type: 'security' | 'infrastructure' | 'data' | 'access' | 'compliance';
  reportedAt: Date;
  resolvedAt?: Date;
  assignee?: { id: string; name: string; avatar?: string };
  affectedSystems?: string[];
  updates: IncidentUpdate[];
  impactLevel?: string;
  rootCause?: string;
}

export interface IncidentTrackerProps extends EngineAwareProps {
  preset?: IncidentTrackerPreset;
  incidents: Incident[];
  selectedIncidentId?: string;
  onIncidentClick?: (incidentId: string) => void;
  onStatusChange?: (incidentId: string, status: IncidentStatus) => void;
  onAssign?: (incidentId: string) => void;
  onAddUpdate?: (incidentId: string, message: string) => void;
  onCreate?: () => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const INCIDENT_TRACKER_DEFAULTS: Partial<IncidentTrackerProps> = {
  preset: 'board',
  title: 'Incident Tracker',
};

export function getIncidentSeverityColors(tokens: DesignTokens) {
  return {
    critical: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[800], dot: tokens.colors.errorScale[600] },
    high: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    medium: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    low: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500] },
  };
}

export function getIncidentStatusColors(tokens: DesignTokens) {
  return {
    open: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    investigating: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    identified: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500] },
    mitigating: { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], dot: tokens.colors.primaryScale[500] },
    resolved: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    closed: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], dot: tokens.colors.neutral[400] },
  };
}
