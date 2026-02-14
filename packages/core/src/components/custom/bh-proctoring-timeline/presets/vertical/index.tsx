'use client';

/**
 * BhProctoringTimeline - Vertical Preset
 * Time flows top-to-bottom. Events are rendered as decorated nodes along
 * a vertical axis with connecting lines, detailed info cards, and
 * severity-based coloring. Glass-aware, personality-driven.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, ZoomIn, ZoomOut, Clock,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  AlertTriangle, ChevronRight,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createEmptyStateStyle,
  formatDistanceToNow,
  getAccentAwareLayout,
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

function getEventTypeLabel(type: string | undefined): string {
  switch (type) {
    case 'tab_switch': return 'Tab Switch';
    case 'copy_paste': return 'Copy/Paste';
    case 'screen_share': return 'Screen Share';
    case 'unusual_typing': return 'Unusual Typing';
    case 'browser_focus_lost': return 'Focus Lost';
    default: return 'Unknown';
  }
}

function getSeverityLabel(severity: string | undefined): string {
  return (severity || 'unknown').charAt(0).toUpperCase() + (severity || 'unknown').slice(1);
}

function formatTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function formatFullTime(date: Date): string {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const NOW = new Date();
const TWO_HOURS_AGO = new Date(NOW.getTime() - 2 * 60 * 60 * 1000);

const MOCK_EVENTS: TimelineEventView[] = [
  { event: { id: 'vtl-1', eventType: 'screen_share', severity: 'critical', timestamp: new Date(NOW.getTime() - 15 * 60 * 1000) }, candidateName: 'Sarah Johnson', label: 'Screen share detected' },
  { event: { id: 'vtl-2', eventType: 'copy_paste', severity: 'high', timestamp: new Date(NOW.getTime() - 30 * 60 * 1000) }, candidateName: 'Michael Chen', label: 'Large paste detected' },
  { event: { id: 'vtl-3', eventType: 'tab_switch', severity: 'medium', timestamp: new Date(NOW.getTime() - 45 * 60 * 1000) }, candidateName: 'Emily Rodriguez' },
  { event: { id: 'vtl-4', eventType: 'unusual_typing', severity: 'medium', timestamp: new Date(NOW.getTime() - 55 * 60 * 1000) }, candidateName: 'James Kim' },
  { event: { id: 'vtl-5', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(NOW.getTime() - 70 * 60 * 1000) }, candidateName: 'Anna Kowalski' },
  { event: { id: 'vtl-6', eventType: 'tab_switch', severity: 'low', timestamp: new Date(NOW.getTime() - 85 * 60 * 1000) }, candidateName: 'David Park' },
  { event: { id: 'vtl-7', eventType: 'copy_paste', severity: 'high', timestamp: new Date(NOW.getTime() - 100 * 60 * 1000) }, candidateName: 'Lisa Martinez', label: 'Multiple pastes' },
  { event: { id: 'vtl-8', eventType: 'browser_focus_lost', severity: 'medium', timestamp: new Date(NOW.getTime() - 110 * 60 * 1000) }, candidateName: 'Robert Taylor' },
];

/* ================================================================== */
/*  Vertical Preset                                                    */
/* ================================================================== */

