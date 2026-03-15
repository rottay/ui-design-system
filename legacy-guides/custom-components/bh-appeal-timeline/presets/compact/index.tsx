'use client';

/**
 * BhAppealTimeline - Compact Preset
 * Condensed timeline widget for sidebar placement.
 */

import { useMemo, useCallback} from 'react';
import {
  Clock, FileText, UserPlus, Eye, Gavel, Bell,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,

  createPersonalityAccentBar,
  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type { BhAppealTimelineProps, AppealTimelineEvent } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getEventIcon(type: AppealTimelineEvent['type']) {
  switch (type) {
    case 'submitted': return FileText;
    case 'assigned': return UserPlus;
    case 'reviewed': return Eye;
    case 'decision': return Gavel;
    case 'notified': return Bell;
  }
}

function getEventColor(type: AppealTimelineEvent['type'], t: DesignTokens): string {
  switch (type) {
    case 'submitted': return t.colors.primaryScale[500];
    case 'assigned': return t.colors.infoScale[500];
    case 'reviewed': return t.colors.warningScale[500];
    case 'decision': return t.colors.successScale[500];
    case 'notified': return t.colors.secondaryScale[500];
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhAppealTimeline = createPreset<BhAppealTimelineProps>({
  name: 'BhAppealTimeline.Compact',
  render: (ctx: PresetContext<BhAppealTimelineProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      events: rawEvents = [],
      onEventClick,
      className,
      style,
    } = props;

    const events = Array.isArray(rawEvents) ? rawEvents : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((id: string) => {
      onEventClick?.(id);
    }, [onEventClick]);

    const sortedEvents = useMemo(
      () => [...events].sort((a, b) => (b.date?.getTime?.() ?? 0) - (a.date?.getTime?.() ?? 0)).slice(0, 5),
      [events],
    );

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    return (
      <Box
        className={className}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[2],
        }}>
          <Clock size={16} color={t.colors.primaryScale[500]} />
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: ptypo.headingWeight,
            color: t.colors.neutral[800],
          }}>
            Timeline
          </Text>
        </Box>

        {/* Events */}
        <Box role="list" aria-label="Timeline events">
          {sortedEvents.map((event, i) => {
            const Icon = getEventIcon(event.type);
            const color = getEventColor(event.type, t);
            const isLast = i === sortedEvents.length - 1;

            return (
              <Box
                key={event.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${event.description} by ${event.actor}`}
                onClick={() => handleClick(event.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(event.id); } }}
                style={{
                  display: 'flex',
                  gap: t.spacing[3],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  cursor: 'pointer',
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <Box style={{
                    width: 24,
                    height: 24,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: t.colors.neutral[100],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={12} color={color} />
                  </Box>
                  {!isLast && (
                    <Box style={{
                      width: 1,
                      flex: 1,
                      minHeight: 8,
                      backgroundColor: t.colors.neutral[200],
                    }} />
                  )}
                </Box>
                <Box style={{ flex: 1, paddingBottom: isLast ? 0 : t.spacing[1], display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[700],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {event.description}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {event.actor} {formatDistanceToNow((event.date ?? new Date()), { addSuffix: true })}
                  </Text>
                </Box>
              </Box>
            );
          })}
          {events.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No events
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
