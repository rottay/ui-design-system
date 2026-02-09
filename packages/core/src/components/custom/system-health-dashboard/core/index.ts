import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type SystemHealthDashboardPreset = 'status-page' | 'ops-dashboard' | 'compact';

export type ServiceStatus = 'operational' | 'degraded' | 'partial-outage' | 'major-outage' | 'maintenance';

export interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend?: 'up' | 'down' | 'stable';
}

export interface ServiceHealth {
  id: string;
  name: string;
  status: ServiceStatus;
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastIncident?: Date;
  metrics: HealthMetric[];
}

export interface SystemHealthDashboardProps extends EngineAwareProps {
  preset?: SystemHealthDashboardPreset;
  services: ServiceHealth[];
  overallStatus?: ServiceStatus;
  onViewService?: (id: string) => void;
  onAcknowledge?: (id: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SYSTEM_HEALTH_DASHBOARD_DEFAULTS: Partial<SystemHealthDashboardProps> = {
  preset: 'status-page',
  title: 'System Status',
};

export function getServiceStatusColors(tokens: DesignTokens) {
  return {
    operational: {
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      dot: tokens.colors.successScale[500],
      border: tokens.colors.successScale[200],
    },
    degraded: {
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      dot: tokens.colors.warningScale[500],
      border: tokens.colors.warningScale[200],
    },
    'partial-outage': {
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      dot: tokens.colors.warningScale[500],
      border: tokens.colors.warningScale[200],
    },
    'major-outage': {
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      dot: tokens.colors.errorScale[500],
      border: tokens.colors.errorScale[200],
    },
    maintenance: {
      color: tokens.colors.infoScale[700],
      bgColor: tokens.colors.infoScale[50],
      dot: tokens.colors.infoScale[500],
      border: tokens.colors.infoScale[200],
    },
  };
}

export function getStatusLabel(status: ServiceStatus): string {
  const labels: Record<ServiceStatus, string> = {
    operational: 'Operational',
    degraded: 'Degraded',
    'partial-outage': 'Partial Outage',
    'major-outage': 'Major Outage',
    maintenance: 'Maintenance',
  };
  return labels[status];
}

export function getMetricHealth(metric: HealthMetric): 'healthy' | 'warning' | 'critical' {
  if (metric.value >= metric.threshold.critical) return 'critical';
  if (metric.value >= metric.threshold.warning) return 'warning';
  return 'healthy';
}
