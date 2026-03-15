'use client';

/**
 * PlTenantPlanManager - Overview Preset
 * Plan overview dashboard with stats summary, pricing-style plan cards,
 * feature lists, usage limits, revenue display, and action buttons.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createSurfaceStyle,
  createStatusDotStyle,
  createAccentBarStyle,
} from '../../../helpers';
import type {
  PlTenantPlanManagerProps,
  TenantPlan,
  PlanTier,
  PlanStatus,
  PlanFeature,
} from '../../core';
import { PL_TENANT_PLAN_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  CreditCard,
  Users,
  TrendingUp,
  BarChart3,
  Check,
  X,
  Plus,
  Edit3,
  Copy,
  Archive,
  Star,
  Zap,
  Shield,
  Crown,
  HardDrive,
  Gauge,
  DollarSign,
  Layers,
} from 'lucide-react';

// ─── Tier Config ──────────────────────────────────────────────────────────

interface TierConfig {
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  accentColor: string;
}

function getTierConfig(tier: PlanTier, tokens: DesignTokens): TierConfig {
  const iconSize = 16;
  switch (tier) {
    case 'free':
      return {
        label: 'Free',
        icon: <Layers size={iconSize} />,
        color: tokens.colors.neutral[700],
        bgColor: tokens.colors.neutral[100],
        borderColor: tokens.colors.neutral[300],
        accentColor: tokens.colors.neutral[500],
      };
    case 'starter':
      return {
        label: 'Starter',
        icon: <Zap size={iconSize} />,
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[100],
        borderColor: tokens.colors.infoScale[300],
        accentColor: tokens.colors.infoScale[500],
      };
    case 'business':
      return {
        label: 'Business',
        icon: <Shield size={iconSize} />,
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
        borderColor: tokens.colors.primaryScale[300],
        accentColor: tokens.colors.primaryScale[500],
      };
    case 'enterprise':
      return {
        label: 'Enterprise',
        icon: <Crown size={iconSize} />,
        color: tokens.colors.warningScale[700],
        bgColor: tokens.colors.warningScale[100],
        borderColor: tokens.colors.warningScale[300],
        accentColor: tokens.colors.warningScale[500],
      };
  }
}

// ─── Status Config ────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
}

function getStatusConfig(status: PlanStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
      };
    case 'deprecated':
      return {
        label: 'Deprecated',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
      };
    case 'draft':
      return {
        label: 'Draft',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
      };
  }
}

// ─── Formatters ───────────────────────────────────────────────────────────

function formatPrice(cents: number): string {
  if (cents === 0) return 'Free';
  const dollars = cents / 100;
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatRevenue(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  return `$${dollars.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toLocaleString();
}

// ─── Overview Preset ──────────────────────────────────────────────────────

export const OverviewPlTenantPlanManager = createPreset<PlTenantPlanManagerProps>({
  name: 'PlTenantPlanManager.Overview',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlTenantPlanManagerProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      plans,
      onPlanClick,
      onCreate,
      onEdit,
      onDeprecate,
      onDuplicate,
      loading = false,
      emptyText = PL_TENANT_PLAN_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
    const [hoveredActionId, setHoveredActionId] = useState<string | null>(null);

    // ─── Computed Stats ─────────────────────────────────────────────────

    const stats = useMemo(() => {
      const totalPlans = plans.length;
      const activePlans = plans.filter(p => p.status === 'active').length;
      const totalSubscribers = plans.reduce((sum, p) => sum + p.subscriberCount, 0);
      const totalRevenue = plans.reduce((sum, p) => sum + p.revenue, 0);
      return { totalPlans, activePlans, totalSubscribers, totalRevenue };
    }, [plans]);

    // ─── Sort: highlighted first, then by tier weight ───────────────────

    const sortedPlans = useMemo(() => {
      const tierWeight: Record<PlanTier, number> = { free: 0, starter: 1, business: 2, enterprise: 3 };
      return [...plans].sort((a, b) => {
        if (a.highlighted && !b.highlighted) return -1;
        if (!a.highlighted && b.highlighted) return 1;
        return tierWeight[a.tier] - tierWeight[b.tier];
      });
    }, [plans]);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Loading State ──────────────────────────────────────────────────

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

    // ─── Render: Header ─────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[6],
      }}>
        <div>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            Plan Management
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Configure pricing tiers, features, and usage limits for your tenants
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
            Create Plan
          </button>
        )}
      </div>
    );

    // ─── Render: Stats Bar ──────────────────────────────────────────────

    const renderStatsBar = () => {
      const statItems = [
        {
          label: 'Total Plans',
          value: stats.totalPlans.toString(),
          icon: <Layers size={18} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active Plans',
          value: stats.activePlans.toString(),
          icon: <Check size={18} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Total Subscribers',
          value: formatSubscribers(stats.totalSubscribers),
          icon: <Users size={18} />,
          color: tokens.colors.infoScale[600],
          bgColor: tokens.colors.infoScale[50],
        },
        {
          label: 'Total Revenue',
          value: formatRevenue(stats.totalRevenue),
          icon: <TrendingUp size={18} />,
          color: tokens.colors.warningScale[600],
          bgColor: tokens.colors.warningScale[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[6],
        }}>
          {statItems.map((stat, idx) => (
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
                width: 44,
                height: 44,
                borderRadius: tokens.borderRadius.lg,
                backgroundColor: stat.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.neutral[500],
                  marginBottom: tokens.spacing[1],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize['xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Feature Row ────────────────────────────────────────────

    const renderFeatureRow = (feature: PlanFeature, idx: number, total: number) => (
      <div
        key={idx}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px 0`,
          borderBottom: idx < total - 1
            ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
            : 'none',
        }}
      >
        <div style={{
          width: 20,
          height: 20,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: feature.included
            ? tokens.colors.successScale[50]
            : tokens.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          {feature.included ? (
            <Check size={12} color={tokens.colors.successScale[600]} />
          ) : (
            <X size={12} color={tokens.colors.neutral[400]} />
          )}
        </div>
        <span style={{
          fontSize: tokens.typography.fontSize.sm,
          color: feature.included
            ? tokens.colors.neutral[700]
            : tokens.colors.neutral[400],
          fontWeight: tokens.typography.fontWeight.normal,
          flex: 1,
          textDecoration: feature.included ? 'none' : 'line-through',
        }}>
          {feature.name}
        </span>
        {feature.limit !== undefined && feature.included && (
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.primaryScale[600],
            backgroundColor: tokens.colors.primaryScale[50],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
            borderRadius: tokens.borderRadius.full,
            flexShrink: 0,
          }}>
            {typeof feature.limit === 'number' ? feature.limit.toLocaleString() : feature.limit}
          </span>
        )}
      </div>
    );

    // ─── Render: Limit Row ──────────────────────────────────────────────

    const renderLimitRow = (
      icon: React.ReactNode,
      label: string,
      value: string | number,
      color: string,
      bgColor: string,
    ) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${tokens.spacing[2]}px 0`,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
        }}>
          <div style={{ color, display: 'flex', alignItems: 'center' }}>
            {icon}
          </div>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.normal,
            color: tokens.colors.neutral[600],
          }}>
            {label}
          </span>
        </div>
        <span style={{
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          color,
          backgroundColor: bgColor,
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.md,
        }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
    );

    // ─── Render: Plan Card ──────────────────────────────────────────────

    const renderPlanCard = (plan: TenantPlan) => {
      const tierCfg = getTierConfig(plan.tier, tokens);
      const statusCfg = getStatusConfig(plan.status, tokens);
      const isHovered = hoveredPlanId === plan.id;
      const isHighlighted = plan.highlighted === true;

      return (
        <div
          key={plan.id}
          style={{
            ...createCardStyle(tokens, { elevation: isHighlighted ? 'md' : 'sm', glass: isModern, padding: 0 }),
            display: 'flex',
            flexDirection: 'column' as const,
            overflow: 'hidden' as const,
            transition: `all ${tokens.motion.hover}`,
            transform: isHovered ? tokens.motion.transform : 'none',
            boxShadow: isHovered
              ? tokens.shadows.lg
              : isHighlighted ? tokens.shadows.md : tokens.shadows.sm,
            border: isHighlighted
              ? `2px solid ${tierCfg.accentColor}`
              : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            position: 'relative' as const,
            ...(isModern ? glassCardStyle : {}),
            ...(isHighlighted && isModern && tokens.glass ? {
              border: `2px solid ${tierCfg.accentColor}`,
            } : {}),
          }}
          onMouseEnter={() => setHoveredPlanId(plan.id)}
          onMouseLeave={() => setHoveredPlanId(null)}
          onClick={() => onPlanClick?.(plan.id)}
        >
          {/* Accent bar for highlighted plans */}
          {isHighlighted && (
            <div style={{
              ...createAccentBarStyle(tokens, { position: 'top', color: tierCfg.accentColor }),
              height: 4,
            }} />
          )}

          {/* Highlighted badge */}
          {isHighlighted && (
            <div style={{
              position: 'absolute' as const,
              top: isHighlighted ? tokens.spacing[3] : tokens.spacing[2],
              right: tokens.spacing[3],
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              backgroundColor: tokens.colors.warningScale[100],
              color: tokens.colors.warningScale[700],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
            }}>
              <Star size={10} />
              Popular
            </div>
          )}

          {/* Card header: tier badge + plan name + price */}
          <div style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            {/* Tier badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tierCfg.bgColor,
              color: tierCfg.color,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              marginBottom: tokens.spacing[3],
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tierCfg.borderColor}`,
            }}>
              {tierCfg.icon}
              {tierCfg.label}
            </div>

            {/* Plan name */}
            <div style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              {plan.name}
            </div>

            {/* Description */}
            {plan.description && (
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[3],
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}>
                {plan.description}
              </div>
            )}

            {/* Price */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: tokens.spacing[1],
              marginBottom: tokens.spacing[3],
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize['3xl'] || tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {formatPrice(plan.price)}
              </span>
              {plan.price > 0 && (
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.normal,
                }}>
                  /{plan.interval === 'monthly' ? 'mo' : 'yr'}
                </span>
              )}
            </div>

            {/* Status + Subscribers row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              {/* Status badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: statusCfg.bgColor,
              }}>
                <span style={{
                  ...createStatusDotStyle(tokens, statusCfg.dotColor),
                }} />
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: statusCfg.textColor,
                }}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Subscriber count */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}>
                <Users size={14} />
                <span style={{ fontWeight: tokens.typography.fontWeight.medium }}>
                  {formatSubscribers(plan.subscriberCount)}
                </span>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  subscribers
                </span>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div style={{
            padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
            flex: 1,
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[3],
            }}>
              Features
            </div>
            {plan.features.map((feature, idx) =>
              renderFeatureRow(feature, idx, plan.features.length)
            )}
          </div>

          {/* Limits section */}
          <div style={{
            padding: `0 ${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
          }}>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              marginBottom: tokens.spacing[2],
              paddingTop: tokens.spacing[3],
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            }}>
              Usage Limits
            </div>
            {renderLimitRow(
              <Users size={14} />,
              'Max Users',
              plan.maxUsers,
              tokens.colors.infoScale[600],
              tokens.colors.infoScale[50],
            )}
            {renderLimitRow(
              <HardDrive size={14} />,
              'Storage',
              plan.maxStorage,
              tokens.colors.primaryScale[600],
              tokens.colors.primaryScale[50],
            )}
            {renderLimitRow(
              <Gauge size={14} />,
              'API Rate',
              plan.apiRateLimit,
              tokens.colors.secondaryScale
                ? tokens.colors.secondaryScale[600]
                : tokens.colors.neutral[600],
              tokens.colors.secondaryScale
                ? tokens.colors.secondaryScale[50]
                : tokens.colors.neutral[50],
            )}
          </div>

          {/* Revenue display */}
          <div style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[50],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <DollarSign size={14} color={tokens.colors.successScale[600]} />
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                textTransform: 'uppercase' as const,
                letterSpacing: '0.05em',
              }}>
                Revenue
              </span>
            </div>
            <span style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.successScale[700],
            }}>
              {formatRevenue(plan.revenue)}
            </span>
          </div>

          {/* Actions row */}
          <div style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            opacity: isHovered ? 1 : 0.6,
            transition: `opacity ${tokens.motion.hover}`,
          }}>
            {/* Edit */}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(plan.id);
                }}
                onMouseEnter={() => setHoveredActionId(`edit-${plan.id}`)}
                onMouseLeave={() => setHoveredActionId(null)}
                title="Edit plan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: hoveredActionId === `edit-${plan.id}`
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.common.white,
                  color: hoveredActionId === `edit-${plan.id}`
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <Edit3 size={12} />
                Edit
              </button>
            )}

            {/* Duplicate */}
            {onDuplicate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(plan.id);
                }}
                onMouseEnter={() => setHoveredActionId(`dup-${plan.id}`)}
                onMouseLeave={() => setHoveredActionId(null)}
                title="Duplicate plan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: hoveredActionId === `dup-${plan.id}`
                    ? tokens.colors.infoScale[50]
                    : tokens.colors.common.white,
                  color: hoveredActionId === `dup-${plan.id}`
                    ? tokens.colors.infoScale[600]
                    : tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <Copy size={12} />
                Duplicate
              </button>
            )}

            {/* Deprecate */}
            {onDeprecate && plan.status !== 'deprecated' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeprecate(plan.id);
                }}
                onMouseEnter={() => setHoveredActionId(`dep-${plan.id}`)}
                onMouseLeave={() => setHoveredActionId(null)}
                title="Deprecate plan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                  backgroundColor: hoveredActionId === `dep-${plan.id}`
                    ? tokens.colors.errorScale[50]
                    : tokens.colors.common.white,
                  color: hoveredActionId === `dep-${plan.id}`
                    ? tokens.colors.errorScale[600]
                    : tokens.colors.errorScale[500],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                <Archive size={12} />
                Deprecate
              </button>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Empty State ────────────────────────────────────────────

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
          <CreditCard size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {emptyText}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          Create your first subscription plan to start managing tenant access, features, and pricing.
        </div>
        {onCreate && (
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
            Create Your First Plan
          </button>
        )}
      </div>
    );

    // ─── Main Render ────────────────────────────────────────────────────

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
      >
        {renderHeader()}

        {plans.length > 0 && renderStatsBar()}

        {sortedPlans.length === 0 ? (
          renderEmptyState()
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(340px, 1fr))`,
            gap: tokens.spacing[5],
            alignItems: 'start',
          }}>
            {sortedPlans.map(plan => renderPlanCard(plan))}
          </div>
        )}
      </div>
    );
  },
});