export const VerticalBhProctoringTimeline = createPreset<BhProctoringTimelineProps>({
  name: 'BhProctoringTimeline.Vertical',
  render: (ctx: PresetContext<BhProctoringTimelineProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      events = MOCK_EVENTS,
      startTime = TWO_HOURS_AGO,
      endTime = NOW,
      onEventClick,
      selectedEventId,
      zoomLevel = 1,
      onZoomChange,
      className,
      style,
    } = props;

    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

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

    /* Sort events by timestamp descending (most recent first) */
    const sortedEvents = useMemo(
      () => [...events].sort((a, b) => {
        const tsA = a.event?.timestamp?.getTime() ?? 0;
        const tsB = b.event?.timestamp?.getTime() ?? 0;
        return tsB - tsA;
      }),
      [events],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    /* Severity legend */
    const severityLegend: ProctoringEventSeverity[] = ['critical', 'high', 'medium', 'low'];

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...entrance.animate,
          transition: entrance.transition,
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
                width: 8,
                height: 8,
                borderRadius: t.borderRadius.full,
                backgroundColor: getSeverityColor(sev, t),
                flexShrink: 0,
              }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                {getSeverityLabel(sev)}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Empty State */}
        {events.length === 0 && (
          <Box style={createEmptyStateStyle(t)}>
            <Clock size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              No events in this time range
            </Text>
          </Box>
        )}

        {/* Vertical Timeline */}
        {events.length > 0 && (
          <Box
            role="list"
            aria-label="Vertical event timeline"
            style={{
              padding: `${t.spacing[5]}px ${t.spacing[5]}px`,
              position: 'relative',
              overflowY: 'auto',
              maxHeight: 500 * (zoomLevel ?? 1),
            }}
          >
            {/* Vertical line */}
            <Box style={{
              position: 'absolute',
              left: t.spacing[5] + 20,
              top: t.spacing[5],
              bottom: t.spacing[5],
              width: 2,
              backgroundColor: t.colors.neutral[200],
              borderRadius: t.borderRadius.full,
            }} />

            {sortedEvents.map((item, i) => {
              const itemId = item.event?.id ?? '';
              const itemSeverity = item.event?.severity;
              const itemEventType = item.event?.eventType;
              const itemTimestamp = item.event?.timestamp ?? new Date();
              const itemCandidateName = item.candidateName ?? 'Unknown';
              const itemLabel = item.label;

              const isHovered = hoveredEvent === itemId;
              const isSelected = selectedEventId === itemId;
              const sevColor = getSeverityColor(itemSeverity, t);
              const sevBg = getSeverityBg(itemSeverity, t);
              const EventIcon = getEventTypeIcon(itemEventType);

              return (
                <Box
                  key={itemId || i}
                  role="listitem"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: t.spacing[4],
                    marginBottom: i < sortedEvents.length - 1 ? t.spacing[5] : 0,
                    ...animStyle(i),
                  }}
                >
                  {/* Timeline Node */}
                  <Box style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                    width: 42,
                    position: 'relative',
                    zIndex: 2,
                  }}>
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`${itemCandidateName}: ${getEventTypeLabel(itemEventType)}, ${getSeverityLabel(itemSeverity)}`}
                      onClick={() => handleEventClick(itemId)}
                      onMouseEnter={() => setHoveredEvent(itemId)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventClick(itemId); } }}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: isSelected ? t.colors.primaryScale[100] : sevBg,
                        border: `3px solid ${isSelected ? t.colors.primaryScale[500] : sevColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: isHovered || isSelected ? t.shadows.md : t.shadows.sm,
                        transition: `all ${t.motion.hover}`,
                        transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                      }}
                    >
                      <EventIcon size={18} color={isSelected ? t.colors.primaryScale[600] : sevColor} />
                    </Box>
                  </Box>

                  {/* Event Content Card */}
                  <Box
                    onClick={() => handleEventClick(itemId)}
                    onMouseEnter={() => setHoveredEvent(itemId)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    style={{
                      flex: 1,
                      ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
                      ...hoverStyles.base,
                      ...(isHovered ? hoverStyles.hover : {}),
                      padding: 0,
                      overflow: 'hidden',
                      borderLeft: `3px solid ${sevColor}`,
                      cursor: 'pointer',
                      ...(isSelected ? { borderColor: t.colors.primaryScale[400], boxShadow: `0 0 0 1px ${t.colors.primaryScale[200]}, ${t.shadows.md}` } : {}),
                    }}
                  >
                    {/* Card Header */}
                    <Box style={{
                      padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                      backgroundColor: t.colors.neutral[50],
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], minWidth: 0 }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {itemCandidateName}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getSeverityBadgeKey(itemSeverity)),
                          borderRadius: badgeRadius,
                          flexShrink: 0,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getSeverityLabel(itemSeverity)}
                          </Text>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], flexShrink: 0 }}>
                        <Clock size={11} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {formatFullTime(itemTimestamp)}
                        </Text>
                      </Box>
                    </Box>

                    {/* Card Body */}
                    <Box style={{
                      padding: `${t.spacing[2]}px ${t.spacing[4]}px ${t.spacing[3]}px`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <Box>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: itemLabel ? 4 : 0 }}>
                          <EventIcon size={13} color={t.colors.neutral[500]} />
                          <Text style={{
                            fontSize: t.typography.fontSize.sm,
                            color: t.colors.neutral[700],
                            fontWeight: t.typography.fontWeight.medium,
                          }}>
                            {getEventTypeLabel(itemEventType)}
                          </Text>
                        </Box>
                        {itemLabel && (
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[500],
                            marginTop: t.spacing[1],
                          }}>
                            {itemLabel}
                          </Text>
                        )}
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {formatDistanceToNow(itemTimestamp, { addSuffix: true })}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
        </Box>
      </Box>
    );
  },
});
