'use client';

/**
 * BhCalibrationDrift - Monitoring Preset
 * Full dashboard monitoring panel for interviewer calibration drift.
 *
 * Sections:
 * 1. Health summary bar with overall status, interviewer counts, trend
 * 2. Interviewer grid with cards showing drift direction, mini charts, status
 * 3. Detail panel with full control chart when interviewer is selected
 * 4. Alerts section with severity badges and acknowledge actions
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * full ARIA accessibility. All colors via design tokens.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhCalibrationDriftProps, InterviewerDrift, DriftAlert } from '../../core';
import {
  getDriftStatusColor,
  getDriftDirectionLabel,
  toControlChartData,
} from '../../core';
import { BhControlChart } from '../../../bh-control-chart';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createStatValueStyle,
  createStatLabelStyle,
  createInteractiveCardStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatDate,
  formatDistanceToNow,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Bell,
  Check,
  CheckCircle,
  ChevronRight,
  Info,
  Minus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  XCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Alert type icons                                                    */
/* ------------------------------------------------------------------ */

const ALERT_TYPE_ICONS: Record<DriftAlert['type'], typeof Activity> = {
  mean_shift: TrendingUp,
  trend: ArrowRight,
  run: Activity,
  outlier: AlertTriangle,
  range_expansion: ArrowUp,
};

const SEVERITY_COLORS = (severity: DriftAlert['severity'], t: any) => {
  switch (severity) {
    case 'info':
      return { bg: t.colors.infoScale[100], text: t.colors.infoScale[700], border: t.colors.infoScale[200] };
    case 'warning':
      return { bg: t.colors.warningScale[100], text: t.colors.warningScale[700], border: t.colors.warningScale[200] };
    case 'critical':
      return { bg: t.colors.errorScale[100], text: t.colors.errorScale[700], border: t.colors.errorScale[200] };
  }
};

/* ------------------------------------------------------------------ */
/*  Mini inline SVG chart                                              */
/* ------------------------------------------------------------------ */

