import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type DsarTrackerPreset = 'board' | 'table' | 'detail';

export type DsarStatus = 'new' | 'in-review' | 'processing' | 'completed' | 'rejected' | 'overdue';

export type DsarType = 'access' | 'deletion' | 'rectification' | 'portability' | 'restriction' | 'objection';

export interface DsarRequest {
  id: string;
  type: DsarType;
  status: DsarStatus;
  subject: {
    name: string;
    email: string;
    id?: string;
  };
  description?: string;
  submittedAt: Date;
  dueDate: Date;
  completedAt?: Date;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  priority: 'high' | 'medium' | 'low';
  regulation: 'gdpr' | 'ccpa' | 'lgpd' | 'other';
  notes?: string[];
  attachments?: number;
}

export interface DsarMetrics {
  total: number;
  open: number;
  completed: number;
  overdue: number;
  avgResponseDays: number;
  complianceRate: number;
}

export interface DsarTrackerProps extends EngineAwareProps {
  preset?: DsarTrackerPreset;
  requests: DsarRequest[];
  metrics?: DsarMetrics;
  selectedRequestId?: string;
  onRequestClick?: (requestId: string) => void;
  onStatusChange?: (requestId: string, status: DsarStatus) => void;
  onAssign?: (requestId: string, assigneeId: string) => void;
  onExport?: () => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const DSAR_TRACKER_DEFAULTS: Partial<DsarTrackerProps> = {
  preset: 'board',
  title: 'DSAR Tracker',
};

export function getDsarStatusColors(tokens: DesignTokens) {
  return {
    'new': { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500] },
    'in-review': { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    'processing': { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], dot: tokens.colors.primaryScale[500] },
    'completed': { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    'rejected': { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    'overdue': { bg: tokens.colors.errorScale[100], color: tokens.colors.errorScale[800], dot: tokens.colors.errorScale[600] },
  };
}

export function getDsarTypeLabel(type: DsarType): string {
  const labels: Record<DsarType, string> = {
    'access': 'Access Request',
    'deletion': 'Deletion Request',
    'rectification': 'Rectification',
    'portability': 'Data Portability',
    'restriction': 'Processing Restriction',
    'objection': 'Objection',
  };
  return labels[type];
}

export function getPriorityColors(tokens: DesignTokens) {
  return {
    high: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700] },
    medium: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700] },
    low: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600] },
  };
}

export function getDaysRemaining(dueDate: Date): number {
  return Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}
