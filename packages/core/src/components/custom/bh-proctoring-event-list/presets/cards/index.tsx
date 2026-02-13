'use client';

/**
 * BhProctoringEventList - Cards Preset
 * Grid layout of event cards with severity badges, type icons,
 * candidate info, and quick-action buttons. Glass-aware, personality-driven.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, Eye, EyeOff, CheckCircle, XCircle,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  Search, AlertTriangle, Loader2, Clock,
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
  getAccentAwareLayout,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhProctoringEventListProps,
  ProctoringEventItem,
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

function getSeverityWeight(severity: ProctoringEventSeverity): number {
  switch (severity) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
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

function getEventTypeLabel(type: ProctoringEventType): string {
  switch (type) {
    case 'tab_switch': return 'Tab Switch';
    case 'copy_paste': return 'Copy/Paste';
    case 'screen_share': return 'Screen Share';
    case 'unusual_typing': return 'Unusual Typing';
    case 'browser_focus_lost': return 'Focus Lost';
  }
}

function getSeverityLabel(severity: ProctoringEventSeverity): string {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_EVENTS: ProctoringEventItem[] = [
  { id: 'pe-1', candidateName: 'Sarah Johnson', eventType: 'screen_share', severity: 'critical', timestamp: new Date(Date.now() - 300000), reviewed: false, dismissed: false },
  { id: 'pe-2', candidateName: 'Michael Chen', eventType: 'copy_paste', severity: 'high', timestamp: new Date(Date.now() - 900000), reviewed: false, dismissed: false },
  { id: 'pe-3', candidateName: 'Emily Rodriguez', eventType: 'tab_switch', severity: 'medium', timestamp: new Date(Date.now() - 1800000), reviewed: true, dismissed: false },
  { id: 'pe-4', candidateName: 'James Kim', eventType: 'unusual_typing', severity: 'medium', timestamp: new Date(Date.now() - 3600000), reviewed: false, dismissed: false },
  { id: 'pe-5', candidateName: 'Sarah Johnson', eventType: 'tab_switch', severity: 'low', timestamp: new Date(Date.now() - 5400000), reviewed: true, dismissed: true },
  { id: 'pe-6', candidateName: 'Anna Kowalski', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(Date.now() - 7200000), reviewed: false, dismissed: false },
  { id: 'pe-7', candidateName: 'David Park', eventType: 'copy_paste', severity: 'critical', timestamp: new Date(Date.now() - 8400000), reviewed: false, dismissed: false },
  { id: 'pe-8', candidateName: 'Lisa Martinez', eventType: 'screen_share', severity: 'high', timestamp: new Date(Date.now() - 10800000), reviewed: true, dismissed: false },
  { id: 'pe-9', candidateName: 'Robert Taylor', eventType: 'browser_focus_lost', severity: 'medium', timestamp: new Date(Date.now() - 14400000), reviewed: false, dismissed: false },
  { id: 'pe-10', candidateName: 'Jennifer Wu', eventType: 'unusual_typing', severity: 'low', timestamp: new Date(Date.now() - 18000000), reviewed: false, dismissed: false },
];

/* ================================================================== */
/*  Cards Preset                                                       */
/* ================================================================== */

