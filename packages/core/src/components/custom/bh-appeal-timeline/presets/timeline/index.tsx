'use client';

/**
 * BhAppealTimeline - Timeline Preset
 * Full timeline view of appeal process events with vertical
 * connector line, icons, and event details.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Scale, FileText, UserPlus, Eye, Gavel,
  Bell, Clock, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  formatDistanceToNow,
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

function getEventBg(type: AppealTimelineEvent['type'], t: DesignTokens): string {
  switch (type) {
    case 'submitted': return t.colors.primaryScale[50];
    case 'assigned': return t.colors.infoScale[50];
    case 'reviewed': return t.colors.warningScale[50];
    case 'decision': return t.colors.successScale[50];
    case 'notified': return t.colors.secondaryScale[50];
  }
}

function getEventLabel(type: AppealTimelineEvent['type']): string {
  switch (type) {
    case 'submitted': return 'Submitted';
    case 'assigned': return 'Assigned';
    case 'reviewed': return 'Reviewed';
    case 'decision': return 'Decision';
    case 'notified': return 'Notified';
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Timeline Preset                                                    */
/* ================================================================== */

export const TimelineBhAppealTimeline = createPreset<BhAppealTimelineProps>({
  name: 'BhAppealTimeline.Timeline',
  render: (ctx: PresetContext<BhAppealTimelineProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      events: rawEvents = [],
      appealId,
      candidateName,
      onEventClick,
      loading,
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
      () => [...events].sort((a, b) => (a.date?.getTime?.() ?? 0) - (b.date?.getTime?.() ?? 0)),
      [events],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
              <Clock size={22} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.xl,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Appeal Timeline
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500] }}>
                {candidateName ? `${candidateName}` : appealId ? `Appeal #${appealId}` : 'Process history'}
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Timeline */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          <Box style={{ ...card, padding: `${t.spacing[6]}px ${t.spacing[5]}px` }}>
            {sortedEvents.length === 0 && (
              <Box style={createEmptyStateStyle(t)}>
                <Clock size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                  No timeline events
                </Text>
              </Box>
            )}

            <Box role="list" aria-label="Appeal timeline events">
              {sortedEvents.map((event, i) => {
                const Icon = getEventIcon(event.type);
                const color = getEventColor(event.type, t);
                const bg = getEventBg(event.type, t);
                const isLast = i === sortedEvents.length - 1;

                return (
                  <Box
                    key={event.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${getEventLabel(event.type)}: ${event.description}`}
                    onClick={() => handleClick(event.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(event.id); } }}
                    style={{
                      display: 'flex',
                      gap: t.spacing[4],
                      cursor: 'pointer',
                      ...animStyle(i),
                    }}
                  >
                    {/* Timeline connector */}
                    <Box style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}>
                      <Box style={createIconContainerStyle(t, { size: 36, color: bg })}>
                        <Icon size={16} color={color} />
                      </Box>
                      {!isLast && (
                        <Box style={{
                          width: 2,
                          flex: 1,
                          minHeight: t.spacing[4],
                          backgroundColor: t.colors.neutral[200],
                        }} />
                      )}
                    </Box>

                    {/* Event content */}
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                      flex: 1,
                      paddingBottom: isLast ? 0 : t.spacing[5],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                        <Box style={{
                          ...createBadgeStyle(t, 'primary'),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>{getEventLabel(event.type)}</Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {formatDistanceToNow((event.date ?? new Date()), { addSuffix: true })}
                        </Text>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        color: t.colors.neutral[700],
                        lineHeight: 1.5,
                        marginBottom: t.spacing[1],
                      }}>
                        {event.description}
                      </Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        by {event.actor}
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
