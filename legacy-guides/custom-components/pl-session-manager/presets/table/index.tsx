'use client';

/**
 * PlSessionManager - Table Preset
 * Data table view showing sessions with device, location, IP, status, and actions
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createStatusDotStyle,
  createFilterPillStyle,
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
  ArrowUpDown,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

// ─── Status Config ────────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
  icon: any;
}

function getStatusConfig(tokens: DesignTokens): Record<SessionStatus, StatusConfig> {
  return {
    active: {
      label: 'Active',
      color: tokens.colors.successScale[700],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      dotColor: tokens.colors.successScale[500],
      icon: CheckCircle2,
    },
    expired: {
      label: 'Expired',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      borderColor: tokens.colors.neutral[200],
      dotColor: tokens.colors.neutral[400],
      icon: Clock,
    },
    revoked: {
      label: 'Revoked',
      color: tokens.colors.errorScale[700],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      dotColor: tokens.colors.errorScale[500],
      icon: XCircle,
    },
    suspicious: {
      label: 'Suspicious',
      color: tokens.colors.warningScale[700],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      dotColor: tokens.colors.warningScale[500],
      icon: AlertTriangle,
    },
  };
}

// ─── Risk Level Config ────────────────────────────────────────────────────────

interface RiskConfig {
  label: string;
  color: string;
  icon: any;
}

function getRiskConfig(tokens: DesignTokens): Record<RiskLevel, RiskConfig> {
  return {
    low: {
      label: 'Low Risk',
      color: tokens.colors.successScale[500],
      icon: ShieldCheck,
    },
    medium: {
      label: 'Medium Risk',
      color: tokens.colors.warningScale[500],
      icon: Shield,
    },
    high: {
      label: 'High Risk',
      color: tokens.colors.errorScale[500],
      icon: ShieldAlert,
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

// ─── Table Preset ─────────────────────────────────────────────────────────────

export const TablePlSessionManager = createPreset<PlSessionManagerProps>({
  name: 'PlSessionManager.Table',
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
      selectedSessions: controlledSelected,
      onSelectionChange,
      onBulkRevoke,
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

    const [internalSelected, setInternalSelected] = useState<string[]>([]);
    const [internalStatusFilter, setInternalStatusFilter] = useState<SessionStatus | null>(null);
    const [internalSortBy, setInternalSortBy] = useState(PL_SESSION_MANAGER_DEFAULTS.sortBy ?? 'lastActive');
    const [internalSortDirection, setInternalSortDirection] = useState(PL_SESSION_MANAGER_DEFAULTS.sortDirection ?? 'desc');
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const selectedSessions = controlledSelected ?? internalSelected;
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

    const handleSortChange = useCallback((field: string) => {
      const newDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
      if (controlledSortBy === undefined) {
        setInternalSortBy(field as any);
        setInternalSortDirection(newDirection);
      }
      onSortChange?.(field, newDirection);
    }, [sortBy, sortDirection, controlledSortBy, onSortChange]);

    const handleSelectionToggle = useCallback((sessionId: string) => {
      const next = selectedSessions.includes(sessionId)
        ? selectedSessions.filter(id => id !== sessionId)
        : [...selectedSessions, sessionId];
      if (controlledSelected === undefined) setInternalSelected(next);
      onSelectionChange?.(next);
    }, [selectedSessions, controlledSelected, onSelectionChange]);

    const handleSelectAll = useCallback(() => {
      const allIds = filteredSessions.map(s => s.id);
      const next = selectedSessions.length === allIds.length ? [] : allIds;
      if (controlledSelected === undefined) setInternalSelected(next);
      onSelectionChange?.(next);
    }, [selectedSessions, controlledSelected, onSelectionChange]);

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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: tokens.colors.neutral[100],
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[600],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Expired
            </span>
            <span style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[700],
            }}>
              {stats.expired}
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

          {/* Sort control */}
          <button
            onClick={() => handleSortChange(sortBy)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <ArrowUpDown size={12} />
            {sortDirection === 'asc' ? 'Oldest' : 'Newest'}
          </button>

          {/* Bulk actions */}
          {selectedSessions.length > 0 && (
            <>
              <button
                onClick={() => onBulkRevoke?.(selectedSessions)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: 'none',
                  backgroundColor: tokens.colors.errorScale[600],
                  color: tokens.colors.common.white,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <XCircle size={12} />
                Revoke {selectedSessions.length} selected
              </button>
            </>
          )}

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

    // ─── Render: Table ──────────────────────────────────────────────────

    const renderTable = () => {
      if (filteredSessions.length === 0) return renderEmptyState();

      const currentSession = sessions.find(s => s.isCurrent);

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          padding: 0,
          overflow: 'hidden' as const,
          ...glassSurfaceStyle,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'left' as const,
                  width: 40,
                }}>
                  <input
                    type="checkbox"
                    checked={selectedSessions.length === filteredSessions.length && filteredSessions.length > 0}
                    onChange={handleSelectAll}
                    style={{
                      width: 16,
                      height: 16,
                      cursor: 'pointer',
                    }}
                  />
                </th>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'left' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  User
                </th>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'left' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  Device
                </th>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'left' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  Location
                </th>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'left' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  IP Address
                </th>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'left' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  Status
                </th>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'left' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  Last Active
                </th>
                <th style={{
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  textAlign: 'right' as const,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                  borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session, idx) => {
                const statusCfg = STATUS_CONFIG[session.status];
                const riskCfg = RISK_CONFIG[session.riskLevel];
                const DeviceIcon = getDeviceIcon(session.device.type);
                const RiskIcon = riskCfg.icon;
                const isHovered = hoveredId === session.id;
                const isSelected = selectedSessions.includes(session.id);

                return (
                  <tr
                    key={session.id}
                    onMouseEnter={() => setHoveredId(session.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onSessionClick?.(session.id)}
                    style={{
                      backgroundColor: session.isCurrent
                        ? tokens.colors.successScale[50]
                        : isSelected
                        ? tokens.colors.primaryScale[50]
                        : isHovered
                        ? tokens.colors.neutral[50]
                        : tokens.colors.common.white,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      borderLeft: session.isCurrent
                        ? `3px solid ${tokens.colors.successScale[500]}`
                        : `3px solid transparent`,
                    }}
                  >
                    {/* Checkbox */}
                    <td
                      style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        borderBottom: idx < filteredSessions.length - 1
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                          : 'none',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectionToggle(session.id)}
                        style={{
                          width: 16,
                          height: 16,
                          cursor: 'pointer',
                        }}
                      />
                    </td>

                    {/* User */}
                    <td style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      borderBottom: idx < filteredSessions.length - 1
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                        : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: session.userAvatar
                            ? 'transparent'
                            : tokens.colors.primaryScale[100],
                          backgroundImage: session.userAvatar ? `url(${session.userAvatar})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.primaryScale[600],
                          flexShrink: 0,
                        }}>
                          {!session.userAvatar && session.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                          }}>
                            {session.userName}
                            {session.isCurrent && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: `1px ${tokens.spacing[1]}px`,
                                borderRadius: tokens.borderRadius.full,
                                fontSize: '10px',
                                fontWeight: tokens.typography.fontWeight.medium,
                                backgroundColor: tokens.colors.successScale[100],
                                color: tokens.colors.successScale[700],
                              }}>
                                Current
                              </span>
                            )}
                          </div>
                          <div style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}>
                            {session.userEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Device */}
                    <td style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      borderBottom: idx < filteredSessions.length - 1
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                        : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <DeviceIcon size={16} color={tokens.colors.neutral[400]} />
                        <div>
                          <div style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[800],
                          }}>
                            {session.device.name}
                          </div>
                          <div style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}>
                            {session.device.os} · {session.device.browser} {session.device.version}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      borderBottom: idx < filteredSessions.length - 1
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                        : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                        <MapPin size={12} color={tokens.colors.neutral[400]} />
                        <span style={{ fontSize: tokens.typography.fontSize.sm }}>
                          {session.location.city}, {session.location.countryCode}
                        </span>
                      </div>
                    </td>

                    {/* IP */}
                    <td style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                      fontFamily: 'monospace',
                      borderBottom: idx < filteredSessions.length - 1
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                        : 'none',
                    }}>
                      {session.ip.split('.').slice(0, 2).join('.')}.***.*****
                    </td>

                    {/* Status */}
                    <td style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      borderBottom: idx < filteredSessions.length - 1
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                        : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
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
                        <RiskIcon
                          size={14}
                          color={riskCfg.color}
                          title={riskCfg.label}
                        />
                      </div>
                    </td>

                    {/* Last Active */}
                    <td style={{
                      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[600],
                      borderBottom: idx < filteredSessions.length - 1
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                        : 'none',
                    }}>
                      {formatDistanceToNow(session.lastActive, { addSuffix: true })}
                    </td>

                    {/* Actions */}
                    <td
                      style={{
                        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                        fontSize: tokens.typography.fontSize.sm,
                        textAlign: 'right' as const,
                        borderBottom: idx < filteredSessions.length - 1
                          ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
                          : 'none',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {!session.isCurrent && session.status !== 'revoked' && (
                        <button
                          onClick={() => onRevokeSession?.(session.id)}
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
        {renderTable()}
      </div>
    );
  },
});