export const CardsBhProctoringEventList = createPreset<BhProctoringEventListProps>({
  name: 'BhProctoringEventList.Cards',
  render: (ctx: PresetContext<BhProctoringEventListProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      events = MOCK_EVENTS,
      onEventClick,
      onReviewEvent,
      onDismissEvent,
      selectedEventId,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      filterSeverity,
      filterType,
      loading,
      className,
      style,
    } = props;

    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleEventClick = useCallback((id: string) => {
      onEventClick?.(id);
    }, [onEventClick]);

    const handleReview = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onReviewEvent?.(id);
    }, [onReviewEvent]);

    const handleDismiss = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onDismissEvent?.(id);
    }, [onDismissEvent]);

    const processedEvents = useMemo(() => {
      let filtered = [...events];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(e =>
          e.candidateName.toLowerCase().includes(q) ||
          getEventTypeLabel(e.eventType).toLowerCase().includes(q)
        );
      }

      if (filterSeverity && filterSeverity.length > 0) {
        filtered = filtered.filter(e => filterSeverity.includes(e.severity));
      }

      if (filterType && filterType.length > 0) {
        filtered = filtered.filter(e => filterType.includes(e.eventType));
      }

      filtered.sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case 'timestamp':
            cmp = a.timestamp.getTime() - b.timestamp.getTime();
            break;
          case 'severity':
            cmp = getSeverityWeight(a.severity) - getSeverityWeight(b.severity);
            break;
          case 'type':
            cmp = a.eventType.localeCompare(b.eventType);
            break;
        }
        return sortOrder === 'desc' ? -cmp : cmp;
      });

      return filtered;
    }, [events, searchQuery, filterSeverity, filterType, sortBy, sortOrder]);

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
          height: '100%',
          fontFamily: 'inherit',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: t.spacing[4],
          gap: t.spacing[3],
          flexWrap: 'wrap',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.errorScale[50] })}>
              <Shield size={20} color={t.colors.errorScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Proctoring Events
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                {processedEvents.length} events
              </Text>
            </Box>
          </Box>

          {/* Search */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            backgroundColor: t.colors.common.white,
            border: `1px solid ${t.colors.neutral[200]}`,
            borderRadius: t.borderRadius.md,
            padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
            minWidth: 200,
            boxShadow: t.shadows.sm,
            ...(isGlass && t.glass ? { backdropFilter: t.glass.blurSm, backgroundColor: t.glass.bgLight } : {}),
          }}>
            <Search size={14} color={t.colors.neutral[400]} />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search proctoring events"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[700],
                width: '100%',
                padding: `${t.spacing[1]}px 0`,
                fontFamily: 'inherit',
              }}
            />
          </Box>
        </Box>

        {/* Loading */}
        {loading && (
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: t.spacing[8],
          }}>
            <Loader2
              size={24}
              color={t.colors.primaryScale[500]}
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </Box>
        )}

        {/* Empty State */}
        {!loading && processedEvents.length === 0 && (
          <Box style={{ ...card, ...createEmptyStateStyle(t) }}>
            <Shield size={36} style={{ marginBottom: t.spacing[3], opacity: 0.4 }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
              No proctoring events found
            </Text>
          </Box>
        )}

        {/* Card Grid */}
        {!loading && processedEvents.length > 0 && (
          <Box
            role="list"
            aria-label="Proctoring events grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: t.spacing[4],
            }}
          >
            {processedEvents.map((event, i) => {
              const Icon = getEventTypeIcon(event.eventType);
              const isHovered = hoveredCard === event.id;
              const isSelected = selectedEventId === event.id;
              const sevColor = getSeverityColor(event.severity, t);

              return (
                <Box
                  key={event.id}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${event.candidateName}: ${getEventTypeLabel(event.eventType)}, ${getSeverityLabel(event.severity)} severity`}
                  onClick={() => handleEventClick(event.id)}
                  onMouseEnter={() => setHoveredCard(event.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventClick(event.id); } }}
                  style={{
                    ...card,
                    ...hoverStyles.base,
                    ...(isHovered ? hoverStyles.hover : {}),
                    padding: 0,
                    overflow: 'hidden',
                    borderLeft: `3px solid ${sevColor}`,
                    ...(isSelected ? { borderColor: t.colors.primaryScale[400], backgroundColor: t.colors.primaryScale[50] } : {}),
                    ...animStyle(i),
                    ...(accentBar ? accentLayout.outer : {}),
                  }}
                >
                  {accentBar && <Box style={accentBar} />}

                  <Box style={accentBar ? accentLayout.inner : {}}>
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
                      <Box style={createIconContainerStyle(t, { size: 32, color: getSeverityBg(event.severity, t) })}>
                        <Icon size={14} color={sevColor} />
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.sm,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[900],
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {event.candidateName}
                      </Text>
                    </Box>
                    <Box style={{
                      ...createBadgeStyle(t, getSeverityBadgeKey(event.severity)),
                      borderRadius: badgeRadius,
                      flexShrink: 0,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>
                        {getSeverityLabel(event.severity)}
                      </Text>
                    </Box>
                  </Box>

                  {/* Card Body */}
                  <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                      <Icon size={14} color={t.colors.neutral[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>
                        {getEventTypeLabel(event.eventType)}
                      </Text>
                    </Box>

                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                      <Clock size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </Text>
                    </Box>

                    {/* Status + Actions */}
                    <Box style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: t.spacing[2],
                      borderTop: `1px solid ${t.colors.neutral[100]}`,
                    }}>
                      {event.reviewed ? (
                        <Box style={{
                          ...createBadgeStyle(t, event.dismissed ? 'secondary' : 'success'),
                          borderRadius: badgeRadius,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: t.spacing[1],
                        }}>
                          {event.dismissed ? <EyeOff size={10} /> : <CheckCircle size={10} />}
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {event.dismissed ? 'Dismissed' : 'Reviewed'}
                          </Text>
                        </Box>
                      ) : (
                        <Box style={{
                          ...createBadgeStyle(t, 'warning'),
                          borderRadius: badgeRadius,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: t.spacing[1],
                        }}>
                          <Eye size={10} />
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>Pending</Text>
                        </Box>
                      )}

                      {!event.reviewed && (
                        <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                          <button
                            onClick={(e) => handleReview(event.id, e)}
                            aria-label="Review event"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 28, height: 28, borderRadius: t.borderRadius.md,
                              border: `1px solid ${t.colors.neutral[200]}`,
                              backgroundColor: t.colors.common.white, color: t.colors.primaryScale[600],
                              cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                              transition: `transform ${t.motion.hover}`,
                            }}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDismiss(event.id, e)}
                            aria-label="Dismiss event"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 28, height: 28, borderRadius: t.borderRadius.md,
                              border: `1px solid ${t.colors.neutral[200]}`,
                              backgroundColor: t.colors.common.white, color: t.colors.neutral[500],
                              cursor: 'pointer', padding: 0, boxShadow: t.shadows.sm,
                              transition: `transform ${t.motion.hover}`,
                            }}
                          >
                            <XCircle size={13} />
                          </button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
