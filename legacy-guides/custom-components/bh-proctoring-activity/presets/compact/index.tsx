'use client';

/**
 * BhProctoringActivity - Compact Preset
 * Condensed list view of proctoring events.
 * Minimal spacing, ideal for sidebars or widget areas.
 */

import { useMemo, useCallback} from 'react';
import {
  Activity, MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  createPersonalitySectionHeaderStyle,
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
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhProctoringActivity = createPreset<BhProctoringActivityProps>({
  name: 'BhProctoringActivity.Compact',
  render: (ctx: PresetContext<BhProctoringActivityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      events: rawEvents = [],
      onEventClick,
      maxItems = 10,
      showTimestamps = true,
      className,
      style,
    } = props;

    const events = Array.isArray(rawEvents) ? rawEvents : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const displayEvents = useMemo(() => {
      const sorted = [...events].sort((a, b) => (b.timestamp?.getTime?.() ?? 0) - (a.timestamp?.getTime?.() ?? 0));
      return sorted.slice(0, maxItems);
    }, [events, maxItems]);

    const handleClick = useCallback((id: string) => {
      onEventClick?.(id);
    }, [onEventClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

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
          padding: 0,
          overflow: 'hidden',
          fontFamily: 'inherit',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            <Activity size={12} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[700],
            }}>
              Activity
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {events.length}
          </Text>
        </Box>

        {/* Event list */}
        <Box role="list" aria-label="Proctoring activity">
          {displayEvents.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No activity
              </Text>
            </Box>
          )}

          {displayEvents.map((event, index) => {
            const EventIcon = getEventTypeIcon(event.eventType ?? 'tab_switch');
            const sevColor = getSeverityColor(event.severity ?? 'low', t);

            return (
              <Box
                key={event.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${event.candidateName}: ${getEventTypeLabel(event.eventType ?? 'tab_switch')}`}
                onClick={() => handleClick(event.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(event.id); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: `2px solid ${sevColor}`,
                  cursor: 'pointer',
                  backgroundColor: t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                  ...entrance.animate,
                  transitionDelay: `${createStaggerDelay(t, index)}ms`,
                }}
              >
                {/* Icon */}
                <EventIcon size={12} color={sevColor} style={{ flexShrink: 0 }} />

                {/* Content */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[800],
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {event.candidateName}
                    </Text>
                    <Box style={{
                      width: 4, height: 4,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: sevColor,
                      flexShrink: 0,
                    }} />
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[500],
                      whiteSpace: 'nowrap',
                    }}>
                      {getEventTypeLabel(event.eventType ?? 'tab_switch')}
                    </Text>
                  </Box>
                  {showTimestamps && (
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      {event.timestamp ? formatDistanceToNow(event.timestamp, { addSuffix: true }) : ''}
                    </Text>
                  )}
                </Box>

                <ChevronRight size={10} color={t.colors.neutral[300]} style={{ flexShrink: 0 }} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
