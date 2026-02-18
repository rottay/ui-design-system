'use client';

/**
 * BhProctoringDashboard - Dashboard Preset
 * Full proctoring overview with severity donut, event type bars,
 * stats cards, and recent events feed. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Shield, AlertTriangle, Eye, EyeOff, Clock, Activity,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  ChevronRight, CheckCircle, XCircle, Search,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createSurfaceStyle,
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
  getChartConfig,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhProctoringDashboardProps,
  ProctoringEventSummary,
  ProctoringEventType,
  ProctoringEventSeverity,
  SeverityCount,
  EventTypeCount,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getSeverityColor(severity: ProctoringEventSeverity | undefined, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'high': return t.colors.errorScale[400];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.infoScale[500];
    default: return t.colors.neutral[400];
  }
}

function getSeverityBg(severity: ProctoringEventSeverity | undefined, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[50];
    case 'high': return t.colors.errorScale[50];
    case 'medium': return t.colors.warningScale[50];
    case 'low': return t.colors.infoScale[50];
    default: return t.colors.neutral[50];
  }
}

function getSeverityBadgeKey(severity: ProctoringEventSeverity | undefined): 'error' | 'warning' | 'info' {
  switch (severity) {
    case 'critical':
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'info';
    default: return 'info';
  }
}

function getEventTypeIcon(type: ProctoringEventType | undefined) {
  switch (type) {
    case 'tab_switch': return MonitorOff;
    case 'copy_paste': return Clipboard;
    case 'screen_share': return ScreenShare;
    case 'unusual_typing': return Keyboard;
    case 'browser_focus_lost': return Globe;
    default: return Activity;
  }
}

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel } from '@rottay/scoring';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Donut Chart Component                                              */
/* ------------------------------------------------------------------ */

