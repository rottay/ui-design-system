'use client';

/**
 * BhProctoringDashboard - Compact Preset
 * Condensed proctoring summary with mini severity donut, stats row,
 * and compact event list. Designed for sidebar or widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Shield, AlertTriangle, Eye, EyeOff, Activity,
  MonitorOff, Clipboard, ScreenShare, Keyboard, Globe,
  ChevronRight, CheckCircle, XCircle,
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
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhProctoringDashboardProps,
  ProctoringEventType,
  ProctoringEventSeverity,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers (reused from dashboard)                                    */
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

const MOCK_STATS = {
  totalEvents: 127,
  unreviewedCount: 34,
  suspiciousCandidates: 8,
  averageRiskScore: 0.42,
};

const MOCK_SEVERITY = [
  { severity: 'critical' as const, count: 5 },
  { severity: 'high' as const, count: 18 },
  { severity: 'medium' as const, count: 42 },
  { severity: 'low' as const, count: 62 },
];

const MOCK_EVENTS = [
  { id: 'pe-1', scorableId: 'int-1', candidateName: 'Sarah Johnson', eventType: 'screen_share' as const, severity: 'critical' as const, timestamp: new Date(Date.now() - 300000), reviewed: false, dismissed: false },
  { id: 'pe-2', scorableId: 'int-2', candidateName: 'Michael Chen', eventType: 'copy_paste' as const, severity: 'high' as const, timestamp: new Date(Date.now() - 900000), reviewed: false, dismissed: false },
  { id: 'pe-3', scorableId: 'int-3', candidateName: 'Emily Rodriguez', eventType: 'tab_switch' as const, severity: 'medium' as const, timestamp: new Date(Date.now() - 1800000), reviewed: true, dismissed: false },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhProctoringDashboard = createPreset<BhProctoringDashboardProps>({
  name: 'BhProctoringDashboard.Compact',
  render: (ctx: PresetContext<BhProctoringDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      stats = MOCK_STATS,
      severityCounts = MOCK_SEVERITY,
      recentEvents = MOCK_EVENTS,
      onEventClick,
      selectedEventId,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const handleClick = useCallback((id: string) => {
      onEventClick?.(id);
    }, [onEventClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const totalSeverity = useMemo(
      () => severityCounts.reduce((s, d) => s + d.count, 0),
      [severityCounts],
    );

    return (
      <Box
        className={className}
        style={{
          ...card,
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
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Shield size={16} color={t.colors.errorScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Proctoring
            </Text>
          </Box>
          {stats.unreviewedCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'warning'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{stats.unreviewedCount}</Text>
            </Box>
          )}
        </Box>

        {/* Mini severity bar */}
        <Box style={{
          display: 'flex',
          height: 4,
          overflow: 'hidden',
        }} role="img" aria-label="Severity distribution">
          {severityCounts.map((sc) => (
            <Box
              key={sc.severity}
              style={{
                flex: totalSeverity > 0 ? sc.count / totalSeverity : 0,
                backgroundColor: getSeverityColor(sc.severity, t),
                transition: `flex ${t.motion.hover}`,
              }}
            />
          ))}
        </Box>

        {/* Stats row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: t.spacing[1],
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {[
            { label: 'Events', value: stats.totalEvents },
            { label: 'Suspicious', value: stats.suspiciousCandidates },
            { label: 'Risk', value: `${(stats.averageRiskScore * 100).toFixed(0)}%` },
          ].map((s) => (
            <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' }} role="status" aria-label={`${s.label}: ${s.value}`}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {s.label}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Recent events (compact) */}
        <Box role="list" aria-label="Recent events">
          {recentEvents.slice(0, 5).map((event) => {
            const isSelected = selectedEventId === event.id;
            return (
              <Box
                key={event.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${event.candidateName}: ${getEventTypeLabel(event.eventType)}`}
                onClick={() => handleClick(event.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(event.id); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  borderLeft: `2px solid ${getSeverityColor(event.severity, t)}`,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {event.candidateName ?? 'Unknown'}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {getEventTypeLabel(event.eventType)} {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </Text>
                </Box>
                {event.reviewed ? (
                  <CheckCircle size={12} color={t.colors.successScale[500]} />
                ) : (
                  <ChevronRight size={12} color={t.colors.neutral[300]} />
                )}
              </Box>
            );
          })}
          {recentEvents.length === 0 && (
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
