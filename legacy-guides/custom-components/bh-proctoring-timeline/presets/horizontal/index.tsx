'use client';

/**
 * BhProctoringTimeline - Horizontal Preset
 * Time flows left-to-right. Events are rendered as colored dots along
 * a horizontal axis with time labels, hover tooltips, zoom controls,
 * and severity-based coloring. Glass-aware, personality-driven.
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Shield, ZoomIn, ZoomOut, Clock,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  AlertTriangle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
  getAccentAwareLayout,

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhProctoringTimelineProps,
  TimelineEventView,
  ProctoringEventSeverity,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverityColor(severity: string | undefined, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'high': return t.colors.errorScale[400];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.infoScale[500];
    default: return t.colors.neutral[400];
  }
}

function getSeverityBg(severity: string | undefined, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[50];
    case 'high': return t.colors.errorScale[50];
    case 'medium': return t.colors.warningScale[50];
    case 'low': return t.colors.infoScale[50];
    default: return t.colors.neutral[50];
  }
}

function getSeverityBadgeKey(severity: string | undefined): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low':
    default: return 'info';
  }
}

function getEventTypeIcon(type: string | undefined) {
  switch (type) {
    case 'tab_switch': return MonitorOff;
    case 'copy_paste': return Clipboard;
    case 'screen_share': return ScreenShare;
    case 'unusual_typing': return Keyboard;
    case 'browser_focus_lost': return Globe;
    default: return AlertTriangle;
  }
}

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel } from '../../../_shared/proctoring-labels';

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getDotSize(severity: string | undefined): number {
  switch (severity) {
    case 'critical': return 16;
    case 'high': return 14;
    case 'medium': return 12;
    case 'low': return 10;
    default: return 10;
  }
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const NOW = new Date();
const TWO_HOURS_AGO = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);

/* ================================================================== */
/*  Horizontal Preset                                                  */
/* ================================================================== */

