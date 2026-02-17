'use client';

/**
 * BhProctoringEventList - Table Preset
 * Row-based data table view of proctoring events with sortable columns,
 * severity badges, type icons, and inline review actions.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, Eye, EyeOff, ChevronRight, CheckCircle, XCircle,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  ArrowUpDown, ArrowUp, ArrowDown, Filter, Search,
  AlertTriangle, Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
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

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel } from '@rottay/scoring';

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
/*  Table Preset                                                       */
/* ================================================================== */

export const TableBhProctoringEventList = createPreset<BhProctoringEventListProps>({
  name: 'BhProctoringEventList.Table',
  render: (ctx: PresetContext<BhProctoringEventListProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      events: rawEvents = MOCK_EVENTS,
      onEventClick,
      onReviewEvent,
      onDismissEvent,
      selectedEventId,
      sortBy = 'timestamp',
      sortOrder = 'desc',
      onSortChange,
      filterSeverity,
      filterType,
      onFilterChange,
      loading,
      className,
      style,
    } = props;

    const events = Array.isArray(rawEvents) ? rawEvents : MOCK_EVENTS;

    const [hoveredRow, setHoveredRow] = useState<string | null>(null);
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

    const handleSort = useCallback((field: string) => {
      if (onSortChange) {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        onSortChange(field, newOrder);
      }
    }, [sortBy, sortOrder, onSortChange]);

    /* Filtered and sorted events */
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

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const SortIcon = useCallback(({ field }: { field: string }) => {
      if (sortBy !== field) return <ArrowUpDown size={12} color={t.colors.neutral[400]} />;
      return sortOrder === 'asc'
        ? <ArrowUp size={12} color={t.colors.primaryScale[600]} />
        : <ArrowDown size={12} color={t.colors.primaryScale[600]} />;
    }, [sortBy, sortOrder, t]);

    const columnHeaderStyle = useMemo((): React.CSSProperties => ({
      fontSize: t.typography.fontSize.xs,
      fontWeight: t.typography.fontWeight.semibold,
      color: t.colors.neutral[500],
      textTransform: ptypo.labelTransform,
      letterSpacing: ptypo.labelLetterSpacing,
      display: 'flex',
      alignItems: 'center',
      gap: t.spacing[1],
      cursor: 'pointer',
      userSelect: 'none' as const,
      padding: `${t.spacing[2]}px 0`,
    }), [t, ptypo]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          fontFamily: 'inherit',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header Card */}
        <Box style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          marginBottom: t.spacing[4],
          ...(accentBar ? accentLayout.outer : {}),
        }}>
          {accentBar && <Box style={accentBar} />}
          <Box style={accentBar ? accentLayout.inner : {}}>
          <Box style={{
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            backgroundColor: t.colors.neutral[50],
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: t.spacing[3],
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
                  {processedEvents.length} of {events.length} events
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

          {/* Table */}
          <Box style={{ overflowX: 'auto' }}>
            {/* Table Header */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
              gap: t.spacing[3],
              padding: `${t.spacing[2]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              minWidth: 700,
            }}>
              <Box
                style={columnHeaderStyle}
                onClick={() => handleSort('type')}
                role="columnheader"
                tabIndex={0}
                aria-label="Sort by candidate"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSort('type'); }}
              >
                <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Candidate</Text>
                <SortIcon field="type" />
              </Box>
              <Box
                style={columnHeaderStyle}
                onClick={() => handleSort('type')}
                role="columnheader"
                tabIndex={0}
                aria-label="Sort by event type"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSort('type'); }}
              >
                <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Type</Text>
                <SortIcon field="type" />
              </Box>
              <Box
                style={columnHeaderStyle}
                onClick={() => handleSort('severity')}
                role="columnheader"
                tabIndex={0}
                aria-label="Sort by severity"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSort('severity'); }}
              >
                <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Severity</Text>
                <SortIcon field="severity" />
              </Box>
              <Box
                style={columnHeaderStyle}
                onClick={() => handleSort('timestamp')}
                role="columnheader"
                tabIndex={0}
                aria-label="Sort by time"
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSort('timestamp'); }}
              >
                <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Time</Text>
                <SortIcon field="timestamp" />
              </Box>
              <Box style={{ ...columnHeaderStyle, cursor: 'default' }}>
                <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Status</Text>
              </Box>
              <Box style={{ ...columnHeaderStyle, cursor: 'default', justifyContent: 'flex-end' }}>
                <Text style={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>Actions</Text>
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
              <Box style={createEmptyStateStyle(t)}>
                <Shield size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                  No proctoring events found
                </Text>
                {searchQuery && (
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1] }}>
                    Try adjusting your search or filters
                  </Text>
                )}
              </Box>
            )}

            {/* Table Rows */}
            <Box role="list" aria-label="Proctoring events table">
              {!loading && processedEvents.map((item, i) => {
                const itemId = getItemId(item);
                const itemEventType = getItemEventType(item);
                const itemSeverity = getItemSeverity(item);
                const itemTimestamp = getItemTimestamp(item);
                const itemReviewed = getItemReviewed(item);
                const itemDismissed = getItemDismissed(item);
                const Icon = getEventTypeIcon(itemEventType);
                const isHovered = hoveredRow === itemId;
                const isSelected = selectedEventId === itemId;
                const sevColor = getSeverityColor(itemSeverity, t);

                return (
                  <Box
                    key={itemId || i}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${item.candidateName ?? 'Unknown'}: ${getEventTypeLabel(itemEventType)}, ${getSeverityLabel(itemSeverity)} severity`}
                    onClick={() => handleEventClick(itemId)}
                    onMouseEnter={() => setHoveredRow(itemId)}
                    onMouseLeave={() => setHoveredRow(null)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventClick(itemId); } }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 120px',
                      gap: t.spacing[3],
                      padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      borderLeft: `3px solid ${sevColor}`,
                      cursor: 'pointer',
                      alignItems: 'center',
                      minWidth: 700,
                      backgroundColor: isSelected
                        ? t.colors.primaryScale[50]
                        : isHovered
                          ? t.colors.neutral[50]
                          : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    {/* Candidate */}
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

                    {/* Type */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Icon size={12} color={t.colors.neutral[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                        {getEventTypeLabel(itemEventType)}
                      </Text>
                    </Box>

                    {/* Severity */}
                    <Box>
                      <Box style={{
                        ...createBadgeStyle(t, getSeverityBadgeKey(itemSeverity)),
                        borderRadius: badgeRadius,
                      }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>
                          {getSeverityLabel(itemSeverity)}
                        </Text>
                      </Box>
                    </Box>

                    {/* Time */}
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {itemTimestamp ? formatDistanceToNow(itemTimestamp, { addSuffix: true }) : 'Unknown'}
                    </Text>

                    {/* Status */}
                    <Box>
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
                    </Box>

                    {/* Actions */}
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: t.spacing[1] }}>
                      {!itemReviewed && (
                        <Box style={{ display: 'flex', gap: t.spacing[1], opacity: isHovered ? 1 : 0, transition: `opacity ${t.motion.hover}` }}>
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
                      <ChevronRight size={14} color={t.colors.neutral[300]} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
