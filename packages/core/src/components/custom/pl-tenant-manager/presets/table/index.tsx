'use client';

/**
 * PlTenantManager - Table Preset
 * Rich data table with stats ribbon, search/filter toolbar, plan/status badges,
 * usage progress bars, region flags, MRR display, and contextual row actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlTenantManagerProps,
  Tenant,
  TenantStatus,
  TenantPlan,
} from '../../core';
import { PL_TENANT_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search,
  Plus,
  Building2,
  Users,
  Clock,
  ChevronDown,
  MoreHorizontal,
  Eye,
  Settings,
  ShieldBan,
  ShieldCheck,
  Trash2,
  X,
  Globe,
  HardDrive,
  DollarSign,
  AlertTriangle,
  Crown,
  Zap,
  Sparkles,
  TrendingUp,
  Activity,
} from 'lucide-react';

// ─── Region Flag Helper ──────────────────────────────────────────────────────

const REGION_FLAGS: Record<string, string> = {
  'us-east-1': 'US',
  'us-east-2': 'US',
  'us-west-1': 'US',
  'us-west-2': 'US',
  'eu-west-1': 'IE',
  'eu-west-2': 'GB',
  'eu-central-1': 'DE',
  'ap-southeast-1': 'SG',
  'ap-southeast-2': 'AU',
  'ap-northeast-1': 'JP',
  'ap-south-1': 'IN',
  'sa-east-1': 'BR',
  'ca-central-1': 'CA',
};

function getRegionLabel(region: string): string {
  return REGION_FLAGS[region] || region.toUpperCase().slice(0, 5);
}

// ─── Plan Config ─────────────────────────────────────────────────────────────

interface PlanConfig {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function getPlanConfig(plan: TenantPlan, tokens: DesignTokens): PlanConfig {
  const iconSize = 12;
  switch (plan) {
    case 'free':
      return {
        label: 'Free',
        icon: <Zap size={iconSize} />,
        bgColor: tokens.colors.neutral[100],
        textColor: tokens.colors.neutral[700],
        borderColor: tokens.colors.neutral[200],
      };
    case 'starter':
      return {
        label: 'Starter',
        icon: <Sparkles size={iconSize} />,
        bgColor: tokens.colors.infoScale[100],
        textColor: tokens.colors.infoScale[700],
        borderColor: tokens.colors.infoScale[200],
      };
    case 'business':
      return {
        label: 'Business',
        icon: <TrendingUp size={iconSize} />,
        bgColor: tokens.colors.secondaryScale[100],
        textColor: tokens.colors.secondaryScale[700],
        borderColor: tokens.colors.secondaryScale[200],
      };
    case 'enterprise':
      return {
        label: 'Enterprise',
        icon: <Crown size={iconSize} />,
        bgColor: tokens.colors.warningScale[100],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
      };
  }
}

// ─── Status Config ───────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function getStatusConfig(status: TenantStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
        borderColor: tokens.colors.successScale[200],
      };
    case 'inactive':
      return {
        label: 'Inactive',
        dotColor: tokens.colors.neutral[400],
        bgColor: tokens.colors.neutral[50],
        textColor: tokens.colors.neutral[600],
        borderColor: tokens.colors.neutral[200],
      };
    case 'suspended':
      return {
        label: 'Suspended',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
        borderColor: tokens.colors.errorScale[200],
      };
    case 'trial':
      return {
        label: 'Trial',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
      };
  }
}

// ─── Storage Helpers ─────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  return `${val.toFixed(val < 10 ? 1 : 0)} ${units[i]}`;
}

function getStorageColor(percent: number, tokens: DesignTokens): string {
  if (percent >= 90) return tokens.colors.errorScale[500];
  if (percent >= 70) return tokens.colors.warningScale[500];
  return tokens.colors.successScale[500];
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getTrialDaysLeft(trialEndsAt?: Date): number | null {
  if (!trialEndsAt) return null;
  const now = Date.now();
  const diff = trialEndsAt.getTime() - now;
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Table Preset ────────────────────────────────────────────────────────────

export const TablePlTenantManager = createPreset<PlTenantManagerProps>({
  name: 'PlTenantManager.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlTenantManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      tenants,
      onTenantClick,
      onCreate,
      onSuspend,
      onActivate,
      onDelete,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      filterStatus: controlledFilterStatus,
      onFilterStatus,
      filterPlan: controlledFilterPlan,
      onFilterPlan,
      loading = false,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalFilterStatus, setInternalFilterStatus] = useState<TenantStatus | null>(null);
    const [internalFilterPlan, setInternalFilterPlan] = useState<TenantPlan | null>(null);
    const [hoveredTenantId, setHoveredTenantId] = useState<string | null>(null);
    const [openActionsId, setOpenActionsId] = useState<string | null>(null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showPlanDropdown, setShowPlanDropdown] = useState(false);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const filterStatus = controlledFilterStatus ?? internalFilterStatus;
    const filterPlan = controlledFilterPlan ?? internalFilterPlan;

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleFilterStatus = useCallback((status: TenantStatus | null) => {
      if (controlledFilterStatus === undefined) setInternalFilterStatus(status);
      onFilterStatus?.(status);
      setShowStatusDropdown(false);
    }, [controlledFilterStatus, onFilterStatus]);

    const handleFilterPlan = useCallback((plan: TenantPlan | null) => {
      if (controlledFilterPlan === undefined) setInternalFilterPlan(plan);
      onFilterPlan?.(plan);
      setShowPlanDropdown(false);
    }, [controlledFilterPlan, onFilterPlan]);

    // ─── Filtered Tenants ────────────────────────────────────────────────

    const filteredTenants = useMemo(() => {
      let result = [...tenants];

      if (filterStatus) {
        result = result.filter(t => t.status === filterStatus);
      }

      if (filterPlan) {
        result = result.filter(t => t.plan === filterPlan);
      }

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(t =>
          t.name.toLowerCase().includes(lower) ||
          t.slug.toLowerCase().includes(lower) ||
          t.ownerName.toLowerCase().includes(lower) ||
          t.ownerEmail.toLowerCase().includes(lower) ||
          (t.domain && t.domain.toLowerCase().includes(lower))
        );
      }

      return result;
    }, [tenants, filterStatus, filterPlan, searchQuery]);

    // ─── Stats ───────────────────────────────────────────────────────────

    const stats = useMemo(() => {
      const totalTenants = tenants.length;
      const activeTenants = tenants.filter(t => t.status === 'active').length;
      const trialTenants = tenants.filter(t => t.status === 'trial').length;
      const totalUsers = tenants.reduce((sum, t) => sum + t.usersCount, 0);
      const totalMrr = tenants.reduce((sum, t) => sum + (t.mrr || 0), 0);
      return { totalTenants, activeTenants, trialTenants, totalUsers, totalMrr };
    }, [tenants]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Loading ─────────────────────────────────────────────────────────

    if (loading) {
      return (
        <div
          className={className}
          style={{
            padding: tokens.spacing[6],
            backgroundColor: tokens.colors.neutral[50],
            minHeight: '100%',
            fontFamily: 'inherit',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...style,
          }}
        >
          <Spinner size="lg" />
        </div>
      );
    }

    // ─── Render: Stats Ribbon ────────────────────────────────────────────

    const renderStatsRibbon = () => {
      const statItems = [
        {
          label: 'Total Tenants',
          value: stats.totalTenants.toLocaleString(),
          icon: <Building2 size={18} />,
          color: tokens.colors.primaryScale[600],
          bg: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: stats.activeTenants.toLocaleString(),
          icon: <Activity size={18} />,
          color: tokens.colors.successScale[600],
          bg: tokens.colors.successScale[50],
        },
        {
          label: 'Trial',
          value: stats.trialTenants.toLocaleString(),
          icon: <AlertTriangle size={18} />,
          color: tokens.colors.warningScale[600],
          bg: tokens.colors.warningScale[50],
        },
        {
          label: 'Total Users',
          value: stats.totalUsers.toLocaleString(),
          icon: <Users size={18} />,
          color: tokens.colors.infoScale[600],
          bg: tokens.colors.infoScale[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[5],
        }}>
          {statItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
                ...(isModern ? glassCardStyle : {}),
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: item.bg,
                color: item.color,
                flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  marginBottom: 2,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.03em',
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize['xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Header ──────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[5],
      }}>
        <div>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            Tenant Manager
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage tenant organizations, plans, and usage across your platform
          </p>
        </div>
        {onCreate && (
          <button
            onClick={onCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              boxShadow: tokens.shadows.sm,
              outline: 'none',
            }}
          >
            <Plus size={16} />
            New Tenant
          </button>
        )}
      </div>
    );

    // ─── Render: Filter Bar ──────────────────────────────────────────────

    const renderFilterBar = () => {
      const allStatuses: TenantStatus[] = ['active', 'inactive', 'suspended', 'trial'];
      const allPlans: TenantPlan[] = ['free', 'starter', 'business', 'enterprise'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Status filter dropdown */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowPlanDropdown(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterStatus ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: filterStatus ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: filterStatus ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              {filterStatus ? getStatusConfig(filterStatus, tokens).label : 'All Statuses'}
              <ChevronDown size={14} />
            </button>
            {showStatusDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 180,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
              }}>
                <div
                  onClick={() => handleFilterStatus(null)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: !filterStatus ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: !filterStatus ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  All Statuses
                </div>
                {allStatuses.map(status => {
                  const cfg = getStatusConfig(status, tokens);
                  return (
                    <div
                      key={status}
                      onClick={() => handleFilterStatus(status)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filterStatus === status ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filterStatus === status ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <span style={createStatusDotStyle(tokens, cfg.dotColor)} />
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Plan filter dropdown */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => {
                setShowPlanDropdown(!showPlanDropdown);
                setShowStatusDropdown(false);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterPlan ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                backgroundColor: filterPlan ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                color: filterPlan ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              {filterPlan ? getPlanConfig(filterPlan, tokens).label : 'All Plans'}
              <ChevronDown size={14} />
            </button>
            {showPlanDropdown && (
              <div style={{
                position: 'absolute' as const,
                top: '100%',
                left: 0,
                marginTop: tokens.spacing[1],
                minWidth: 180,
                backgroundColor: tokens.colors.common.white,
                borderRadius: tokens.borderRadius.lg,
                boxShadow: tokens.shadows.lg,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                zIndex: 50,
                padding: `${tokens.spacing[1]}px 0`,
              }}>
                <div
                  onClick={() => handleFilterPlan(null)}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: !filterPlan ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                    backgroundColor: !filterPlan ? tokens.colors.primaryScale[50] : 'transparent',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  All Plans
                </div>
                {allPlans.map(plan => {
                  const cfg = getPlanConfig(plan, tokens);
                  return (
                    <div
                      key={plan}
                      onClick={() => handleFilterPlan(plan)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        color: filterPlan === plan ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                        backgroundColor: filterPlan === plan ? tokens.colors.primaryScale[50] : 'transparent',
                        cursor: 'pointer',
                        transition: `all ${tokens.motion.hover}`,
                      }}
                    >
                      <span style={{ color: cfg.textColor }}>{cfg.icon}</span>
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ flex: 1 }} />

          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 280,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={16} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search tenants by name, slug, owner..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[800],
                backgroundColor: 'transparent',
                flex: 1,
                padding: 0,
              }}
            />
            {searchQuery && (
              <X
                size={14}
                color={tokens.colors.neutral[400]}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSearchChange('')}
              />
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Plan Badge ──────────────────────────────────────────────

    const renderPlanBadge = (plan: TenantPlan) => {
      const cfg = getPlanConfig(plan, tokens);
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          backgroundColor: cfg.bgColor,
          color: cfg.textColor,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${cfg.borderColor}`,
          whiteSpace: 'nowrap' as const,
        }}>
          {cfg.icon}
          {cfg.label}
        </span>
      );
    };

    // ─── Render: Status Badge ────────────────────────────────────────────

    const renderStatusBadge = (status: TenantStatus) => {
      const cfg = getStatusConfig(status, tokens);
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          backgroundColor: cfg.bgColor,
          color: cfg.textColor,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${cfg.borderColor}`,
          whiteSpace: 'nowrap' as const,
        }}>
          <span style={createStatusDotStyle(tokens, cfg.dotColor)} />
          {cfg.label}
        </span>
      );
    };

    // ─── Render: Users Progress ──────────────────────────────────────────

    const renderUsersProgress = (tenant: Tenant) => {
      const percent = tenant.maxUsers > 0
        ? Math.round((tenant.usersCount / tenant.maxUsers) * 100)
        : 0;
      const barColor = percent >= 90
        ? tokens.colors.errorScale[500]
        : percent >= 70
          ? tokens.colors.warningScale[500]
          : tokens.colors.primaryScale[500];

      const { track, fill } = createProgressBarStyle(tokens, { color: barColor, percent });

      return (
        <div style={{ minWidth: 100 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 3,
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.neutral[700],
            }}>
              {tenant.usersCount.toLocaleString()}
            </span>
            <span style={{
              fontSize: '10px',
              color: tokens.colors.neutral[400],
            }}>
              /{tenant.maxUsers.toLocaleString()}
            </span>
          </div>
          <div style={{ ...track, height: 4 }}>
            <div style={{ ...fill, height: 4 }} />
          </div>
        </div>
      );
    };

    // ─── Render: Storage Bar ─────────────────────────────────────────────

    const renderStorageBar = (tenant: Tenant) => {
      const percent = tenant.storageLimit > 0
        ? Math.round((tenant.storageUsed / tenant.storageLimit) * 100)
        : 0;
      const barColor = getStorageColor(percent, tokens);
      const { track, fill } = createProgressBarStyle(tokens, { color: barColor, percent });

      return (
        <div style={{ minWidth: 90 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 3,
          }}>
            <span style={{
              fontSize: '10px',
              color: tokens.colors.neutral[600],
            }}>
              {formatBytes(tenant.storageUsed)}
            </span>
            <span style={{
              fontSize: '10px',
              color: tokens.colors.neutral[400],
            }}>
              {percent}%
            </span>
          </div>
          <div style={{ ...track, height: 4 }}>
            <div style={{ ...fill, height: 4 }} />
          </div>
        </div>
      );
    };

    // ─── Render: Trial Countdown ─────────────────────────────────────────

    const renderTrialCountdown = (tenant: Tenant) => {
      if (tenant.status !== 'trial') return null;
      const days = getTrialDaysLeft(tenant.trialEndsAt);
      if (days === null) return null;

      const isUrgent = days <= 3;
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: `2px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: '10px',
          fontWeight: tokens.typography.fontWeight.semibold,
          backgroundColor: isUrgent ? tokens.colors.errorScale[50] : tokens.colors.warningScale[50],
          color: isUrgent ? tokens.colors.errorScale[700] : tokens.colors.warningScale[700],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isUrgent ? tokens.colors.errorScale[200] : tokens.colors.warningScale[200]}`,
          whiteSpace: 'nowrap' as const,
        }}>
          <AlertTriangle size={10} />
          {days === 0 ? 'Expires today' : `${days}d left`}
        </span>
      );
    };

    // ─── Render: Actions Menu ────────────────────────────────────────────

    const renderActionsMenu = (tenant: Tenant) => {
      const isOpen = openActionsId === tenant.id;

      const menuItems: Array<{
        label: string;
        icon: React.ReactNode;
        color: string;
        onClick: () => void;
        divider?: boolean;
      }> = [
        {
          label: 'View Details',
          icon: <Eye size={14} />,
          color: tokens.colors.neutral[700],
          onClick: () => { onTenantClick?.(tenant.id); setOpenActionsId(null); },
        },
        {
          label: 'Settings',
          icon: <Settings size={14} />,
          color: tokens.colors.neutral[700],
          onClick: () => { onTenantClick?.(tenant.id); setOpenActionsId(null); },
        },
      ];

      if (tenant.status === 'active' || tenant.status === 'trial') {
        menuItems.push({
          label: 'Suspend',
          icon: <ShieldBan size={14} />,
          color: tokens.colors.warningScale[600],
          onClick: () => { onSuspend?.(tenant.id); setOpenActionsId(null); },
          divider: true,
        });
      }

      if (tenant.status === 'suspended' || tenant.status === 'inactive') {
        menuItems.push({
          label: 'Activate',
          icon: <ShieldCheck size={14} />,
          color: tokens.colors.successScale[600],
          onClick: () => { onActivate?.(tenant.id); setOpenActionsId(null); },
          divider: true,
        });
      }

      menuItems.push({
        label: 'Delete',
        icon: <Trash2 size={14} />,
        color: tokens.colors.errorScale[600],
        onClick: () => { onDelete?.(tenant.id); setOpenActionsId(null); },
      });

      return (
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenActionsId(isOpen ? null : tenant.id);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: isOpen ? tokens.colors.neutral[100] : tokens.colors.common.white,
              color: tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <MoreHorizontal size={16} />
          </button>
          {isOpen && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              right: 0,
              marginTop: tokens.spacing[1],
              minWidth: 180,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 100,
              padding: `${tokens.spacing[1]}px 0`,
              overflow: 'hidden' as const,
            }}>
              {menuItems.map((item, idx) => (
                <div key={idx}>
                  {item.divider && (
                    <div style={{
                      height: 1,
                      backgroundColor: tokens.colors.neutral[100],
                      margin: `${tokens.spacing[1]}px 0`,
                    }} />
                  )}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onClick();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: item.color,
                      cursor: 'pointer',
                      transition: `background-color ${tokens.motion.hover}`,
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Table Header ────────────────────────────────────────────

    const renderTableHeader = () => (
      <thead>
        <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
          {[
            { label: 'Tenant', width: undefined },
            { label: 'Plan', width: 110 },
            { label: 'Status', width: 120 },
            { label: 'Users', width: 130 },
            { label: 'Region', width: 80 },
            { label: 'MRR', width: 80 },
            { label: 'Storage', width: 120 },
            { label: 'Last Active', width: 110 },
            { label: '', width: 50 },
          ].map((col, idx) => (
            <th
              key={idx}
              style={{
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                textAlign: 'left' as const,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                whiteSpace: 'nowrap' as const,
                ...(col.width ? { width: col.width } : {}),
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
    );

    // ─── Render: Table Row ───────────────────────────────────────────────

    const renderTableRow = (tenant: Tenant, idx: number) => {
      const isHovered = hoveredTenantId === tenant.id;
      const isLast = idx === filteredTenants.length - 1;

      return (
        <tr
          key={tenant.id}
          onMouseEnter={() => setHoveredTenantId(tenant.id)}
          onMouseLeave={() => {
            setHoveredTenantId(null);
            if (openActionsId === tenant.id) setOpenActionsId(null);
          }}
          onClick={() => onTenantClick?.(tenant.id)}
          style={{
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Tenant: Logo + Name + Slug */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
              {/* Logo or initial */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden' as const,
              }}>
                {tenant.logo ? (
                  <img
                    src={tenant.logo}
                    alt={tenant.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover' as const,
                    }}
                  />
                ) : (
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {tenant.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[900],
                    whiteSpace: 'nowrap' as const,
                    overflow: 'hidden' as const,
                    textOverflow: 'ellipsis' as const,
                  }}>
                    {tenant.name}
                  </span>
                  {renderTrialCountdown(tenant)}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  marginTop: 1,
                }}>
                  {tenant.slug}
                  {tenant.domain && (
                    <span style={{ marginLeft: tokens.spacing[2], color: tokens.colors.neutral[300] }}>
                      ({tenant.domain})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </td>

          {/* Plan */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            {renderPlanBadge(tenant.plan)}
          </td>

          {/* Status */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            {renderStatusBadge(tenant.status)}
          </td>

          {/* Users */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            {renderUsersProgress(tenant)}
          </td>

          {/* Region */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <Globe size={12} color={tokens.colors.neutral[400]} />
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[600],
              }}>
                {getRegionLabel(tenant.region)}
              </span>
            </div>
          </td>

          {/* MRR */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tenant.mrr && tenant.mrr > 0 ? tokens.colors.successScale[700] : tokens.colors.neutral[400],
            }}>
              {tenant.mrr ? formatCurrency(tenant.mrr) : '--'}
            </span>
          </td>

          {/* Storage */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            {renderStorageBar(tenant)}
          </td>

          {/* Last Active */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <Clock size={12} color={tokens.colors.neutral[400]} />
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                whiteSpace: 'nowrap' as const,
              }}>
                {tenant.lastActive
                  ? formatDistanceToNow(tenant.lastActive, { addSuffix: true })
                  : 'Never'}
              </span>
            </div>
          </td>

          {/* Actions */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[2]}px`,
            borderBottom: !isLast ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none',
          }}>
            <div style={{
              opacity: isHovered ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
            }}>
              {renderActionsMenu(tenant)}
            </div>
          </td>
        </tr>
      );
    };

    // ─── Render: Empty State ─────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
        ...(isModern ? glassCardStyle : {}),
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[4],
        }}>
          <Building2 size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery || filterStatus || filterPlan
            ? 'No tenants match your filters'
            : 'No tenants yet'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filterStatus || filterPlan
            ? 'Try adjusting your search query or filters to find the tenant you are looking for.'
            : 'Create your first tenant to start managing organizations on your platform.'}
        </div>
        {onCreate && !(searchQuery || filterStatus || filterPlan) && (
          <button
            onClick={onCreate}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[5]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              border: 'none',
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              boxShadow: tokens.shadows.sm,
              outline: 'none',
            }}
          >
            <Plus size={16} />
            Create First Tenant
          </button>
        )}
      </div>
    );

    // ─── Main Render ─────────────────────────────────────────────────────

    return (
      <div
        className={className}
        style={{
          padding: tokens.spacing[6],
          backgroundColor: tokens.colors.neutral[50],
          minHeight: '100%',
          fontFamily: 'inherit',
          ...style,
        }}
        onClick={() => {
          setOpenActionsId(null);
          setShowStatusDropdown(false);
          setShowPlanDropdown(false);
        }}
      >
        {renderHeader()}
        {renderStatsRibbon()}
        {renderFilterBar()}

        {filteredTenants.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
            overflow: 'hidden' as const,
            ...(isModern ? glassCardStyle : {}),
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse' as const,
              tableLayout: 'auto' as const,
            }}>
              {renderTableHeader()}
              <tbody>
                {filteredTenants.map((tenant, idx) => renderTableRow(tenant, idx))}
              </tbody>
            </table>

            {/* Footer summary */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              backgroundColor: tokens.colors.neutral[50],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                Showing {filteredTenants.length} of {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
              </span>
              {stats.totalMrr > 0 && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.successScale[700],
                }}>
                  <DollarSign size={12} />
                  Total MRR: {formatCurrency(stats.totalMrr)}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
});