export const HorizontalBhProctoringTimeline = createPreset<BhProctoringTimelineProps>({
  name: 'BhProctoringTimeline.Horizontal',
  render: (ctx: PresetContext<BhProctoringTimelineProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      events: rawEvents = [],
      startTime = TWO_HOURS_AGO,
      endTime = NOW,
      onEventClick,
      selectedEventId,
      zoomLevel = 1,
      onZoomChange,
      className,
      style,
    } = props;

    const events = Array.isArray(rawEvents) ? rawEvents : [];

    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleEventClick = useCallback((id: string) => {
      onEventClick?.(id);
    }, [onEventClick]);

    const handleZoomIn = useCallback(() => {
      const newLevel = Math.min((zoomLevel ?? 1) + 0.5, 4);
      onZoomChange?.(newLevel);
    }, [zoomLevel, onZoomChange]);

    const handleZoomOut = useCallback(() => {
      const newLevel = Math.max((zoomLevel ?? 1) - 0.5, 0.5);
      onZoomChange?.(newLevel);
    }, [zoomLevel, onZoomChange]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* Timeline calculations */
    const timeRange = useMemo(() => endTime.getTime() - startTime.getTime(), [startTime, endTime]);
    const baseWidth = 600;
    const timelineWidth = useMemo(() => baseWidth * (zoomLevel ?? 1), [zoomLevel]);

    /* Generate time markers */
    const timeMarkers = useMemo(() => {
      const markers: { time: Date; position: number }[] = [];
      const intervalMs = Math.max(timeRange / (6 * (zoomLevel ?? 1)), 60000);
      let current = startTime.getTime();
      while (current <= endTime.getTime()) {
        const position = ((current - startTime.getTime()) / timeRange) * 100;
        markers.push({ time: new Date(current), position });
        current += intervalMs;
      }
      return markers;
    }, [startTime, endTime, timeRange, zoomLevel]);

    /* Compute event positions */
    const positionedEvents = useMemo(() => {
      return events.map(ev => {
        const ts = ev.event?.timestamp ?? new Date();
        const position = ((ts.getTime() - startTime.getTime()) / timeRange) * 100;
        return { ...ev, _position: Math.max(0, Math.min(100, position)) };
      }).sort((a, b) => a._position - b._position);
    }, [events, startTime, timeRange]);

    /* Severity legend */
    const severityLegend: ProctoringEventSeverity[] = ['critical', 'high', 'medium', 'low'];

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          backgroundColor: t.colors.neutral[50],
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.errorScale[50] })}>
              <Clock size={20} color={t.colors.errorScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Event Timeline
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                {formatTime(startTime)} - {formatTime(endTime)} ({events.length} events)
              </Text>
            </Box>
          </Box>

          {/* Zoom Controls */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <button
              onClick={handleZoomOut}
              aria-label="Zoom out"
              disabled={zoomLevel <= 0.5}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                color: zoomLevel <= 0.5 ? t.colors.neutral[300] : t.colors.neutral[600],
                cursor: zoomLevel <= 0.5 ? 'not-allowed' : 'pointer',
                padding: 0, boxShadow: t.shadows.sm,
                transition: `all ${t.motion.hover}`,
              }}
            >
              <ZoomOut size={16} />
            </button>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], minWidth: 32, textAlign: 'center' }}>
              {zoomLevel}x
            </Text>
            <button
              onClick={handleZoomIn}
              aria-label="Zoom in"
              disabled={zoomLevel >= 4}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                color: zoomLevel >= 4 ? t.colors.neutral[300] : t.colors.neutral[600],
                cursor: zoomLevel >= 4 ? 'not-allowed' : 'pointer',
                padding: 0, boxShadow: t.shadows.sm,
                transition: `all ${t.motion.hover}`,
              }}
            >
              <ZoomIn size={16} />
            </button>
          </Box>
        </Box>

        {/* Legend */}
        <Box style={{
          padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[4],
          flexWrap: 'wrap',
        }}>
          {severityLegend.map((sev) => (
            <Box key={sev} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{
                width: getDotSize(sev),
                height: getDotSize(sev),
                borderRadius: t.borderRadius.full,
                backgroundColor: getSeverityColor(sev, t),
                flexShrink: 0,
                boxShadow: `0 0 0 2px ${getSeverityBg(sev, t)}`,
              }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                {getSeverityLabel(sev)}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Timeline Area */}
        {events.length === 0 ? (
          <Box style={createEmptyStateStyle(t)}>
            <Clock size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              No events in this time range
            </Text>
          </Box>
        ) : (
          <div
            ref={scrollRef}
            style={{
              overflowX: 'auto',
              padding: `${t.spacing[5]}px ${t.spacing[5]}px ${t.spacing[4]}px`,
            }}
          >
            <Box style={{
              position: 'relative',
              minWidth: timelineWidth,
              height: 120,
            }}>
              {/* Time axis line */}
              <Box style={{
                position: 'absolute',
                top: 60,
                left: 0,
                right: 0,
                height: 2,
                backgroundColor: t.colors.neutral[200],
                borderRadius: t.borderRadius.full,
              }} />

              {/* Time markers */}
              {timeMarkers.map((marker, i) => (
                <Box
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${marker.position}%`,
                    top: 52,
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box style={{
                    width: 1,
                    height: 18,
                    backgroundColor: t.colors.neutral[200],
                  }} />
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[400],
                    marginTop: 4,
                    whiteSpace: 'nowrap',
                  }}>
                    {formatTime(marker.time)}
                  </Text>
                </Box>
              ))}

              {/* Event dots */}
              {positionedEvents.map((item) => {
                const itemId = item.event?.id ?? '';
                const itemSeverity = item.event?.severity;
                const itemEventType = item.event?.eventType;
                const itemTimestamp = item.event?.timestamp ?? new Date();
                const itemCandidateName = item.candidateName ?? 'Unknown';
                const itemLabel = item.label;

                const isHovered = hoveredEvent === itemId;
                const isSelected = selectedEventId === itemId;
                const sevColor = getSeverityColor(itemSeverity, t);
                const dotSize = getDotSize(itemSeverity);
                const EventIcon = getEventTypeIcon(itemEventType);

                return (
                  <Box
                    key={itemId || Math.random()}
                    style={{
                      position: 'absolute',
                      left: `${item._position}%`,
                      top: 60 - dotSize / 2,
                      transform: `translateX(-50%) ${isHovered || isSelected ? 'scale(1.4)' : 'scale(1)'}`,
                      zIndex: isHovered || isSelected ? 10 : 1,
                      transition: `transform ${t.motion.hover}`,
                    }}
                  >
                    {/* Dot */}
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`${itemCandidateName}: ${getEventTypeLabel(itemEventType)}, ${getSeverityLabel(itemSeverity)}`}
                      onClick={() => handleEventClick(itemId)}
                      onMouseEnter={() => setHoveredEvent(itemId)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventClick(itemId); } }}
                      style={{
                        width: dotSize,
                        height: dotSize,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: sevColor,
                        cursor: 'pointer',
                        boxShadow: isSelected
                          ? `0 0 0 3px ${t.colors.primaryScale[200]}, ${t.shadows.md}`
                          : isHovered
                            ? `0 0 0 3px ${getSeverityBg(itemSeverity, t)}, ${t.shadows.sm}`
                            : `0 0 0 2px ${getSeverityBg(itemSeverity, t)}`,
                        transition: `box-shadow ${t.motion.hover}`,
                      }}
                    />

                    {/* Tooltip */}
                    {(isHovered || isSelected) && (
                      <Box style={{
                        position: 'absolute',
                        bottom: dotSize + 8,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: t.colors.neutral[900],
                        color: t.colors.common.white,
                        borderRadius: t.borderRadius.md,
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        whiteSpace: 'nowrap',
                        boxShadow: t.shadows.lg,
                        zIndex: 20,
                        ...(isGlass && t.glass ? { backdropFilter: t.glass.blur } : {}),
                      }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.common.white,
                          display: 'block',
                          marginBottom: t.spacing[1],
                        }}>
                          {itemCandidateName}
                        </Text>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                          <EventIcon size={10} color={t.colors.neutral[300]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>
                            {getEventTypeLabel(itemEventType)}
                          </Text>
                        </Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Box style={{
                            width: 6,
                            height: 6,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: sevColor,
                          }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>
                            {getSeverityLabel(itemSeverity)} - {formatTime(itemTimestamp)}
                          </Text>
                        </Box>
                        {itemLabel && (
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1] }}>
                            {itemLabel}
                          </Text>
                        )}
                        {(item.reviewed || item.dismissed) && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginTop: t.spacing[1] }}>
                            <Text style={{
                              fontSize: t.typography.fontSize.xs,
                              color: item.dismissed ? t.colors.neutral[400] : t.colors.successScale[300],
                            }}>
                              {item.dismissed ? 'Dismissed' : 'Reviewed'}
                              {item.reviewedBy ? ` by ${item.reviewedBy}` : ''}
                            </Text>
                          </Box>
                        )}
                        {/* Tooltip arrow */}
                        <Box style={{
                          position: 'absolute',
                          bottom: -4,
                          left: '50%',
                          transform: 'translateX(-50%) rotate(45deg)',
                          width: 8,
                          height: 8,
                          backgroundColor: t.colors.neutral[900],
                        }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </div>
        )}
        </Box>
      </Box>
    );
  },
});
