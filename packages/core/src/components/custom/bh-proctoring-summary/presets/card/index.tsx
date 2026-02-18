'use client';

/**
 * BhProctoringSummary - Card Preset
 * Detailed per-candidate summary card with risk score gauge,
 * severity breakdown, and review progress.
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  Shield, User, ChevronRight, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
  createProgressBarStyle,
  getAccentAwareLayout,
  formatDistanceToNow,
} from '../../../helpers';
import type {
  BhProctoringSummaryProps,
  ProctoringEventSeverity,
  SeverityEventCounts,
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

// Label helpers from scoring domain (centralized, no duplication)
import { getSeverityLabel } from '@rottay/scoring';

function getRiskColor(score: number, t: DesignTokens): string {
  if (score >= 75) return t.colors.errorScale[600];
  if (score >= 50) return t.colors.warningScale[600];
  if (score >= 25) return t.colors.warningScale[400];
  return t.colors.successScale[600];
}

function getRiskLabel(score: number): string {
  if (score >= 75) return 'Critical Risk';
  if (score >= 50) return 'High Risk';
  if (score >= 25) return 'Moderate Risk';
  return 'Low Risk';
}

function getRiskBadgeKey(score: number): 'error' | 'warning' | 'success' {
  if (score >= 75) return 'error';
  if (score >= 50) return 'warning';
  return 'success';
}

/* ------------------------------------------------------------------ */
/*  Mock defaults                                                      */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Card Preset                                                        */
/* ================================================================== */

