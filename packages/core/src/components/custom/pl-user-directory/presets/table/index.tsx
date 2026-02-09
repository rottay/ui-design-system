'use client';

/**
 * PlUserDirectory - Table Preset
 * Full-featured data table view with stats ribbon, sortable columns,
 * role/status badges, MFA indicators, inline actions menu, and search/filter toolbar
 */

import { useState, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createStatusDotStyle,
  createSurfaceStyle,
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
  ChevronUp,
  ChevronsUpDown,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  Clock,
  UserCheck,
  UserX,
  Crown,
  Briefcase,
  User,
  EyeOff,
  Globe,
  Lock,
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

// ─── Column Definitions ──────────────────────────────────────────────────────

interface TableColumn {
  key: string;
  label: string;
  width?: string | number;
  sortable?: boolean;
  sortField?: SortField;
  align?: 'left' | 'center' | 'right';
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'user', label: 'User', sortable: true, sortField: 'name' },
  { key: 'email', label: 'Email', width: 200, sortable: true, sortField: 'email' },
  { key: 'role', label: 'Role', width: 120, sortable: true, sortField: 'role' },
  { key: 'department', label: 'Department', width: 140, sortable: true, sortField: 'department' },
  { key: 'status', label: 'Status', width: 120, sortable: true, sortField: 'status' },
  { key: 'mfa', label: 'MFA', width: 60, sortable: false, align: 'center' },
  { key: 'lastLogin', label: 'Last Login', width: 130, sortable: true, sortField: 'lastLogin', align: 'center' },
  { key: 'actions', label: '', width: 90, sortable: false, align: 'center' },
];

// ─── Table Preset ────────────────────────────────────────────────────────────

