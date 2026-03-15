'use client';

/**
 * BhCalibrationDashboard - Dashboard Preset
 * Full calibration dashboard with metrics cards, active sessions list,
 * progress bars, status badges, participant avatars, agreement rate chart,
 * and action buttons. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback} from 'react';
import {
  Scale, Activity, CheckCircle, PauseCircle, PlayCircle,
  Users, BarChart3, TrendingUp, TrendingDown, Plus,
  ChevronRight, Clock, Target, AlertTriangle,
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
  createEmptyStateStyle,
  formatDistanceToNow,

  createDividerStyle,
  formatAbbreviated,
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
    default: return Activity;
  }
}

function getStatusLabel(status: string): string {
return (status || '').charAt(0).toUpperCase() + (status || '').slice(1);
}

function getAgreementColor(rate: number, t: DesignTokens): string {
  if (rate >= 0.8) return t.colors.successScale[500];
  if (rate >= 0.6) return t.colors.warningScale[500];
  return t.colors.errorScale[500];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Dashboard Preset                                                   */
/* ================================================================== */

export const DashboardBhCalibrationDashboard = createPreset<BhCalibrationDashboardProps>({
  name: 'BhCalibrationDashboard.Dashboard',
  render: (ctx: PresetContext<BhCalibrationDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      sessions: rawSessions = [],
      metrics = { activeSessions: 0, totalCompleted: 0, avgAgreementRate: 0, avgDeviation: 0 },
      onSessionClick,
      onCreateSession,
      selectedSessionId,
      loading,
      className,
      style,
    } = props;

    const sessions = Array.isArray(rawSessions) ? rawSessions : [];

    const [hoveredSession, setHoveredSession] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const handleSessionClick = useCallback((id: string) => {
      onSessionClick?.(id);
    }, [onSessionClick]);

    const activeSessions = useMemo(
      () => sessions.filter(s => s.status === 'active' || s.status === 'paused'),
      [sessions],
    );

    const maxAgreement = useMemo(
      () => Math.max(...sessions.map(s => n(s.agreementRate)), 0.01),
      [sessions],
    );

    const metricCards = useMemo(() => [
      { label: 'Active Sessions', value: n(metrics.activeSessions), icon: PlayCircle, color: t.colors.successScale },
      { label: 'Completed', value: n(metrics.totalCompleted), icon: CheckCircle, color: t.colors.primaryScale },
      { label: 'Avg Agreement', value: `${(n(metrics.avgAgreementRate) * 100).toFixed(0)}%`, icon: Target, color: n(metrics.avgAgreementRate) >= 0.7 ? t.colors.successScale : t.colors.warningScale },
      { label: 'Avg Deviation', value: n(metrics.avgDeviation).toFixed(2), icon: BarChart3, color: n(metrics.avgDeviation) <= 0.5 ? t.colors.successScale : t.colors.warningScale },
    ], [metrics, t]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });
    const divider = useMemo(() => createDividerStyle(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
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
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
                <Scale size={22} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  Calibration Dashboard
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Manage scoring calibration sessions and track inter-rater agreement
                </Text>
              </Box>
            </Box>
            {onCreateSession && (
              <button
                onClick={onCreateSession}
                aria-label="Create new calibration session"
                style={{
                  display: 'flex', alignItems: 'center', gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderRadius: t.borderRadius.md,
                  border: 'none',
                  backgroundColor: t.colors.primaryScale[600],
                  color: t.colors.common.white,
                  fontSize: t.typography.fontSize.sm,
                  fontWeight: t.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  boxShadow: t.shadows.sm,
                }}
              >
                <Plus size={16} />
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.common.white }}>New Session</Text>
              </button>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Metrics Cards Row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: t.spacing[4],
            marginBottom: t.spacing[7],
          }}>
            {metricCards.map((mc, i) => {
              const Icon = mc.icon;
              return (
                <Box
                  key={mc.label}
                  style={{
                    ...card,
                    ...hoverStyles.base,
                    ...animStyle(i),
                  }}
                  role="status"
                  aria-label={`${mc.label}: ${mc.value}`}
                >
                  {accentBar && <Box style={accentBar} />}

                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                    <Box style={createIconContainerStyle(t, { size: 36, color: mc.color[50] })}>
                      <Icon size={18} color={mc.color[600]} />
                    </Box>
                  </Box>
                  <Text style={{
                    fontSize: t.typography.fontSize['2xl'],
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {mc.value}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    marginTop: t.spacing[1],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {mc.label}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Main Content: Sessions List + Agreement Chart */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(400px, 2fr) minmax(280px, 1fr)',
            gap: t.spacing[6],
            marginBottom: t.spacing[7],
          }}>
            {/* Active Calibrations List */}
            <Box style={{ ...card, ...animStyle(4), padding: 0 }}>
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
                    Calibration Sessions
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    {sessions.length} sessions
                  </Text>
                </Box>
              </Box>

              <Box role="list" aria-label="Calibration sessions">
                {sessions.length === 0 && (
                  <Box style={createEmptyStateStyle(t)}>
                    <Scale size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
                    <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                      No calibration sessions
                    </Text>
                  </Box>
                )}
                {sessions.map((session) => {
                  const StatusIcon = getStatusIcon(session.status);
                  const isHovered = hoveredSession === session.id;
                  const isSelected = selectedSessionId === session.id;
                  const statusColor = getStatusColor(session.status, t);
                  const agrColor = getAgreementColor(n(session.agreementRate), t);
                  const progressPct = (n(session.progress) * 100).toFixed(0);

                  return (
                    <Box
                      key={session.id}
                      role="listitem"
                      tabIndex={0}
                      aria-label={`${session.rubricName ?? ''}: ${getStatusLabel(session.status)}, ${progressPct}% progress, ${(n(session.agreementRate) * 100).toFixed(0)}% agreement`}
                      onClick={() => handleSessionClick(session.id)}
                      onMouseEnter={() => setHoveredSession(session.id)}
                      onMouseLeave={() => setHoveredSession(null)}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSessionClick(session.id); } }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: t.spacing[2],
                        padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
                        borderBottom: `1px solid ${t.colors.neutral[100]}`,
                        cursor: 'pointer',
                        backgroundColor: isSelected
                          ? t.colors.primaryScale[50]
                          : isHovered
                            ? t.colors.neutral[50]
                            : t.colors.common.white,
                        transition: `background-color ${t.motion.hover}`,
                      }}
                    >
                      {/* Row 1: Name + Status + Arrow */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                        <StatusIcon size={16} color={statusColor} />
                        <Text style={{
                          flex: 1,
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.semibold,
                          color: t.colors.neutral[900],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {session.rubricName}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getStatusBadgeKey(session.status)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getStatusLabel(session.status)}
                          </Text>
                        </Box>
                        <ChevronRight size={14} color={t.colors.neutral[300]} />
                      </Box>

                      {/* Row 2: Progress bar */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{
                          flex: 1,
                          height: 6,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: t.colors.neutral[100],
                          overflow: 'hidden',
                        }}>
                          <Box style={{
                            height: '100%',
                            width: `${progressPct}%`,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: statusColor,
                            transition: 'width 0.6s ease',
                          }} />
                        </Box>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], minWidth: 36, textAlign: 'right' as const }}>
                          {session.completedSamples}/{session.totalSamples}
                        </Text>
                      </Box>

                      {/* Row 3: Participants + Agreement + Time */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                        {/* Participant avatars */}
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          {(session.participants ?? []).slice(0, 3).map((name, idx) => (
                            <Box
                              key={name}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: t.borderRadius.full,
                                backgroundColor: (t.colors.primaryScale as any)[100 + (idx * 100)],
                                border: `2px solid ${t.colors.common.white}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: idx > 0 ? -6 : 0,
                                zIndex: 3 - idx,
                              }}
                              aria-label={name}
                            >
                              <Text style={{ fontSize: 9, fontWeight: t.typography.fontWeight.bold, color: t.colors.primaryScale[700] }}>
                                {(name || '').charAt(0)}
                              </Text>
                            </Box>
                          ))}
                          {(session.participants ?? []).length > 3 && (
                            <Box style={{
                              width: 22, height: 22,
                              borderRadius: t.borderRadius.full,
                              backgroundColor: t.colors.neutral[200],
                              border: `2px solid ${t.colors.common.white}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              marginLeft: -6,
                            }}>
                              <Text style={{ fontSize: 9, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[600] }}>
                                +{(session.participants ?? []).length - 3}
                              </Text>
                            </Box>
                          )}
                        </Box>

                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Box style={{ width: 6, height: 6, borderRadius: t.borderRadius.full, backgroundColor: agrColor }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                            {(n(session.agreementRate) * 100).toFixed(0)}% agree
                          </Text>
                        </Box>

                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <Clock size={11} color={t.colors.neutral[400]} />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                            {formatDistanceToNow((session.startedAt ?? new Date()), { addSuffix: true })}
                          </Text>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* Agreement Rate Chart */}
            <Box style={{ ...card, ...animStyle(5) }}>
              <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Agreement Rates</Text>
              <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[3] }}>
                {sessions.map((session) => {
                  const barPct = (n(session.agreementRate) / Math.max(maxAgreement, 1)) * 100;
                  const agrColor = getAgreementColor(n(session.agreementRate), t);

                  return (
                    <Box key={session.id}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[700],
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          flex: 1,
                          minWidth: 0,
                        }}>
                          {session.rubricName}
                        </Text>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.bold,
                          color: agrColor,
                          marginLeft: t.spacing[2],
                        }}>
                          {(n(session.agreementRate) * 100).toFixed(0)}%
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
                          backgroundColor: agrColor,
                          transition: 'width 0.6s ease',
                        }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {/* Top/Worst performing */}
              {(metrics.topPerformingRubric || metrics.worstPerformingRubric) && (
                <Box style={{ marginTop: t.spacing[5], borderTop: `1px solid ${t.colors.neutral[100]}`, paddingTop: t.spacing[4] }}>
                  {metrics.topPerformingRubric && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                      <TrendingUp size={14} color={t.colors.successScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Best:</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.successScale[700] }}>
                        {metrics.topPerformingRubric}
                      </Text>
                    </Box>
                  )}
                  {metrics.worstPerformingRubric && (
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <TrendingDown size={14} color={t.colors.warningScale[500]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Needs work:</Text>
                      <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.warningScale[700] }}>
                        {metrics.worstPerformingRubric}
                      </Text>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
