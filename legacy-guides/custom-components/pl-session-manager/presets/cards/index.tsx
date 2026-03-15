'use client';

/**
 * PlSessionManager - Cards Preset
 * Card view where each session is displayed as a card with device icon, location, and risk level
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  getCardHoverShadow,
  formatDistanceToNow,
} from '../../../helpers';
import type { PlSessionManagerProps, SessionItem, SessionStatus, RiskLevel } from '../../core';
import { PL_SESSION_MANAGER_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
  Search,
  Filter,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
}

function getStatusConfig(tokens: DesignTokens): Record<SessionStatus, StatusConfig> {
  return {
    active: {
      label: 'Active',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
    },
    expired: {
      label: 'Expired',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
      dotColor: tokens.colors.neutral[400],
    },
    revoked: {
      label: 'Revoked',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
    },
    suspicious: {
      label: 'Suspicious',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
    },
  };
}

// ─── Risk Level Config ────────────────────────────────────────────────────────

interface RiskConfig {
  label: string;
  color: string;
}

function getRiskConfig(tokens: DesignTokens): Record<RiskLevel, RiskConfig> {
  return {
    low: {
      label: 'Low Risk',
      color: tokens.colors.successScale[500],
    },
    medium: {
      label: 'Medium Risk',
      color: tokens.colors.warningScale[500],
    },
    high: {
      label: 'High Risk',
      color: tokens.colors.errorScale[500],
    },
  };
}

// ─── Device Icon ──────────────────────────────────────────────────────────────

function getDeviceIcon(type: string) {
  switch (type) {
    case 'mobile':
      return Smartphone;
    case 'tablet':
      return Tablet;
    default:
      return Monitor;
  }
}

// ─── Cards Preset ─────────────────────────────────────────────────────────────

export const CardsPlSessionManager = createPreset<PlSessionManagerProps>({
  name: 'PlSessionManager.Cards',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlSessionManagerProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const STATUS_CONFIG = useMemo(() => getStatusConfig(tokens), [tokens]);
    const RISK_CONFIG = useMemo(() => getRiskConfig(tokens), [tokens]);

    const {
      sessions,
      stats,
      onSessionClick,
      onRevokeSession,
      onRevokeAllOthers,
      statusFilter: controlledStatusFilter,
      onStatusFilterChange,
      sortBy: controlledSortBy,
      sortDirection: controlledSortDirection,
      onSortChange,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      emptyText = PL_SESSION_MANAGER_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalStatusFilter, setInternalStatusFilter] = useState<SessionStatus | null>(null);
    const [internalSortBy, setInternalSortBy] = useState(PL_SESSION_MANAGER_DEFAULTS.sortBy ?? 'lastActive');
    const [internalSortDirection, setInternalSortDirection] = useState(PL_SESSION_MANAGER_DEFAULTS.sortDirection ?? 'desc');
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const statusFilter = controlledStatusFilter ?? internalStatusFilter;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleStatusFilter = useCallback((status: SessionStatus | null) => {
      if (controlledStatusFilter === undefined) setInternalStatusFilter(status);
      onStatusFilterChange?.(status);
    }, [controlledStatusFilter, onStatusFilterChange]);

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    // ─── Filtered + Sorted Sessions ────────────────────────────────────

    const filteredSessions = useMemo(() => {
      let result = [...sessions];

      if (statusFilter) {
        result = result.filter(s => s.status === statusFilter);
      }
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(s =>
          s.userName.toLowerCase().includes(lower) ||
          s.userEmail.toLowerCase().includes(lower) ||
          s.device.name.toLowerCase().includes(lower) ||
          s.device.os.toLowerCase().includes(lower) ||
          s.device.browser.toLowerCase().includes(lower) ||
          s.ip.includes(lower) ||
          s.location.city.toLowerCase().includes(lower) ||
          s.location.country.toLowerCase().includes(lower)
        );
      }

      result.sort((a, b) => {
        let aVal: any = 0;
        let bVal: any = 0;
        switch (sortBy) {
          case 'lastActive':
            aVal = a.lastActive.getTime();
            bVal = b.lastActive.getTime();
            break;
          case 'createdAt':
            aVal = a.createdAt.getTime();
            bVal = b.createdAt.getTime();
            break;
          case 'riskLevel': {
            const order: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };
            aVal = order[a.riskLevel];
            bVal = order[b.riskLevel];
            break;
          }
          default:
            aVal = a.lastActive.getTime();
            bVal = b.lastActive.getTime();
        }
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      });

      return result;
    }, [sessions, statusFilter, searchQuery, sortBy, sortDirection]);

    // ─── Glass Style ────────────────────────────────────────────────────

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
    } : {};

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Render: Stats Bar ──────────────────────────────────────────────

    const renderStatsBar = () => {
      if (!stats) return null;

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            ...createSurfaceStyle(tokens, { elevation: 'sm' }),
            backgroundColor: tokens.colors.common.white,
            marginBottom: tokens.spacing[4],
            flexWrap: 'wrap' as const,
            ...glassSurfaceStyle,
          }}
        >
          <Shield size={18} color={tokens.colors.neutral[500]} style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[700],
            marginRight: tokens.spacing[2],
          }}>
            Session Overview
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.primaryScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[200]}`,
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Total
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.primaryScale[700],
            }}>
              {stats.total}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.successScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Active
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.successScale[700],
            }}>
              {stats.active}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.warningScale[50],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Suspicious
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.warningScale[700],
            }}>
              {stats.suspicious}
            </span>
          </div>
        </div>
      );
    };

    // ─── Render: Filter Bar ─────────────────────────────────────────────

    const renderFilterBar = () => {
      const statusOptions: (SessionStatus | null)[] = [null, 'active', 'expired', 'revoked', 'suspicious'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px 0`,
          marginBottom: tokens.spacing[3],
          flexWrap: 'wrap' as const,
        }}>
          {/* Status filter chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <Filter size={14} color={tokens.colors.neutral[400]} />
            {statusOptions.map((status) => {
              const isActive = statusFilter === status || (status === null && !statusFilter);
              return (
                <button
                  key={status ?? 'all'}
                  onClick={() => handleStatusFilter(status)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.full,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActive ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                    backgroundColor: isActive ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                    color: isActive ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  {status !== null && (
                    <span style={{
                      width: 6,
                      height: 6,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: STATUS_CONFIG[status].dotColor,
                      flexShrink: 0,
                    }} />
                  )}
                  {status === null ? 'All' : STATUS_CONFIG[status].label}
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Search input */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
            minWidth: 200,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search sessions..."
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
                size={12}
                color={tokens.colors.neutral[400]}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSearchChange('')}
              />
            )}
          </div>

          {/* Revoke all others button */}
          {onRevokeAllOthers && (
            <button
              onClick={onRevokeAllOthers}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`,
                backgroundColor: tokens.colors.errorScale[50],
                color: tokens.colors.errorScale[700],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <XCircle size={12} />
              Revoke All Others
            </button>
          )}
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
        ...glassSurfaceStyle,
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
          <Shield size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery || statusFilter ? emptyText : 'No sessions found'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          maxWidth: 360,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || statusFilter
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'No active sessions to display at this time.'}
        </div>
      </div>
    );

    // ─── Render: Header ─────────────────────────────────────────────────

    const renderHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: tokens.spacing[4],
      }}>
        <div>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            Active Sessions
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage sessions across all devices and locations
          </p>
        </div>
      </div>
    );

    // ─── Render: Session Card ───────────────────────────────────────────

    const renderSessionCard = (session: SessionItem) => {
      const statusCfg = STATUS_CONFIG[session.status];
      const riskCfg = RISK_CONFIG[session.riskLevel];
      const DeviceIcon = getDeviceIcon(session.device.type);
      const isHovered = hoveredId === session.id;

      return (
        <div
          key={session.id}
          onMouseEnter={() => setHoveredId(session.id)}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => onSessionClick?.(session.id)}
          style={{
            ...createCardStyle(tokens, { elevation: isHovered ? 'md' : 'sm', glass: isModern }),
            padding: tokens.spacing[4],
            position: 'relative' as const,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            transform: isHovered ? tokens.motion.transform : 'none',
            borderLeft: session.isCurrent
              ? `4px solid ${tokens.colors.successScale[500]}`
              : `4px solid ${riskCfg.color}`,
            ...(isModern ? glassCardStyle : {}),
          }}
        >
          {/* Risk level color bar on left edge is applied via borderLeft above */}

          {/* Top section: Device icon + Current badge */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[3],
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: tokens.borderRadius.lg,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.primaryScale[600],
            }}>
              <DeviceIcon size={24} />
            </div>
            {session.isCurrent && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: tokens.colors.successScale[100],
                color: tokens.colors.successScale[700],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[200]}`,
              }}>
                <CheckCircle2 size={12} />
                Current Session
              </span>
            )}
          </div>

          {/* Device name + OS + Browser */}
          <div style={{ marginBottom: tokens.spacing[3] }}>
            <div style={{
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}>
              {session.device.name}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
            }}>
              {session.device.os} · {session.device.browser} {session.device.version}
            </div>
          </div>

          {/* Location */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            marginBottom: tokens.spacing[2],
          }}>
            <MapPin size={14} color={tokens.colors.neutral[400]} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
            }}>
              {session.location.city}, {session.location.country}
            </span>
          </div>

          {/* IP Address (partially masked) */}
          <div style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            fontFamily: 'monospace',
            marginBottom: tokens.spacing[3],
          }}>
            IP: {session.ip.split('.').slice(0, 2).join('.')}.***.*****
          </div>

          {/* Time since last activity */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            marginBottom: tokens.spacing[3],
          }}>
            <Clock size={14} color={tokens.colors.neutral[400]} />
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              Active {formatDistanceToNow(session.lastActive, { addSuffix: true })}
            </span>
          </div>

          {/* Status badge + Revoke button */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: tokens.spacing[3],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: statusCfg.bgColor,
              color: statusCfg.color,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: statusCfg.dotColor,
              }} />
              {statusCfg.label}
            </span>

            {!session.isCurrent && session.status !== 'revoked' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRevokeSession?.(session.id);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[300]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.errorScale[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <XCircle size={12} />
                Revoke
              </button>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Cards Grid ─────────────────────────────────────────────

    const renderCards = () => {
      if (filteredSessions.length === 0) return renderEmptyState();

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: tokens.spacing[4],
        }}>
          {filteredSessions.map(session => renderSessionCard(session))}
        </div>
      );
    };

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
        {renderStatsBar()}
        {renderFilterBar()}
        {renderCards()}
      </div>
    );
  },
});
