'use client';

/**
 * BhProctoringSummary - Inline Preset
 * Compact single-row layout for candidate summary.
 * Suitable for table rows or list items.
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  User, ChevronRight, Shield,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createProgressBarStyle,
} from '../../../helpers';
import type {
  BhProctoringSummaryProps,
  ProctoringEventSeverity,
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

function getRiskColor(score: number, t: DesignTokens): string {
  if (score >= 75) return t.colors.errorScale[600];
  if (score >= 50) return t.colors.warningScale[600];
  if (score >= 25) return t.colors.warningScale[400];
  return t.colors.successScale[600];
}

function getRiskBadgeKey(score: number): 'error' | 'warning' | 'success' {
  if (score >= 75) return 'error';
  if (score >= 50) return 'warning';
  return 'success';
}

/* ------------------------------------------------------------------ */
/*  Mock defaults                                                      */
/* ------------------------------------------------------------------ */

const MOCK_PROPS = {
  candidateName: 'Sarah Johnson',
  riskScore: 72,
  eventCounts: { low: 8, medium: 5, high: 3, critical: 1 },
  totalEvents: 17,
  reviewedCount: 12,
};

/* ================================================================== */
/*  Inline Preset                                                      */
/* ================================================================== */

export const InlineBhProctoringSummary = createPreset<BhProctoringSummaryProps>({
  name: 'BhProctoringSummary.Inline',
  render: (ctx: PresetContext<BhProctoringSummaryProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      candidateName: rawCandidateName = MOCK_PROPS.candidateName,
      candidateAvatar,
      riskScore: rawRiskScore = MOCK_PROPS.riskScore,
      eventCounts: rawEventCounts = MOCK_PROPS.eventCounts,
      totalEvents: rawTotalEvents = MOCK_PROPS.totalEvents,
      reviewedCount: rawReviewedCount = MOCK_PROPS.reviewedCount,
      onViewDetails,
      className,
      style,
    } = props;

    const candidateName = Array.isArray(rawCandidateName) ? rawCandidateName : MOCK_PROPS.candidateName;
    const riskScore = Array.isArray(rawRiskScore) ? rawRiskScore : MOCK_PROPS.riskScore;
    const eventCounts = Array.isArray(rawEventCounts) ? rawEventCounts : MOCK_PROPS.eventCounts;
    const totalEvents = Array.isArray(rawTotalEvents) ? rawTotalEvents : MOCK_PROPS.totalEvents;
    const reviewedCount = Array.isArray(rawReviewedCount) ? rawReviewedCount : MOCK_PROPS.reviewedCount;

    const [isHovered, setIsHovered] = useState(false);

    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const riskColor = useMemo(() => getRiskColor(riskScore, t), [riskScore, t]);
    const reviewPct = useMemo(() => totalEvents > 0 ? Math.round((reviewedCount / totalEvents) * 100) : 0, [reviewedCount, totalEvents]);
    const progressBar = useMemo(() => createProgressBarStyle(t, { percent: reviewPct, color: t.colors.successScale[500] }), [t, reviewPct]);

    const handleClick = useCallback(() => {
      onViewDetails?.();
    }, [onViewDetails]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const severities: ProctoringEventSeverity[] = ['critical', 'high', 'medium', 'low'];

    return (
      <Box
        className={className}
        role="button"
        tabIndex={0}
        aria-label={`${candidateName}: Risk ${riskScore}%, ${totalEvents} events, ${reviewedCount} reviewed`}
        onClick={handleClick}
        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[4],
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          backgroundColor: isHovered ? t.colors.neutral[50] : t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          cursor: 'pointer',
          fontFamily: 'inherit',
          ...hoverStyles.base,
          ...animStyle,
          ...(isGlass && t.glass ? {
            backdropFilter: t.glass.blur,
            WebkitBackdropFilter: t.glass.blur,
          } : {}),
          ...style,
        }}
      >
        {/* Avatar */}
        <Box style={{
          ...createIconContainerStyle(t, { size: 36, color: t.colors.neutral[100] }),
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          {candidateAvatar ? (
            <img
              src={candidateAvatar}
              alt={candidateName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <User size={18} color={t.colors.neutral[400]} />
          )}
        </Box>

        {/* Name */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 100 }}>
          <Text style={{
            fontSize: t.typography.fontSize.sm,
            fontWeight: t.typography.fontWeight.semibold,
            color: t.colors.neutral[900],
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}>
            {candidateName}
          </Text>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
            {totalEvents} events
          </Text>
        </Box>

        {/* Risk score pill */}
        <Box style={{
          ...createBadgeStyle(t, getRiskBadgeKey(riskScore)),
          borderRadius: badgeRadius,
          minWidth: 44,
          textAlign: 'center' as const,
          flexShrink: 0,
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold }}>
            {riskScore}%
          </Text>
        </Box>

        {/* Severity mini-dots */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flexShrink: 0 }}>
          {severities.map((sev) => {
            const count = eventCounts[sev] ?? 0;
            if (count === 0) return null;
            return (
              <Box
                key={sev}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
                aria-label={`${sev}: ${count}`}
              >
                <Box style={{
                  width: 8, height: 8,
                  borderRadius: t.borderRadius.full,
                  backgroundColor: getSeverityColor(sev, t),
                  flexShrink: 0,
                }} />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.medium,
                  color: t.colors.neutral[600],
                }}>
                  {count}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Review progress */}
        <Box style={{ width: 80, flexShrink: 0 }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Reviewed</Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[600] }}>
              {reviewPct}%
            </Text>
          </Box>
          <Box style={{ ...progressBar.track, height: 4 }}>
            <Box style={progressBar.fill} />
          </Box>
        </Box>

        {/* Arrow */}
        <ChevronRight size={14} color={t.colors.neutral[300]} style={{ flexShrink: 0 }} />
      </Box>
    );
  },
});
