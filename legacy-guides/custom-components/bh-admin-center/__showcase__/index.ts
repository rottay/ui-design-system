/**
 * bh-admin-center - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type {
  SystemHealthStatus,
  ProviderHealth,
  BillingMetrics,
  GlobalKpi,
  UserSummary,
  SystemEvent,
  CostBreakdown,
  ComplianceStatus,
  AdminQuickAction,
} from '../core';

/* ── System Health ───────────────────────────────────────────────────── */

export const MOCK_SYSTEM_HEALTH: SystemHealthStatus = {
  providersUp: 4,
  providersTotal: 5,
  interviewsRunning: 12,
  tokenBalance: 284_500,
  slaCompliance: 97.3,
  avgLatencyMs: 142,
  errorRate: 0.8,
  uptime: 99.97,
};

/* ── Providers ───────────────────────────────────────────────────────── */

export const MOCK_PROVIDERS: ProviderHealth[] = [
  {
    id: 'prov-1',
    name: 'OpenAI GPT-4o',
    status: 'healthy',
    latencyMs: 89,
    circuitBreaker: 'closed',
    lastChecked: '2026-02-17T14:32:00Z',
    errorCount: 2,
    requestsPerMinute: 340,
    region: 'us-east-1',
    fallbackProvider: 'Anthropic Claude',
  },
  {
    id: 'prov-2',
    name: 'Anthropic Claude',
    status: 'healthy',
    latencyMs: 112,
    circuitBreaker: 'closed',
    lastChecked: '2026-02-17T14:31:45Z',
    errorCount: 0,
    requestsPerMinute: 185,
    region: 'us-west-2',
  },
  {
    id: 'prov-3',
    name: 'Google Gemini',
    status: 'degraded',
    latencyMs: 387,
    circuitBreaker: 'half-open',
    lastChecked: '2026-02-17T14:30:12Z',
    errorCount: 24,
    requestsPerMinute: 45,
    region: 'us-central1',
    fallbackProvider: 'OpenAI GPT-4o',
  },
  {
    id: 'prov-4',
    name: 'Whisper STT',
    status: 'healthy',
    latencyMs: 203,
    circuitBreaker: 'closed',
    lastChecked: '2026-02-17T14:32:05Z',
    errorCount: 1,
    requestsPerMinute: 78,
    region: 'us-east-1',
  },
  {
    id: 'prov-5',
    name: 'Deepgram Nova',
    status: 'down',
    latencyMs: 0,
    circuitBreaker: 'open',
    lastChecked: '2026-02-17T14:28:00Z',
    errorCount: 156,
    requestsPerMinute: 0,
    region: 'eu-west-1',
    fallbackProvider: 'Whisper STT',
  },
];

/* ── Billing ─────────────────────────────────────────────────────────── */

export const MOCK_BILLING: BillingMetrics = {
  tokenBalance: 284_500,
  burnRate: 8_420,
  monthlyTrend: [
    312_000, 298_000, 285_000, 276_000, 264_000, 258_000,
    249_000, 241_000, 237_000, 228_000, 219_000, 214_000,
  ],
  projectedRunwayDays: 34,
  monthlyCost: 4_872.50,
  costByProvider: [
    { provider: 'OpenAI GPT-4o', cost: 2_340.00 },
    { provider: 'Anthropic Claude', cost: 1_520.00 },
    { provider: 'Google Gemini', cost: 456.50 },
    { provider: 'Whisper STT', cost: 389.00 },
    { provider: 'Deepgram Nova', cost: 167.00 },
  ],
  savingsVsPrevious: 12.4,
};

/* ── Global KPIs ─────────────────────────────────────────────────────── */

export const MOCK_KPIS: GlobalKpi[] = [
  { label: 'Interviews This Month', value: 847, previousValue: 762, trend: 11.2 },
  { label: 'Avg. Score Accuracy', value: '94.6%', previousValue: '92.1%', trend: 2.7 },
  { label: 'Time to Fill (days)', value: 23.4, previousValue: 27.8, trend: -15.8 },
  { label: 'Offer Acceptance Rate', value: '82%', previousValue: '78%', trend: 5.1 },
  { label: 'Active Positions', value: 156, previousValue: 142, trend: 9.9 },
  { label: 'Candidate NPS', value: 72, previousValue: 68, trend: 5.9 },
];