function MiniChart(props: {
  dataPoints: { score: number; isOutlier: boolean }[];
  controlLimits: { ucl: number; lcl: number; centerLine: number };
  primaryColor: string;
  errorColor: string;
  neutralColor: string;
  centerColor: string;
}) {
  const { dataPoints, controlLimits, primaryColor, errorColor, neutralColor, centerColor } = props;
  const W = 60;
  const H = 30;
  const PAD = 2;

  if (dataPoints.length < 2) return null;

  const { ucl, lcl, centerLine } = controlLimits;
  const yMin = Math.min(lcl, ...dataPoints.map(d => d.score)) - 1;
  const yMax = Math.max(ucl, ...dataPoints.map(d => d.score)) + 1;
  const yRange = yMax - yMin;

  const xStep = (W - PAD * 2) / (dataPoints.length - 1);
  const yScale = (v: number) => PAD + (H - PAD * 2) - ((v - yMin) / yRange) * (H - PAD * 2);

  const path = dataPoints
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${PAD + i * xStep} ${yScale(d.score)}`)
    .join(' ');

  const centerY = yScale(centerLine);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ flexShrink: 0 }}>
      {/* Center line */}
      <line x1={PAD} y1={centerY} x2={W - PAD} y2={centerY} stroke={centerColor} strokeWidth={0.5} strokeDasharray="2,2" />
      {/* Data line */}
      <path d={path} fill="none" stroke={primaryColor} strokeWidth={1.5} strokeLinecap="round" />
      {/* Outlier dots */}
      {dataPoints.map((d, i) => {
        if (!d.isOutlier) return null;
        return (
          <circle
            key={i}
            cx={PAD + i * xStep}
            cy={yScale(d.score)}
            r={2}
            fill={errorColor}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const MonitoringBhCalibrationDrift = createPreset<BhCalibrationDriftProps>({
  name: 'BhCalibrationDrift.Monitoring',
  render: (ctx: PresetContext<BhCalibrationDriftProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      driftData,
      summary,
      alerts = [],
      loading,
      onSelectInterviewer,
      onAcknowledgeAlert,
      selectedInterviewerId,
      className,
      style,
    } = props;

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    const interviewers = driftData?.interviewers ?? [];
    const overallHealth = driftData?.overallHealth ?? 'healthy';
    const selectedInterviewer = interviewers.find(i => i.interviewerId === selectedInterviewerId);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading calibration drift data">
          <Box style={{ ...skeletonStyle, height: 24, width: '50%' }} />
          <Box style={{ display: 'flex', gap: t.spacing[3] }}>
            <Box style={{ ...skeletonStyle, height: 64, width: '25%' }} />
            <Box style={{ ...skeletonStyle, height: 64, width: '25%' }} />
            <Box style={{ ...skeletonStyle, height: 64, width: '25%' }} />
            <Box style={{ ...skeletonStyle, height: 64, width: '25%' }} />
          </Box>
          <Box style={{ ...skeletonStyle, height: 120, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 120, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 80, width: '100%' }} />
        </Box>
      );
    }

    /* -- Health icon mapping ------------------------------------------ */
    const healthConfig = {
      healthy: {
        icon: ShieldCheck,
        color: t.colors.successScale[600],
        bg: t.colors.successScale[100],
        border: t.colors.successScale[200],
        label: 'Healthy',
      },
      warning: {
        icon: ShieldAlert,
        color: t.colors.warningScale[600],
        bg: t.colors.warningScale[100],
        border: t.colors.warningScale[200],
        label: 'Warning',
      },
      critical: {
        icon: XCircle,
        color: t.colors.errorScale[600],
        bg: t.colors.errorScale[100],
        border: t.colors.errorScale[200],
        label: 'Critical',
      },
    };
    const health = healthConfig[overallHealth];
    const HealthIcon = health.icon;

    /* -- Trend icon --------------------------------------------------- */
    const trendDir = summary?.trendDirection ?? 'stable';
    const TrendIcon = trendDir === 'improving' ? TrendingUp : trendDir === 'degrading' ? TrendingDown : Minus;
    const trendColor = trendDir === 'improving'
      ? t.colors.successScale[600]
      : trendDir === 'degrading'
        ? t.colors.errorScale[600]
        : t.colors.neutral[500];

    /* -- Direction icon helper ---------------------------------------- */
    const getDirectionIcon = (dir: InterviewerDrift['driftDirection']) => {
      switch (dir) {
        case 'hawkish': return ArrowUp;
        case 'dovish': return ArrowDown;
        case 'stable': return Minus;
      }
    };
    const getDirectionColor = (dir: InterviewerDrift['driftDirection']) => {
      switch (dir) {
        case 'hawkish': return t.colors.warningScale[600];
        case 'dovish': return t.colors.infoScale[600];
        case 'stable': return t.colors.successScale[600];
      }
    };

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Calibration Drift Monitor"
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}

        <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>

          {/* ============================================================ */}
          {/* SECTION 1: Health Summary Bar                                 */}
          {/* ============================================================ */}
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: t.spacing[5], flexWrap: 'wrap' as const, gap: t.spacing[3],
          }}>
            {/* Title + health badge */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 36 })}>
                <Activity size={ICON_SIZES.feature} color={t.colors.primaryScale[500]} aria-hidden="true" />
              </Box>
              <Box>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: personalityTypo.headingWeight,
                  letterSpacing: personalityTypo.headingLetterSpacing,
                  color: t.colors.neutral[900],
                  display: 'block',
                }}>
                  Calibration Drift
                </Text>
                {driftData?.lastCalculated && (
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[400],
                  }}>
                    Updated {formatDistanceToNow(
                      typeof driftData.lastCalculated === 'string'
                        ? new Date(driftData.lastCalculated)
                        : driftData.lastCalculated,
                      { addSuffix: true }
                    )}
                  </Text>
                )}
              </Box>

              {/* Overall health badge */}
              <Box style={{
                display: 'inline-flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: badgeRadius,
                backgroundColor: health.bg,
                color: health.color,
                border: `1px solid ${health.border}`,
              }}>
                <HealthIcon size={ICON_SIZES.label} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium }}>
                  {health.label}
                </Text>
              </Box>
            </Box>

            {/* Interviewer counts + trend */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              {/* In control */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2 }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.successScale[600],
                }}>
                  {summary?.inControl ?? 0}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  In Control
                </Text>
              </Box>

              {/* Warning */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2 }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.warningScale[600],
                }}>
                  {summary?.warning ?? 0}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Warning
                </Text>
              </Box>

              {/* Out of control */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2 }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: t.colors.errorScale[600],
                }}>
                  {summary?.outOfControl ?? 0}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Out of Control
                </Text>
              </Box>

              {/* Trend arrow */}
              <Box style={{
                display: 'flex', alignItems: 'center', gap: t.spacing[1],
                padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                borderRadius: badgeRadius,
                backgroundColor: t.colors.neutral[50],
                border: `1px solid ${t.colors.neutral[100]}`,
              }}>
                <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor, fontWeight: t.typography.fontWeight.medium }}>
                  {trendDir === 'improving' ? 'Improving' : trendDir === 'degrading' ? 'Degrading' : 'Stable'}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* ============================================================ */}
          {/* SECTION 2: Interviewer Grid                                   */}
          {/* ============================================================ */}
          {interviewers.length > 0 && (
            <Box style={{ marginBottom: t.spacing[5] }}>
              <Text style={{ ...sectionHeader, marginBottom: t.spacing[3] }}>Interviewers</Text>
              <Box style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: t.spacing[3],
              }}>
                {interviewers.map((interviewer, idx) => {
                  const statusColors = getDriftStatusColor(interviewer.status, t);
                  const DirectionIcon = getDirectionIcon(interviewer.driftDirection);
                  const directionColor = getDirectionColor(interviewer.driftDirection);
                  const isSelected = selectedInterviewerId === interviewer.interviewerId;
                  const itemAnim = createEntranceAnimation(t, { index: idx });

                  return (
                    <div
                      key={interviewer.interviewerId}
                      role="button"
                      tabIndex={0}
                      aria-label={`${interviewer.interviewerName} - ${getDriftDirectionLabel(interviewer.driftDirection)} - ${interviewer.status.replace(/_/g, ' ')}`}
                      aria-pressed={isSelected}
                      onClick={() => onSelectInterviewer?.(interviewer.interviewerId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectInterviewer?.(interviewer.interviewerId);
                        }
                      }}
                      onMouseEnter={(e: any) => { if (!isSelected) Object.assign(e.currentTarget.style, cardHover.hover); }}
                      onMouseLeave={(e: any) => { if (!isSelected) Object.assign(e.currentTarget.style, { ...cardHover.base, boxShadow: t.shadows.sm }); }}
                      style={{
                        ...createInteractiveCardStyle(t, { active: isSelected }),
                        display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2],
                        padding: `${t.spacing[3]}px`,
                        ...itemAnim.animate,
                        transition: `${itemAnim.transition}, ${entranceAnim.transition}`,
                      }}
                    >
                      {/* Row 1: Avatar + Name + Status badge */}
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        {/* Avatar */}
                        {interviewer.avatarUrl ? (
                          <img
                            src={interviewer.avatarUrl}
                            alt=""
                            style={{
                              width: 32, height: 32,
                              borderRadius: t.borderRadius.full,
                              objectFit: 'cover' as const,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <Box style={{
                            ...createIconContainerStyle(t, { size: 32 }),
                            backgroundColor: t.colors.neutral[100],
                          }}>
                            <User size={ICON_SIZES.section} color={t.colors.neutral[400]} aria-hidden="true" />
                          </Box>
                        )}

                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Text style={{
                            fontSize: t.typography.fontSize.sm,
                            fontWeight: t.typography.fontWeight.medium,
                            color: t.colors.neutral[800],
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                          }}>
                            {interviewer.interviewerName}
                          </Text>
                        </Box>

                        {/* Status badge */}
                        <Box style={{
                          display: 'inline-flex', alignItems: 'center', gap: 3,
                          padding: `2px ${t.spacing[2]}px`,
                          borderRadius: badgeRadius,
                          backgroundColor: statusColors.bg,
                          color: statusColors.text,
                          border: `1px solid ${statusColors.border}`,
                          flexShrink: 0,
                        }}>
                          <Box style={{
                            width: 6, height: 6,
                            borderRadius: t.borderRadius.full,
                            backgroundColor: statusColors.dot,
                          }} />
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {interviewer.status === 'in_control' ? 'OK' : interviewer.status === 'warning' ? 'Warn' : 'OOC'}
                          </Text>
                        </Box>
                      </Box>

                      {/* Row 2: Direction + Mean comparison + Mini chart */}
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                          <DirectionIcon size={ICON_SIZES.label} color={directionColor} aria-hidden="true" />
                          <Text style={{ fontSize: t.typography.fontSize.xs, color: directionColor, fontWeight: t.typography.fontWeight.medium }}>
                            {getDriftDirectionLabel(interviewer.driftDirection)}
                          </Text>
                        </Box>

                        {/* Mini control chart */}
                        <MiniChart
                          dataPoints={interviewer.dataPoints.slice(-15).map(dp => ({ score: dp.score, isOutlier: dp.isOutlier }))}
                          controlLimits={{
                            ucl: interviewer.controlLimits.ucl,
                            lcl: interviewer.controlLimits.lcl,
                            centerLine: interviewer.controlLimits.centerLine,
                          }}
                          primaryColor={t.colors.primaryScale[500]}
                          errorColor={t.colors.errorScale[600]}
                          neutralColor={t.colors.neutral[200]}
                          centerColor={t.colors.neutral[300]}
                        />
                      </Box>

                      {/* Row 3: Current vs Historical mean */}
                      <Box style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: t.colors.neutral[50],
                      }}>
                        <Box style={{ display: 'flex', flexDirection: 'column' as const }}>
                          <Text style={{ fontSize: 10, color: t.colors.neutral[400] }}>Current</Text>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                            {interviewer.currentMean.toFixed(1)}
                          </Text>
                        </Box>
                        <ArrowRight size={ICON_SIZES.label} color={t.colors.neutral[300]} aria-hidden="true" />
                        <Box style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 10, color: t.colors.neutral[400] }}>Historical</Text>
                          <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[800] }}>
                            {interviewer.historicalMean.toFixed(1)}
                          </Text>
                        </Box>
                      </Box>

                      {/* Row 4: Alerts count + Last interview */}
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {interviewer.alertCount > 0 && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Bell size={ICON_SIZES.inline} color={t.colors.warningScale[500]} aria-hidden="true" />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.warningScale[600] }}>
                              {interviewer.alertCount} alert{interviewer.alertCount !== 1 ? 's' : ''}
                            </Text>
                          </Box>
                        )}
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: 'auto' }}>
                          {formatDate(interviewer.lastInterviewAt, { month: 'short', day: 'numeric' })}
                        </Text>
                      </Box>
                    </div>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Empty state for no interviewers */}
          {interviewers.length === 0 && !loading && (
            <Box style={{ ...emptyStyle, marginBottom: t.spacing[5] }}>
              <Box style={createIconContainerStyle(t, { size: 48 })}>
                <Users size={ICON_SIZES.illustration} color={t.colors.neutral[300]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                color: t.colors.neutral[400],
                marginTop: t.spacing[2],
              }}>
                No interviewer drift data available
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[300],
                marginTop: t.spacing[1],
              }}>
                Drift analysis requires completed interviews with scores
              </Text>
            </Box>
          )}

          {/* ============================================================ */}
          {/* SECTION 3: Detail Panel (selected interviewer)                */}
          {/* ============================================================ */}
          {selectedInterviewer && (
            <Box style={{
              marginBottom: t.spacing[5],
              padding: `${t.spacing[4]}px`,
              borderRadius: t.borderRadius.lg,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              {/* Detail header */}
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: t.spacing[4],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  {selectedInterviewer.avatarUrl ? (
                    <img
                      src={selectedInterviewer.avatarUrl}
                      alt=""
                      style={{
                        width: 40, height: 40,
                        borderRadius: t.borderRadius.full,
                        objectFit: 'cover' as const,
                      }}
                    />
                  ) : (
                    <Box style={{
                      ...createIconContainerStyle(t, { size: 40 }),
                      backgroundColor: t.colors.neutral[200],
                    }}>
                      <User size={ICON_SIZES.feature} color={t.colors.neutral[500]} aria-hidden="true" />
                    </Box>
                  )}
                  <Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.md,
                      fontWeight: personalityTypo.headingWeight,
                      color: t.colors.neutral[900],
                      display: 'block',
                    }}>
                      {selectedInterviewer.interviewerName}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      Drift: {selectedInterviewer.drift > 0 ? '+' : ''}{selectedInterviewer.drift.toFixed(2)} | SD: {selectedInterviewer.standardDeviation.toFixed(2)}
                    </Text>
                  </Box>
                </Box>

                {/* Status badge */}
                {(() => {
                  const sc = getDriftStatusColor(selectedInterviewer.status, t);
                  return (
                    <Box style={{
                      ...createBadgeStyle(t, selectedInterviewer.status === 'in_control' ? 'success' : selectedInterviewer.status === 'warning' ? 'warning' : 'error'),
                      borderRadius: badgeRadius,
                    }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs }}>
                        {selectedInterviewer.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </Text>
                    </Box>
                  );
                })()}
              </Box>

              {/* Full control chart */}
              <Box style={{ marginBottom: t.spacing[4] }}>
                <BhControlChart
                  data={toControlChartData(selectedInterviewer)}
                  width={Math.min(700, typeof window !== 'undefined' ? window.innerWidth - 120 : 700)}
                  height={280}
                  showZones
                  showLabels
                  animate
                  title={`Scoring Pattern - ${selectedInterviewer.interviewerName}`}
                />
              </Box>

              {/* Data point table */}
              {selectedInterviewer.dataPoints.length > 0 && (
                <Box>
                  <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Recent Scores</Text>
                  <Box style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr auto',
                    gap: `${t.spacing[1]}px`,
                    fontSize: t.typography.fontSize.xs,
                  }}>
                    {/* Header */}
                    <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>Date</Text>
                    <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>Score</Text>
                    <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>Candidate</Text>
                    <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[500], padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>Status</Text>

                    {/* Rows */}
                    {selectedInterviewer.dataPoints.slice(-10).reverse().map((dp, i) => (
                      <Box key={`${dp.interviewId}-${i}`} style={{ display: 'contents' }}>
                        <Text style={{ color: t.colors.neutral[600], padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>
                          {formatDate(dp.date, { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={{
                          fontWeight: t.typography.fontWeight.medium,
                          color: dp.isOutlier ? t.colors.errorScale[600] : t.colors.neutral[800],
                          padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                        }}>
                          {dp.score.toFixed(1)}
                        </Text>
                        <Text style={{ color: t.colors.neutral[600], padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>
                          {dp.candidateName ?? '--'}
                        </Text>
                        <Box style={{ padding: `${t.spacing[1]}px ${t.spacing[2]}px` }}>
                          {dp.isOutlier ? (
                            <Box style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              padding: `1px ${t.spacing[1]}px`,
                              borderRadius: badgeRadius,
                              backgroundColor: t.colors.errorScale[100],
                              color: t.colors.errorScale[700],
                            }}>
                              <AlertTriangle size={ICON_SIZES.inline} aria-hidden="true" />
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>Outlier</Text>
                            </Box>
                          ) : (
                            <Box style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              padding: `1px ${t.spacing[1]}px`,
                              borderRadius: badgeRadius,
                              backgroundColor: t.colors.successScale[100],
                              color: t.colors.successScale[700],
                            }}>
                              <CheckCircle size={ICON_SIZES.inline} aria-hidden="true" />
                              <Text style={{ fontSize: t.typography.fontSize.xs }}>Normal</Text>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Alerts for this interviewer */}
              {(() => {
                const interviewerAlerts = alerts.filter(a => a.interviewerId === selectedInterviewer.interviewerId);
                if (interviewerAlerts.length === 0) return null;
                return (
                  <Box style={{ marginTop: t.spacing[4] }}>
                    <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Active Alerts</Text>
                    <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                      {interviewerAlerts.map(alert => {
                        const sevColors = SEVERITY_COLORS(alert.severity, t);
                        const AlertTypeIcon = ALERT_TYPE_ICONS[alert.type];
                        return (
                          <Box
                            key={alert.id}
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                              borderRadius: t.borderRadius.md,
                              backgroundColor: t.colors.common.white,
                              border: `1px solid ${t.colors.neutral[100]}`,
                            }}
                          >
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flex: 1, minWidth: 0 }}>
                              <AlertTypeIcon size={ICON_SIZES.section} color={sevColors.text} aria-hidden="true" />
                              <Box style={{ flex: 1, minWidth: 0 }}>
                                <Text style={{
                                  fontSize: t.typography.fontSize.sm,
                                  color: t.colors.neutral[800],
                                  display: 'block',
                                }}>
                                  {alert.message}
                                </Text>
                                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                                  {formatDate(alert.detectedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                </Text>
                              </Box>
                            </Box>
                            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
                              <Box style={{
                                display: 'inline-flex', alignItems: 'center',
                                padding: `1px ${t.spacing[2]}px`,
                                borderRadius: badgeRadius,
                                backgroundColor: sevColors.bg,
                                color: sevColors.text,
                                border: `1px solid ${sevColors.border}`,
                              }}>
                                <Text style={{ fontSize: t.typography.fontSize.xs }}>{alert.severity}</Text>
                              </Box>
                              {!alert.acknowledged && onAcknowledgeAlert && (
                                <Box
                                  {...clickableProps(() => onAcknowledgeAlert(alert.id), 'Acknowledge alert')}
                                  onClick={() => onAcknowledgeAlert(alert.id)}
                                  style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 3,
                                    padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                                    borderRadius: t.borderRadius.md,
                                    backgroundColor: t.colors.primaryScale[50],
                                    color: t.colors.primaryScale[600],
                                    border: `1px solid ${t.colors.primaryScale[200]}`,
                                    cursor: 'pointer',
                                    transition: `all ${t.motion.hover}`,
                                    fontSize: t.typography.fontSize.xs,
                                    fontWeight: t.typography.fontWeight.medium,
                                  }}
                                >
                                  <Check size={ICON_SIZES.inline} aria-hidden="true" />
                                  <Text style={{ fontSize: t.typography.fontSize.xs }}>Ack</Text>
                                </Box>
                              )}
                              {alert.acknowledged && (
                                <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <CheckCircle size={ICON_SIZES.inline} color={t.colors.successScale[500]} aria-hidden="true" />
                                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Done</Text>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          )}

          {/* ============================================================ */}
          {/* SECTION 4: All Alerts                                         */}
          {/* ============================================================ */}
          {alerts.length > 0 && (
            <Box>
              <Box style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: t.spacing[3],
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Bell size={ICON_SIZES.section} color={t.colors.neutral[500]} aria-hidden="true" />
                  <Text style={{ ...sectionHeader, marginBottom: 0 }}>Recent Alerts</Text>
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {alerts.filter(a => !a.acknowledged).length} unacknowledged
                </Text>
              </Box>

              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {alerts.slice(0, 8).map((alert, idx) => {
                  const sevColors = SEVERITY_COLORS(alert.severity, t);
                  const AlertTypeIcon = ALERT_TYPE_ICONS[alert.type];
                  const alertAnim = createEntranceAnimation(t, { index: idx });

                  return (
                    <Box
                      key={alert.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: alert.acknowledged ? t.colors.neutral[50] : t.colors.common.white,
                        border: `1px solid ${alert.acknowledged ? t.colors.neutral[100] : sevColors.border}`,
                        opacity: alert.acknowledged ? 0.7 : 1,
                        ...alertAnim.animate,
                        transition: alertAnim.transition,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flex: 1, minWidth: 0 }}>
                        <Box style={{
                          ...createIconContainerStyle(t, { size: 28, color: sevColors.bg }),
                        }}>
                          <AlertTypeIcon size={ICON_SIZES.label} color={sevColors.text} aria-hidden="true" />
                        </Box>
                        <Box style={{ flex: 1, minWidth: 0 }}>
                          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                            <Text style={{
                              fontSize: t.typography.fontSize.sm,
                              fontWeight: t.typography.fontWeight.medium,
                              color: t.colors.neutral[800],
                            }}>
                              {alert.interviewerName}
                            </Text>
                            <Box style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: `1px ${t.spacing[1]}px`,
                              borderRadius: badgeRadius,
                              backgroundColor: sevColors.bg,
                              color: sevColors.text,
                              border: `1px solid ${sevColors.border}`,
                            }}>
                              <Text style={{ fontSize: 10 }}>{alert.severity}</Text>
                            </Box>
                          </Box>
                          <Text style={{
                            fontSize: t.typography.fontSize.xs,
                            color: t.colors.neutral[500],
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap' as const,
                          }}>
                            {alert.message}
                          </Text>
                          <Text style={{ fontSize: 10, color: t.colors.neutral[400] }}>
                            {formatDate(alert.detectedAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                          </Text>
                        </Box>
                      </Box>

                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0, marginLeft: t.spacing[2] }}>
                        {!alert.acknowledged && onAcknowledgeAlert && (
                          <Box
                            {...clickableProps(() => onAcknowledgeAlert(alert.id), `Acknowledge alert for ${alert.interviewerName}`)}
                            onClick={() => onAcknowledgeAlert(alert.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 3,
                              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                              borderRadius: t.borderRadius.md,
                              backgroundColor: t.colors.primaryScale[50],
                              color: t.colors.primaryScale[600],
                              border: `1px solid ${t.colors.primaryScale[200]}`,
                              cursor: 'pointer',
                              transition: `all ${t.motion.hover}`,
                              fontSize: t.typography.fontSize.xs,
                              fontWeight: t.typography.fontWeight.medium,
                            }}
                          >
                            <Check size={ICON_SIZES.inline} aria-hidden="true" />
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>Acknowledge</Text>
                          </Box>
                        )}
                        {alert.acknowledged && (
                          <Box style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CheckCircle size={ICON_SIZES.inline} color={t.colors.successScale[500]} aria-hidden="true" />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Acknowledged</Text>
                          </Box>
                        )}
                        {onSelectInterviewer && (
                          <Box
                            {...clickableProps(() => onSelectInterviewer(alert.interviewerId), `View ${alert.interviewerName}`)}
                            onClick={() => onSelectInterviewer(alert.interviewerId)}
                            style={{ cursor: 'pointer', flexShrink: 0 }}
                          >
                            <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* Empty state for no alerts */}
          {alerts.length === 0 && interviewers.length > 0 && (
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[2],
              padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.successScale[50],
              border: `1px solid ${t.colors.successScale[200]}`,
            }}>
              <ShieldCheck size={ICON_SIZES.section} color={t.colors.successScale[600]} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.successScale[700] }}>
                No active drift alerts. All interviewers are scoring within expected ranges.
              </Text>
            </Box>
          )}

        </Box>
      </div>
    );
  },
});
