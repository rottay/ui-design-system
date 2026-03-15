'use client';

/**
 * PlUserAssignment - Table Preset
 * Full-featured table view with stats bar, search, role filter,
 * status badges, expiration countdown, and inline actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createSurfaceStyle,
  createStatusDotStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlUserAssignmentProps,
  UserAssignment,
  AssignmentStatus,
  AssignmentRole,
} from '../../core';
import { PL_USER_ASSIGNMENT_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Search,
  Plus,
  X,
  ChevronDown,
  Users,
  UserCheck,
  Clock,
  AlertTriangle,
  Shield,
  ShieldOff,
  CalendarClock,
  MoreHorizontal,
  UserPlus,
  Ban,
  RefreshCw,
  Building2,
  Mail,
} from 'lucide-react';

// ─── Role Config ─────────────────────────────────────────────────────────────

interface RoleConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

function getRoleConfig(role: AssignmentRole, tokens: DesignTokens): RoleConfig {
  switch (role) {
    case 'owner':
      return {
        label: 'Owner',
        color: tokens.colors.warningScale[800],
        bgColor: tokens.colors.warningScale[100],
        borderColor: tokens.colors.warningScale[200],
      };
    case 'admin':
      return {
        label: 'Admin',
        color: tokens.colors.errorScale[700],
        bgColor: tokens.colors.errorScale[100],
        borderColor: tokens.colors.errorScale[200],
      };
    case 'editor':
      return {
        label: 'Editor',
        color: tokens.colors.primaryScale[700],
        bgColor: tokens.colors.primaryScale[100],
        borderColor: tokens.colors.primaryScale[200],
      };
    case 'viewer':
      return {
        label: 'Viewer',
        color: tokens.colors.neutral[600],
        bgColor: tokens.colors.neutral[100],
        borderColor: tokens.colors.neutral[200],
      };
    case 'billing':
      return {
        label: 'Billing',
        color: tokens.colors.successScale[700],
        bgColor: tokens.colors.successScale[100],
        borderColor: tokens.colors.successScale[200],
      };
    case 'support':
      return {
        label: 'Support',
        color: tokens.colors.infoScale[700],
        bgColor: tokens.colors.infoScale[100],
        borderColor: tokens.colors.infoScale[200],
      };
    case 'developer':
      return {
        label: 'Developer',
        color: tokens.colors.secondaryScale[700],
        bgColor: tokens.colors.secondaryScale[100],
        borderColor: tokens.colors.secondaryScale[200],
      };
    case 'analyst':
      return {
        label: 'Analyst',
        color: tokens.colors.primaryScale[600],
        bgColor: tokens.colors.primaryScale[50],
        borderColor: tokens.colors.primaryScale[200],
      };
  }
}

// ─── Status Config ───────────────────────────────────────────────────────────

interface StatusConfig {
  label: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
}

function getStatusConfig(status: AssignmentStatus, tokens: DesignTokens): StatusConfig {
  switch (status) {
    case 'active':
      return {
        label: 'Active',
        dotColor: tokens.colors.successScale[500],
        bgColor: tokens.colors.successScale[50],
        textColor: tokens.colors.successScale[700],
      };
    case 'pending':
      return {
        label: 'Pending',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
      };
    case 'expired':
      return {
        label: 'Expired',
        dotColor: tokens.colors.neutral[400],
        bgColor: tokens.colors.neutral[50],
        textColor: tokens.colors.neutral[600],
      };
    case 'revoked':
      return {
        label: 'Revoked',
        dotColor: tokens.colors.errorScale[500],
        bgColor: tokens.colors.errorScale[50],
        textColor: tokens.colors.errorScale[700],
      };
  }
}

// ─── Expiration Helpers ──────────────────────────────────────────────────────

function getDaysUntilExpiration(expiresAt: Date): number {
  const now = Date.now();
  const diff = expiresAt.getTime() - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isExpiringSoon(assignment: UserAssignment): boolean {
  if (!assignment.expiresAt || assignment.status !== 'active') return false;
  const days = getDaysUntilExpiration(assignment.expiresAt);
  return days >= 0 && days <= 14;
}

function formatExpirationCountdown(expiresAt: Date, tokens: DesignTokens): { text: string; color: string } {
  const days = getDaysUntilExpiration(expiresAt);
  if (days < 0) {
    return { text: 'Expired', color: tokens.colors.errorScale[600] };
  }
  if (days === 0) {
    return { text: 'Expires today', color: tokens.colors.errorScale[600] };
  }
  if (days === 1) {
    return { text: '1 day left', color: tokens.colors.errorScale[600] };
  }
  if (days <= 7) {
    return { text: `${days} days left`, color: tokens.colors.warningScale[600] };
  }
  if (days <= 14) {
    return { text: `${days} days left`, color: tokens.colors.warningScale[500] };
  }
  if (days <= 30) {
    return { text: `${days} days left`, color: tokens.colors.neutral[600] };
  }
  return { text: formatDistanceToNow(expiresAt, { addSuffix: false }), color: tokens.colors.neutral[500] };
}

// ─── User Avatar ─────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ─── All Roles List ──────────────────────────────────────────────────────────

const ALL_ROLES: AssignmentRole[] = [
  'owner', 'admin', 'editor', 'viewer', 'billing', 'support', 'developer', 'analyst',
];

// ─── Table Preset ────────────────────────────────────────────────────────────

export const TablePlUserAssignment = createPreset<PlUserAssignmentProps>({
  name: 'PlUserAssignment.Table',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlUserAssignmentProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      assignments,
      onAssignmentClick,
      onAssign,
      onRevoke,
      onExtend,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      filterRole: controlledFilterRole,
      onFilterRole,
      loading = false,
      emptyText = PL_USER_ASSIGNMENT_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalFilterRole, setInternalFilterRole] = useState<AssignmentRole | null>(null);
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const filterRole = controlledFilterRole ?? internalFilterRole;

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleFilterRole = useCallback((role: AssignmentRole | null) => {
      if (controlledFilterRole === undefined) setInternalFilterRole(role);
      onFilterRole?.(role);
      setShowRoleDropdown(false);
    }, [controlledFilterRole, onFilterRole]);

    const handleRevoke = useCallback((e: React.MouseEvent, assignmentId: string) => {
      e.stopPropagation();
      setActiveActionMenuId(null);
      onRevoke?.(assignmentId);
    }, [onRevoke]);

    const handleExtend = useCallback((e: React.MouseEvent, assignmentId: string) => {
      e.stopPropagation();
      setActiveActionMenuId(null);
      onExtend?.(assignmentId);
    }, [onExtend]);

    const toggleActionMenu = useCallback((e: React.MouseEvent, assignmentId: string) => {
      e.stopPropagation();
      setActiveActionMenuId(prev => prev === assignmentId ? null : assignmentId);
    }, []);

    // ─── Filtered Assignments ────────────────────────────────────────────

    const filteredAssignments = useMemo(() => {
      let result = [...assignments];

      if (filterRole) {
        result = result.filter(a => a.role === filterRole);
      }

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(a =>
          a.userName.toLowerCase().includes(lower) ||
          a.userEmail.toLowerCase().includes(lower) ||
          a.tenantName.toLowerCase().includes(lower) ||
          (a.companyName && a.companyName.toLowerCase().includes(lower)) ||
          a.role.toLowerCase().includes(lower)
        );
      }

      return result;
    }, [assignments, filterRole, searchQuery]);

    // ─── Stats ───────────────────────────────────────────────────────────

    const stats = useMemo(() => {
      const total = assignments.length;
      const active = assignments.filter(a => a.status === 'active').length;
      const pending = assignments.filter(a => a.status === 'pending').length;
      const expiringSoon = assignments.filter(a => isExpiringSoon(a)).length;

      return { total, active, pending, expiringSoon };
    }, [assignments]);

    // ─── Glass Style ─────────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Loading State ───────────────────────────────────────────────────

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

    // ─── Render: Stats Bar ───────────────────────────────────────────────

    const renderStatsBar = () => {
      const statItems = [
        {
          label: 'Total Assignments',
          value: stats.total,
          icon: <Users size={18} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: stats.active,
          icon: <UserCheck size={18} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Pending',
          value: stats.pending,
          icon: <Clock size={18} />,
          color: tokens.colors.warningScale[600],
          bgColor: tokens.colors.warningScale[50],
        },
        {
          label: 'Expiring Soon',
          value: stats.expiringSoon,
          icon: <AlertTriangle size={18} />,
          color: stats.expiringSoon > 0 ? tokens.colors.errorScale[600] : tokens.colors.neutral[400],
          bgColor: stats.expiringSoon > 0 ? tokens.colors.errorScale[50] : tokens.colors.neutral[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[4],
          marginBottom: tokens.spacing[6],
        }}>
          {statItems.map((stat) => (
            <div
              key={stat.label}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: `${tokens.spacing[4]}px ${tokens.spacing[5]}px`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                ...(isModern ? glassCardStyle : {}),
              }}
            >
              <div style={{
                width: 40,
                height: 40,
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize['xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.normal,
                  marginTop: 2,
                }}>
                  {stat.label}
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
            User Assignments
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Manage user-to-tenant and company role assignments
          </p>
        </div>
        {onAssign && (
          <button
            onClick={onAssign}
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
            <UserPlus size={16} />
            Assign User
          </button>
        )}
      </div>
    );

    // ─── Render: Filter Bar ──────────────────────────────────────────────

    const renderFilterBar = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        marginBottom: tokens.spacing[4],
        flexWrap: 'wrap' as const,
      }}>
        {/* Role filter dropdown */}
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${filterRole ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: filterRole ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: filterRole ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <Shield size={14} />
            {filterRole ? getRoleConfig(filterRole, tokens).label : 'All Roles'}
            <ChevronDown size={14} />
          </button>
          {showRoleDropdown && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              left: 0,
              marginTop: tokens.spacing[1],
              minWidth: 200,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              padding: `${tokens.spacing[1]}px 0`,
            }}>
              <div
                onClick={() => handleFilterRole(null)}
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: !filterRole ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                  backgroundColor: !filterRole ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  fontWeight: tokens.typography.fontWeight.normal,
                }}
              >
                All Roles
              </div>
              {ALL_ROLES.map(role => {
                const cfg = getRoleConfig(role, tokens);
                return (
                  <div
                    key={role}
                    onClick={() => handleFilterRole(role)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: filterRole === role ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                      backgroundColor: filterRole === role ? tokens.colors.primaryScale[50] : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                      fontWeight: tokens.typography.fontWeight.normal,
                    }}
                  >
                    <span style={{
                      width: 8,
                      height: 8,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: cfg.color,
                      flexShrink: 0,
                    }} />
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
            placeholder="Search by name, email, tenant..."
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
              fontWeight: tokens.typography.fontWeight.normal,
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

    // ─── Render: Avatar ──────────────────────────────────────────────────

    const renderAvatar = (assignment: UserAssignment) => {
      const initials = getInitials(assignment.userName);

      if (assignment.userAvatar) {
        return (
          <img
            src={assignment.userAvatar}
            alt={assignment.userName}
            style={{
              width: 36,
              height: 36,
              borderRadius: tokens.borderRadius.full,
              objectFit: 'cover' as const,
              flexShrink: 0,
              border: `2px solid ${tokens.colors.neutral[100]}`,
            }}
          />
        );
      }

      return (
        <div style={{
          width: 36,
          height: 36,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[100],
          color: tokens.colors.primaryScale[700],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          flexShrink: 0,
          border: `2px solid ${tokens.colors.primaryScale[50]}`,
        }}>
          {initials}
        </div>
      );
    };

    // ─── Render: Role Badge ──────────────────────────────────────────────

    const renderRoleBadge = (role: AssignmentRole) => {
      const cfg = getRoleConfig(role, tokens);
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.medium,
          backgroundColor: cfg.bgColor,
          color: cfg.color,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${cfg.borderColor}`,
          whiteSpace: 'nowrap' as const,
        }}>
          {cfg.label}
        </span>
      );
    };

    // ─── Render: Status Badge ────────────────────────────────────────────

    const renderStatusBadge = (status: AssignmentStatus) => {
      const cfg = getStatusConfig(status, tokens);
      return (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: cfg.bgColor,
        }}>
          <span style={{ ...createStatusDotStyle(tokens, cfg.dotColor) }} />
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.medium,
            color: cfg.textColor,
          }}>
            {cfg.label}
          </span>
        </div>
      );
    };

    // ─── Render: Expiration Cell ─────────────────────────────────────────

    const renderExpirationCell = (assignment: UserAssignment) => {
      if (!assignment.expiresAt) {
        return (
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            fontStyle: 'italic' as const,
            fontWeight: tokens.typography.fontWeight.normal,
          }}>
            No expiration
          </span>
        );
      }

      const { text, color } = formatExpirationCountdown(assignment.expiresAt, tokens);
      const expiringSoon = isExpiringSoon(assignment);

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[1],
        }}>
          {expiringSoon && (
            <AlertTriangle size={12} color={color} />
          )}
          <span style={{
            fontSize: tokens.typography.fontSize.xs,
            color: color,
            fontWeight: expiringSoon ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
          }}>
            {text}
          </span>
        </div>
      );
    };

    // ─── Render: Action Menu ─────────────────────────────────────────────

    const renderActionMenu = (assignment: UserAssignment) => {
      const isOpen = activeActionMenuId === assignment.id;
      const canRevoke = assignment.status === 'active' || assignment.status === 'pending';
      const canExtend = assignment.status === 'active' && assignment.expiresAt !== undefined;

      return (
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={(e) => toggleActionMenu(e, assignment.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: tokens.borderRadius.md,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isOpen ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]}`,
              backgroundColor: isOpen ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: isOpen ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <MoreHorizontal size={14} />
          </button>
          {isOpen && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              right: 0,
              marginTop: tokens.spacing[1],
              minWidth: 160,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              padding: `${tokens.spacing[1]}px 0`,
              overflow: 'hidden' as const,
            }}>
              {canExtend && onExtend && (
                <div
                  onClick={(e) => handleExtend(e, assignment.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontWeight: tokens.typography.fontWeight.normal,
                  }}
                >
                  <RefreshCw size={14} color={tokens.colors.infoScale[500]} />
                  Extend Expiration
                </div>
              )}
              {canRevoke && onRevoke && (
                <div
                  onClick={(e) => handleRevoke(e, assignment.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.errorScale[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    fontWeight: tokens.typography.fontWeight.normal,
                  }}
                >
                  <Ban size={14} />
                  Revoke Assignment
                </div>
              )}
              {(!canRevoke || !onRevoke) && (!canExtend || !onExtend) && (
                <div style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                  fontWeight: tokens.typography.fontWeight.normal,
                }}>
                  No actions available
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    // ─── Render: Table Row ───────────────────────────────────────────────

    const renderTableRow = (assignment: UserAssignment, idx: number) => {
      const isHovered = hoveredRowId === assignment.id;
      const expiring = isExpiringSoon(assignment);

      return (
        <tr
          key={assignment.id}
          onMouseEnter={() => setHoveredRowId(assignment.id)}
          onMouseLeave={() => {
            setHoveredRowId(null);
            if (activeActionMenuId === assignment.id) setActiveActionMenuId(null);
          }}
          onClick={() => onAssignmentClick?.(assignment.id)}
          style={{
            backgroundColor: expiring
              ? (isHovered ? tokens.colors.warningScale[100] : tokens.colors.warningScale[50])
              : (isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white),
            cursor: onAssignmentClick ? 'pointer' : 'default',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* User cell: Avatar + Name + Email */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
            }}>
              {renderAvatar(assignment)}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                  maxWidth: 200,
                }}>
                  {assignment.userName}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.normal,
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  marginTop: 1,
                }}>
                  <Mail size={10} color={tokens.colors.neutral[400]} />
                  {assignment.userEmail}
                </div>
              </div>
            </div>
          </td>

          {/* Tenant cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[700],
            fontWeight: tokens.typography.fontWeight.normal,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <Building2 size={14} color={tokens.colors.neutral[400]} />
              {assignment.tenantName}
            </div>
          </td>

          {/* Company cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            fontSize: tokens.typography.fontSize.sm,
            color: assignment.companyName ? tokens.colors.neutral[700] : tokens.colors.neutral[400],
            fontWeight: tokens.typography.fontWeight.normal,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
          }}>
            {assignment.companyName || '\u2014'}
          </td>

          {/* Role cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
          }}>
            {renderRoleBadge(assignment.role)}
          </td>

          {/* Status cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
          }}>
            {renderStatusBadge(assignment.status)}
          </td>

          {/* Assigned By cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            fontSize: tokens.typography.fontSize.xs,
            color: assignment.assignedBy ? tokens.colors.neutral[600] : tokens.colors.neutral[400],
            fontWeight: tokens.typography.fontWeight.normal,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
          }}>
            {assignment.assignedBy || '\u2014'}
          </td>

          {/* Assigned Date cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            fontWeight: tokens.typography.fontWeight.normal,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            whiteSpace: 'nowrap' as const,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <CalendarClock size={12} color={tokens.colors.neutral[400]} />
              {formatDistanceToNow(assignment.assignedAt, { addSuffix: true })}
            </div>
          </td>

          {/* Expires cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            whiteSpace: 'nowrap' as const,
          }}>
            {renderExpirationCell(assignment)}
          </td>

          {/* Actions cell */}
          <td style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: idx < filteredAssignments.length - 1
              ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`
              : 'none',
            width: 48,
          }}>
            <div style={{
              opacity: isHovered || activeActionMenuId === assignment.id ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
            }}>
              {renderActionMenu(assignment)}
            </div>
          </td>
        </tr>
      );
    };

    // ─── Render: Table ───────────────────────────────────────────────────

    const renderTable = () => {
      const tableHeaders = [
        { label: 'User', width: undefined },
        { label: 'Tenant', width: undefined },
        { label: 'Company', width: undefined },
        { label: 'Role', width: 110 },
        { label: 'Status', width: 110 },
        { label: 'Assigned By', width: 120 },
        { label: 'Assigned', width: 110 },
        { label: 'Expires', width: 130 },
        { label: '', width: 48 },
      ];

      return (
        <div style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
          overflow: 'hidden' as const,
          ...(isModern ? glassCardStyle : {}),
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse' as const,
          }}>
            <thead>
              <tr style={{ backgroundColor: tokens.colors.neutral[50] }}>
                {tableHeaders.map((header, i) => (
                  <th
                    key={i}
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
                      width: header.width,
                    }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment, idx) => renderTableRow(assignment, idx))}
            </tbody>
          </table>
        </div>
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
          <Users size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery || filterRole ? emptyText : 'No user assignments yet'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
          fontWeight: tokens.typography.fontWeight.normal,
        }}>
          {searchQuery || filterRole
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'Assign users to tenants and companies to manage their roles and access permissions.'}
        </div>
        {onAssign && !(searchQuery || filterRole) && (
          <button
            onClick={onAssign}
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
            <UserPlus size={16} />
            Assign First User
          </button>
        )}
      </div>
    );

    // ─── Render: Results Summary ─────────────────────────────────────────

    const renderResultsSummary = () => {
      if (!searchQuery && !filterRole) return null;

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: tokens.spacing[3],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          backgroundColor: tokens.colors.neutral[50],
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[600],
            fontWeight: tokens.typography.fontWeight.normal,
          }}>
            Showing {filteredAssignments.length} of {assignments.length} assignments
            {filterRole && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                marginLeft: tokens.spacing[2],
              }}>
                filtered by {renderRoleBadge(filterRole)}
              </span>
            )}
          </span>
          <button
            onClick={() => {
              handleSearchChange('');
              handleFilterRole(null);
            }}
            style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.primaryScale[600],
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.sm,
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            Clear filters
          </button>
        </div>
      );
    };

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
      >
        {renderHeader()}
        {renderStatsBar()}
        {renderFilterBar()}
        {renderResultsSummary()}
        {filteredAssignments.length === 0 ? renderEmptyState() : renderTable()}
      </div>
    );
  },
});
