/**
 * TenantOverviewCard - Core Interface
 * Card displaying tenant/organization overview with plan, usage,
 * status badges, and management actions
 */

import type { CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

// ============================================================================
// Type Aliases
// ============================================================================

export type TenantOverviewCardPreset = 'standard' | 'compact' | 'admin';

export type TenantPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';

// ============================================================================
// Data Interfaces
// ============================================================================

export interface TenantOverview {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  plan: TenantPlan;
  status: TenantStatus;
  userCount: number;
  userLimit: number;
  storageUsedMb: number;
  storageLimitMb: number;
  features: string[];
  createdAt: Date;
  trialEndsAt?: Date;
  mrr?: number;
  industry?: string;
}

// ============================================================================
// Props
// ============================================================================

export interface TenantOverviewCardProps extends EngineAwareProps {
  preset?: TenantOverviewCardPreset;
  tenant: TenantOverview;
  onManage?: (id: string) => void;
  onUpgrade?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onDelete?: (id: string) => void;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

// ============================================================================
// Defaults
// ============================================================================

export const TENANT_OVERVIEW_CARD_DEFAULTS: Partial<TenantOverviewCardProps> = {
  preset: 'standard',
};

// ============================================================================
// Utilities - Plan Colors
// ============================================================================

export function getPlanColors(tokens: DesignTokens) {
  return {
    free: {
      bg: tokens.colors.neutral[100],
      text: tokens.colors.neutral[700],
      border: tokens.colors.neutral[200],
    },
    starter: {
      bg: tokens.colors.infoScale[100],
      text: tokens.colors.infoScale[700],
      border: tokens.colors.infoScale[200],
    },
    professional: {
      bg: tokens.colors.primaryScale[100],
      text: tokens.colors.primaryScale[700],
      border: tokens.colors.primaryScale[200],
    },
    enterprise: {
      bg: tokens.colors.secondaryScale[100],
      text: tokens.colors.secondaryScale[700],
      border: tokens.colors.secondaryScale[200],
    },
  };
}

// ============================================================================
// Utilities - Status Colors
// ============================================================================

export function getStatusColors(tokens: DesignTokens) {
  return {
    active: {
      bg: tokens.colors.successScale[100],
      text: tokens.colors.successScale[700],
      border: tokens.colors.successScale[200],
      dot: tokens.colors.successScale[500],
    },
    trial: {
      bg: tokens.colors.warningScale[100],
      text: tokens.colors.warningScale[700],
      border: tokens.colors.warningScale[200],
      dot: tokens.colors.warningScale[500],
    },
    suspended: {
      bg: tokens.colors.errorScale[100],
      text: tokens.colors.errorScale[700],
      border: tokens.colors.errorScale[200],
      dot: tokens.colors.errorScale[500],
    },
    cancelled: {
      bg: tokens.colors.neutral[100],
      text: tokens.colors.neutral[600],
      border: tokens.colors.neutral[200],
      dot: tokens.colors.neutral[400],
    },
  };
}

// ============================================================================
// Utilities - Formatting
// ============================================================================

export function formatStorage(mb: number): string {
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(1)} GB`;
  }
  return `${Math.round(mb)} MB`;
}

export function formatMrr(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function getUsagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
}

export function getUsageColor(percent: number, tokens: DesignTokens): string {
  if (percent >= 90) return tokens.colors.errorScale[500];
  if (percent >= 70) return tokens.colors.warningScale[500];
  return tokens.colors.successScale[500];
}

export function formatPlanLabel(plan: TenantPlan): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

export function formatStatusLabel(status: TenantStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function getDaysRemaining(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
