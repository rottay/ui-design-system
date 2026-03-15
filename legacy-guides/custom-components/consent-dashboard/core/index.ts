import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type ConsentDashboardPreset = 'overview' | 'manager' | 'audit';

export type ConsentStatus = 'granted' | 'denied' | 'withdrawn' | 'expired' | 'pending';

export type ConsentPurpose = 'marketing' | 'analytics' | 'personalization' | 'essential' | 'third-party' | 'data-sharing';

export interface ConsentRecord {
  id: string;
  purpose: ConsentPurpose;
  label: string;
  description: string;
  status: ConsentStatus;
  grantedAt?: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  version: string;
  isRequired?: boolean;
  dataCategories?: string[];
}

export interface ConsentAuditEntry {
  id: string;
  consentId: string;
  action: 'granted' | 'denied' | 'withdrawn' | 'updated' | 'expired';
  timestamp: Date;
  actor: string;
  ipAddress?: string;
  previousStatus?: ConsentStatus;
  newStatus: ConsentStatus;
  source: 'user' | 'system' | 'api' | 'admin';
}

export interface ConsentSummary {
  totalConsents: number;
  granted: number;
  denied: number;
  withdrawn: number;
  expired: number;
  pending: number;
  complianceRate: number;
}

export interface ConsentDashboardProps extends EngineAwareProps {
  preset?: ConsentDashboardPreset;
  consents: ConsentRecord[];
  auditLog?: ConsentAuditEntry[];
  summary?: ConsentSummary;
  onConsentToggle?: (consentId: string, granted: boolean) => void;
  onWithdraw?: (consentId: string) => void;
  onViewHistory?: (consentId: string) => void;
  onExport?: () => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const CONSENT_DASHBOARD_DEFAULTS: Partial<ConsentDashboardProps> = {
  preset: 'overview',
  title: 'Consent Management',
};

export function getConsentStatusColors(tokens: DesignTokens) {
  return {
    granted: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
    denied: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    withdrawn: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
    expired: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[500], dot: tokens.colors.neutral[400] },
    pending: { bg: tokens.colors.infoScale[50], color: tokens.colors.infoScale[700], dot: tokens.colors.infoScale[500] },
  };
}

export function getPurposeIcon(purpose: ConsentPurpose): string {
  const icons: Record<ConsentPurpose, string> = {
    'marketing': '📢',
    'analytics': '📊',
    'personalization': '🎯',
    'essential': '⚙',
    'third-party': '🔗',
    'data-sharing': '📤',
  };
  return icons[purpose];
}
