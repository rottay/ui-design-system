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
  ProctoringEventListItem,
  ProctoringEventType,
  ProctoringEventSeverity,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Safe accessors for ProctoringEventListItem */
function getItemId(item: ProctoringEventListItem): string { return item.event?.id ?? ''; }
function getItemEventType(item: ProctoringEventListItem): string | undefined { return item.event?.eventType; }
function getItemSeverity(item: ProctoringEventListItem): string | undefined { return item.event?.severity; }
function getItemTimestamp(item: ProctoringEventListItem): Date | undefined { return item.event?.timestamp ? new Date(item.event.timestamp) : undefined; }
function getItemReviewed(item: ProctoringEventListItem): boolean { return item.event?.reviewed ?? false; }
function getItemDismissed(item: ProctoringEventListItem): boolean { return item.event?.dismissed ?? false; }

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

function getSeverityWeight(severity: string | undefined): number {
  switch (severity) {
    case 'critical': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
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

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_EVENTS: ProctoringEventListItem[] = [
  { event: { id: 'pe-1', eventType: 'screen_share', severity: 'critical', timestamp: new Date(Date.now() - 300000), reviewed: false, dismissed: false }, candidateName: 'Sarah Johnson' },
  { event: { id: 'pe-2', eventType: 'copy_paste', severity: 'high', timestamp: new Date(Date.now() - 900000), reviewed: false, dismissed: false }, candidateName: 'Michael Chen' },
  { event: { id: 'pe-3', eventType: 'tab_switch', severity: 'medium', timestamp: new Date(Date.now() - 1800000), reviewed: true, dismissed: false }, candidateName: 'Emily Rodriguez' },
  { event: { id: 'pe-4', eventType: 'unusual_typing', severity: 'medium', timestamp: new Date(Date.now() - 3600000), reviewed: false, dismissed: false }, candidateName: 'James Kim' },
  { event: { id: 'pe-5', eventType: 'tab_switch', severity: 'low', timestamp: new Date(Date.now() - 5400000), reviewed: true, dismissed: true }, candidateName: 'Sarah Johnson' },
  { event: { id: 'pe-6', eventType: 'browser_focus_lost', severity: 'low', timestamp: new Date(Date.now() - 7200000), reviewed: false, dismissed: false }, candidateName: 'Anna Kowalski' },
  { event: { id: 'pe-7', eventType: 'copy_paste', severity: 'critical', timestamp: new Date(Date.now() - 8400000), reviewed: false, dismissed: false }, candidateName: 'David Park' },
  { event: { id: 'pe-8', eventType: 'screen_share', severity: 'high', timestamp: new Date(Date.now() - 10800000), reviewed: true, dismissed: false }, candidateName: 'Lisa Martinez' },
  { event: { id: 'pe-9', eventType: 'browser_focus_lost', severity: 'medium', timestamp: new Date(Date.now() - 14400000), reviewed: false, dismissed: false }, candidateName: 'Robert Taylor' },
  { event: { id: 'pe-10', eventType: 'unusual_typing', severity: 'low', timestamp: new Date(Date.now() - 18000000), reviewed: false, dismissed: false }, candidateName: 'Jennifer Wu' },
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
      let filtered = [...(events ?? [])];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(e =>
          (e.candidateName || '').toLowerCase().includes(q) ||
          getEventTypeLabel(getItemEventType(e)).toLowerCase().includes(q)
        );
      }

      if (filterSeverity && filterSeverity.length > 0) {
        filtered = filtered.filter(e => {
          const sev = getItemSeverity(e);
          return sev ? filterSeverity.includes(sev as ProctoringEventSeverity) : false;
        });
      }

      if (filterType && filterType.length > 0) {
        filtered = filtered.filter(e => {
          const et = getItemEventType(e);
          return et ? filterType.includes(et as ProctoringEventType) : false;
        });
      }

      filtered.sort((a, b) => {
        let cmp = 0;
        switch (sortBy) {
          case 'timestamp': {
            const aT = getItemTimestamp(a)?.getTime() ?? 0;
            const bT = getItemTimestamp(b)?.getTime() ?? 0;
            cmp = aT - bT;
            break;
          }
          case 'severity':
            cmp = getSeverityWeight(getItemSeverity(a)) - getSeverityWeight(getItemSeverity(b));
            break;
          case 'type':
            cmp = (getItemEventType(a) ?? '').localeCompare(getItemEventType(b) ?? '');
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
            {processedEvents.map((item, i) => {
              const itemId = getItemId(item);
              const itemEventType = getItemEventType(item);
              const itemSeverity = getItemSeverity(item);
              const itemTimestamp = getItemTimestamp(item);
              const itemReviewed = getItemReviewed(item);
              const itemDismissed = getItemDismissed(item);
              const Icon = getEventTypeIcon(itemEventType);
              const isHovered = hoveredCard === itemId;
              const isSelected = selectedEventId === itemId;
              const sevColor = getSeverityColor(itemSeverity, t);

              return (
                <Box
                  key={itemId || i}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${item.candidateName ?? 'Unknown'}: ${getEventTypeLabel(itemEventType)}, ${getSeverityLabel(itemSeverity)} severity`}
                  onClick={() => handleEventClick(itemId)}
                  onMouseEnter={() => setHoveredCard(itemId)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventClick(itemId); } }}
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
                      <Box style={createIconContainerStyle(t, { size: 32, color: getSeverityBg(itemSeverity, t) })}>
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
                        {item.candidateName ?? 'Unknown'}
                      </Text>
                    </Box>
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

                  {/* Card Body */}
                  <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                      <Icon size={14} color={t.colors.neutral[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700], fontWeight: t.typography.fontWeight.medium }}>
                        {getEventTypeLabel(itemEventType)}
                      </Text>
                    </Box>

                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[3] }}>
                      <Clock size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {itemTimestamp ? formatDistanceToNow(itemTimestamp, { addSuffix: true }) : 'Unknown'}
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
                      {itemReviewed ? (
                        <Box style={{
                          ...createBadgeStyle(t, itemDismissed ? 'secondary' : 'success'),
                          borderRadius: badgeRadius,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: t.spacing[1],
                        }}>
                          {itemDismissed ? <EyeOff size={10} /> : <CheckCircle size={10} />}
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {itemDismissed ? 'Dismissed' : 'Reviewed'}
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

                      {!itemReviewed && (
                        <Box style={{ display: 'flex', gap: t.spacing[1] }}>
                          <button
                            onClick={(e) => handleReview(itemId, e)}
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
                            onClick={(e) => handleDismiss(itemId, e)}
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
