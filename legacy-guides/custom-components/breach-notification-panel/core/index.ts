import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BreachNotificationPanelPreset = 'timeline' | 'notification' | 'summary';

export type BreachSeverity = 'critical' | 'high' | 'medium' | 'low';

export type BreachStatus = 'detected' | 'investigating' | 'contained' | 'notifying' | 'resolved' | 'closed';

export type BreachCategory = 'unauthorized-access' | 'data-leak' | 'ransomware' | 'phishing' | 'insider-threat' | 'system-compromise' | 'third-party';

export interface AffectedData {
  category: string;
  recordCount: number;
  dataTypes: string[];
}

export interface BreachNotification {
  id: string;
  recipientType: 'authority' | 'affected-users' | 'internal' | 'public';
  sentAt?: Date;
  dueDate: Date;
  status: 'pending' | 'sent' | 'acknowledged' | 'overdue';
  recipientCount?: number;
}

export interface BreachTimelineEvent {
  id: string;
  timestamp: Date;
  action: string;
  description?: string;
  actor: string;
  type: 'detection' | 'investigation' | 'containment' | 'notification' | 'resolution';
}

export interface BreachIncident {
  id: string;
  title: string;
  description?: string;
  severity: BreachSeverity;
  status: BreachStatus;
  category: BreachCategory;
  detectedAt: Date;
  reportedAt?: Date;
  resolvedAt?: Date;
  affectedUsers: number;
  affectedData: AffectedData[];
  notifications: BreachNotification[];
  timeline: BreachTimelineEvent[];
  assignee?: { id: string; name: string };
  regulatoryDeadline?: Date;
}

export interface BreachNotificationPanelProps extends EngineAwareProps {
  preset?: BreachNotificationPanelPreset;
  incidents: BreachIncident[];
  selectedIncidentId?: string;
  onIncidentClick?: (incidentId: string) => void;
  onSendNotification?: (incidentId: string, recipientType: BreachNotification['recipientType']) => void;
  onUpdateStatus?: (incidentId: string, status: BreachStatus) => void;
  onExport?: (incidentId: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const BREACH_NOTIFICATION_PANEL_DEFAULTS: Partial<BreachNotificationPanelProps> = {
  preset: 'timeline',
  title: 'Breach Management',
};

export function getBreachSeverityColors(tokens: DesignTokens) {
  return {
    critical: { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[800], dot: tokens.colors.errorScale[600], border: tokens.colors.errorScale[300] },
    high: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500], border: tokens.colors.errorScale[200] },
    medium: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500], border: tokens.colors.warningScale[200] },
    low: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500], border: tokens.colors.infoScale[200] },
  };
}

export function getBreachStatusColors(tokens: DesignTokens) {
  return {
    'detected': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    'investigating': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    'contained': { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500] },
    'notifying': { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], dot: tokens.colors.primaryScale[500] },
    'resolved': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    'closed': { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], dot: tokens.colors.neutral[400] },
  };
}

export function getCategoryLabel(category: BreachCategory): string {
  const labels: Record<BreachCategory, string> = {
    'unauthorized-access': 'Unauthorized Access',
    'data-leak': 'Data Leak',
    'ransomware': 'Ransomware',
    'phishing': 'Phishing',
    'insider-threat': 'Insider Threat',
    'system-compromise': 'System Compromise',
    'third-party': 'Third Party',
  };
  return labels[category];
}