function SeverityDonut({ data, tokens: t, size = 160 }: {
  data: SeverityCount[];
  tokens: DesignTokens;
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  if (total === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 16;
  const strokeWidth = 20;

  let accumulated = 0;
  const segments = data.map((d) => {
    const pct = d.count / total;
    const start = accumulated;
    accumulated += pct;
    return { ...d, start, pct };
  });

  const circumference = 2 * Math.PI * r;

  return (
    <Box style={{ position: 'relative', width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Severity distribution: ${data.map(d => `${getSeverityLabel(d.severity)}: ${d.count}`).join(', ')}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {segments.map((seg, i) => (
          <circle
            key={seg.severity}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={getSeverityColor(seg.severity, t)}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.pct * circumference} ${circumference}`}
            strokeDashoffset={-seg.start * circumference}
            strokeLinecap="round"
            style={{ transition: `stroke-dasharray ${t.motion.hover}, stroke-dashoffset ${t.motion.hover}` }}
          />
        ))}
      </svg>
      <Box style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
          {total}
        </Text>
        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
          Events
        </Text>
      </Box>
    </Box>
  );
}

// Need Box/Text ref outside render for SeverityDonut - handled by destructuring in preset
let Box: any;
let Text: any;

/* ================================================================== */
/*  Dashboard Preset                                                   */
/* ================================================================== */

export const DashboardBhProctoringDashboard = createPreset<BhProctoringDashboardProps>({
  name: 'BhProctoringDashboard.Dashboard',
  render: (ctx: PresetContext<BhProctoringDashboardProps>) => {
    const { primitives, props, tokens: t } = ctx;
    // Assign to module-level vars for SeverityDonut
    Box = primitives.Box;
    Text = primitives.Text;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);
    const chartCfg = getChartConfig(t);

    const {
      stats = { totalEvents: 0, unreviewedCount: 0, suspiciousCandidates: 0, averageRiskScore: 0 },
      severityCounts: rawSeverityCounts = [],
      eventTypeCounts: rawEventTypeCounts = [],
      recentEvents: rawRecentEvents = [],
      dateRange,
      onEventClick,
      onReviewEvent,
      onDismissEvent,
      selectedEventId,
      loading,
      className,
      style,
    } = props;

    const severityCounts = Array.isArray(rawSeverityCounts) ? rawSeverityCounts : [];
    const eventTypeCounts = Array.isArray(rawEventTypeCounts) ? rawEventTypeCounts : [];
    const recentEvents = Array.isArray(rawRecentEvents) ? rawRecentEvents : [];

    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
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

    /* Sort event types by count descending */
    const sortedEventTypes = useMemo(
      () => [...eventTypeCounts].sort((a, b) => b.count - a.count),
      [eventTypeCounts],
    );
    const maxEventCount = useMemo(
      () => Math.max(...sortedEventTypes.map(e => e.count), 1),
      [sortedEventTypes],
    );

    /* Risk score color */
    const riskColor = useMemo(() => {
      const r = stats.averageRiskScore ?? 0;
      if (r >= 0.75) return t.colors.errorScale[600];
      if (r >= 0.5) return t.colors.warningScale[600];
      if (r >= 0.25) return t.colors.warningScale[400];
      return t.colors.successScale[600];
    }, [stats.averageRiskScore, t]);

    /* Stats cards config */
    const statCards = useMemo(() => [
      { label: 'Total Events', value: stats.totalEvents, icon: Activity, color: t.colors.primaryScale },
      { label: 'Unreviewed', value: stats.unreviewedCount, icon: Eye, color: t.colors.warningScale },
      { label: 'Suspicious Candidates', value: stats.suspiciousCandidates, icon: AlertTriangle, color: t.colors.errorScale },
      { label: 'Avg Risk Score', value: `${((stats.averageRiskScore ?? 0) * 100).toFixed(0)}%`, icon: Shield, color: (stats.averageRiskScore ?? 0) >= 0.5 ? t.colors.errorScale : t.colors.successScale },
    ], [stats, t, riskColor]);

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
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.errorScale[50] })}>
                <Shield size={22} color={t.colors.errorScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Proctoring Dashboard
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Session integrity monitoring and fraud detection{dateRange && Array.isArray(dateRange) && dateRange.length === 2 ? ` | ${dateRange[0]} - ${dateRange[1]}` : ''}
                </Text>
              </Box>
            </Box>
            {(stats.unreviewedCount ?? 0) > 0 && (
              <Box style={{
                ...createBadgeStyle(t, 'warning'),
                borderRadius: badgeRadius,
                display: 'inline-flex',
                alignItems: 'center',
                gap: t.spacing[1],
              }}>
                <Eye size={12} />
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{stats.unreviewedCount} pending review</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Stats Cards Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: t.spacing[4],
            marginBottom: t.spacing[7],
          }}>
            {statCards.map((sc, i) => {
              const Icon = sc.icon;
              return (
                <Box
                  key={sc.label}
                  style={{
                    ...card,
                    ...hoverStyles.base,
                    ...animStyle(i),
                    ...(accentBar ? accentLayout.outer : {}),
                  }}
                  role="status"
                  aria-label={`${sc.label}: ${sc.value}`}
                >
                  {accentBar && <Box style={accentBar} />}
                  <Box style={accentBar ? accentLayout.inner : {}}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 36, color: sc.color[50] })}>
                      <Icon size={18} color={sc.color[600]} />
                    </Box>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize['2xl'],
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {sc.value}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    marginTop: t.spacing[1],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {sc.label}
                  </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Charts Row: Severity Donut + Event Types Bar */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 2fr)',
            gap: t.spacing[6],
            marginBottom: t.spacing[7],
          }}>
            {/* Severity Donut */}
            <Box style={{ ...card, ...animStyle(4) }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Severity Distribution</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t.spacing[4] }}>
                <SeverityDonut data={severityCounts} tokens={t} />
                {/* Legend */}
                <Box style={{ display: 'flex', flexWrap: 'wrap', gap: t.spacing[3], justifyContent: 'center' }}>
                  {severityCounts.map((sc) => (
                    <Box
                      key={sc.severity}
                      style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}
                      role="listitem"
                    >
                      <Box style={{
                        width: 10, height: 10, borderRadius: t.borderRadius.full,
                        backgroundColor: getSeverityColor(sc.severity, t), flexShrink: 0,
                      }} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                        {getSeverityLabel(sc.severity)} ({sc.count})
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>

            {/* Event Type Bars */}
            <Box style={{ ...card, ...animStyle(5) }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Event Types</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {sortedEventTypes.map((et) => {
                  const Icon = getEventTypeIcon(et.eventType);
                  const barPct = (et.count / maxEventCount) * 100;
                  return (
                    <Box key={et.eventType}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                          <Icon size={14} color={t.colors.neutral[500]} />
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                            {getEventTypeLabel(et.eventType)}
                          </Text>
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                          {et.count}
                        </Text>
                      </Box>
                      <Box style={{
                        height: 8,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.neutral[100],
                        overflow: 'hidden',
                      }}>
                        <Box style={{
                          height: '100%',
                          width: `${barPct}%`,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.primaryScale[500],
                          transition: `width ${chartCfg.animationDuration}ms ease`,
                        }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>

          {/* Recent Events Feed */}
          <Box style={{ ...card, ...animStyle(6), padding: 0 }}>
            <Box style={{
              padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
              borderBottom: `1px solid ${t.colors.neutral[100]}`,
              backgroundColor: t.colors.neutral[50],
              borderRadius: `${t.borderRadius.lg} ${t.borderRadius.lg} 0 0`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[800],
                  textTransform: ptypo.labelTransform,
                  letterSpacing: ptypo.labelLetterSpacing,
                }}>
                  Recent Events
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {recentEvents.length} events
                </Text>
              </Box>
            </Box>

            <Box role="list" aria-label="Recent proctoring events">
              {recentEvents.length === 0 && (
                <Box style={createEmptyStateStyle(t)}>
                  <Shield size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                  <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                    No proctoring events recorded
                  </Text>
                </Box>
              )}
              {recentEvents.map((event, i) => {
                const Icon = getEventTypeIcon(event.eventType);
                const isHovered = hoveredEvent === event.id;
                const isSelected = selectedEventId === event.id;
                const sevColor = getSeverityColor(event.severity, t);

                return (
                  <Box
                    key={event.id}
                    role="listitem"
                    tabIndex={0}
                    aria-label={`${event.candidateName ?? 'Unknown'}: ${getEventTypeLabel(event.eventType)}, ${getSeverityLabel(event.severity ?? 'low')} severity`}
                    onClick={() => handleEventClick(event.id)}
                    onMouseEnter={() => setHoveredEvent(event.id)}
                    onMouseLeave={() => setHoveredEvent(null)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventClick(event.id); } }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: t.spacing[3],
                      padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                      borderBottom: `1px solid ${t.colors.neutral[100]}`,
                      borderLeft: `3px solid ${sevColor}`,
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? t.colors.primaryScale[50]
                        : isHovered
                          ? t.colors.neutral[50]
                          : t.colors.common.white,
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  >
                    {/* Event icon */}
                    <Box style={createIconContainerStyle(t, {
                      size: 36,
                      color: getSeverityBg(event.severity, t),
                    })}>
                      <Icon size={16} color={sevColor} />
                    </Box>

                    {/* Event info */}
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[1] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {event.candidateName ?? 'Unknown Candidate'}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getSeverityBadgeKey(event.severity ?? 'low')),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getSeverityLabel(event.severity ?? 'low')}
                          </Text>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {getEventTypeLabel(event.eventType)}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {event.timestamp ? formatDistanceToNow(event.timestamp, { addSuffix: true }) : ''}
                        </Text>
                      </Box>
                    </Box>

                    {/* Status + Actions */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                      {event.reviewed && (
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: t.spacing[1] }}>
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
                          {event.reviewedBy && (
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                              by {event.reviewedBy}
                            </Text>
                          )}
                        </Box>
                      )}
                      {!event.reviewed && isHovered && (
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
                      <ChevronRight size={14} color={t.colors.neutral[300]} />
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
