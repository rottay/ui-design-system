'use client';

/**
 * BhBurnoutDetection - Compact Preset
 * Small dashboard widget showing team burnout risk metrics.
 * Includes health gauge, at-risk count, top at-risk recruiters,
 * throttle actions, and contributing indicator insights.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhBurnoutDetectionProps, BurnoutRecruiter } from '../../core';
import { n, getBurnoutColor } from '../../core';
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
  createTrendStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Heart,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  AlertTriangle,
  ShieldAlert,
  ChevronRight,
  Zap,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function getTrendIcon(trend: 'improving' | 'stable' | 'worsening') {
  switch (trend) {
    case 'improving': return TrendingDown; // burnout going down is good
    case 'worsening': return TrendingUp;   // burnout going up is bad
    case 'stable': return Minus;
  }
}

function getScoreColor(score: number, tokens: any): string {
  if (score < 30) return tokens.colors.successScale[500];
  if (score <= 60) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'error' {
  if (score < 30) return 'success';
  if (score <= 60) return 'warning';
  return 'error';
}

function getScoreLabel(score: number): string {
  if (score < 30) return 'Healthy';
  if (score <= 60) return 'Caution';
  return 'At Risk';
}

function getRiskBadgeVariant(level: BurnoutRecruiter['riskLevel']): 'success' | 'warning' | 'error' | 'info' {
  switch (level) {
    case 'low': return 'success';
    case 'moderate': return 'warning';
    case 'high': return 'error';
    case 'critical': return 'error';
  }
}

/* ------------------------------------------------------------------ */
/*  Preset                                                            */
/* ------------------------------------------------------------------ */

