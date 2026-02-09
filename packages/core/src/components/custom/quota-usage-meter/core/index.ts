import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type QuotaUsageMeterPreset = 'bars' | 'cards' | 'compact';

export type QuotaStatus = 'normal' | 'warning' | 'critical' | 'exceeded';

export interface QuotaItem {
  id: string;
  label: string;
  current: number;
  limit: number;
  unit: string;
  category?: string;
  resetDate?: Date;
}

export interface QuotaUsageMeterProps extends EngineAwareProps {
  preset?: QuotaUsageMeterPreset;
  quotas: QuotaItem[];
  onUpgrade?: () => void;
  onViewDetail?: (id: string) => void;
  title?: string;
  subtitle?: string;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const QUOTA_USAGE_METER_DEFAULTS: Partial<QuotaUsageMeterProps> = {
  preset: 'bars',
  title: 'Usage',
};

export function getQuotaStatus(current: number, limit: number): QuotaStatus {
  if (limit <= 0) return 'exceeded';
  const ratio = current / limit;
  if (ratio >= 1) return 'exceeded';
  if (ratio >= 0.9) return 'critical';
  if (ratio >= 0.7) return 'warning';
  return 'normal';
}

export function getQuotaStatusColors(tokens: DesignTokens) {
  return {
    normal: {
      bar: tokens.colors.successScale[500],
      bg: tokens.colors.successScale[100],
      text: tokens.colors.successScale[700],
      badge: tokens.colors.successScale[50],
      border: tokens.colors.successScale[200],
    },
    warning: {
      bar: tokens.colors.warningScale[500],
      bg: tokens.colors.warningScale[100],
      text: tokens.colors.warningScale[700],
      badge: tokens.colors.warningScale[50],
      border: tokens.colors.warningScale[200],
    },
    critical: {
      bar: tokens.colors.errorScale[500],
      bg: tokens.colors.errorScale[100],
      text: tokens.colors.errorScale[700],
      badge: tokens.colors.errorScale[50],
      border: tokens.colors.errorScale[200],
    },
    exceeded: {
      bar: tokens.colors.errorScale[600],
      bg: tokens.colors.errorScale[100],
      text: tokens.colors.errorScale[800],
      badge: tokens.colors.errorScale[50],
      border: tokens.colors.errorScale[300],
    },
  };
}

export function formatQuotaValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

export function getUsagePercentage(current: number, limit: number): number {
  if (limit <= 0) return 100;
  return Math.min(Math.round((current / limit) * 100), 100);
}
