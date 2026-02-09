'use client';

/**
 * PlUserLifecycle - Timeline Preset
 * User lifecycle timeline with vertical event display, stage visualization, and progress tracking
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createSurfaceStyle,
  createEmptyStateStyle,
  createListItemStyle,
  createProgressBarStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { PlUserLifecycleProps, LifecycleStage, LifecycleUser, LifecycleEvent } from '../../core';
import type { DesignTokens } from '../../../../../core/types/tokens';
import {
  User,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
  Trash2,
  Search,
  ChevronDown,
  Bot,
  Play,
  Zap,
} from 'lucide-react';

// ─── Stage Config ─────────────────────────────────────────────────────────────

interface StageConfig {
  label: string;
  color: string;
  bgColor: string;
  icon: JSX.Element;
}

function getStageConfig(tokens: DesignTokens): Record<LifecycleStage, StageConfig> {
  return {
    invited: {
      label: 'Invited',
      color: tokens.colors.infoScale[600],
      bgColor: tokens.colors.infoScale[100],
      icon: <Mail size={16} />,
    },
    onboarding: {
      label: 'Onboarding',
      color: tokens.colors.warningScale[600],
      bgColor: tokens.colors.warningScale[100],
      icon: <UserPlus size={16} />,
    },
    active: {
      label: 'Active',
      color: tokens.colors.successScale[600],
      bgColor: tokens.colors.successScale[100],
      icon: <UserCheck size={16} />,
    },
    suspended: {
      label: 'Suspended',
      color: tokens.colors.errorScale[600],
      bgColor: tokens.colors.errorScale[100],
      icon: <AlertCircle size={16} />,
    },
    offboarding: {
      label: 'Offboarding',
      color: tokens.colors.secondaryScale[600],
      bgColor: tokens.colors.secondaryScale[100],
      icon: <UserMinus size={16} />,
    },
    deactivated: {
      label: 'Deactivated',
      color: tokens.colors.neutral[600],
      bgColor: tokens.colors.neutral[100],
      icon: <UserX size={16} />,
    },
    deleted: {
      label: 'Deleted',
      color: tokens.colors.neutral[400],
      bgColor: tokens.colors.neutral[50],
      icon: <Trash2 size={16} />,
    },
  };
}

// ─── Timeline Preset ──────────────────────────────────────────────────────────

export const TimelinePlUserLifecycle = createPreset<PlUserLifecycleProps>({
  name: 'PlUserLifecycle.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<PlUserLifecycleProps>) => {
    const { Box, Stack } = primitives;
    const isModern = tokens.surface.useGlass;

    const STAGE_CONFIG = useMemo(() => getStageConfig(tokens), [tokens]);

    const {
      users,
      stats,
      selectedUserId: controlledSelectedUserId,
      onUserSelect,
      onTransitionUser,
      stageFilter: controlledStageFilter,
      onStageFilterChange,
      searchQuery: controlledSearchQuery,
      onSearchChange,
      emptyText = 'No users found',
      className,
      style,
    } = props;

    // ─── Internal State ─────────────────────────────────────────────────

    const [internalSelectedUserId, setInternalSelectedUserId] = useState<string | null>(
      users.length > 0 ? users[0].id : null
    );
    const [internalStageFilter, setInternalStageFilter] = useState<LifecycleStage | null>(null);
    const [internalSearchQuery, setInternalSearchQuery] = useState('');
    const [showTransitionModal, setShowTransitionModal] = useState(false);
    const [transitionReason, setTransitionReason] = useState('');

    const selectedUserId = controlledSelectedUserId ?? internalSelectedUserId;
    const stageFilter = controlledStageFilter ?? internalStageFilter;
    const searchQuery = controlledSearchQuery ?? internalSearchQuery;

    // ─── Handlers ───────────────────────────────────────────────────────

    const handleUserSelect = useCallback((userId: string) => {
      if (controlledSelectedUserId === undefined) setInternalSelectedUserId(userId);
      onUserSelect?.(userId);
    }, [controlledSelectedUserId, onUserSelect]);

    const handleStageFilterChange = useCallback((stage: LifecycleStage | null) => {
      if (controlledStageFilter === undefined) setInternalStageFilter(stage);
      onStageFilterChange?.(stage);
    }, [controlledStageFilter, onStageFilterChange]);

    const handleSearchChange = useCallback((query: string) => {
      if (controlledSearchQuery === undefined) setInternalSearchQuery(query);
      onSearchChange?.(query);
    }, [controlledSearchQuery, onSearchChange]);

    const handleTransitionUser = useCallback((toStage: LifecycleStage) => {
      if (selectedUserId) {
        onTransitionUser?.(selectedUserId, toStage, transitionReason || undefined);
        setShowTransitionModal(false);
        setTransitionReason('');
      }
    }, [selectedUserId, transitionReason, onTransitionUser]);

    // ─── Filtered Users ─────────────────────────────────────────────────

    const filteredUsers = useMemo(() => {
      let result = [...users];

      if (stageFilter) {
        result = result.filter(u => u.currentStage === stageFilter);
      }

      if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        result = result.filter(u =>
          u.name.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower)
        );
      }

      return result;
    }, [users, stageFilter, searchQuery]);

    const selectedUser = users.find(u => u.id === selectedUserId);

    // ─── Glass Styles ───────────────────────────────────────────────────

    const glassCardStyle = isModern && tokens.glass ? {
      backdropFilter: tokens.glass.blur,
      WebkitBackdropFilter: tokens.glass.blur,
      backgroundColor: tokens.glass.bg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.glass.border}`,
    } : {};

    // ─── Render: Stats Ribbon ───────────────────────────────────────────

    const renderStatsRibbon = () => {
      if (!stats) return null;

      const stages: LifecycleStage[] = ['invited', 'onboarding', 'active', 'suspended', 'offboarding', 'deactivated', 'deleted'];

      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
            flexWrap: 'wrap' as const,
          }}
        >
          {stages.map(stage => {
            const count = stats.byStage[stage] || 0;
            const cfg = STAGE_CONFIG[stage];
            const isActive = stageFilter === stage;

            return (
              <div
                key={stage}
                onClick={() => handleStageFilterChange(isActive ? null : stage)}
                style={{
                  ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
                  flex: 1,
                  minWidth: 140,
                  padding: tokens.spacing[3],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  borderColor: isActive ? cfg.color : undefined,
                  borderWidth: isActive ? '2px' : undefined,
                  ...glassCardStyle,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: cfg.bgColor,
                    color: cfg.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {cfg.icon}
                  </div>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[600],
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.05em',
                  }}>
                    {cfg.label}
                  </span>
                </div>
                <div style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                }}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // ─── Render: User List Sidebar ──────────────────────────────────────

    const renderUserListSidebar = () => (
      <div
        style={{
          ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
          width: 320,
          padding: 0,
          display: 'flex',
          flexDirection: 'column' as const,
          maxHeight: '80vh',
          overflow: 'hidden' as const,
          ...glassCardStyle,
        }}
      >
        {/* Search */}
        <div style={{ padding: tokens.spacing[3], borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            backgroundColor: tokens.colors.common.white,
          }}>
            <Search size={14} color={tokens.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search users..."
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
          </div>
        </div>

        {/* User List */}
        <div style={{ flex: 1, overflow: 'auto' as const }}>
          {filteredUsers.length === 0 ? (
            <div style={{
              ...createEmptyStateStyle(tokens),
              padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
            }}>
              <span style={{ fontSize: tokens.typography.fontSize.sm }}>{emptyText}</span>
            </div>
          ) : (
            filteredUsers.map(user => {
              const isSelected = user.id === selectedUserId;
              const cfg = STAGE_CONFIG[user.currentStage];

              return (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  style={{
                    ...createListItemStyle(tokens, { active: isSelected, interactive: true }),
                    display: 'flex',
                    alignItems: 'center',
                    gap: tokens.spacing[3],
                    padding: `${tokens.spacing[3]}px ${tokens.spacing[3]}px`,
                  }}
                >
                  <div style={{ position: 'relative' as const }}>
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: tokens.borderRadius.full,
                          objectFit: 'cover' as const,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        color: tokens.colors.primaryScale[600],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.semibold,
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{
                      position: 'absolute' as const,
                      bottom: -2,
                      right: -2,
                      width: 14,
                      height: 14,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: cfg.bgColor,
                      border: `2px solid ${tokens.colors.common.white}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <span style={{ ...createStatusDotStyle(tokens, cfg.color) }} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      overflow: 'hidden' as const,
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {user.name}
                    </div>
                    <div style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      overflow: 'hidden' as const,
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {user.email}
                    </div>
                  </div>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[400],
                    whiteSpace: 'nowrap' as const,
                  }}>
                    {user.daysSinceLastTransition}d
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    );

    // ─── Render: Timeline Event Card ────────────────────────────────────

    const renderEventCard = (event: LifecycleEvent) => {
      const fromCfg = event.fromStage ? STAGE_CONFIG[event.fromStage] : null;
      const toCfg = STAGE_CONFIG[event.toStage];

      return (
        <div
          key={event.id}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: false }),
            padding: tokens.spacing[4],
            marginLeft: tokens.spacing[6],
            position: 'relative' as const,
          }}
        >
          {/* Transition Arrow */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginBottom: tokens.spacing[3],
          }}>
            {fromCfg && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.medium,
                backgroundColor: fromCfg.bgColor,
                color: fromCfg.color,
              }}>
                {fromCfg.label}
              </span>
            )}
            <ArrowRight size={14} color={tokens.colors.neutral[400]} />
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
              borderRadius: tokens.borderRadius.full,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              backgroundColor: toCfg.bgColor,
              color: toCfg.color,
            }}>
              {toCfg.label}
            </span>
          </div>

          {/* Event Details */}
          <div style={{ marginBottom: tokens.spacing[2] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[700],
            }}>
              <User size={14} color={tokens.colors.neutral[400]} />
              <span>
                Triggered by <strong>{event.triggeredBy.name}</strong>
              </span>
              {event.isAutomated && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: `2px ${tokens.spacing[1]}px`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: '10px',
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: tokens.colors.infoScale[50],
                  color: tokens.colors.infoScale[600],
                }}>
                  <Bot size={10} />
                  Auto
                </span>
              )}
            </div>
          </div>

          {event.reason && (
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[600],
              marginBottom: tokens.spacing[2],
              fontStyle: 'italic',
            }}>
              "{event.reason}"
            </div>
          )}

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
          }}>
            <Clock size={12} />
            {event.timestamp.toLocaleString()}
          </div>
        </div>
      );
    };

    // ─── Render: Timeline Panel ─────────────────────────────────────────

    const renderTimelinePanel = () => {
      if (!selectedUser) {
        return (
          <div
            style={{
              ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
              ...createEmptyStateStyle(tokens),
              flex: 1,
              minHeight: 400,
              ...glassCardStyle,
            }}
          >
            <User size={48} color={tokens.colors.neutral[300]} />
            <span style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[400],
              marginTop: tokens.spacing[3],
            }}>
              Select a user to view timeline
            </span>
          </div>
        );
      }

      const currentCfg = STAGE_CONFIG[selectedUser.currentStage];
      const sortedHistory = [...selectedUser.stageHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return (
        <div
          style={{
            ...createCardStyle(tokens, { elevation: 'sm', glass: isModern }),
            flex: 1,
            padding: tokens.spacing[6],
            maxHeight: '80vh',
            overflow: 'auto' as const,
            ...glassCardStyle,
          }}
        >
          {/* User Header */}
          <div style={{ marginBottom: tokens.spacing[6] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[4], marginBottom: tokens.spacing[4] }}>
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: tokens.borderRadius.lg,
                    objectFit: 'cover' as const,
                  }}
                />
              ) : (
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: tokens.borderRadius.lg,
                  backgroundColor: tokens.colors.primaryScale[100],
                  color: tokens.colors.primaryScale[600],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                }}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  margin: 0,
                  marginBottom: tokens.spacing[1],
                }}>
                  {selectedUser.name}
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}>
                  <Mail size={14} />
                  {selectedUser.email}
                </div>
              </div>
              <button
                onClick={() => setShowTransitionModal(true)}
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
                <Zap size={16} />
                Transition User
              </button>
            </div>

            {/* Current Stage Badge (Pulsing) */}
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.full,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                backgroundColor: currentCfg.bgColor,
                color: currentCfg.color,
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}>
                {currentCfg.icon}
                Current: {currentCfg.label}
                <span style={{ ...createStatusDotStyle(tokens, currentCfg.color) }} />
              </span>
            </div>

            {/* Onboarding Progress */}
            {selectedUser.currentStage === 'onboarding' && selectedUser.onboardingProgress !== undefined && (
              <div style={{ marginBottom: tokens.spacing[4] }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[2],
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[600],
                    textTransform: 'uppercase' as const,
                  }}>
                    Onboarding Progress
                  </span>
                  <span style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primaryScale[600],
                  }}>
                    {selectedUser.onboardingProgress}%
                  </span>
                </div>
                <div style={createProgressBarStyle(tokens, { percent: selectedUser.onboardingProgress }).track}>
                  <div style={createProgressBarStyle(tokens, { percent: selectedUser.onboardingProgress }).fill} />
                </div>
              </div>
            )}

            {/* Offboarding Checklist */}
            {selectedUser.currentStage === 'offboarding' && selectedUser.offboardingChecklist && (
              <div style={{
                padding: tokens.spacing[3],
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.neutral[50],
                border: `1px solid ${tokens.colors.neutral[200]}`,
              }}>
                <div style={{
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[600],
                  textTransform: 'uppercase' as const,
                  marginBottom: tokens.spacing[2],
                }}>
                  Offboarding Checklist
                </div>
                {selectedUser.offboardingChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: tokens.spacing[2],
                      padding: `${tokens.spacing[1]}px 0`,
                    }}
                  >
                    <div style={{
                      width: 16,
                      height: 16,
                      borderRadius: tokens.borderRadius.sm,
                      border: `2px solid ${item.completed ? tokens.colors.successScale[500] : tokens.colors.neutral[300]}`,
                      backgroundColor: item.completed ? tokens.colors.successScale[500] : tokens.colors.common.white,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {item.completed && (
                        <CheckCircle2 size={10} color={tokens.colors.common.white} />
                      )}
                    </div>
                    <span style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: item.completed ? tokens.colors.neutral[500] : tokens.colors.neutral[700],
                      textDecoration: item.completed ? 'line-through' : 'none',
                    }}>
                      {item.item}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative' as const }}>
            {/* Vertical Line */}
            <div style={{
              position: 'absolute' as const,
              left: 20,
              top: 40,
              bottom: 0,
              width: 2,
              backgroundColor: tokens.colors.neutral[200],
            }} />

            {/* Timeline Events */}
            {sortedHistory.map((event, idx) => {
              const cfg = STAGE_CONFIG[event.toStage];

              return (
                <div key={event.id} style={{ position: 'relative' as const, marginBottom: tokens.spacing[6] }}>
                  {/* Stage Node */}
                  <div style={{
                    position: 'absolute' as const,
                    left: 0,
                    top: 0,
                    width: 40,
                    height: 40,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: cfg.bgColor,
                    color: cfg.color,
                    border: `3px solid ${tokens.colors.common.white}`,
                    boxShadow: `0 0 0 3px ${cfg.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}>
                    {cfg.icon}
                  </div>

                  {/* Event Card */}
                  {renderEventCard(event)}
                </div>
              );
            })}
          </div>
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
        {/* Header */}
        <div style={{ marginBottom: tokens.spacing[4] }}>
          <h1 style={{
            fontSize: tokens.typography.fontSize['2xl'],
            fontWeight: tokens.typography.fontWeight.bold,
            color: tokens.colors.neutral[900],
            margin: 0,
            lineHeight: tokens.typography.lineHeight.tight,
          }}>
            User Lifecycle
          </h1>
          <p style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            margin: 0,
            marginTop: tokens.spacing[1],
          }}>
            Track user journey through lifecycle stages with complete transition history
          </p>
        </div>

        {renderStatsRibbon()}

        {/* Main Content */}
        <div style={{ display: 'flex', gap: tokens.spacing[4] }}>
          {renderUserListSidebar()}
          {renderTimelinePanel()}
        </div>

        {/* Pulse Animation Keyframes */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: .8;
            }
          }
        `}</style>
      </div>
    );
  },
});