export const CompactBhBurnoutDetection = createPreset<BhBurnoutDetectionProps>({
  name: 'BhBurnoutDetection.Compact',
  render: (ctx: PresetContext<BhBurnoutDetectionProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewRecruiter,
      onApplyThrottle,
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

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading burnout detection">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '40%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!data) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Heart size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No burnout data available
            </Text>
          </Box>
        </Box>
      );
    }

    const avgScore = n(data.avgBurnoutScore);
    const scoreColor = getScoreColor(avgScore, t);
    const topRecruiters = data.highRiskRecruiters.slice(0, 3);
    const topIndicator = data.topIndicators.length > 0 ? data.topIndicators[0] : null;

    const TrendIcon = getTrendIcon(data.trend);
    const trendColor = data.trend === 'improving'
      ? t.colors.successScale[600]
      : data.trend === 'worsening'
        ? t.colors.errorScale[600]
        : t.colors.neutral[400];

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Burnout Detection"
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
            <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.errorScale[50] })}>
              <Heart size={ICON_SIZES.section} color={t.colors.errorScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Burnout Detection
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, getScoreBadgeVariant(avgScore)),
            borderRadius: badgeRadius,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{getScoreLabel(avgScore)}</Text>
          </Box>
        </Box>

        {/* Health gauge: avg burnout score */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3],
          marginBottom: t.spacing[4],
        }}>
          {/* Circular gauge */}
          <Box style={{ position: 'relative' as const, width: 56, height: 56, flexShrink: 0 }}>
            <svg width={56} height={56} viewBox="0 0 56 56" aria-hidden="true">
              <circle
                cx={28} cy={28} r={22}
                fill="none"
                stroke={t.colors.neutral[100]}
                strokeWidth={5}
              />
              <circle
                cx={28} cy={28} r={22}
                fill="none"
                stroke={scoreColor}
                strokeWidth={5}
                strokeDasharray={`${(avgScore / 100) * 138.23} 138.23`}
                strokeLinecap="round"
                transform="rotate(-90 28 28)"
                style={{ transition: `stroke-dasharray ${t.motion.hover}` }}
              />
            </svg>
            <Box style={{
              position: 'absolute' as const, inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.bold,
                color: scoreColor,
              }}>
                {Math.round(avgScore)}
              </Text>
            </Box>
          </Box>

          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[500],
              textTransform: personalityTypo.labelTransform,
              letterSpacing: personalityTypo.labelLetterSpacing,
            }}>
              Avg Burnout Score
            </Text>
            {/* At-risk count with trend */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: t.typography.fontWeight.bold,
                color: t.colors.neutral[900],
              }}>
                {data.atRiskCount}
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: t.colors.neutral[500],
              }}>
                at risk / {data.teamSize}
              </Text>
              <Box style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: trendColor }}>
                  {data.trend}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Top 3 at-risk recruiters */}
        {topRecruiters.length > 0 && (
          <Box>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>High Risk Recruiters</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {topRecruiters.map((recruiter, idx) => {
                const recruiterEntrance = createEntranceAnimation(t, { index: idx });
                const barColor = getBurnoutColor(recruiter.riskLevel, t);
                const barProgress = createProgressBarStyle(t, {
                  color: barColor,
                  percent: recruiter.burnoutScore,
                });
                return (
                  <Box
                    key={recruiter.recruiterId}
                    {...(onViewRecruiter ? clickableProps(() => onViewRecruiter(recruiter.recruiterId), `View ${recruiter.name}`) : {})}
                    onClick={onViewRecruiter ? () => onViewRecruiter(recruiter.recruiterId) : undefined}
                    style={{
                      display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1],
                      padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[50],
                      border: `1px solid ${t.colors.neutral[100]}`,
                      cursor: onViewRecruiter ? 'pointer' : 'default',
                      transition: `all ${t.motion.hover}`,
                      ...recruiterEntrance.animate,
                    }}
                  >
                    {/* Row 1: Name + risk badge + throttle */}
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[800],
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap' as const,
                        }}>
                          {recruiter.name}
                        </Text>
                        <Box style={{
                          ...createBadgeStyle(t, getRiskBadgeVariant(recruiter.riskLevel)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {recruiter.riskLevel}
                          </Text>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        {recruiter.riskLevel === 'critical' && onApplyThrottle && (
                          <Box
                            {...clickableProps(() => onApplyThrottle(recruiter.recruiterId), `Apply throttle for ${recruiter.name}`)}
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              onApplyThrottle(recruiter.recruiterId);
                            }}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 2,
                              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
                              borderRadius: badgeRadius,
                              backgroundColor: t.colors.errorScale[50],
                              border: `1px solid ${t.colors.errorScale[200]}`,
                              cursor: 'pointer',
                              fontSize: t.typography.fontSize.xs,
                              color: t.colors.errorScale[700],
                              fontWeight: t.typography.fontWeight.medium,
                              transition: `all ${t.motion.hover}`,
                            }}
                          >
                            <Zap size={ICON_SIZES.inline} aria-hidden="true" />
                            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.errorScale[700] }}>
                              Throttle
                            </Text>
                          </Box>
                        )}
                        {onViewRecruiter && (
                          <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                        )}
                      </Box>
                    </Box>

                    {/* Row 2: Burnout score bar + indicator tag */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ flex: 1 }}>
                        <Box style={barProgress.track}>
                          <Box style={barProgress.fill} />
                        </Box>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: barColor,
                        minWidth: 28,
                        textAlign: 'right' as const,
                      }}>
                        {Math.round(recruiter.burnoutScore)}
                      </Text>
                    </Box>

                    {/* Top indicator tag */}
                    {recruiter.indicators.length > 0 && (
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                      }}>
                        {recruiter.indicators[0]}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}

        {/* Quick insight: top contributing indicator */}
        {topIndicator && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            marginTop: t.spacing[3],
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.warningScale[50],
            border: `1px solid ${t.colors.warningScale[200]}`,
          }}>
            <AlertTriangle size={ICON_SIZES.label} color={t.colors.warningScale[600]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.warningScale[700],
            }}>
              Top indicator: {topIndicator}
            </Text>
          </Box>
        )}

        {/* View Team Health link */}
        {onViewRecruiter && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View team health"
            onClick={() => onViewRecruiter('__team__')}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewRecruiter('__team__'); }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: t.spacing[1],
              marginTop: t.spacing[3],
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
              View Team Health
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
