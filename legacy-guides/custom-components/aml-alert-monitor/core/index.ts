import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type AmlAlertMonitorPreset = 'monitor' | 'investigation' | 'analytics';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';
export type AlertStatus = 'new' | 'investigating' | 'escalated' | 'resolved' | 'dismissed';
export type AlertType = 'transaction-pattern' | 'sanctions-match' | 'pep-match' | 'unusual-activity' | 'threshold-breach' | 'velocity-alert';

export interface AmlAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  entityId: string;
  entityName: string;
  entityType: 'individual' | 'organization';
  riskScore: number;
  amount?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  notes?: string[];
}

export interface AmlAlertMonitorProps extends EngineAwareProps {
  preset?: AmlAlertMonitorPreset;
  alerts: AmlAlert[];
  onInvestigate?: (id: string) => void;
  onEscalate?: (id: string) => void;
  onResolve?: (id: string) => void;
  onDismiss?: (id: string) => void;
  onAssign?: (id: string, assignee: string) => void;
  onFileSar?: (id: string) => void;
  selectedAlertId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const AML_ALERT_MONITOR_DEFAULTS: Partial<AmlAlertMonitorProps> = {
  preset: 'monitor',
  title: 'AML Alerts',
};

export function getSeverityColors(tokens: DesignTokens) {
  return {
    critical: { color: tokens.colors.errorScale[800], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200], dot: tokens.colors.errorScale[500] },
    high: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200], dot: tokens.colors.warningScale[500] },
    medium: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200], dot: tokens.colors.infoScale[500] },
    low: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], border: tokens.colors.neutral[200], dot: tokens.colors.neutral[400] },
  };
}

export function getAlertStatusColors(tokens: DesignTokens) {
  return {
    new: { color: tokens.colors.infoScale[700], bgColor: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200] },
    investigating: { color: tokens.colors.warningScale[700], bgColor: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
    escalated: { color: tokens.colors.errorScale[700], bgColor: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    resolved: { color: tokens.colors.successScale[700], bgColor: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    dismissed: { color: tokens.colors.neutral[600], bgColor: tokens.colors.neutral[100], border: tokens.colors.neutral[200] },
  };
}

export function getAlertTypeIcon(type: AlertType): string {
  const icons: Record<AlertType, string> = {
    'transaction-pattern': '\u{1F4CA}',
    'sanctions-match': '\u{1F6AB}',
    'pep-match': '\u{1F3DB}',
    'unusual-activity': '\u{26A0}',
    'threshold-breach': '\u{1F4C8}',
    'velocity-alert': '\u{26A1}',
  };
  return icons[type];
}
