'use client';

/**
 * BhDecisionSupport - Compact Preset
 * Dashboard widget showing AI-driven decision support for hiring managers.
 * Includes top candidate highlight with score gauge, comparison bars,
 * recommended action with confidence badge, and view analysis link.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhDecisionSupportProps } from '../../core';
import { n, getConfidenceColor, getProbabilityColor } from '../../core';
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
  createProgressBarStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Brain,
  ArrowRight,
  ChevronRight,
  Target,
  Users,
  Shield,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhDecisionSupport = createPreset<BhDecisionSupportProps>({
  name: 'BhDecisionSupport.Compact',
  render: (ctx: PresetContext<BhDecisionSupportProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewCandidate,
      onViewJob,
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

    /* -- Score gauge SVG arc ------------------------------------------ */
    const renderScoreGauge = useMemo(() => {
      if (!data?.topCandidate) return null;
      const score = n(data.topCandidate.score);
      const radius = 30;
      const circumference = 2 * Math.PI * radius;
      const pct = Math.min(100, Math.max(0, score));
      const dashOffset = circumference - (pct / 100) * circumference;
      const gaugeColor = score >= 80
        ? t.colors.successScale[500]
        : score >= 60
          ? t.colors.warningScale[500]
          : t.colors.errorScale[500];

      return (
        <svg width={76} height={76} viewBox="0 0 76 76" aria-hidden="true">
          <circle
            cx={38} cy={38} r={radius}
            fill="none"
            stroke={t.colors.neutral[100]}
            strokeWidth={6}
          />
          <circle
            cx={38} cy={38} r={radius}
            fill="none"
            stroke={gaugeColor}
            strokeWidth={6}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 38 38)"
            style={{ transition: `stroke-dashoffset 0.6s ease` }}
          />
          <text
            x={38} y={42}
            textAnchor="middle"
            fontSize={t.typography.fontSize.lg}
            fontWeight={t.typography.fontWeight.bold}
            fill={t.colors.neutral[900]}
          >
            {Math.round(score)}
          </text>
        </svg>
      );
    }, [data?.topCandidate, t]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading decision support">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 76, width: 76, borderRadius: t.borderRadius.full }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '100%' }} />
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Decision Support"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, cardHover.base); }}
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

        {/* Title row */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 32 })}>
              <Brain size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Decision Support
            </Text>
          </Box>
          {data && (
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {n(data.candidatesInFinal)} in final
              </Text>
            </Box>
          )}
        </Box>

        {/* Job title */}
        {data && (
          <Box
            style={{
              marginBottom: t.spacing[3],
              cursor: onViewJob ? 'pointer' : 'default',
            }}
            {...(onViewJob ? clickableProps(() => onViewJob(data.jobId), `View job: ${data.jobTitle}`) : {})}
            onClick={onViewJob ? () => onViewJob(data.jobId) : undefined}
          >
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: t.typography.fontWeight.medium,
              color: onViewJob ? t.colors.primaryScale[600] : t.colors.neutral[700],
            }}>
              {data.jobTitle}
            </Text>
          </Box>
        )}

        {/* Top candidate highlight */}
        {data?.topCandidate && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[3],
            marginBottom: t.spacing[4],
            padding: `${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.neutral[50],
            border: `1px solid ${t.colors.neutral[100]}`,
          }}>
            {renderScoreGauge}
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {data.topCandidate.name}
              </Text>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                Top Candidate
              </Text>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[1] }}>
                <Target size={ICON_SIZES.inline} color={getProbabilityColor(n(data.topCandidate.probability), t)} aria-hidden="true" />
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.semibold,
                  color: getProbabilityColor(n(data.topCandidate.probability), t),
                }}>
                  {Math.round(n(data.topCandidate.probability))}% hire probability
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        {/* Mini comparison bars for top 3 candidates */}
        {data && data.comparisons.length > 0 && (
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Candidate Comparison</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {data.comparisons.slice(0, 3).map((candidate, idx) => {
                const barEntrance = createEntranceAnimation(t, { index: idx });
                const score = n(candidate.overallScore);
                const barColor = score >= 80
                  ? t.colors.successScale[500]
                  : score >= 60
                    ? t.colors.warningScale[500]
                    : t.colors.errorScale[500];
                const progressStyles = createProgressBarStyle(t, { color: barColor, percent: score });
                return (
                  <Box
                    key={candidate.candidateId}
                    {...(onViewCandidate ? clickableProps(() => onViewCandidate(candidate.candidateId), `View candidate: ${candidate.name}`) : {})}
                    onClick={onViewCandidate ? () => onViewCandidate(candidate.candidateId) : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: t.spacing[2],
                      cursor: onViewCandidate ? 'pointer' : 'default',
                      ...barEntrance.animate,
                      transition: `all ${t.motion.hover}`,
                    }}
                  >
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[700],
                      width: 80,
                      flexShrink: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap' as const,
                    }}>
                      {candidate.name}
                    </Text>
                    <Box style={{ ...progressStyles.track, flex: 1, height: 8 }}>
                      <Box style={{ ...progressStyles.fill, height: 8 }} />
                    </Box>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: t.colors.neutral[800],
                      width: 28,
                      textAlign: 'right' as const,
                      flexShrink: 0,
                    }}>
                      {Math.round(score)}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Recommended action with confidence badge */}
        {data && (
          <Box style={{
            padding: `${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.primaryScale[50],
            border: `1px solid ${t.colors.primaryScale[100]}`,
            marginBottom: t.spacing[3],
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
              <Shield size={ICON_SIZES.label} color={getConfidenceColor(data.confidenceLevel, t)} aria-hidden="true" />
              <Box style={{
                ...createBadgeStyle(t, data.confidenceLevel === 'high' ? 'success' : data.confidenceLevel === 'medium' ? 'warning' : 'error'),
                borderRadius: badgeRadius,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>
                  {data.confidenceLevel} confidence
                </Text>
              </Box>
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[800],
              lineHeight: 1.4,
            }}>
              {data.recommendedAction}
            </Text>
          </Box>
        )}

        {/* Empty state */}
        {!data && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Brain size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No decision data available
            </Text>
          </Box>
        )}

        {/* View Analysis link */}
        {data && onViewJob && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View full analysis"
            onClick={() => onViewJob(data.jobId)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewJob(data.jobId); }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: t.spacing[1],
              marginTop: t.spacing[1],
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.primaryScale[600],
            }}>
              View Analysis
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
