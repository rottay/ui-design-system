'use client';

/**
 * BhAuditTrail - Timeline Preset
 * Vertical timeline view of audit events with filter bar, expandable
 * before/after diff cards, event detail modal, stats bar, export,
 * and real-time mode toggle.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createCardStyle,
  createEmptyStateStyle,
  createHoverStyle,
  createListItemStyle,
  createPanelHeaderStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
  createStatusDotStyle,
  createSurfaceStyle,
  getHoverTransform,
} from '../../../helpers';
import type {
  BhAuditTrailProps,
  AuditEvent,
  AuditStats,
  AuditFilter,
  EntityType,
  ActionType,
} from '../../core';
import {
  getEntityTypeColors,
  getActionTypeColors,
  formatAuditTimestamp,
} from '../../core';
import {
  Activity,
  User,
  Briefcase,
  Video,
  FileText,
  Users,
  Settings,
  Plus,
  Pencil,
  ArrowRightLeft,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  X,
  Download,
  Radio,
  Eye,
  Globe,
  Clock,
  BarChart3,
  UserCheck,
  Layers,
  RefreshCw,
  Zap,
} from 'lucide-react';

const ENTITY_TYPE_OPTIONS: { value: EntityType; label: string }[] = [
  { value: 'candidate', label: 'Candidate' },
  { value: 'job', label: 'Job' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'team', label: 'Team' },
  { value: 'settings', label: 'Settings' },
];

const ACTION_TYPE_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'updated', label: 'Updated' },
  { value: 'state_change', label: 'State Change' },
  { value: 'deleted', label: 'Deleted' },
];

function getEntityIcon(entityType: EntityType, size: number) {
  switch (entityType) {
    case 'candidate':
      return <User size={size} />;
    case 'job':
      return <Briefcase size={size} />;
    case 'interview':
      return <Video size={size} />;
    case 'offer':
      return <FileText size={size} />;
    case 'team':
      return <Users size={size} />;
    case 'settings':
      return <Settings size={size} />;
  }
}

function getActionIcon(actionType: ActionType, size: number) {
  switch (actionType) {
    case 'created':
      return <Plus size={size} />;
    case 'updated':
      return <Pencil size={size} />;
    case 'state_change':
      return <ArrowRightLeft size={size} />;
    case 'deleted':
      return <Trash2 size={size} />;
  }
}

function getActionLabel(actionType: ActionType): string {
  switch (actionType) {
    case 'created':
      return 'created';
    case 'updated':
      return 'updated';
    case 'state_change':
      return 'changed state of';
    case 'deleted':
      return 'deleted';
  }
}

export const TimelineBhAuditTrail = createPreset<BhAuditTrailProps>({
  name: 'BhAuditTrail.Timeline',
  render: ({ primitives, props, tokens, engine }: PresetContext<BhAuditTrailProps>) => {
    const { Box, Stack } = primitives;

    const {
      events: externalEvents = [],
      stats: externalStats,
      filters: externalFilters,
      onFilterChange,
      selectedEvent: externalSelectedEvent,
      onEventSelect,
      showDetail: externalShowDetail = false,
      onDetailToggle,
      viewMode: externalViewMode = 'timeline',
      onViewModeChange,
      liveMode: externalLiveMode = false,
      onLiveModeToggle,
      exportRange: externalExportRange,
      onExport,
      className,
      style,
    } = props;

    const [viewMode, setViewMode] = useState(externalViewMode);
    const [filters, setFilters] = useState<AuditFilter>(externalFilters ?? {});
    const [selectedEvent, setSelectedEvent] = useState<string | null>(
      externalSelectedEvent ?? null
    );
    const [showDetail, setShowDetail] = useState(externalShowDetail);
    const [liveMode, setLiveMode] = useState(externalLiveMode);
    const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

    useEffect(() => { setViewMode(externalViewMode); }, [externalViewMode]);
    useEffect(() => {
      if (externalFilters) setFilters(externalFilters);
    }, [externalFilters]);
    useEffect(() => {
      if (externalSelectedEvent !== undefined) setSelectedEvent(externalSelectedEvent);
    }, [externalSelectedEvent]);
    useEffect(() => { setShowDetail(externalShowDetail); }, [externalShowDetail]);
    useEffect(() => { setLiveMode(externalLiveMode); }, [externalLiveMode]);

    const handleFilterChange = useCallback(
      (next: AuditFilter) => {
        setFilters(next);
        onFilterChange?.(next);
      },
      [onFilterChange]
    );

    const handleEventSelect = useCallback(
      (eventId: string | null) => {
        setSelectedEvent(eventId);
        onEventSelect?.(eventId);
        if (eventId) {
          setShowDetail(true);
          onDetailToggle?.();
        }
      },
      [onEventSelect, onDetailToggle]
    );

    const handleDetailClose = useCallback(() => {
      setShowDetail(false);
      setSelectedEvent(null);
      onDetailToggle?.();
      onEventSelect?.(null);
    }, [onDetailToggle, onEventSelect]);

    const handleLiveModeToggle = useCallback(() => {
      const next = !liveMode;
      setLiveMode(next);
      onLiveModeToggle?.();
    }, [liveMode, onLiveModeToggle]);

    const toggleExpanded = useCallback((eventId: string) => {
      setExpandedEvents((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
        return next;
      });
    }, []);

    const isGlass = engine === 'modern';
    const entityColors = getEntityTypeColors(tokens);
    const actionColors = getActionTypeColors(tokens);
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverTransition = useMemo(() => createHoverStyle(tokens), [tokens]);
    const sectionHeader = useMemo(() => createSectionHeaderStyle(tokens), [tokens]);

    const containerStyle: React.CSSProperties = {
      ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
      padding: tokens.spacing[5],
      backgroundColor: tokens.colors.neutral[50],
      minHeight: '100%',
      ...style,
    };

    const sectionTitleStyle: React.CSSProperties = {
      fontSize: tokens.typography.fontSize.lg,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[900],
      margin: 0,
    };

    const pulseKeyframes = `
      @keyframes bhAuditPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
    `;

    const selectedEventObj = useMemo(
      () => externalEvents.find((e) => e.id === selectedEvent),
      [externalEvents, selectedEvent]
    );

    /* ---- Statistics Bar ---- */
    const renderStatsBar = () => {
      if (!externalStats) return null;

      const statItems = [
        {
          label: 'Total Events',
          value: externalStats.totalEvents.toLocaleString(),
          icon: <Layers size={16} color={tokens.colors.primaryScale[600]} />,
          color: tokens.colors.primaryScale,
        },
        {
          label: 'Today',
          value: externalStats.eventsToday.toLocaleString(),
          icon: <Activity size={16} color={tokens.colors.infoScale[600]} />,
          color: tokens.colors.infoScale,
        },
        {
          label: 'Most Active',
          value: externalStats.mostActiveUser,
          icon: <UserCheck size={16} color={tokens.colors.successScale[600]} />,
          color: tokens.colors.successScale,
        },
        {
          label: 'Most Changed',
          value: externalStats.mostChangedEntity,
          icon: <Zap size={16} color={tokens.colors.warningScale[600]} />,
          color: tokens.colors.warningScale,
        },
      ];

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
          }}
        >
          {statItems.map((item) => (
            <div key={item.label} style={cardBase}>
              <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: (item.color as any)[50],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <span
                    style={{
                      ...sectionHeader,
                      marginBottom: 0,
                      display: 'block',
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {item.value}
                  </span>
                </div>
              </Stack>
            </div>
          ))}
        </div>
      );
    };

    /* ---- Filter Bar ---- */
    const renderFilterBar = () => {
      return (
        <div style={cardBase}>
          <Stack
            direction="horizontal"
            align="center"
            justify="space-between"
            style={{ flexWrap: 'wrap' as const, gap: tokens.spacing[3] }}
          >
            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]} style={{ flexWrap: 'wrap' as const }}>
              {/* Entity type pills */}
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Entity:
              </span>
              {ENTITY_TYPE_OPTIONS.map((opt) => {
                const isActive = filters.entityType === opt.value;
                const eColor = entityColors[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleFilterChange({
                        ...filters,
                        entityType: isActive ? undefined : opt.value,
                      })
                    }
                    style={{
                      ...hoverTransition,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      border: isActive
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${eColor.border}`
                        : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: isActive ? eColor.bg : tokens.colors.common.white,
                      color: isActive ? eColor.color : tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {getEntityIcon(opt.value, 12)}
                    {opt.label}
                  </button>
                );
              })}

              <div
                style={{
                  width: 1,
                  height: 20,
                  backgroundColor: tokens.colors.neutral[200],
                  margin: `0 ${tokens.spacing[1]}px`,
                }}
              />

              {/* Action type chips */}
              <span
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                Action:
              </span>
              {ACTION_TYPE_OPTIONS.map((opt) => {
                const isActive = filters.actionType === opt.value;
                const aColor = actionColors[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() =>
                      handleFilterChange({
                        ...filters,
                        actionType: isActive ? undefined : opt.value,
                      })
                    }
                    style={{
                      ...hoverTransition,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.full,
                      border: isActive
                        ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${aColor.bg}`
                        : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: isActive ? aColor.bg : tokens.colors.common.white,
                      color: isActive ? aColor.color : tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {getActionIcon(opt.value, 12)}
                    {opt.label}
                  </button>
                );
              })}
            </Stack>

            <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
              {/* Live mode toggle */}
              <button
                onClick={handleLiveModeToggle}
                style={{
                  ...hoverTransition,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                    liveMode
                      ? tokens.colors.successScale[300]
                      : tokens.colors.neutral[200]
                  }`,
                  backgroundColor: liveMode
                    ? tokens.colors.successScale[50]
                    : tokens.colors.common.white,
                  color: liveMode
                    ? tokens.colors.successScale[700]
                    : tokens.colors.neutral[600],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Radio
                  size={12}
                  style={
                    liveMode
                      ? { animation: 'bhAuditPulse 2s ease-in-out infinite' }
                      : undefined
                  }
                />
                {liveMode ? 'Live' : 'Paused'}
              </button>

              {/* Export buttons */}
              {onExport && (
                <>
                  <button
                    onClick={() => onExport('csv')}
                    style={{
                      ...hoverTransition,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Download size={12} />
                    CSV
                  </button>
                  <button
                    onClick={() => onExport('json')}
                    style={{
                      ...hoverTransition,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      backgroundColor: tokens.colors.common.white,
                      color: tokens.colors.neutral[600],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    <Download size={12} />
                    JSON
                  </button>
                </>
              )}
            </Stack>
          </Stack>
        </div>
      );
    };

    /* ---- Timeline ---- */
    const renderTimeline = () => {
      const filteredEvents = externalEvents.filter((ev) => {
        if (filters.entityType && ev.entityType !== filters.entityType) return false;
        if (filters.actionType && ev.actionType !== filters.actionType) return false;
        if (filters.userId && ev.userName !== filters.userId) return false;
        return true;
      });

      if (filteredEvents.length === 0) {
        return (
          <div
            style={{
              ...cardBase,
              display: 'flex',
              flexDirection: 'column' as const,
              alignItems: 'center',
              justifyContent: 'center',
              padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
              textAlign: 'center' as const,
            }}
          >
            <Activity
              size={32}
              color={tokens.colors.neutral[300]}
              style={{ marginBottom: tokens.spacing[3] }}
            />
            <p
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                margin: 0,
              }}
            >
              No audit events match your filters
            </p>
          </div>
        );
      }

      return (
        <div style={{ position: 'relative' as const }}>
          {/* Timeline vertical line */}
          <div
            style={{
              position: 'absolute' as const,
              left: 19,
              top: 0,
              bottom: 0,
              width: 2,
              backgroundColor: tokens.colors.neutral[200],
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: tokens.spacing[3],
            }}
          >
            {filteredEvents.map((event) => {
              const eColor = entityColors[event.entityType];
              const aColor = actionColors[event.actionType];
              const isExpanded = expandedEvents.has(event.id);
              const isSelected = selectedEvent === event.id;
              const hasDiff =
                event.beforeState &&
                event.afterState &&
                Object.keys(event.beforeState).length > 0;

              return (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[3],
                    position: 'relative' as const,
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    style={{
                      width: 40,
                      flexShrink: 0,
                      display: 'flex',
                      justifyContent: 'center',
                      paddingTop: tokens.spacing[3],
                      zIndex: 1,
                    }}
                  >
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: eColor.dot,
                        border: `3px solid ${tokens.colors.common.white}`,
                        boxShadow: tokens.shadows.sm,
                      }}
                    />
                  </div>

                  {/* Event card */}
                  <div
                    style={{
                      ...createCardStyle(tokens, {
                        elevation: isSelected ? 'md' : 'sm',
                        glass: isGlass,
                        interactive: true,
                      }),
                      flex: 1,
                      borderLeft: `3px solid ${eColor.dot}`,
                      cursor: 'pointer',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                    onClick={() => handleEventSelect(event.id)}
                  >
                    {/* Header */}
                    <Stack
                      direction="horizontal"
                      align="center"
                      justify="space-between"
                      style={{ marginBottom: tokens.spacing[2] }}
                    >
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                        {event.userAvatar ? (
                          <img
                            src={event.userAvatar}
                            alt={event.userName}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: tokens.borderRadius.full,
                              objectFit: 'cover' as const,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: tokens.borderRadius.full,
                              backgroundColor: tokens.colors.neutral[200],
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <User size={14} color={tokens.colors.neutral[500]} />
                          </div>
                        )}
                        <div>
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.semibold,
                              color: tokens.colors.neutral[900],
                            }}
                          >
                            {event.userName}
                          </span>{' '}
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: tokens.colors.neutral[500],
                            }}
                          >
                            {getActionLabel(event.actionType)}
                          </span>{' '}
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[800],
                            }}
                          >
                            {event.entityName}
                          </span>
                        </div>
                      </Stack>

                      <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                        <span
                          style={{
                            ...createBadgeStyle(tokens, 'primary'),
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          }}
                        >
                          {getEntityIcon(event.entityType, 10)}
                          <span style={{ marginLeft: 4 }}>{event.entityType}</span>
                        </span>
                        <span
                          style={{
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.full,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            backgroundColor: aColor.bg,
                            color: aColor.color,
                          }}
                        >
                          {event.actionType.replace('_', ' ')}
                        </span>
                      </Stack>
                    </Stack>

                    {/* Timestamp + IP */}
                    <Stack
                      direction="horizontal"
                      align="center"
                      gap={tokens.spacing[3]}
                      style={{ marginBottom: hasDiff ? tokens.spacing[2] : 0 }}
                    >
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                        <Clock size={12} color={tokens.colors.neutral[400]} />
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {formatAuditTimestamp(event.timestamp)}
                        </span>
                      </Stack>
                      {event.ipAddress && (
                        <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                          <Globe size={12} color={tokens.colors.neutral[400]} />
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                              fontFamily: 'monospace',
                            }}
                          >
                            {event.ipAddress}
                          </span>
                        </Stack>
                      )}
                      {event.relatedEvents && event.relatedEvents.length > 0 && (
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                          }}
                        >
                          {event.relatedEvents.length} related event{event.relatedEvents.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </Stack>

                    {/* Expandable diff */}
                    {hasDiff && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(event.id);
                          }}
                          style={{
                            ...hoverTransition,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: tokens.spacing[1],
                            padding: 0,
                            border: 'none',
                            backgroundColor: 'transparent',
                            color: tokens.colors.primaryScale[600],
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                        >
                          {isExpanded ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                          {isExpanded ? 'Hide changes' : 'Show changes'}
                        </button>

                        {isExpanded && event.beforeState && event.afterState && (
                          <div
                            style={{
                              marginTop: tokens.spacing[2],
                              borderRadius: tokens.borderRadius.md,
                              overflow: 'hidden',
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            }}
                          >
                            {Object.keys({
                              ...event.beforeState,
                              ...event.afterState,
                            }).map((key) => {
                              const before = event.beforeState?.[key];
                              const after = event.afterState?.[key];
                              if (JSON.stringify(before) === JSON.stringify(after))
                                return null;

                              return (
                                <div
                                  key={key}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: '120px 1fr 1fr',
                                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                                    fontSize: tokens.typography.fontSize.xs,
                                  }}
                                >
                                  <div
                                    style={{
                                      padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                                      backgroundColor: tokens.colors.neutral[50],
                                      fontWeight: tokens.typography.fontWeight.medium,
                                      color: tokens.colors.neutral[700],
                                      fontFamily: 'monospace',
                                      borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                    }}
                                  >
                                    {key}
                                  </div>
                                  <div
                                    style={{
                                      padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                                      backgroundColor: tokens.colors.errorScale[50],
                                      color: tokens.colors.errorScale[700],
                                      fontFamily: 'monospace',
                                      borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                                      wordBreak: 'break-all' as const,
                                    }}
                                  >
                                    {before !== undefined
                                      ? String(before)
                                      : '(none)'}
                                  </div>
                                  <div
                                    style={{
                                      padding: `${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
                                      backgroundColor: tokens.colors.successScale[50],
                                      color: tokens.colors.successScale[700],
                                      fontFamily: 'monospace',
                                      wordBreak: 'break-all' as const,
                                    }}
                                  >
                                    {after !== undefined
                                      ? String(after)
                                      : '(none)'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    /* ---- Event Detail Modal ---- */
    const renderDetailModal = () => {
      if (!showDetail || !selectedEventObj) return null;

      const eColor = entityColors[selectedEventObj.entityType];
      const aColor = actionColors[selectedEventObj.actionType];
      const hasDiff =
        selectedEventObj.beforeState &&
        selectedEventObj.afterState &&
        Object.keys(selectedEventObj.beforeState).length > 0;

      return (
        <div
          style={{
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: tokens.overlay?.light,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={handleDetailClose}
        >
          <div
            style={{
              ...createCardStyle(tokens, { elevation: 'xl', glass: isGlass }),
              width: '100%',
              maxWidth: 700,
              maxHeight: '85vh',
              overflowY: 'auto' as const,
              padding: tokens.spacing[6],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <Stack
              direction="horizontal"
              align="center"
              justify="space-between"
              style={{ marginBottom: tokens.spacing[5] }}
            >
              <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: eColor.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: eColor.color,
                  }}
                >
                  {getEntityIcon(selectedEventObj.entityType, 22)}
                </div>
                <div>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                    }}
                  >
                    {selectedEventObj.entityName}
                  </span>
                  <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                    <span style={createBadgeStyle(tokens, 'primary')}>
                      {selectedEventObj.entityType}
                    </span>
                    <span
                      style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.full,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        backgroundColor: aColor.bg,
                        color: aColor.color,
                      }}
                    >
                      {selectedEventObj.actionType.replace('_', ' ')}
                    </span>
                  </Stack>
                </div>
              </Stack>
              <button
                onClick={handleDetailClose}
                style={{
                  ...hoverTransition,
                  padding: tokens.spacing[2],
                  border: 'none',
                  backgroundColor: tokens.colors.neutral[100],
                  borderRadius: tokens.borderRadius.md,
                  color: tokens.colors.neutral[600],
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </Stack>

            {/* User info */}
            <div
              style={{
                ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
                padding: tokens.spacing[4],
                backgroundColor: tokens.colors.common.white,
                marginBottom: tokens.spacing[4],
              }}
            >
              <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
                {selectedEventObj.userAvatar ? (
                  <img
                    src={selectedEventObj.userAvatar}
                    alt={selectedEventObj.userName}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: tokens.borderRadius.full,
                      objectFit: 'cover' as const,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.neutral[200],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={20} color={tokens.colors.neutral[500]} />
                  </div>
                )}
                <div>
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[900],
                      display: 'block',
                    }}
                  >
                    {selectedEventObj.userName}
                  </span>
                  <Stack direction="horizontal" align="center" gap={tokens.spacing[3]}>
                    <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                      <Clock size={12} color={tokens.colors.neutral[400]} />
                      <span
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                        }}
                      >
                        {formatAuditTimestamp(selectedEventObj.timestamp)}
                      </span>
                    </Stack>
                    {selectedEventObj.ipAddress && (
                      <Stack direction="horizontal" align="center" gap={tokens.spacing[1]}>
                        <Globe size={12} color={tokens.colors.neutral[400]} />
                        <span
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            color: tokens.colors.neutral[400],
                            fontFamily: 'monospace',
                          }}
                        >
                          {selectedEventObj.ipAddress}
                        </span>
                      </Stack>
                    )}
                  </Stack>
                </div>
              </Stack>
            </div>

            {/* Full diff view */}
            {hasDiff && selectedEventObj.beforeState && selectedEventObj.afterState && (
              <div style={{ marginBottom: tokens.spacing[4] }}>
                <span style={{ ...sectionHeader, marginBottom: tokens.spacing[2], display: 'block' }}>
                  Changes
                </span>
                <div
                  style={{
                    borderRadius: tokens.borderRadius.md,
                    overflow: 'hidden',
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '140px 1fr 1fr',
                      backgroundColor: tokens.colors.neutral[100],
                      padding: `${tokens.spacing[2]}px`,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[600],
                      textTransform: 'uppercase' as const,
                      letterSpacing: '0.05em',
                    }}
                  >
                    <span>Field</span>
                    <span>Before</span>
                    <span>After</span>
                  </div>
                  {Object.keys({
                    ...selectedEventObj.beforeState,
                    ...selectedEventObj.afterState,
                  }).map((key) => {
                    const before = selectedEventObj.beforeState?.[key];
                    const after = selectedEventObj.afterState?.[key];
                    const changed =
                      JSON.stringify(before) !== JSON.stringify(after);
                    return (
                      <div
                        key={key}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr 1fr',
                          borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          fontSize: tokens.typography.fontSize.xs,
                        }}
                      >
                        <div
                          style={{
                            padding: `${tokens.spacing[2]}px`,
                            fontFamily: 'monospace',
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[700],
                            backgroundColor: tokens.colors.neutral[50],
                            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                          }}
                        >
                          {key}
                        </div>
                        <div
                          style={{
                            padding: `${tokens.spacing[2]}px`,
                            fontFamily: 'monospace',
                            color: changed
                              ? tokens.colors.errorScale[700]
                              : tokens.colors.neutral[500],
                            backgroundColor: changed
                              ? tokens.colors.errorScale[50]
                              : tokens.colors.common.white,
                            borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                            wordBreak: 'break-all' as const,
                          }}
                        >
                          {before !== undefined ? String(before) : '(none)'}
                        </div>
                        <div
                          style={{
                            padding: `${tokens.spacing[2]}px`,
                            fontFamily: 'monospace',
                            color: changed
                              ? tokens.colors.successScale[700]
                              : tokens.colors.neutral[500],
                            backgroundColor: changed
                              ? tokens.colors.successScale[50]
                              : tokens.colors.common.white,
                            wordBreak: 'break-all' as const,
                          }}
                        >
                          {after !== undefined ? String(after) : '(none)'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Related events */}
            {selectedEventObj.relatedEvents &&
              selectedEventObj.relatedEvents.length > 0 && (
                <div>
                  <span style={{ ...sectionHeader, marginBottom: tokens.spacing[2], display: 'block' }}>
                    Related Events
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: tokens.spacing[2],
                    }}
                  >
                    {selectedEventObj.relatedEvents.map((relId) => {
                      const relEvent = externalEvents.find((e) => e.id === relId);
                      if (!relEvent) return null;
                      const relEColor = entityColors[relEvent.entityType];
                      return (
                        <div
                          key={relId}
                          style={{
                            ...createSurfaceStyle(tokens, { elevation: 'sm', glass: isGlass }),
                            padding: tokens.spacing[3],
                            backgroundColor: tokens.colors.common.white,
                            cursor: 'pointer',
                            transition: `all ${tokens.motion.hover}`,
                          }}
                          onClick={() => handleEventSelect(relId)}
                        >
                          <Stack direction="horizontal" align="center" gap={tokens.spacing[2]}>
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: relEColor.dot,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: tokens.typography.fontSize.sm,
                                color: tokens.colors.neutral[800],
                              }}
                            >
                              {relEvent.userName} {getActionLabel(relEvent.actionType)}{' '}
                              {relEvent.entityName}
                            </span>
                            <span
                              style={{
                                fontSize: tokens.typography.fontSize.xs,
                                color: tokens.colors.neutral[400],
                                marginLeft: 'auto',
                              }}
                            >
                              {formatAuditTimestamp(relEvent.timestamp)}
                            </span>
                          </Stack>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
          </div>
        </div>
      );
    };

    /* ---- Main Layout ---- */
    return (
      <div className={className} style={containerStyle}>
        <style>{pulseKeyframes}</style>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column' as const,
            gap: tokens.spacing[5],
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          {/* Stats bar */}
          {renderStatsBar()}

          {/* Filter bar */}
          {renderFilterBar()}

          {/* Timeline */}
          {renderTimeline()}

          {/* Detail Modal */}
          {renderDetailModal()}
        </div>
      </div>
    );
  },
});
