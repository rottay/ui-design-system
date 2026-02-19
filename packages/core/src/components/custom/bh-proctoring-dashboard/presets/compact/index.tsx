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

function getSeverityColor(severity: ProctoringEventSeverity | undefined, t: DesignTokens): string {
  switch (severity) {
    case 'critical': return t.colors.errorScale[600];
    case 'high': return t.colors.errorScale[400];
    case 'medium': return t.colors.warningScale[500];
    case 'low': return t.colors.infoScale[500];
    default: return t.colors.neutral[400];
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

// Label helpers from scoring domain (centralized, no duplication)
import { getEventTypeLabel, getSeverityLabel } from '../../../_shared/proctoring-labels';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

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
      stats = { totalEvents: 0, unreviewedCount: 0, suspiciousCandidates: 0, averageRiskScore: 0 },
      severityCounts: rawSeverityCounts = [],
      recentEvents: rawRecentEvents = [],
      onEventClick,
      selectedEventId,
      className,
      style,
    } = props;

    const severityCounts = Array.isArray(rawSeverityCounts) ? rawSeverityCounts : [];
    const recentEvents = Array.isArray(rawRecentEvents) ? rawRecentEvents : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

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
        {accentBar && <Box style={accentBar} />}
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
          {(stats.unreviewedCount ?? 0) > 0 && (
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
            { label: 'Risk', value: `${((stats.averageRiskScore ?? 0) * 100).toFixed(0)}%` },
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
                    {getEventTypeLabel(event.eventType)} {event.timestamp ? formatDistanceToNow(event.timestamp, { addSuffix: true }) : ''}
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
