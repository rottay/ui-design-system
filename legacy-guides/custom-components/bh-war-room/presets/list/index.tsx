'use client';

/**
 * BhWarRoom - List Preset
 * War room sessions list view with active sessions at top,
 * participant avatars, candidate count, status indicators,
 * and quick actions for join/view/create.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Users,
  UserCheck,
  Clock,
  CheckCircle2,
  PlayCircle,
  Vote,
  XCircle,
  Search,
  Filter,
  ArrowRight,
  Zap,
  Target,
  Calendar,
  Timer,
  ChevronDown,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createCardHoverStyles,
  createBadgeStyle,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createPersonalitySkeletonStyle,
  createEmptyStateStyle,
  createFilterPillStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getPulseSpeed,
  createDividerStyle,
  clickableProps,
  listProps,
  listItemProps,
  ICON_SIZES,
  formatDistanceToNow,
} from '../../../helpers';
import type { BhWarRoomProps, WarRoomSession } from '../../core';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusConfig(status: WarRoomSession['status']): {
  label: string;
  color: 'success' | 'primary' | 'warning' | 'error' | 'secondary';
  icon: typeof PlayCircle;
} {
  switch (status) {
    case 'active':
      return { label: 'Active', color: 'success', icon: PlayCircle };
    case 'voting':
      return { label: 'Voting', color: 'primary', icon: Vote };
    case 'decided':
      return { label: 'Decided', color: 'info' as any, icon: CheckCircle2 };
    case 'closed':
      return { label: 'Closed', color: 'secondary', icon: XCircle };
    case 'scheduled':
    default:
      return { label: 'Scheduled', color: 'warning', icon: Calendar };
  }
}

function formatDurationMinutes(minutes?: number): string {
  if (!minutes) return '--';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function isActiveSession(session: WarRoomSession): boolean {
  return session.status === 'active' || session.status === 'voting';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const ListBhWarRoom = createPreset<BhWarRoomProps>(
  'ListBhWarRoom',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhWarRoomProps>) => {
    const {
      sessions = [],
      onCreateSession,
      onJoinSession,
      loading = false,
      className,
      style,
    } = props;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);
    const cardHover = useMemo(() => createCardHoverStyles(tokens), [tokens]);
    const pulseSpeed = useMemo(() => getPulseSpeed(tokens), [tokens]);

    // Filter sessions
    const filteredSessions = useMemo(() => {
      let result = [...sessions];

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.jobTitle.toLowerCase().includes(q)
        );
      }

      if (statusFilter !== 'all') {
        result = result.filter((s) => s.status === statusFilter);
      }

      // Active sessions first, then by date
      result.sort((a, b) => {
        const aActive = isActiveSession(a) ? 1 : 0;
        const bActive = isActiveSession(b) ? 1 : 0;
        if (aActive !== bActive) return bActive - aActive;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return result;
    }, [sessions, searchQuery, statusFilter]);

    const activeSessions = useMemo(
      () => filteredSessions.filter(isActiveSession),
      [filteredSessions]
    );
    const otherSessions = useMemo(
      () => filteredSessions.filter((s) => !isActiveSession(s)),
      [filteredSessions]
    );

    const statusOptions = ['all', 'active', 'voting', 'decided', 'closed', 'scheduled'];

    // ---- Styles ----
    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: tokens.spacing[5],
      height: '100%',
      ...style,
    };

    const headerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: tokens.spacing[3],
    };

    const searchBarStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      flex: 1,
      minWidth: 200,
    };

    const filtersRowStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      flexWrap: 'wrap',
    };

    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
      gap: tokens.spacing[4],
    };

    const sectionHeaderStyle = createPersonalitySectionHeaderStyle(tokens);

    // ---- Loading ----
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={containerStyle} className={className}>
          <Box style={headerStyle}>
            <Box style={{ ...skeletonStyle, width: 200, height: 32 }} />
            <Box style={{ ...skeletonStyle, width: 140, height: 36, borderRadius: tokens.borderRadius.md }} />
          </Box>
          <Box style={gridStyle}>
            {[1, 2, 3].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, height: 180, borderRadius: tokens.borderRadius.lg }} />
            ))}
          </Box>
        </Box>
      );
    }

    // ---- Empty State ----
    if (sessions.length === 0) {
      return (
        <Box style={containerStyle} className={className}>
          <Box style={createEmptyStateStyle(tokens)}>
            <Box style={createIconContainerStyle(tokens, { size: 56, color: tokens.colors.primaryScale[50] })}>
              <Target size={ICON_SIZES.hero} style={{ color: tokens.colors.primaryScale[500] }} />
            </Box>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[700],
              marginTop: tokens.spacing[3],
            }}>
              No War Room Sessions Yet
            </Text>
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[1],
              maxWidth: 400,
            }}>
              Create your first war room to bring your hiring team together for collaborative candidate decisions.
            </Text>
            {onCreateSession && (
              <Button
                onClick={() => onCreateSession({ title: '', jobId: '', candidateIds: [], participantIds: [] })}
                style={{
                  marginTop: tokens.spacing[4],
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  border: 'none',
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                  borderRadius: tokens.borderRadius.md,
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                }}
              >
                <Plus size={ICON_SIZES.section} />
                Create War Room
              </Button>
            )}
          </Box>
        </Box>
      );
    }

    // ---- Session Card Renderer ----
    const renderSessionCard = (session: WarRoomSession, index: number) => {
      const statusCfg = getStatusConfig(session.status);
      const isActive = isActiveSession(session);
      const isHovered = hoveredCard === session.id;
      const entrance = createEntranceAnimation(tokens, { index });

      const cardBaseStyle: React.CSSProperties = {
        ...createCardStyle(tokens, { elevation: 'sm' }),
        ...cardHover.base,
        ...(isHovered ? cardHover.hover : {}),
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[3],
        position: 'relative',
        overflow: 'hidden',
        ...entrance.animate,
        transition: entrance.transition,
      };

      if (isActive) {
        cardBaseStyle.borderColor = tokens.colors.successScale[300];
        cardBaseStyle.borderWidth = '1px';
        cardBaseStyle.borderStyle = 'solid';
      }

      return (
        <Box
          key={session.id}
          style={cardBaseStyle}
          onMouseEnter={() => setHoveredCard(session.id)}
          onMouseLeave={() => setHoveredCard(null)}
        >
          {/* Active pulse indicator */}
          {isActive && (
            <Box style={{
              position: 'absolute',
              top: tokens.spacing[3],
              right: tokens.spacing[3],
              width: 10,
              height: 10,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[500],
              animation: pulseSpeed !== 'paused' ? `pulse ${pulseSpeed} ease-in-out infinite` : undefined,
            }} />
          )}

          {/* Header: Title + Status */}
          <Box style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: tokens.spacing[2] }}>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {session.title}
              </Text>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: 2,
              }}>
                {session.jobTitle}
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(tokens, statusCfg.color),
              borderRadius: getPersonalityBadgeRadius(tokens),
              flexShrink: 0,
            }}>
              <statusCfg.icon size={ICON_SIZES.inline} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, marginLeft: 4 }}>
                {statusCfg.label}
              </Text>
            </Box>
          </Box>

          {/* Stats row */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[4],
            flexWrap: 'wrap',
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Users size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                {session.participants.length} participants
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <UserCheck size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                {session.candidateCount} candidates
              </Text>
            </Box>
            {session.durationMinutes != null && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <Timer size={ICON_SIZES.label} style={{ color: tokens.colors.neutral[400] }} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  {formatDurationMinutes(session.durationMinutes)}
                </Text>
              </Box>
            )}
          </Box>

          {/* Participant avatars */}
          {session.participants.length > 0 && (
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              {session.participants.slice(0, 5).map((p, i) => (
                <Box
                  key={p.id}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: (tokens.colors.primaryScale as unknown as Record<number, string>)[100 + ((i * 100) % 400)],
                    border: `2px solid ${tokens.colors.common.white}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: i > 0 ? -8 : 0,
                    position: 'relative',
                    zIndex: 5 - i,
                    overflow: 'hidden',
                  }}
                >
                  {p.avatarUrl ? (
                    <img
                      src={p.avatarUrl}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: tokens.borderRadius.full }}
                    />
                  ) : (
                    <Text style={{
                      fontSize: 10,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.primaryScale[700],
                    }}>
                      {p.name?.[0]?.toUpperCase() ?? '?'}
                    </Text>
                  )}
                  {/* Online indicator */}
                  {p.isOnline && (
                    <Box style={{
                      position: 'absolute',
                      bottom: -1,
                      right: -1,
                      width: 8,
                      height: 8,
                      borderRadius: tokens.borderRadius.full,
                      backgroundColor: tokens.colors.successScale[500],
                      border: `1.5px solid ${tokens.colors.common.white}`,
                    }} />
                  )}
                </Box>
              ))}
              {session.participants.length > 5 && (
                <Box style={{
                  width: 28,
                  height: 28,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.neutral[100],
                  border: `2px solid ${tokens.colors.common.white}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginLeft: -8,
                }}>
                  <Text style={{ fontSize: 9, color: tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>
                    +{session.participants.length - 5}
                  </Text>
                </Box>
              )}
            </Box>
          )}

          {/* Outcome summary for completed sessions */}
          {session.status === 'closed' && session.summary && (
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              fontStyle: 'italic',
              lineHeight: 1.4,
            }}>
              {session.summary}
            </Text>
          )}

          {/* Actions */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            marginTop: 'auto',
            paddingTop: tokens.spacing[2],
            borderTop: `1px solid ${tokens.colors.neutral[100]}`,
          }}>
            {isActive && onJoinSession && (
              <Box
                onClick={() => onJoinSession(session.id)}
                {...clickableProps(() => onJoinSession(session.id), 'Join session')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.successScale[600],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: 'none',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <Zap size={ICON_SIZES.label} />
                Join Now
              </Box>
            )}
            {(session.status === 'closed' || session.status === 'decided') && onJoinSession && (
              <Box
                onClick={() => onJoinSession(session.id)}
                {...clickableProps(() => onJoinSession(session.id), 'View results')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.neutral[100],
                  color: tokens.colors.neutral[700],
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: 'none',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <ArrowRight size={ICON_SIZES.label} />
                View Results
              </Box>
            )}
            {session.status === 'scheduled' && onJoinSession && (
              <Box
                onClick={() => onJoinSession(session.id)}
                {...clickableProps(() => onJoinSession(session.id), 'Start session')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: tokens.colors.primaryScale[600],
                  color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  border: 'none',
                  transition: `all ${tokens.motion.hover}`,
                }}
              >
                <PlayCircle size={ICON_SIZES.label} />
                Start
              </Box>
            )}
            <Text style={{
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[400],
              marginLeft: 'auto',
            }}>
              {session.startedAt
                ? formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })
                : session.scheduledAt
                  ? `Scheduled ${formatDistanceToNow(new Date(session.scheduledAt), { addSuffix: true })}`
                  : formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
            </Text>
          </Box>
        </Box>
      );
    };

    return (
      <Box style={containerStyle} className={className}>
        {/* Header */}
        <Box style={headerStyle}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <Box style={createIconContainerStyle(tokens, { size: 36 })}>
              <Target size={ICON_SIZES.feature} style={{ color: tokens.colors.primaryScale[600] }} />
            </Box>
            <Box>
              <Text style={{
                fontSize: tokens.typography.fontSize.lg,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}>
                War Rooms
              </Text>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}>
                {activeSessions.length > 0 ? `${activeSessions.length} active session${activeSessions.length > 1 ? 's' : ''}` : 'No active sessions'}
              </Text>
            </Box>
          </Box>
          {onCreateSession && (
            <Box
              onClick={() => onCreateSession({ title: '', jobId: '', candidateIds: [], participantIds: [] })}
              {...clickableProps(() => onCreateSession({ title: '', jobId: '', candidateIds: [], participantIds: [] }), 'Create war room')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
                padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
                borderRadius: tokens.borderRadius.md,
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                border: 'none',
                transition: `all ${tokens.motion.hover}`,
              }}
            >
              <Plus size={ICON_SIZES.section} />
              New War Room
            </Box>
          )}
        </Box>

        {/* Search & Filters */}
        <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
          <Box style={searchBarStyle}>
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              backgroundColor: tokens.colors.neutral[50],
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.neutral[200]}`,
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              gap: tokens.spacing[2],
            }}>
              <Search size={ICON_SIZES.section} style={{ color: tokens.colors.neutral[400], flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  flex: 1,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[800],
                }}
              />
            </Box>
          </Box>
          <Box style={filtersRowStyle}>
            {statusOptions.map((opt) => (
              <Box
                key={opt}
                onClick={() => setStatusFilter(opt)}
                {...clickableProps(() => setStatusFilter(opt), `Filter by ${opt}`)}
                style={createFilterPillStyle(tokens, { active: statusFilter === opt })}
              >
                {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Active Sessions Section */}
        {activeSessions.length > 0 && (
          <Box>
            <Text style={sectionHeaderStyle}>
              Live Sessions
            </Text>
            <Box style={gridStyle}>
              {activeSessions.map((s, i) => renderSessionCard(s, i))}
            </Box>
          </Box>
        )}

        {/* Other Sessions */}
        {otherSessions.length > 0 && (
          <Box>
            {activeSessions.length > 0 && (
              <Text style={{ ...sectionHeaderStyle, marginTop: tokens.spacing[4] }}>
                All Sessions
              </Text>
            )}
            <Box style={gridStyle}>
              {otherSessions.map((s, i) => renderSessionCard(s, i + activeSessions.length))}
            </Box>
          </Box>
        )}

        {/* No Results */}
        {filteredSessions.length === 0 && sessions.length > 0 && (
          <Box style={createEmptyStateStyle(tokens)}>
            <Search size={ICON_SIZES.hero} style={{ color: tokens.colors.neutral[300] }} />
            <Text style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[2],
            }}>
              No sessions match your filters
            </Text>
          </Box>
        )}

        {/* Pulse animation keyframes */}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.2); }
          }
        `}</style>
      </Box>
    );
  }
);
