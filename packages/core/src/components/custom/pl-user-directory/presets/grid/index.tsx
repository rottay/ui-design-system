'use client';

/**
 * PlUserDirectory - Grid Preset
 * Card-based grid layout for browsing users with large avatars, contact actions,
 * role/status badges, MFA indicators, search/filter toolbar, and hover quick actions
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSurfaceStyle,
  createStatusDotStyle,
  getCardHoverShadow,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlUserDirectoryProps,
  UserDirectoryItem,
  UserStatus,
  UserRole,
  SortField,
  SortDirection,
} from '../../core';
import { PL_USER_DIRECTORY_DEFAULTS } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  Users,
  UserPlus,
  Search,
  X,
  ChevronDown,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Edit,
  Mail,
  Phone,
  Clock,
  UserCheck,
  Crown,
  Briefcase,
  User,
  Globe,
  Lock,
  MapPin,
  MessageSquare,
  MoreVertical,
  Trash2,
  LockOpen,
} from 'lucide-react';

// ─── Role Config ─────────────────────────────────────────────────────────────

interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

function getRoleConfig(role: UserRole, tokens: DesignTokens): RoleConfig {
  switch (role) {
    case 'admin':
      return {
        label: 'Admin',
        icon: <Crown size={10} />,
        bgColor: tokens.colors.secondaryScale[100],
        textColor: tokens.colors.secondaryScale[700],
        borderColor: tokens.colors.secondaryScale[200],
      };
    case 'manager':
      return {
        label: 'Manager',
        icon: <Briefcase size={10} />,
        bgColor: tokens.colors.infoScale[100],
        textColor: tokens.colors.infoScale[700],
        borderColor: tokens.colors.infoScale[200],
      };
    case 'member':
      return {
        label: 'Member',
        icon: <User size={10} />,
        bgColor: tokens.colors.successScale[100],
        textColor: tokens.colors.successScale[700],
        borderColor: tokens.colors.successScale[200],
      };
    case 'viewer':
      return {
        label: 'Viewer',
        icon: <Eye size={10} />,
        bgColor: tokens.colors.neutral[100],
        textColor: tokens.colors.neutral[600],
        borderColor: tokens.colors.neutral[200],
      };
    case 'guest':
      return {
        label: 'Guest',
        icon: <Globe size={10} />,
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

function getStatusConfig(status: UserStatus, tokens: DesignTokens): StatusConfig {
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
        bgColor: tokens.colors.neutral[100],
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
    case 'invited':
      return {
        label: 'Invited',
        dotColor: tokens.colors.warningScale[500],
        bgColor: tokens.colors.warningScale[50],
        textColor: tokens.colors.warningScale[700],
        borderColor: tokens.colors.warningScale[200],
      };
  }
}

// ─── Avatar color by role ────────────────────────────────────────────────────

function getAvatarColorForRole(role: UserRole, tokens: DesignTokens): { bg: string; text: string } {
  switch (role) {
    case 'admin':
      return { bg: tokens.colors.secondaryScale[100], text: tokens.colors.secondaryScale[700] };
    case 'manager':
      return { bg: tokens.colors.infoScale[100], text: tokens.colors.infoScale[700] };
    case 'member':
      return { bg: tokens.colors.successScale[100], text: tokens.colors.successScale[700] };
    case 'viewer':
      return { bg: tokens.colors.neutral[100], text: tokens.colors.neutral[600] };
    case 'guest':
      return { bg: tokens.colors.warningScale[100], text: tokens.colors.warningScale[700] };
  }
}

// ─── Grid Preset ─────────────────────────────────────────────────────────────

export const GridPlUserDirectory = createPreset<PlUserDirectoryProps>({
  name: 'PlUserDirectory.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlUserDirectoryProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const {
      users,
      onUserClick,
      onInvite,
      onSuspend,
      onActivate,
      onRoleChange,
      onDelete,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      filterRole: controlledFilterRole,
      onFilterRole,
      filterStatus: controlledFilterStatus,
      onFilterStatus,
      loading = false,
      emptyText = PL_USER_DIRECTORY_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalFilterRole, setInternalFilterRole] = useState<UserRole | null>(null);
    const [internalFilterStatus, setInternalFilterStatus] = useState<UserStatus | null>(null);
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [openQuickActionsId, setOpenQuickActionsId] = useState<string | null>(null);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const filterRole = controlledFilterRole ?? internalFilterRole;
    const filterStatus = controlledFilterStatus ?? internalFilterStatus;

    // ─── Handlers ────────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleFilterRole = useCallback((role: UserRole | null) => {
      if (controlledFilterRole === undefined) setInternalFilterRole(role);
      onFilterRole?.(role);
      setShowRoleDropdown(false);
    }, [controlledFilterRole, onFilterRole]);

    const handleFilterStatus = useCallback((status: UserStatus | null) => {
      if (controlledFilterStatus === undefined) setInternalFilterStatus(status);
      onFilterStatus?.(status);
      setShowStatusDropdown(false);
    }, [controlledFilterStatus, onFilterStatus]);

    // ─── Filtered Users ──────────────────────────────────────────────────

    const filteredUsers = useMemo(() => {
      let result = [...users];

      if (filterRole) {
        result = result.filter(u => u.role === filterRole);
      }
      if (filterStatus) {
        result = result.filter(u => u.status === filterStatus);
      }
      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(u =>
          u.firstName.toLowerCase().includes(lower) ||
          u.lastName.toLowerCase().includes(lower) ||
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower) ||
          (u.department && u.department.toLowerCase().includes(lower)) ||
          (u.title && u.title.toLowerCase().includes(lower))
        );
      }

      // Sort alphabetically by name
      result.sort((a, b) => {
        const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
        const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
        return aName.localeCompare(bName);
      });

      return result;
    }, [users, filterRole, filterStatus, searchQuery]);

    // ─── Computed Stats ──────────────────────────────────────────────────

    const computedStats = useMemo(() => {
      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.status === 'active').length;
      const mfaEnabled = users.filter(u => u.mfaEnabled).length;
      const adminCount = users.filter(u => u.role === 'admin').length;
      return { totalUsers, activeUsers, mfaEnabled, adminCount };
    }, [users]);

    // ─── Glass Styles ────────────────────────────────────────────────────

    const glassSurfaceStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blurSm,
      WebkitBackdropFilter: tokens.glass.blurSm,
      backgroundColor: tokens.glass.bgLight,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.borderLight}`,
    } : {};

    // ─── Render: Avatar (large) ──────────────────────────────────────────

    const renderAvatar = (user: UserDirectoryItem, size: number = 64) => {
      const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
      const avatarColors = getAvatarColorForRole(user.role, tokens);

      return (
        <div style={{ position: 'relative' as const, display: 'inline-block' }}>
          <div
            style={{
              width: size,
              height: size,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: user.avatar ? tokens.colors.neutral[100] : avatarColors.bg,
              backgroundImage: user.avatar ? `url(${user.avatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: size >= 64 ? tokens.typography.fontSize.xl : tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.bold,
              color: user.avatar ? 'transparent' : avatarColors.text,
              border: `3px solid ${tokens.colors.common.white}`,
              boxShadow: tokens.shadows.md,
              flexShrink: 0,
            }}
          >
            {!user.avatar && initials}
          </div>
          {/* MFA indicator on avatar */}
          <div
            title={user.mfaEnabled ? 'MFA enabled' : 'MFA not enabled'}
            style={{
              position: 'absolute' as const,
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: user.mfaEnabled ? tokens.colors.successScale[100] : tokens.colors.neutral[100],
              color: user.mfaEnabled ? tokens.colors.successScale[600] : tokens.colors.neutral[400],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${tokens.colors.common.white}`,
            }}
          >
            {user.mfaEnabled ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
          </div>
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
            User Directory
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Browse team members and manage access
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
          {/* Stats summary inline */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            borderRadius: tokens.borderRadius.lg,
            backgroundColor: tokens.colors.common.white,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            ...glassSurfaceStyle,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <Users size={14} color={tokens.colors.primaryScale[500]} />
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
              }}>
                {computedStats.totalUsers}
              </span>
            </div>
            <div style={{
              width: 1,
              height: 16,
              backgroundColor: tokens.colors.neutral[200],
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <UserCheck size={14} color={tokens.colors.successScale[500]} />
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.successScale[600],
              }}>
                {computedStats.activeUsers}
              </span>
            </div>
            <div style={{
              width: 1,
              height: 16,
              backgroundColor: tokens.colors.neutral[200],
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <ShieldCheck size={14} color={tokens.colors.infoScale[500]} />
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.infoScale[600],
              }}>
                {computedStats.mfaEnabled}
              </span>
            </div>
          </div>
          {onInvite && (
            <button
              onClick={onInvite}
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
              Invite User
            </button>
          )}
        </div>
      </div>
    );

    // ─── Render: Filter Bar ──────────────────────────────────────────────

    const renderFilterBar = () => {
      const allRoles: UserRole[] = ['admin', 'manager', 'member', 'viewer', 'guest'];
      const allStatuses: UserStatus[] = ['active', 'inactive', 'suspended', 'invited'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {/* Search */}
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
            ...glassSurfaceStyle,
          }}>
            <Search size={15} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
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

          <div style={{ flex: 1 }} />

          {/* Role filter */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
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
                right: 0,
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
                  }}
                >
                  All Roles
                </div>
                {allRoles.map(role => {
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

          {/* Status filter */}
          <div style={{ position: 'relative' as const }}>
            <button
              onClick={() => {
                setShowStatusDropdown(!showStatusDropdown);
                setShowRoleDropdown(false);
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
                right: 0,
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
                      <span style={{ ...createStatusDotStyle(tokens, cfg.dotColor) }} />
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Clear filters */}
          {(filterRole || filterStatus || searchQuery) && (
            <button
              onClick={() => {
                handleFilterRole(null);
                handleFilterStatus(null);
                handleSearchChange('');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.errorScale[200]}`,
                backgroundColor: tokens.colors.errorScale[50],
                color: tokens.colors.errorScale[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                outline: 'none',
              }}
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      );
    };

    // ─── Render: User Card ───────────────────────────────────────────────

    const renderUserCard = (user: UserDirectoryItem) => {
      const roleCfg = getRoleConfig(user.role, tokens);
      const statusCfg = getStatusConfig(user.status, tokens);
      const isHovered = hoveredCardId === user.id;
      const isActionsOpen = openQuickActionsId === user.id;
      const fullName = `${user.firstName} ${user.lastName}`;

      return (
        <div
          key={user.id}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            padding: 0,
            overflow: 'hidden' as const,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            transform: isHovered ? tokens.motion.transform : 'none',
            boxShadow: isHovered ? getCardHoverShadow(tokens, 'sm') : tokens.shadows.sm,
            position: 'relative' as const,
            ...glassSurfaceStyle,
          }}
          onMouseEnter={() => setHoveredCardId(user.id)}
          onMouseLeave={() => {
            setHoveredCardId(null);
            setOpenQuickActionsId(null);
          }}
          onClick={() => onUserClick?.(user.id)}
        >
          {/* Top accent bar - colored by role */}
          <div style={{
            height: 3,
            width: '100%',
            backgroundColor: roleCfg.bgColor,
            background: `linear-gradient(to right, ${roleCfg.textColor}, ${roleCfg.bgColor})`,
          }} />

          {/* Quick actions overlay on hover */}
          {isHovered && (
            <div style={{
              position: 'absolute' as const,
              top: tokens.spacing[2],
              right: tokens.spacing[2],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              zIndex: 10,
            }}>
              <button
                onClick={(e) => { e.stopPropagation(); /* Message action */ }}
                title="Message"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  color: tokens.colors.infoScale[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  boxShadow: tokens.shadows.sm,
                }}
              >
                <MessageSquare size={13} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onUserClick?.(user.id); }}
                title="Edit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  color: tokens.colors.primaryScale[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  boxShadow: tokens.shadows.sm,
                }}
              >
                <Edit size={13} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (user.status === 'active' || user.status === 'invited') {
                    onSuspend?.(user.id);
                  } else {
                    onActivate?.(user.id);
                  }
                }}
                title={user.status === 'active' || user.status === 'invited' ? 'Suspend' : 'Activate'}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.common.white,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  color: user.status === 'active' || user.status === 'invited'
                    ? tokens.colors.warningScale[600]
                    : tokens.colors.successScale[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                  boxShadow: tokens.shadows.sm,
                }}
              >
                {user.status === 'active' || user.status === 'invited' ? <Lock size={13} /> : <LockOpen size={13} />}
              </button>
            </div>
          )}

          {/* Card body */}
          <div style={{
            padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            textAlign: 'center' as const,
          }}>
            {/* Avatar */}
            {renderAvatar(user, 64)}

            {/* Name */}
            <div style={{
              marginTop: tokens.spacing[3],
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              lineHeight: tokens.typography.lineHeight.tight,
            }}>
              {fullName}
            </div>

            {/* Title */}
            {user.title && (
              <div style={{
                marginTop: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
                lineHeight: tokens.typography.lineHeight.normal,
              }}>
                {user.title}
              </div>
            )}

            {/* Department */}
            {user.department && (
              <div style={{
                marginTop: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
              }}>
                <Briefcase size={11} color={tokens.colors.neutral[400]} />
                {user.department}
              </div>
            )}

            {/* Badges row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginTop: tokens.spacing[3],
              flexWrap: 'wrap' as const,
              justifyContent: 'center',
            }}>
              {/* Role badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: '10px',
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: roleCfg.bgColor,
                color: roleCfg.textColor,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${roleCfg.borderColor}`,
              }}>
                {roleCfg.icon}
                {roleCfg.label}
              </span>

              {/* Status badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: '10px',
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: statusCfg.bgColor,
                color: statusCfg.textColor,
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusCfg.borderColor}`,
              }}>
                <span style={{
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: statusCfg.dotColor,
                  flexShrink: 0,
                }} />
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Separator */}
          <div style={{
            height: 1,
            backgroundColor: tokens.colors.neutral[100],
            margin: `0 ${tokens.spacing[4]}px`,
          }} />

          {/* Contact row */}
          <div style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: tokens.spacing[3],
          }}>
            {/* Email icon */}
            <div
              title={user.email}
              onClick={(e) => { e.stopPropagation(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[50],
                color: tokens.colors.primaryScale[600],
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Mail size={14} />
            </div>

            {/* Phone icon */}
            {user.phone && (
              <div
                title={user.phone}
                onClick={(e) => { e.stopPropagation(); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.successScale[50],
                  color: tokens.colors.successScale[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Phone size={14} />
              </div>
            )}

            {/* Groups indicator */}
            {user.groups && user.groups.length > 0 && (
              <div
                title={`${user.groups.length} groups: ${user.groups.join(', ')}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.secondaryScale[50],
                  color: tokens.colors.secondaryScale[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                }}
              >
                {user.groups.length}
              </div>
            )}
          </div>

          {/* Footer: last login */}
          <div style={{
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <Clock size={11} color={tokens.colors.neutral[400]} />
              {user.lastLogin
                ? formatDistanceToNow(user.lastLogin, { addSuffix: true })
                : 'Never logged in'}
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
            }}>
              {user.loginCount.toLocaleString()} logins
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: Loading Skeleton ────────────────────────────────────────

    const renderLoadingSkeleton = () => {
      const skeletonCards = Array.from({ length: 8 }, (_, i) => i);
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: tokens.spacing[4],
        }}>
          {skeletonCards.map(i => (
            <div
              key={i}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: `${tokens.spacing[5]}px ${tokens.spacing[4]}px`,
                display: 'flex',
                flexDirection: 'column' as const,
                alignItems: 'center',
                ...glassSurfaceStyle,
              }}
            >
              <div style={{
                width: 64,
                height: 64,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{
                width: '60%',
                height: 14,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
                marginTop: tokens.spacing[3],
              }} />
              <div style={{
                width: '40%',
                height: 12,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
                marginTop: tokens.spacing[2],
              }} />
              <div style={{
                display: 'flex',
                gap: tokens.spacing[2],
                marginTop: tokens.spacing[3],
              }}>
                <div style={{
                  width: 60,
                  height: 20,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: 60,
                  height: 20,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
              <div style={{
                width: '100%',
                height: 1,
                backgroundColor: tokens.colors.neutral[100],
                marginTop: tokens.spacing[4],
              }} />
              <div style={{
                display: 'flex',
                gap: tokens.spacing[2],
                marginTop: tokens.spacing[3],
              }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
            </div>
          ))}
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
          <Users size={28} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery || filterRole || filterStatus ? emptyText : 'No users yet'}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          marginBottom: tokens.spacing[6],
          maxWidth: 360,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery || filterRole || filterStatus
            ? 'Try adjusting your filters or search query to find what you are looking for.'
            : 'Start building your team by inviting users to your organization.'}
        </div>
        {onInvite && !(searchQuery || filterRole || filterStatus) && (
          <button
            onClick={onInvite}
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
            Invite Your First User
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
          setShowRoleDropdown(false);
          setShowStatusDropdown(false);
          setOpenQuickActionsId(null);
        }}
      >
        {renderHeader()}
        {renderFilterBar()}

        {loading ? renderLoadingSkeleton() : (
          filteredUsers.length === 0 ? renderEmptyState() : (
            <>
              {/* Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: tokens.spacing[4],
              }}>
                {filteredUsers.map(user => renderUserCard(user))}
              </div>

              {/* Footer count */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: tokens.spacing[5],
                padding: `${tokens.spacing[2]}px 0`,
              }}>
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}>
                  Showing {filteredUsers.length} of {users.length} users
                </span>
              </div>
            </>
          )
        )}
      </div>
    );
  },
});
