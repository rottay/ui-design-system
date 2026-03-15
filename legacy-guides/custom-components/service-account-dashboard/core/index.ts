import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type ServiceAccountDashboardPreset = 'overview' | 'detail';

export type ServiceAccountStatus = 'active' | 'inactive' | 'suspended' | 'expired';

export interface ServiceAccount {
  id: string;
  name: string;
  description?: string;
  status: ServiceAccountStatus;
  clientId: string;
  scopes: string[];
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdBy: string;
  requestCount?: number;
  rateLimitPerMinute?: number;
  ipWhitelist?: string[];
  metadata?: Record<string, string>;
}

export interface ServiceAccountDashboardProps extends EngineAwareProps {
  preset?: ServiceAccountDashboardPreset;
  accounts: ServiceAccount[];
  onCreateAccount?: () => void;
  onEditAccount?: (id: string) => void;
  onDeleteAccount?: (id: string) => void;
  onRegenerateSecret?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  selectedAccountId?: string;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const SERVICE_ACCOUNT_DASHBOARD_DEFAULTS: Partial<ServiceAccountDashboardProps> = {
  preset: 'overview',
  title: 'Service Accounts',
};

export function getStatusColors(tokens: DesignTokens) {
  return {
    active: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], border: tokens.colors.successScale[200] },
    inactive: { bg: tokens.colors.neutral[100], color: tokens.colors.neutral[600], border: tokens.colors.neutral[200] },
    suspended: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], border: tokens.colors.warningScale[200] },
    expired: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], border: tokens.colors.errorScale[200] },
  };
}
