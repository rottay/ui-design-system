import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';
import type { DesignTokens } from '../../../../core/types/tokens';

export type BhAdminCenterPreset = 'overview' | 'billing';

/* ── System Health ───────────────────────────────────────────────────── */

export interface SystemHealthStatus {
  providersUp: number;
  providersTotal: number;
  interviewsRunning: number;
  tokenBalance: number;
  slaCompliance: number;
}

export type ProviderStatusType = 'healthy' | 'degraded' | 'down';
export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface ProviderHealth {
  id: string;
  name: string;
  status: ProviderStatusType;
  latencyMs: number;
  circuitBreaker: CircuitBreakerState;
  lastChecked: string;
}

/* ── Billing ─────────────────────────────────────────────────────────── */

export interface BillingMetrics {
  tokenBalance: number;
  burnRate: number;
  monthlyTrend: number[];
  projectedRunwayDays: number;
  monthlyCost: number;
}

/* ── KPIs & Users ────────────────────────────────────────────────────── */

export interface GlobalKpi {
  label: string;
  value: string | number;
  previousValue: string | number;
  trend: number;
}

export interface UserSummary {
  totalUsers: number;
  byRole: Record<string, number>;
  recentInvitations: number;
}

/* ── Events ──────────────────────────────────────────────────────────── */

export type SystemEventType = 'provider_failure' | 'quota_warning' | 'security_alert';
export type EventSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  message: string;
  time: string;
  severity: EventSeverity;
}

/* ── Cost & Compliance ───────────────────────────────────────────────── */

export interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export type ComplianceLevel = 'ok' | 'warning' | 'error';

export interface ComplianceStatus {
  dataRetention: ComplianceLevel;
  gdprRequests: number;
  auditCompleteness: number;
}

/* ── Quick Actions ───────────────────────────────────────────────────── */

export interface AdminQuickAction {
  key: string;
  label: string;
  icon: ReactNode;
  description: string;
}

/* ── Main Props ──────────────────────────────────────────────────────── */

export interface BhAdminCenterProps extends EngineAwareProps {
  preset?: BhAdminCenterPreset;

  /* data */
  systemHealth?: SystemHealthStatus;
  providers?: ProviderHealth[];
  billing?: BillingMetrics;
  kpis?: GlobalKpi[];
  users?: UserSummary;
  events?: SystemEvent[];
  costBreakdown?: CostBreakdown[];
  compliance?: ComplianceStatus;
  quickActions?: AdminQuickAction[];

  /* callbacks */
  onProviderClick?: (providerId: string) => void;
  onEventClick?: (eventId: string) => void;
  onQuickAction?: (actionKey: string) => void;
  onDateRangeChange?: (range: string) => void;
  onExportReport?: () => void;
  onRefresh?: () => void;

  /* layout */
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export const BH_ADMIN_CENTER_DEFAULTS: Partial<BhAdminCenterProps> = {
  preset: 'overview',
  title: 'Admin Center',
  providers: [],
  kpis: [],
  events: [],
  costBreakdown: [],
  quickActions: [],
};

/* ── Helpers ─────────────────────────────────────────────────────────── */

export function getProviderStatusColors(tokens: DesignTokens) {
  return {
    healthy: { color: tokens.colors.successScale[700], bg: tokens.colors.successScale[50], dot: tokens.colors.successScale[500], border: tokens.colors.successScale[200] },
    degraded: { color: tokens.colors.warningScale[700], bg: tokens.colors.warningScale[50], dot: tokens.colors.warningScale[500], border: tokens.colors.warningScale[200] },
    down: { color: tokens.colors.errorScale[700], bg: tokens.colors.errorScale[50], dot: tokens.colors.errorScale[500], border: tokens.colors.errorScale[200] },
  };
}

export function getCircuitBreakerColors(tokens: DesignTokens) {
  return {
    closed: { color: tokens.colors.successScale[700], bg: tokens.colors.successScale[100] },
    open: { color: tokens.colors.errorScale[700], bg: tokens.colors.errorScale[100] },
    'half-open': { color: tokens.colors.warningScale[700], bg: tokens.colors.warningScale[100] },
  };
}

export function getSeverityColors(tokens: DesignTokens) {
  return {
    low: { color: tokens.colors.infoScale[700], bg: tokens.colors.infoScale[50], border: tokens.colors.infoScale[200] },
    medium: { color: tokens.colors.warningScale[700], bg: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
    high: { color: tokens.colors.errorScale[600], bg: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
    critical: { color: tokens.colors.errorScale[800], bg: tokens.colors.errorScale[100], border: tokens.colors.errorScale[300] },
  };
}

export function getComplianceColors(tokens: DesignTokens) {
  return {
    ok: { color: tokens.colors.successScale[700], bg: tokens.colors.successScale[50], border: tokens.colors.successScale[200] },
    warning: { color: tokens.colors.warningScale[700], bg: tokens.colors.warningScale[50], border: tokens.colors.warningScale[200] },
    error: { color: tokens.colors.errorScale[700], bg: tokens.colors.errorScale[50], border: tokens.colors.errorScale[200] },
  };
}

export function formatTokenBalance(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const DATE_RANGE_OPTIONS = [
  { value: '24h', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
] as const;

export type DateRangeValue = typeof DATE_RANGE_OPTIONS[number]['value'];
