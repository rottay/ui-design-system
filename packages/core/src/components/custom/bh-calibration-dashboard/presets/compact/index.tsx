'use client';

/**
 * BhCalibrationDashboard - Compact Preset
 * Summary card with key metrics and top 3 sessions.
 * Designed for sidebar or widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Scale, PlayCircle, CheckCircle, PauseCircle,
  Target, ChevronRight, Clock,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhCalibrationDashboardProps,
  CalibrationSession,
  CalibrationMetrics,
} from '../../core';
import { n } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusColor(status: string, t: DesignTokens): string {
  switch (status) {
    case 'active': return t.colors.successScale[500];
    case 'completed': return t.colors.primaryScale[500];
    case 'paused': return t.colors.warningScale[500];
    default: return t.colors.neutral[400];
  }
}

function getStatusBadgeKey(status: string): 'success' | 'primary' | 'warning' {
  switch (status) {
    case 'active': return 'success';
    case 'completed': return 'primary';
    case 'paused':
    default: return 'warning';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'active': return PlayCircle;
    case 'completed': return CheckCircle;
    case 'paused': return PauseCircle;
    default: return PlayCircle;
  }
}

function getStatusLabel(status: string): string {
  return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhCalibrationDashboard = createPreset<BhCalibrationDashboardProps>({
  name: 'BhCalibrationDashboard.Compact',
  render: (ctx: PresetContext<BhCalibrationDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      sessions: rawSessions = [],
      metrics = { activeSessions: 0, totalCompleted: 0, avgAgreementRate: 0, avgDeviation: 0 },
      onSessionClick,
      selectedSessionId,
      className,
      style,
    } = props;

    const sessions = Array.isArray(rawSessions) ? rawSessions : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((id: string) => {
      onSessionClick?.(id);
    }, [onSessionClick]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const displaySessions = sessions.slice(0, 3);

    return (
      <Box
        className={className}
        style={{
          ...card,
          width: '100%',
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
            <Scale size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Calibration
            </Text>
          </Box>
          {(metrics.activeSessions ?? 0) > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'success'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{metrics.activeSessions} active</Text>
            </Box>
          )}
        </Box>

        {/* Metrics Row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {[
            { label: 'Completed', value: n(metrics.totalCompleted) },
            { label: 'Agreement', value: `${(n(metrics.avgAgreementRate) * 100).toFixed(0)}%` },
            { label: 'Deviation', value: n(metrics.avgDeviation).toFixed(2) },
          ].map((s) => (
            <Box key={s.label} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' }} role="status" aria-label={`${s.label}: ${s.value}`}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
                display: 'block',
              }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {s.label}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Top 3 Sessions */}
        <Box role="list" aria-label="Recent calibration sessions">
          {displaySessions.map((session) => {
            const StatusIcon = getStatusIcon(session.status);
            const isSelected = selectedSessionId === session.id;
            const statusColor = getStatusColor(session.status, t);

            return (
              <Box
                key={session.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${session.rubricName}: ${getStatusLabel(session.status)}`}
                onClick={() => handleClick(session.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(session.id); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? t.colors.primaryScale[50] : t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <StatusIcon size={14} color={statusColor} style={{ flexShrink: 0 }} />
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {session.rubricName}
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    {/* Mini progress bar */}
                    <Box style={{
                      width: 40,
                      height: 3,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.neutral[100],
                      overflow: 'hidden',
                    }}>
                      <Box style={{
                        height: '100%',
                        width: `${n(session.progress) * 100}%`,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: statusColor,
                      }} />
                    </Box>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                      {(n(session.agreementRate) * 100).toFixed(0)}% agree
                    </Text>
                  </Box>
                </Box>
                <ChevronRight size={12} color={t.colors.neutral[300]} />
              </Box>
            );
          })}
          {sessions.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No sessions
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