export const CardBhProctoringSummary = createPreset<BhProctoringSummaryProps>({
  name: 'BhProctoringSummary.Card',
  render: (ctx: PresetContext<BhProctoringSummaryProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      candidateName = '',
      candidateAvatar,
      riskScore = 0,
      eventCounts = {} as SeverityEventCounts,
      totalEvents = 0,
      reviewedCount = 0,
      onViewDetails,
      dismissedCount,
      lastEventAt,
      lastReviewedBy,
      lastReviewedAt,
      riskTrend,
      riskTrendPercentage,
      className,
      style,
    } = props;

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const riskColor = useMemo(() => getRiskColor(riskScore, t), [riskScore, t]);
    const reviewProgress = useMemo(() => totalEvents > 0 ? (reviewedCount / totalEvents) * 100 : 0, [reviewedCount, totalEvents]);
    const progressBar = useMemo(() => createProgressBarStyle(t, { percent: reviewProgress, color: t.colors.successScale[500] }), [t, reviewProgress]);

    const handleViewDetails = useCallback(() => {
      onViewDetails?.();
    }, [onViewDetails]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    /* SVG gauge parameters */
    const gaugeSize = 100;
    const gaugeCx = gaugeSize / 2;
    const gaugeCy = gaugeSize / 2;
    const gaugeR = 38;
    const gaugeStroke = 8;
    const gaugeCircumference = 2 * Math.PI * gaugeR;
    const gaugeArc = 0.75; // 270 degrees
    const gaugeFill = (riskScore / 100) * gaugeArc;

    const severities: ProctoringEventSeverity[] = ['critical', 'high', 'medium', 'low'];

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          fontFamily: 'inherit',
          ...hoverStyles.base,
          ...animStyle,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        <Box style={{ padding: t.spacing[5] }}>
          {/* Header: Avatar + Name + Risk badge */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3], marginBottom: t.spacing[4] }}>
            <Box style={{
              ...createIconContainerStyle(t, { size: 44, color: t.colors.neutral[100] }),
              overflow: 'hidden',
            }}>
              {candidateAvatar ? (
                <img
                  src={candidateAvatar}
                  alt={candidateName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={22} color={t.colors.neutral[400]} />
              )}
            </Box>
            <Box style={{ flex: 1 }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
                display: 'block',
              }}>
                {candidateName}
              </Text>
              <Box style={{
                ...createBadgeStyle(t, getRiskBadgeKey(riskScore)),
                borderRadius: badgeRadius,
                marginTop: 4,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {getRiskLabel(riskScore)}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Risk Score Gauge */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: t.spacing[4],
          }}>
            <Box style={{ position: 'relative', width: gaugeSize, height: gaugeSize }}>
              <svg
                width={gaugeSize}
                height={gaugeSize}
                viewBox={`0 0 ${gaugeSize} ${gaugeSize}`}
                role="img"
                aria-label={`Risk score: ${riskScore}%`}
                style={{ transform: 'rotate(135deg)' }}
              >
                {/* Background arc */}
                <circle
                  cx={gaugeCx} cy={gaugeCy} r={gaugeR}
                  fill="none"
                  stroke={t.colors.neutral[100]}
                  strokeWidth={gaugeStroke}
                  strokeDasharray={`${gaugeArc * gaugeCircumference} ${gaugeCircumference}`}
                  strokeLinecap="round"
                />
                {/* Fill arc */}
                <circle
                  cx={gaugeCx} cy={gaugeCy} r={gaugeR}
                  fill="none"
                  stroke={riskColor}
                  strokeWidth={gaugeStroke}
                  strokeDasharray={`${gaugeFill * gaugeCircumference} ${gaugeCircumference}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
              </svg>
              <Box style={{ 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize['2xl'],
                  fontWeight: t.typography.fontWeight.bold,
                  color: riskColor,
                }}>
                  {riskScore}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Risk</Text>
              </Box>
            </Box>
          </Box>

          {/* Risk Trend */}
          {riskTrend && riskTrend !== 'stable' && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: t.spacing[1],
              marginBottom: t.spacing[3],
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: riskTrend === 'up' ? t.colors.errorScale[600] : t.colors.successScale[600],
                fontWeight: t.typography.fontWeight.medium,
              }}>
                {riskTrend === 'up' ? '\u2191' : '\u2193'}
                {riskTrendPercentage != null ? ` ${riskTrendPercentage}%` : ''}
                {riskTrend === 'up' ? ' from previous period' : ' from previous period'}
              </Text>
            </Box>
          )}

          {/* Event Breakdown */}
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[2] }}>Event Breakdown</Text>
            <Box style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: t.spacing[2],
            }}>
              {severities.map((sev) => (
                <Box
                  key={sev}
                  style={{
                    textAlign: 'center' as const,
                    padding: `${t.spacing[2]}px ${t.spacing[1]}px`,
                    backgroundColor: t.colors.neutral[50],
                    borderRadius: t.borderRadius.md,
                    borderTop: `2px solid ${getSeverityColor(sev, t)}`,
                  }}
                  role="status"
                  aria-label={`${getSeverityLabel(sev)}: ${eventCounts[sev] ?? 0} events`}
                >
                  <Text style={{
                    fontSize: t.typography.fontSize.lg,
                    fontWeight: t.typography.fontWeight.bold,
                    color: t.colors.neutral[900],
                    display: 'block',
                  }}>
                    {eventCounts[sev] ?? 0}
                  </Text>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    textTransform: ptypo.labelTransform,
                    letterSpacing: ptypo.labelLetterSpacing,
                  }}>
                    {getSeverityLabel(sev)}
                  </Text>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Review Progress */}
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Review Progress
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                {reviewedCount}/{totalEvents}
              </Text>
            </Box>
            <Box style={progressBar.track}>
              <Box style={progressBar.fill} />
            </Box>
          </Box>

          {/* Last Activity + Reviewer Info */}
          {(lastEventAt || lastReviewedBy) && (
            <Box style={{
              marginBottom: t.spacing[3],
              display: 'flex',
              flexDirection: 'column' as const,
              gap: t.spacing[1],
            }}>
              {lastEventAt && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Last event: {formatDistanceToNow(new Date(lastEventAt), { addSuffix: true })}
                </Text>
              )}
              {lastReviewedBy && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Last reviewed by {lastReviewedBy}
                  {lastReviewedAt ? ` ${formatDistanceToNow(new Date(lastReviewedAt), { addSuffix: true })}` : ''}
                </Text>
              )}
              {dismissedCount != null && dismissedCount > 0 && (
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                  {dismissedCount} dismissed
                </Text>
              )}
            </Box>
          )}

          {/* View Details Button */}
          <button
            onClick={handleViewDetails}
            aria-label={`View details for ${candidateName}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: t.spacing[2],
              width: '100%',
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              border: `1px solid ${t.colors.neutral[200]}`,
              backgroundColor: t.colors.common.white,
              color: t.colors.primaryScale[700],
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.primaryScale[700] }}>View Details</Text>
            <ChevronRight size={14} />
          </button>
        </Box>
        </Box>
      </Box>
    );
  },
});
