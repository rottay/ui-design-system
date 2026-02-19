'use client';

/**
 * BhProctoringActivity - Feed Preset
 * Vertical timeline feed showing proctoring events in chronological order.
 * Each item shows: timestamp, event type icon, severity dot, candidate, description.
 */

import { useMemo, useCallback, useState} from 'react';
import {
  Activity, MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  ChevronRight, Users,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  createEmptyStateStyle,
  formatDistanceToNow,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhProctoringActivityProps,
  ProctoringActivityEvent,
  ProctoringEventType,
  ProctoringEventSeverity,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverityColor(severity: ProctoringEventSeverity, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'high': return t.colors.errorScale[400];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.infoScale[500];
  }
}

function getSeverityBg(severity: ProctoringEventSeverity, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[50];
    case 'high': return t.colors.errorScale[50];
    case 'medium': return t.colors.warningScale[50];
    case 'low': return t.colors.infoScale[50];
  }
}

function getSeverityBadgeKey(severity: ProctoringEventSeverity): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
  }
}

function getEventTypeIcon(type: ProctoringEventType) {
  switch (type) {
    case 'tab_switch': return MonitorOff;
    case 'copy_paste': return Clipboard;
    case 'screen_share': return ScreenShare;
    case 'unusual_typing': return Keyboard;
    case 'browser_focus_lost': return Globe;
  }
}

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel } from '../../../_shared/proctoring-labels';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Feed Preset                                                        */
/* ================================================================== */

export const FeedBhProctoringActivity = createPreset<BhProctoringActivityProps>({
  name: 'BhProctoringActivity.Feed',
  render: (ctx: PresetContext<BhProctoringActivityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      events: rawEvents = [],
      onEventClick,
      maxItems = 20,
      showTimestamps = true,
      groupByCandidate = false,
      className,
      style,
    } = props;

    const events = Array.isArray(rawEvents) ? rawEvents : [];

    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const displayEvents = useMemo(() => {
      const sorted = [...events].sort((a, b) => (b.timestamp?.getTime?.() ?? 0) - (a.timestamp?.getTime?.() ?? 0));
      return sorted.slice(0, maxItems);
    }, [events, maxItems]);

    const groupedEvents = useMemo(() => {
      if (!groupByCandidate) return null;
      const groups = new Map<string, ProctoringActivityEvent[]>();
      displayEvents.forEach(ev => {
        const name = ev.candidateName ?? 'Unknown';
        const existing = groups.get(name) ?? [];
        existing.push(ev);
        groups.set(name, existing);
      });
      return groups;
    }, [displayEvents, groupByCandidate]);

    const handleClick = useCallback((id: string) => {
      onEventClick?.(id);
    }, [onEventClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const renderEvent = (event: ProctoringActivityEvent, index: number) => {
      const EventIcon = getEventTypeIcon(event.eventType ?? 'tab_switch');
      const sevColor = getSeverityColor(event.severity ?? 'low', t);
      const isHovered = hoveredEvent === event.id;

      const divider = useMemo(() => createDividerStyle(t), [t]);

      const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);


      return (
        <Box
          key={event.id}
          role="listitem"
          tabIndex={0}
          aria-label={`${event.candidateName}: ${getEventTypeLabel(event.eventType ?? 'tab_switch')}, ${getSeverityLabel(event.severity ?? 'low')}`}
          onClick={() => handleClick(event.id)}
          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(event.id); } }}
          onMouseEnter={() => setHoveredEvent(event.id)}
          onMouseLeave={() => setHoveredEvent(null)}
          style={{
            display: 'flex',
            gap: t.spacing[3],
            padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
            cursor: 'pointer',
            backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            transition: `background-color ${t.motion.hover}`,
            ...entrance.animate,
            transitionDelay: `${createStaggerDelay(t, index)}ms`,
          }}
        >
          {/* Timeline indicator */}
          <Box style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: t.spacing[1],
            flexShrink: 0,
          }}>
            <Box style={createIconContainerStyle(t, { size: 32, color: getSeverityBg(event.severity ?? 'low', t) })}>
              <EventIcon size={14} color={sevColor} />
            </Box>
            {/* Vertical line connector */}
            <Box style={{
              width: 2,
              flex: 1,
              backgroundColor: t.colors.neutral[100],
              marginTop: 4,
              minHeight: 8,
            }} />
          </Box>

          {/* Content */}
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0, paddingBottom: t.spacing[2] }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexWrap: 'wrap', marginBottom: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {event.candidateName}
              </Text>
              <Box style={{
                ...createBadgeStyle(t, getSeverityBadgeKey(event.severity ?? 'low')),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {getSeverityLabel(event.severity ?? 'low')}
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.neutral[600],
              }}>
                {getEventTypeLabel(event.eventType ?? 'tab_switch')}
              </Text>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[500],
              lineHeight: 1.5,
              display: 'block',
            }}>
              {event.description}
            </Text>
            {showTimestamps && (
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[400],
                marginTop: t.spacing[1],
              }}>
                {event.timestamp ? formatDistanceToNow(event.timestamp, { addSuffix: true }) : ''}
              </Text>
            )}
            {event.reviewed && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                <Box style={{
                  ...createBadgeStyle(t, event.dismissed ? 'secondary' : 'success'),
                  borderRadius: badgeRadius,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: t.spacing[1],
                }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs }}>
                    {event.dismissed ? 'Dismissed' : 'Reviewed'}
                  </Text>
                </Box>
                {event.reviewedBy && (
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    by {event.reviewedBy}
                  </Text>
                )}
              </Box>
            )}
          </Box>

          {/* Arrow */}
          <Box style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <ChevronRight size={14} color={t.colors.neutral[300]} />
          </Box>
        </Box>
      );
    };

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          fontFamily: 'inherit',
          ...animStyle,
          ...(accentBar ? accentLayout.outer : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? accentLayout.inner : {}}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Activity size={16} color={t.colors.primaryScale[600]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
              textTransform: ptypo.labelTransform,
              letterSpacing: ptypo.labelLetterSpacing,
            }}>
              Activity Feed
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {events.length} events
          </Text>
        </Box>

        {/* Events list */}
        <Box role="list" aria-label="Proctoring activity feed">
          {displayEvents.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Activity size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No activity recorded
              </Text>
            </Box>
          )}

          {!groupByCandidate && displayEvents.map((event, i) => renderEvent(event, i))}

          {groupByCandidate && groupedEvents && Array.from(groupedEvents.entries()).map(([name, evts], groupIdx) => (
            <Box key={name}>
              <Box style={{ display: 'flex',
                alignItems: 'center',
                gap: t.spacing[2],
                padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
                backgroundColor: t.colors.neutral[50],
                borderBottom: `1px solid ${t.colors.neutral[100]}`,
              }}>
                <Users size={12} color={t.colors.neutral[400]} />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: t.colors.neutral[600],
                }}>
                  {name}
                </Text>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  color: t.colors.neutral[400],
                }}>
                  ({evts.length})
                </Text>
              </Box>
              {evts.map((event, i) => renderEvent(event, groupIdx * 10 + i))}
            </Box>
          ))}
        </Box>
        </Box>
      </Box>
    );
  },
});