export const TablePlUserDirectory = createPreset<PlUserDirectoryProps>({
  name: 'PlUserDirectory.Table',
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
      sortBy: controlledSortBy,
      sortDirection: controlledSortDirection,
      onSortChange,
      emptyText = PL_USER_DIRECTORY_DEFAULTS.emptyText,
      className,
      style,
    } = props;

    // ─── Internal State ──────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalFilterRole, setInternalFilterRole] = useState<UserRole | null>(null);
    const [internalFilterStatus, setInternalFilterStatus] = useState<UserStatus | null>(null);
    const [internalSortBy, setInternalSortBy] = useState<SortField>(PL_USER_DIRECTORY_DEFAULTS.sortBy as SortField ?? 'name');
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection>(PL_USER_DIRECTORY_DEFAULTS.sortDirection ?? 'asc');
    const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [openActionsMenuId, setOpenActionsMenuId] = useState<string | null>(null);
    const [openRoleChangeMenuId, setOpenRoleChangeMenuId] = useState<string | null>(null);

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const filterRole = controlledFilterRole ?? internalFilterRole;
    const filterStatus = controlledFilterStatus ?? internalFilterStatus;
    const sortBy = controlledSortBy ?? internalSortBy;
    const sortDirection = controlledSortDirection ?? internalSortDirection;

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

    const handleSortChange = useCallback((field: SortField) => {
      const newDirection: SortDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
      if (controlledSortBy === undefined) {
        setInternalSortBy(field);
        setInternalSortDirection(newDirection);
      }
      onSortChange?.(field, newDirection);
    }, [sortBy, sortDirection, controlledSortBy, onSortChange]);

    const handleToggleActionsMenu = useCallback((userId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenActionsMenuId(prev => prev === userId ? null : userId);
      setOpenRoleChangeMenuId(null);
    }, []);

    const handleToggleRoleChangeMenu = useCallback((userId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setOpenRoleChangeMenuId(prev => prev === userId ? null : userId);
    }, []);

    const handleRoleChangeAction = useCallback((userId: string, role: UserRole) => {
      onRoleChange?.(userId, role);
      setOpenRoleChangeMenuId(null);
      setOpenActionsMenuId(null);
    }, [onRoleChange]);

    const handleSuspendAction = useCallback((userId: string) => {
      onSuspend?.(userId);
      setOpenActionsMenuId(null);
    }, [onSuspend]);

    const handleActivateAction = useCallback((userId: string) => {
      onActivate?.(userId);
      setOpenActionsMenuId(null);
    }, [onActivate]);

    const handleDeleteAction = useCallback((userId: string) => {
      onDelete?.(userId);
      setOpenActionsMenuId(null);
    }, [onDelete]);

    // ─── Filtered + Sorted Users ─────────────────────────────────────────

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

      result.sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';
        switch (sortBy) {
          case 'name':
            aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
            bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'email':
            aVal = a.email.toLowerCase();
            bVal = b.email.toLowerCase();
            break;
          case 'role':
            aVal = a.role;
            bVal = b.role;
            break;
          case 'department':
            aVal = (a.department ?? '').toLowerCase();
            bVal = (b.department ?? '').toLowerCase();
            break;
          case 'status':
            aVal = a.status;
            bVal = b.status;
            break;
          case 'lastLogin':
            aVal = a.lastLogin ? a.lastLogin.getTime() : 0;
            bVal = b.lastLogin ? b.lastLogin.getTime() : 0;
            break;
          case 'createdAt':
            aVal = a.createdAt.getTime();
            bVal = b.createdAt.getTime();
            break;
          case 'loginCount':
            aVal = a.loginCount;
            bVal = b.loginCount;
            break;
          default:
            aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
            bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });

      return result;
    }, [users, filterRole, filterStatus, searchQuery, sortBy, sortDirection]);

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

    // ─── Render: Avatar ──────────────────────────────────────────────────

    const renderAvatar = (user: UserDirectoryItem, size: number = 36) => {
      const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
      const avatarColors = getAvatarColorForRole(user.role, tokens);

      return (
        <div style={{ position: 'relative' as const, flexShrink: 0 }}>
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
              fontSize: size <= 36 ? tokens.typography.fontSize.xs : tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: user.avatar ? 'transparent' : avatarColors.text,
              border: `2px solid ${tokens.colors.common.white}`,
              boxShadow: tokens.shadows.sm,
            }}
          >
            {!user.avatar && initials}
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
            Manage team members, roles, and access permissions
          </p>
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
    );

    // ─── Render: Stats Ribbon ────────────────────────────────────────────

    const renderStatsRibbon = () => {
      const statItems = [
        {
          label: 'Total Users',
          value: computedStats.totalUsers,
          icon: <Users size={18} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: computedStats.activeUsers,
          icon: <UserCheck size={18} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'MFA Enabled',
          value: computedStats.mfaEnabled,
          icon: <ShieldCheck size={18} />,
          color: tokens.colors.infoScale[600],
          bgColor: tokens.colors.infoScale[50],
        },
        {
          label: 'Admins',
          value: computedStats.adminCount,
          icon: <Crown size={18} />,
          color: tokens.colors.secondaryScale[600],
          bgColor: tokens.colors.secondaryScale[50],
        },
      ];

      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
        }}>
          {statItems.map(stat => (
            <div
              key={stat.label}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                ...glassSurfaceStyle,
              }}
            >
              <div style={{
                width: 40,
                height: 40,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: stat.bgColor,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                  marginBottom: 2,
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: stat.color,
                  lineHeight: tokens.typography.lineHeight.tight,
                }}>
                  {stat.value.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Search + Filter Bar ─────────────────────────────────────

    const renderFilterBar = () => {
      const allRoles: UserRole[] = ['admin', 'manager', 'member', 'viewer', 'guest'];
      const allStatuses: UserStatus[] = ['active', 'inactive', 'suspended', 'invited'];

      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
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
            minWidth: 260,
            transition: `all ${tokens.motion.hover}`,
          }}>
            <Search size={15} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search by name, email, department..."
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

          {/* Role filter dropdown */}
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

          {/* Status filter dropdown */}
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
                minWidth: 190,
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
                      <span style={{
                        ...createStatusDotStyle(tokens, cfg.dotColor),
                      }} />
                      {cfg.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active filter indicators */}
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
              Clear filters
            </button>
          )}
        </div>
      );
    };

    // ─── Render: Sort Icon ───────────────────────────────────────────────

    const renderSortIcon = (sortField?: SortField) => {
      if (!sortField) return null;
      if (sortBy === sortField) {
        return sortDirection === 'asc'
          ? <ChevronUp size={12} color={tokens.colors.primaryScale[500]} />
          : <ChevronDown size={12} color={tokens.colors.primaryScale[500]} />;
      }
      return <ChevronsUpDown size={12} color={tokens.colors.neutral[300]} />;
    };

    // ─── Render: Table Header ────────────────────────────────────────────

    const renderTableHeader = () => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
        backgroundColor: tokens.colors.neutral[50],
        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      }}>
        {TABLE_COLUMNS.map(col => (
          <div
            key={col.key}
            style={{
              flex: col.width ? `0 0 ${typeof col.width === 'number' ? col.width + 'px' : col.width}` : '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: sortBy === col.sortField ? tokens.colors.primaryScale[600] : tokens.colors.neutral[500],
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
              cursor: col.sortable ? 'pointer' : 'default',
              userSelect: 'none' as const,
              padding: `0 ${tokens.spacing[2]}px`,
              transition: `color ${tokens.motion.hover}`,
            }}
            onClick={() => col.sortable && col.sortField && handleSortChange(col.sortField)}
          >
            {col.label}
            {col.sortable && renderSortIcon(col.sortField)}
          </div>
        ))}
      </div>
    );

    // ─── Render: Table Row ───────────────────────────────────────────────

    const renderTableRow = (user: UserDirectoryItem) => {
      const roleCfg = getRoleConfig(user.role, tokens);
      const statusCfg = getStatusConfig(user.status, tokens);
      const isHovered = hoveredRowId === user.id;
      const isActionsOpen = openActionsMenuId === user.id;
      const isRoleChangeOpen = openRoleChangeMenuId === user.id;
      const fullName = `${user.firstName} ${user.lastName}`;
      const allRoles: UserRole[] = ['admin', 'manager', 'member', 'viewer', 'guest'];

      return (
        <div
          key={user.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: isHovered ? tokens.colors.neutral[50] : tokens.colors.common.white,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={() => setHoveredRowId(user.id)}
          onMouseLeave={() => setHoveredRowId(null)}
          onClick={() => onUserClick?.(user.id)}
        >
          {/* User (avatar + name) */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `0 ${tokens.spacing[2]}px`,
            overflow: 'hidden' as const,
          }}>
            {renderAvatar(user)}
            <div style={{ overflow: 'hidden' as const }}>
              <div style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                whiteSpace: 'nowrap' as const,
                overflow: 'hidden' as const,
                textOverflow: 'ellipsis' as const,
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {fullName}
              </div>
              {user.title && (
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  whiteSpace: 'nowrap' as const,
                  overflow: 'hidden' as const,
                  textOverflow: 'ellipsis' as const,
                  marginTop: 1,
                }}>
                  {user.title}
                </div>
              )}
            </div>
          </div>

          {/* Email */}
          <div style={{
            flex: '0 0 200px',
            padding: `0 ${tokens.spacing[2]}px`,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            overflow: 'hidden' as const,
          }}>
            <Mail size={12} color={tokens.colors.neutral[400]} style={{ flexShrink: 0 }} />
            <span style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              whiteSpace: 'nowrap' as const,
              overflow: 'hidden' as const,
              textOverflow: 'ellipsis' as const,
            }}>
              {user.email}
            </span>
          </div>

          {/* Role badge */}
          <div style={{
            flex: '0 0 120px',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
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
          </div>

          {/* Department */}
          <div style={{
            flex: '0 0 140px',
            padding: `0 ${tokens.spacing[2]}px`,
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[700],
            whiteSpace: 'nowrap' as const,
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
          }}>
            {user.department || (
              <span style={{ color: tokens.colors.neutral[400], fontStyle: 'italic' as const }}>
                Unassigned
              </span>
            )}
          </div>

          {/* Status badge */}
          <div style={{
            flex: '0 0 120px',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
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

          {/* MFA icon */}
          <div style={{
            flex: '0 0 60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            {user.mfaEnabled ? (
              <div
                title="MFA enabled"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.successScale[50],
                  color: tokens.colors.successScale[600],
                }}
              >
                <ShieldCheck size={14} />
              </div>
            ) : (
              <div
                title="MFA not enabled"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 26,
                  height: 26,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[400],
                }}
              >
                <ShieldAlert size={14} />
              </div>
            )}
          </div>

          {/* Last Login */}
          <div style={{
            flex: '0 0 130px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            {user.lastLogin ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[600],
              }}>
                <Clock size={11} color={tokens.colors.neutral[400]} />
                {formatDistanceToNow(user.lastLogin, { addSuffix: true })}
              </span>
            ) : (
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
                fontStyle: 'italic' as const,
              }}>
                Never
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{
            flex: '0 0 90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative' as const,
            padding: `0 ${tokens.spacing[2]}px`,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              opacity: isHovered || isActionsOpen ? 1 : 0,
              transition: `opacity ${tokens.motion.hover}`,
            }}>
              {/* View profile button */}
              <button
                onClick={(e) => { e.stopPropagation(); onUserClick?.(user.id); }}
                title="View profile"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <Eye size={13} />
              </button>

              {/* More actions button */}
              <button
                onClick={(e) => handleToggleActionsMenu(user.id, e)}
                title="More actions"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${isActionsOpen ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
                  backgroundColor: isActionsOpen ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                  color: isActionsOpen ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <MoreHorizontal size={13} />
              </button>
            </div>

            {/* Actions dropdown */}
            {isActionsOpen && (
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
              }}>
                {/* View Profile */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserClick?.(user.id);
                    setOpenActionsMenuId(null);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Eye size={14} color={tokens.colors.neutral[500]} />
                  View Profile
                </div>

                {/* Change Role */}
                <div
                  onClick={(e) => handleToggleRoleChangeMenu(user.id, e)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[700],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <Shield size={14} color={tokens.colors.neutral[500]} />
                    Change Role
                  </div>
                  <ChevronDown size={12} color={tokens.colors.neutral[400]} style={{
                    transform: isRoleChangeOpen ? 'rotate(180deg)' : 'none',
                    transition: `transform ${tokens.motion.hover}`,
                  }} />
                </div>

                {/* Role sub-menu */}
                {isRoleChangeOpen && (
                  <div style={{
                    borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                    padding: `${tokens.spacing[1]}px 0`,
                    backgroundColor: tokens.colors.neutral[50],
                  }}>
                    {allRoles.map(role => {
                      const cfg = getRoleConfig(role, tokens);
                      const isCurrent = user.role === role;
                      return (
                        <div
                          key={role}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCurrent) handleRoleChangeAction(user.id, role);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[4]}px`,
                            fontSize: tokens.typography.fontSize.xs,
                            color: isCurrent ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                            backgroundColor: isCurrent ? tokens.colors.primaryScale[50] : 'transparent',
                            cursor: isCurrent ? 'default' : 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                            fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal,
                          }}
                        >
                          <span style={{ color: cfg.textColor }}>{cfg.icon}</span>
                          {cfg.label}
                          {isCurrent && (
                            <span style={{
                              fontSize: '9px',
                              color: tokens.colors.primaryScale[500],
                              marginLeft: 'auto',
                            }}>
                              current
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Separator */}
                <div style={{
                  height: 1,
                  backgroundColor: tokens.colors.neutral[100],
                  margin: `${tokens.spacing[1]}px 0`,
                }} />

                {/* Suspend / Activate */}
                {user.status === 'active' || user.status === 'invited' ? (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuspendAction(user.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.warningScale[700],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Lock size={14} color={tokens.colors.warningScale[600]} />
                    Suspend User
                  </div>
                ) : (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivateAction(user.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.successScale[700],
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <LockOpen size={14} color={tokens.colors.successScale[600]} />
                    Activate User
                  </div>
                )}

                {/* Delete */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAction(user.id);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[2],
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.errorScale[600],
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                  }}
                >
                  <Trash2 size={14} color={tokens.colors.errorScale[500]} />
                  Delete User
                </div>
              </div>
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Loading State ───────────────────────────────────────────

    const renderLoadingSkeleton = () => {
      const skeletonRows = Array.from({ length: 6 }, (_, i) => i);
      return (
        <div>
          {skeletonRows.map(i => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              }}
            >
              {/* Avatar skeleton */}
              <div style={{
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
                flexShrink: 0,
              }} />
              {/* Name skeleton */}
              <div style={{ flex: 1 }}>
                <div style={{
                  width: `${60 + Math.random() * 40}%`,
                  height: 12,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                  marginBottom: 6,
                }} />
                <div style={{
                  width: `${30 + Math.random() * 30}%`,
                  height: 10,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
              {/* Email skeleton */}
              <div style={{
                width: 140,
                height: 12,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              {/* Role skeleton */}
              <div style={{
                width: 70,
                height: 22,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              {/* Status skeleton */}
              <div style={{
                width: 80,
                height: 22,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Empty State ─────────────────────────────────────────────

    const renderEmptyState = () => (
      <div style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${tokens.spacing[12]}px ${tokens.spacing[6]}px`,
        textAlign: 'center' as const,
        backgroundColor: tokens.colors.common.white,
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
          setOpenActionsMenuId(null);
          setOpenRoleChangeMenuId(null);
          setShowRoleDropdown(false);
          setShowStatusDropdown(false);
        }}
      >
        {renderHeader()}
        {renderStatsRibbon()}

        {/* Table container */}
        <div style={{
          ...createSurfaceStyle(tokens, { elevation: 'sm' }),
          backgroundColor: tokens.colors.common.white,
          overflow: 'hidden' as const,
          ...glassSurfaceStyle,
        }}>
          {renderFilterBar()}

          {loading ? renderLoadingSkeleton() : (
            filteredUsers.length === 0 ? renderEmptyState() : (
              <>
                {renderTableHeader()}
                <div>
                  {filteredUsers.map(user => renderTableRow(user))}
                </div>
              </>
            )
          )}

          {/* Footer with count */}
          {!loading && filteredUsers.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[400],
              }}>
                {computedStats.mfaEnabled} of {users.length} with MFA enabled
              </span>
            </div>
          )}
        </div>
      </div>
    );
  },
});
