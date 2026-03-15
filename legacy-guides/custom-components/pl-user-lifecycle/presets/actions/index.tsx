'use client';

/**
 * PlUserLifecycle - Actions Preset
 * Actionable user management dashboard with users grouped by lifecycle stage,
 * stage-specific action buttons, search/filter, stats ribbon, and bulk operations.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createListItemStyle,
  createInteractiveCardStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSectionHeaderStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  PlUserLifecycleProps,
  LifecycleStage,
  LifecycleAction,
  LifecycleUser,
  LifecycleEvent,
} from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  User,
  Mail,
  Clock,
  Search,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  Moon,
  LogOut,
  XCircle,
  Rocket,
  Trash2,
  Send,
  RotateCcw,
  Play,
  Pause,
  X,
  Users,
  Shield,
  CalendarClock,
  ArrowRight,
  AlertTriangle,
  Zap,
  Filter,
} from 'lucide-react';

// ─── Stage Config ─────────────────────────────────────────────────────────────

interface StageConfig {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactElement;
}

function getStageConfig(tokens: DesignTokens): Record<LifecycleStage, StageConfig> {
  return {
    invited: {
      label: 'Invited',
      description: 'Users awaiting invitation acceptance',
      color: tokens.colors.infoScale[600],
      bgColor: tokens.colors.infoScale[50],
      borderColor: tokens.colors.infoScale[200],
      icon: <Mail size={18} />,
    },
    onboarding: {
      label: 'Onboarding',
      description: 'Users currently setting up their accounts',
      color: tokens.colors.warningScale[600],
      bgColor: tokens.colors.warningScale[50],
      borderColor: tokens.colors.warningScale[200],
      icon: <Rocket size={18} />,
    },
    active: {
      label: 'Active',
      description: 'Fully active users in good standing',
      color: tokens.colors.successScale[600],
      bgColor: tokens.colors.successScale[50],
      borderColor: tokens.colors.successScale[200],
      icon: <CheckCircle size={18} />,
    },
    suspended: {
      label: 'Inactive',
      description: 'Dormant users with no recent activity',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[50],
      borderColor: tokens.colors.neutral[200],
      icon: <Moon size={18} />,
    },
    offboarding: {
      label: 'Offboarding',
      description: 'Users in the process of leaving',
      color: tokens.colors.secondaryScale[600],
      bgColor: tokens.colors.secondaryScale[50],
      borderColor: tokens.colors.secondaryScale[200],
      icon: <LogOut size={18} />,
    },
    deactivated: {
      label: 'Deactivated',
      description: 'Users who have been fully deactivated',
      color: tokens.colors.errorScale[600],
      bgColor: tokens.colors.errorScale[50],
      borderColor: tokens.colors.errorScale[200],
      icon: <XCircle size={18} />,
    },
    deleted: {
      label: 'Deleted',
      description: 'Users permanently removed from the system',
      color: tokens.colors.neutral[400],
      bgColor: tokens.colors.neutral[50],
      borderColor: tokens.colors.neutral[200],
      icon: <Trash2 size={18} />,
    },
  };
}

// ─── Stage Actions Map ────────────────────────────────────────────────────────

interface StageActionDef {
  action: LifecycleAction;
  label: string;
  icon: React.ReactElement;
  destructive: boolean;
}

function getStageActions(): Record<LifecycleStage, StageActionDef[]> {
  return {
    invited: [
      { action: 'resend_invite', label: 'Resend Invite', icon: <Send size={14} />, destructive: false },
      { action: 'revoke_invite', label: 'Revoke Invite', icon: <XCircle size={14} />, destructive: true },
    ],
    onboarding: [
      { action: 'complete_onboarding', label: 'Complete Onboarding', icon: <CheckCircle size={14} />, destructive: false },
      { action: 'extend_onboarding', label: 'Extend Period', icon: <CalendarClock size={14} />, destructive: false },
    ],
    active: [
      { action: 'suspend', label: 'Suspend', icon: <Pause size={14} />, destructive: true },
      { action: 'start_offboarding', label: 'Start Offboarding', icon: <LogOut size={14} />, destructive: true },
    ],
    suspended: [
      { action: 'reactivate', label: 'Reactivate', icon: <Play size={14} />, destructive: false },
      { action: 'deactivate', label: 'Deactivate', icon: <XCircle size={14} />, destructive: true },
    ],
    offboarding: [
      { action: 'complete_offboarding', label: 'Complete Offboarding', icon: <CheckCircle size={14} />, destructive: false },
      { action: 'cancel_offboarding', label: 'Cancel', icon: <RotateCcw size={14} />, destructive: false },
    ],
    deactivated: [
      { action: 'reactivate', label: 'Reactivate', icon: <Play size={14} />, destructive: false },
      { action: 'delete', label: 'Delete Permanently', icon: <Trash2 size={14} />, destructive: true },
    ],
    deleted: [],
  };
}

// ─── Visible Stage Order (excludes deleted) ──────────────────────────────────

const VISIBLE_STAGES: LifecycleStage[] = [
  'invited',
  'onboarding',
  'active',
  'suspended',
  'offboarding',
  'deactivated',
];

// ─── Actions Preset ──────────────────────────────────────────────────────────

export const ActionsPlUserLifecycle = createPreset<PlUserLifecycleProps>({
  name: 'PlUserLifecycle.Actions',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlUserLifecycleProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const STAGE_CONFIG = useMemo(() => getStageConfig(tokens), [tokens]);
    const STAGE_ACTIONS = useMemo(() => getStageActions(), []);

    const {
      users,
      stats,
      onUserSelect,
      onAction,
      onTransitionUser,
      onBulkAction,
      stageFilter: controlledStageFilter,
      onStageFilterChange,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      loading = false,
      emptyText = 'No users found',
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [internalStageFilter, setInternalStageFilter] = useState<LifecycleStage | null>(null);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
    const [showStageDropdown, setShowStageDropdown] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Set<LifecycleStage>>(new Set());

    const searchQuery = controlledSearchQuery ?? internalSearchQuery;
    const stageFilter = controlledStageFilter ?? internalStageFilter;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleStageFilterChange = useCallback((stage: LifecycleStage | null) => {
      if (controlledStageFilter === undefined) setInternalStageFilter(stage);
      onStageFilterChange?.(stage);
      setShowStageDropdown(false);
    }, [controlledStageFilter, onStageFilterChange]);

    const handleUserToggle = useCallback((userId: string) => {
      setSelectedUserIds(prev => {
        const next = new Set(prev);
        if (next.has(userId)) {
          next.delete(userId);
        } else {
          next.add(userId);
        }
        return next;
      });
    }, []);

    const handleSelectAllInStage = useCallback((stage: LifecycleStage, stageUsers: LifecycleUser[]) => {
      setSelectedUserIds(prev => {
        const next = new Set(prev);
        const allSelected = stageUsers.every(u => next.has(u.id));
        if (allSelected) {
          stageUsers.forEach(u => next.delete(u.id));
        } else {
          stageUsers.forEach(u => next.add(u.id));
        }
        return next;
      });
    }, []);

    const handleClearSelection = useCallback(() => {
      setSelectedUserIds(new Set());
    }, []);

    const handleBulkAction = useCallback((action: string) => {
      const ids = Array.from(selectedUserIds);
      if (ids.length === 0) return;

      // Determine the stage from the first selected user
      const firstUser = users.find(u => selectedUserIds.has(u.id));
      if (firstUser) {
        onBulkAction?.(firstUser.currentStage, action, ids);
      }
      setSelectedUserIds(new Set());
    }, [selectedUserIds, users, onBulkAction]);

    const handleAction = useCallback((userId: string, action: LifecycleAction) => {
      onAction?.(userId, action);
    }, [onAction]);

    const toggleSection = useCallback((stage: LifecycleStage) => {
      setCollapsedSections(prev => {
        const next = new Set(prev);
        if (next.has(stage)) {
          next.delete(stage);
        } else {
          next.add(stage);
        }
        return next;
      });
    }, []);

    // ─── Computed Data ──────────────────────────────────────────────────

    const filteredUsers = useMemo(() => {
      let result = [...users];

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(u =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
        );
      }

      return result;
    }, [users, searchQuery]);

    const usersByStage = useMemo(() => {
      const result: Record<LifecycleStage, LifecycleUser[]> = {
        invited: [],
        onboarding: [],
        active: [],
        suspended: [],
        offboarding: [],
        deactivated: [],
        deleted: [],
      };

      filteredUsers.forEach(user => {
        result[user.currentStage].push(user);
      });

      return result;
    }, [filteredUsers]);

    const visibleStages = useMemo(() => {
      if (stageFilter) {
        return VISIBLE_STAGES.filter(s => s === stageFilter);
      }
      return VISIBLE_STAGES;
    }, [stageFilter]);

    const totalUsers = users.length;
    const activeCount = users.filter(u => u.currentStage === 'active').length;
    const onboardingCount = users.filter(u => u.currentStage === 'onboarding').length;
    const inactiveCount = users.filter(u => u.currentStage === 'suspended').length;

    // ─── Bulk Action Labels ─────────────────────────────────────────────

    const selectedStageForBulk = useMemo((): LifecycleStage | null => {
      if (selectedUserIds.size === 0) return null;
      const stages = new Set<LifecycleStage>();
      users.forEach(u => {
        if (selectedUserIds.has(u.id)) {
          stages.add(u.currentStage);
        }
      });
      if (stages.size === 1) return Array.from(stages)[0];
      return null;
    }, [selectedUserIds, users]);

    // ─── Glass Styles ───────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Render: Stats Ribbon ───────────────────────────────────────────

    const renderStatsRibbon = () => {
      const statItems = [
        {
          label: 'Total Users',
          value: totalUsers,
          icon: <Users size={16} />,
          color: tokens.colors.primaryScale[600],
          bgColor: tokens.colors.primaryScale[50],
        },
        {
          label: 'Active',
          value: activeCount,
          icon: <CheckCircle size={16} />,
          color: tokens.colors.successScale[600],
          bgColor: tokens.colors.successScale[50],
        },
        {
          label: 'Onboarding',
          value: onboardingCount,
          icon: <Rocket size={16} />,
          color: tokens.colors.warningScale[600],
          bgColor: tokens.colors.warningScale[50],
        },
        {
          label: 'Inactive',
          value: inactiveCount,
          icon: <Moon size={16} />,
          color: tokens.colors.neutral[600],
          bgColor: tokens.colors.neutral[100],
        },
      ];

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[5],
          }}
        >
          {statItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                padding: tokens.spacing[4],
                ...glassCardStyle,
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[2],
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: item.bgColor,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {item.icon}
                </div>
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[500],
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.05em',
                }}>
                  {item.label}
                </span>
              </div>
              <div style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      );
    };

    // ─── Render: Search & Filter Bar ────────────────────────────────────

    const renderSearchFilterBar = () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[5],
          flexWrap: 'wrap' as const,
        }}
      >
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.common.white,
          flex: 1,
          minWidth: 280,
          transition: `all ${tokens.motion.hover}`,
        }}>
          <Search size={16} color={tokens.colors.neutral[400]} />
          <input
            type="text"
            placeholder="Search users by name or email..."
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
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <X
              size={14}
              color={tokens.colors.neutral[400]}
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={() => handleSearchChange('')}
            />
          )}
        </div>

        {/* Stage Filter Dropdown */}
        <div style={{ position: 'relative' as const }}>
          <button
            onClick={() => setShowStageDropdown(!showStageDropdown)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${stageFilter ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]}`,
              backgroundColor: stageFilter ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
              color: stageFilter ? tokens.colors.primaryScale[600] : tokens.colors.neutral[600],
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              outline: 'none',
            }}
          >
            <Filter size={14} />
            {stageFilter ? STAGE_CONFIG[stageFilter].label : 'All Stages'}
            <ChevronDown size={14} />
          </button>

          {showStageDropdown && (
            <div style={{
              position: 'absolute' as const,
              top: '100%',
              right: 0,
              marginTop: tokens.spacing[1],
              minWidth: 240,
              backgroundColor: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.lg,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
              zIndex: 50,
              padding: `${tokens.spacing[1]}px 0`,
            }}>
              <div
                onClick={() => handleStageFilterChange(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  fontSize: tokens.typography.fontSize.sm,
                  color: !stageFilter ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                  backgroundColor: !stageFilter ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Users size={14} />
                All Stages
                <span style={{
                  marginLeft: 'auto',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[400],
                }}>
                  {totalUsers}
                </span>
              </div>
              {VISIBLE_STAGES.map(stage => {
                const cfg = STAGE_CONFIG[stage];
                const count = usersByStage[stage].length;
                return (
                  <div
                    key={stage}
                    onClick={() => handleStageFilterChange(stage)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: stageFilter === stage ? tokens.colors.primaryScale[600] : tokens.colors.neutral[700],
                      backgroundColor: stageFilter === stage ? tokens.colors.primaryScale[50] : 'transparent',
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <div style={{ color: cfg.color }}>{cfg.icon}</div>
                    {cfg.label}
                    <span style={{
                      marginLeft: 'auto',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[400],
                      minWidth: 20,
                      textAlign: 'right' as const,
                    }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );

    // ─── Render: Bulk Action Toolbar ────────────────────────────────────

    const renderBulkActionToolbar = () => {
      if (selectedUserIds.size === 0) return null;

      const bulkActions = selectedStageForBulk
        ? STAGE_ACTIONS[selectedStageForBulk]
        : [];

      return (
        <div
          style={{
            ...createCardStyle(tokens, { elevation: 'md' }),
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            marginBottom: tokens.spacing[4],
            backgroundColor: tokens.colors.primaryScale[50],
            border: `2px solid ${tokens.colors.primaryScale[200]}`,
            position: 'sticky' as const,
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap' as const,
            gap: tokens.spacing[2],
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
              }}>
                {selectedUserIds.size}
              </div>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[800],
              }}>
                {selectedUserIds.size} {selectedUserIds.size === 1 ? 'user' : 'users'} selected
              </span>
              {selectedStageForBulk && (
                <span style={{
                  ...createBadgeStyle(tokens, 'info'),
                  fontSize: tokens.typography.fontSize.xs,
                }}>
                  {STAGE_CONFIG[selectedStageForBulk].label}
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              {bulkActions.map(actionDef => (
                <button
                  key={actionDef.action}
                  onClick={() => handleBulkAction(actionDef.action)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    borderRadius: tokens.borderRadius.md,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    backgroundColor: actionDef.destructive
                      ? tokens.colors.errorScale[600]
                      : tokens.colors.primaryScale[600],
                    color: tokens.colors.common.white,
                    border: 'none',
                    cursor: 'pointer',
                    transition: `all ${tokens.motion.hover}`,
                    outline: 'none',
                  }}
                >
                  {actionDef.icon}
                  {actionDef.label}
                </button>
              ))}
              {!selectedStageForBulk && selectedUserIds.size > 0 && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontStyle: 'italic',
                }}>
                  Select users from same stage for bulk actions
                </span>
              )}
              <button
                onClick={handleClearSelection}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.neutral[700],
                  border: `1px solid ${tokens.colors.neutral[300]}`,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  outline: 'none',
                }}
              >
                <X size={14} />
                Clear
              </button>
            </div>
          </div>
        </div>
      );
    };

    // ─── Render: User Avatar ────────────────────────────────────────────

    const renderAvatar = (user: LifecycleUser, size: number = 40) => {
      if (user.avatar) {
        return (
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: size,
              height: size,
              borderRadius: tokens.borderRadius.full,
              objectFit: 'cover' as const,
              flexShrink: 0,
            }}
          />
        );
      }

      return (
        <div style={{
          width: size,
          height: size,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[100],
          color: tokens.colors.primaryScale[600],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size > 36 ? tokens.typography.fontSize.md : tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          flexShrink: 0,
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      );
    };

    // ─── Render: Action Button ──────────────────────────────────────────

    const renderActionButton = (
      userId: string,
      actionDef: StageActionDef,
      compact: boolean = false
    ) => (
      <button
        key={actionDef.action}
        onClick={(e) => {
          e.stopPropagation();
          handleAction(userId, actionDef.action);
        }}
        title={actionDef.label}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: compact ? 0 : tokens.spacing[1],
          padding: compact
            ? `${tokens.spacing[1]}px ${tokens.spacing[2]}px`
            : `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.fontSize.xs,
          fontWeight: tokens.typography.fontWeight.semibold,
          backgroundColor: actionDef.destructive
            ? tokens.colors.errorScale[50]
            : tokens.colors.primaryScale[50],
          color: actionDef.destructive
            ? tokens.colors.errorScale[700]
            : tokens.colors.primaryScale[700],
          border: `1px solid ${actionDef.destructive
            ? tokens.colors.errorScale[200]
            : tokens.colors.primaryScale[200]}`,
          cursor: 'pointer',
          transition: `all ${tokens.motion.hover}`,
          outline: 'none',
          whiteSpace: 'nowrap' as const,
        }}
      >
        {actionDef.icon}
        {!compact && actionDef.label}
      </button>
    );

    // ─── Render: User Card ──────────────────────────────────────────────

    const renderUserCard = (user: LifecycleUser, stageActions: StageActionDef[]) => {
      const isSelected = selectedUserIds.has(user.id);
      const isHovered = hoveredUserId === user.id;
      const cfg = STAGE_CONFIG[user.currentStage];
      const daysWarning = user.daysSinceLastTransition > 30;

      return (
        <div
          key={user.id}
          onMouseEnter={() => setHoveredUserId(user.id)}
          onMouseLeave={() => setHoveredUserId(null)}
          onClick={() => onUserSelect?.(user.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: isSelected
              ? tokens.colors.primaryScale[50]
              : isHovered
                ? tokens.colors.neutral[50]
                : tokens.colors.common.white,
            borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
        >
          {/* Checkbox */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleUserToggle(user.id);
            }}
            style={{
              width: 18,
              height: 18,
              borderRadius: tokens.borderRadius.sm,
              border: `2px solid ${isSelected ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
              backgroundColor: isSelected ? tokens.colors.primaryScale[500] : tokens.colors.common.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: `all ${tokens.motion.hover}`,
            }}
          >
            {isSelected && (
              <svg width={10} height={10} viewBox="0 0 12 12">
                <path
                  d="M2 6L5 9L10 3"
                  stroke={tokens.colors.common.white}
                  strokeWidth={2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          {/* Avatar */}
          {renderAvatar(user)}

          {/* User Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[1],
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                overflow: 'hidden' as const,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {user.name}
              </span>
              {daysWarning && (
                <AlertTriangle size={12} color={tokens.colors.warningScale[500]} />
              )}
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
            }}>
              <Mail size={11} />
              <span style={{
                overflow: 'hidden' as const,
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
              }}>
                {user.email}
              </span>
            </div>
          </div>

          {/* Days in Stage */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: daysWarning
              ? tokens.colors.warningScale[600]
              : tokens.colors.neutral[500],
            minWidth: 80,
            flexShrink: 0,
          }}>
            <Clock size={12} />
            <span>{user.daysSinceLastTransition}d in stage</span>
          </div>

          {/* Last Active */}
          {user.lastActive && (
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
              minWidth: 70,
              flexShrink: 0,
              textAlign: 'right' as const,
            }}>
              {formatDistanceToNow(user.lastActive, { addSuffix: true })}
            </div>
          )}

          {/* Onboarding Progress */}
          {user.currentStage === 'onboarding' && user.onboardingProgress !== undefined && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              minWidth: 100,
              flexShrink: 0,
            }}>
              <div style={{ flex: 1 }}>
                <div style={createProgressBarStyle(tokens, { percent: user.onboardingProgress }).track}>
                  <div style={createProgressBarStyle(tokens, { percent: user.onboardingProgress }).fill} />
                </div>
              </div>
              <span style={{
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.primaryScale[600],
                minWidth: 30,
                textAlign: 'right' as const,
              }}>
                {user.onboardingProgress}%
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            opacity: isHovered || isSelected ? 1 : 0,
            transition: `opacity ${tokens.motion.hover}`,
            flexShrink: 0,
          }}>
            {stageActions.map(actionDef =>
              renderActionButton(user.id, actionDef, false)
            )}
          </div>
        </div>
      );
    };

    // ─── Render: Section Header ─────────────────────────────────────────

    const renderSectionHeader = (stage: LifecycleStage, stageUsers: LifecycleUser[]) => {
      const cfg = STAGE_CONFIG[stage];
      const isCollapsed = collapsedSections.has(stage);
      const selectedInStage = stageUsers.filter(u => selectedUserIds.has(u.id)).length;
      const allSelectedInStage = stageUsers.length > 0 && stageUsers.every(u => selectedUserIds.has(u.id));

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            backgroundColor: cfg.bgColor,
            borderBottom: `1px solid ${cfg.borderColor}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
            userSelect: 'none' as const,
          }}
        >
          {/* Select All Checkbox */}
          {stageUsers.length > 0 && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleSelectAllInStage(stage, stageUsers);
              }}
              style={{
                width: 18,
                height: 18,
                borderRadius: tokens.borderRadius.sm,
                border: `2px solid ${allSelectedInStage ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300]}`,
                backgroundColor: allSelectedInStage
                  ? tokens.colors.primaryScale[500]
                  : selectedInStage > 0
                    ? tokens.colors.primaryScale[200]
                    : tokens.colors.common.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              {allSelectedInStage && (
                <svg width={10} height={10} viewBox="0 0 12 12">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke={tokens.colors.common.white}
                    strokeWidth={2}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              {!allSelectedInStage && selectedInStage > 0 && (
                <div style={{
                  width: 8,
                  height: 2,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.primaryScale[600],
                }} />
              )}
            </div>
          )}

          {/* Stage Icon */}
          <div style={{
            width: 36,
            height: 36,
            borderRadius: tokens.borderRadius.md,
            backgroundColor: tokens.colors.common.white,
            color: cfg.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${cfg.borderColor}`,
            flexShrink: 0,
          }}>
            {cfg.icon}
          </div>

          {/* Label & Description */}
          <div
            style={{ flex: 1, minWidth: 0 }}
            onClick={() => toggleSection(stage)}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
            }}>
              <span style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                {cfg.label}
              </span>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 24,
                height: 24,
                padding: `0 ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                backgroundColor: cfg.color,
                color: tokens.colors.common.white,
              }}>
                {stageUsers.length}
              </span>
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              marginTop: 2,
            }}>
              {cfg.description}
            </div>
          </div>

          {/* Collapse Toggle */}
          <div
            onClick={() => toggleSection(stage)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              borderRadius: tokens.borderRadius.md,
              color: tokens.colors.neutral[400],
              cursor: 'pointer',
              transition: `transform ${tokens.motion.hover}`,
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
              flexShrink: 0,
            }}
          >
            <ChevronDown size={18} />
          </div>
        </div>
      );
    };

    // ─── Render: Empty Section State ────────────────────────────────────

    const renderEmptySectionState = (stage: LifecycleStage) => {
      const cfg = STAGE_CONFIG[stage];

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${tokens.spacing[6]}px ${tokens.spacing[4]}px`,
          textAlign: 'center' as const,
        }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: tokens.borderRadius.full,
            backgroundColor: cfg.bgColor,
            color: cfg.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: tokens.spacing[3],
            opacity: 0.6,
          }}>
            {cfg.icon}
          </div>
          <span style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[400],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            No users in {cfg.label.toLowerCase()} stage
          </span>
        </div>
      );
    };

    // ─── Render: Stage Section ──────────────────────────────────────────

    const renderStageSection = (stage: LifecycleStage) => {
      const stageUsers = usersByStage[stage];
      const stageActions = STAGE_ACTIONS[stage];
      const isCollapsed = collapsedSections.has(stage);
      const cfg = STAGE_CONFIG[stage];

      return (
        <div
          key={stage}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
            marginBottom: tokens.spacing[4],
            overflow: 'hidden' as const,
            ...(isModern ? glassCardStyle : {}),
          }}
        >
          {renderSectionHeader(stage, stageUsers)}

          {!isCollapsed && (
            <>
              {stageUsers.length === 0 ? (
                renderEmptySectionState(stage)
              ) : (
                <div style={{ overflow: 'hidden' as const }}>
                  {stageUsers.map(user => renderUserCard(user, stageActions))}
                </div>
              )}
            </>
          )}
        </div>
      );
    };

    // ─── Render: Loading Skeleton ───────────────────────────────────────

    const renderLoadingSkeleton = () => (
      <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
        {[1, 2, 3].map(idx => (
          <div
            key={idx}
            style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern, padding: 0 }),
              overflow: 'hidden' as const,
              ...(isModern ? glassCardStyle : {}),
            }}
          >
            {/* Skeleton header */}
            <div style={{
              padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
              backgroundColor: tokens.colors.neutral[50],
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[100],
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{
                  width: 120,
                  height: 14,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.neutral[100],
                  marginBottom: tokens.spacing[1],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: 200,
                  height: 10,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
              </div>
            </div>

            {/* Skeleton rows */}
            {[1, 2].map(rowIdx => (
              <div
                key={rowIdx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[3],
                  padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                }}
              >
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: tokens.borderRadius.sm,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  animation: 'pulse 1.5s ease-in-out infinite',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{
                    width: 160,
                    height: 14,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: tokens.colors.neutral[100],
                    marginBottom: tokens.spacing[1],
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                  <div style={{
                    width: 220,
                    height: 10,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: tokens.colors.neutral[100],
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );

    // ─── Render: Global Empty State ─────────────────────────────────────

    const renderGlobalEmptyState = () => (
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
          width: 72,
          height: 72,
          borderRadius: tokens.borderRadius.full,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: tokens.spacing[4],
        }}>
          <Users size={32} color={tokens.colors.primaryScale[400]} />
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.lg,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          marginBottom: tokens.spacing[2],
        }}>
          {searchQuery ? 'No matching users' : emptyText}
        </div>
        <div style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          maxWidth: 400,
          lineHeight: tokens.typography.lineHeight.relaxed,
        }}>
          {searchQuery
            ? 'Try adjusting your search query or clearing filters to find the users you are looking for.'
            : 'No users have been added to the system yet. Invite users to begin tracking their lifecycle.'}
        </div>
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
        {/* Header */}
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
              User Lifecycle Actions
            </h1>
            <p style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              margin: 0,
              marginTop: tokens.spacing[1],
            }}>
              Manage users by lifecycle stage with targeted actions and bulk operations
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}>
            <span style={{
              ...createBadgeStyle(tokens, 'primary'),
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
            }}>
              <Shield size={12} />
              {totalUsers} total users
            </span>
          </div>
        </div>

        {/* Stats Ribbon */}
        {renderStatsRibbon()}

        {/* Search & Filter */}
        {renderSearchFilterBar()}

        {/* Bulk Action Toolbar */}
        {renderBulkActionToolbar()}

        {/* Stage Sections */}
        {loading ? (
          renderLoadingSkeleton()
        ) : filteredUsers.length === 0 && !stageFilter ? (
          renderGlobalEmptyState()
        ) : (
          visibleStages.map(stage => renderStageSection(stage))
        )}

        {/* Pulse Animation Keyframes */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
      </div>
    );
  },
});