/* ── Users ────────────────────────────────────────────────────────────── */

export const MOCK_USERS: UserSummary = {
  totalUsers: 284,
  byRole: {
    Admin: 8,
    'Hiring Manager': 42,
    Recruiter: 67,
    Interviewer: 124,
    Viewer: 43,
  },
  recentInvitations: 14,
  activeUsersToday: 96,
  lastLoginStats: {
    'Last 24h': 96,
    'Last 7d': 218,
    'Last 30d': 261,
    'Inactive (30d+)': 23,
  },
};

/* ── System Events ───────────────────────────────────────────────────── */

export const MOCK_EVENTS: SystemEvent[] = [
  {
    id: 'evt-1',
    type: 'provider_failure',
    message: 'Deepgram Nova: Connection timeout after 30s - circuit breaker opened',
    time: '2026-02-17T14:28:00Z',
    severity: 'critical',
    actionRequired: true,
  },
  {
    id: 'evt-2',
    type: 'quota_warning',
    message: 'Token balance below 300K threshold - projected runway 34 days',
    time: '2026-02-17T12:00:00Z',
    severity: 'high',
    actionRequired: true,
  },
  {
    id: 'evt-3',
    type: 'provider_failure',
    message: 'Google Gemini: Elevated latency (387ms avg) - circuit breaker half-open',
    time: '2026-02-17T10:15:00Z',
    severity: 'medium',
  },
  {
    id: 'evt-4',
    type: 'security_alert',
    message: 'Failed login attempts threshold exceeded for admin@acme.com (5 attempts)',
    time: '2026-02-17T08:42:00Z',
    severity: 'high',
    resolvedAt: '2026-02-17T09:10:00Z',
    resolvedBy: 'security-bot',
  },
  {
    id: 'evt-5',
    type: 'quota_warning',
    message: 'Monthly API cost approaching budget limit (87% utilized)',
    time: '2026-02-16T18:30:00Z',
    severity: 'medium',
    resolvedAt: '2026-02-16T19:00:00Z',
    resolvedBy: 'daniel.avila',
  },
  {
    id: 'evt-6',
    type: 'provider_failure',
    message: 'OpenAI GPT-4o: Rate limit hit during peak hours - auto-scaled to fallback',
    time: '2026-02-16T11:20:00Z',
    severity: 'low',
    resolvedAt: '2026-02-16T11:22:00Z',
    resolvedBy: 'auto-recovery',
  },
];

/* ── Cost Breakdown ──────────────────────────────────────────────────── */

export const MOCK_COST_BREAKDOWN: CostBreakdown[] = [
  { category: 'AI Interview Processing', amount: 2_140.00, percentage: 43.9 },
  { category: 'Resume Parsing & Scoring', amount: 890.00, percentage: 18.3 },
  { category: 'Speech-to-Text', amount: 556.00, percentage: 11.4 },
  { category: 'Candidate Matching', amount: 487.50, percentage: 10.0 },
  { category: 'Report Generation', amount: 412.00, percentage: 8.5 },
  { category: 'Email & Outreach AI', amount: 245.00, percentage: 5.0 },
  { category: 'Other', amount: 142.00, percentage: 2.9 },
];

/* ── Compliance ──────────────────────────────────────────────────────── */

export const MOCK_COMPLIANCE: ComplianceStatus = {
  dataRetention: 'ok',
  gdprRequests: 3,
  auditCompleteness: 94.2,
};

/* ── Quick Actions ──────────────────────────────────────────────────── */

export const MOCK_QUICK_ACTIONS: AdminQuickAction[] = [
  { key: 'manage-providers', label: 'Manage Providers', icon: undefined as any, description: 'Configure and monitor AI provider connections' },
  { key: 'invite-users', label: 'Invite Users', icon: undefined as any, description: 'Send invitations to new team members' },
  { key: 'view-audit-log', label: 'View Audit Log', icon: undefined as any, description: 'Review recent system activity and changes' },
  { key: 'export-report', label: 'Export Report', icon: undefined as any, description: 'Generate and download platform analytics' },
  { key: 'security-settings', label: 'Security Settings', icon: undefined as any, description: 'Configure authentication and access policies' },
];
