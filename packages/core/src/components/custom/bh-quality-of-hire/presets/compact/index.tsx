'use client';

/**
 * BhQualityOfHire - Compact Preset
 * Dashboard widget showing overall QoH score with circular gauge, trend,
 * key stats row, dimension mini-bars, and recent hires with quality badges.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhQualityOfHireProps } from '../../core';
import { n } from '../../core';
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
  formatDate,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  ChevronRight,
  Clock,
  Users,
  ThumbsUp,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getQohColor(score: number, tokens: any): string {
  if (score >= 80) return tokens.colors.successScale[600];
  if (score >= 60) return tokens.colors.infoScale[600];
  if (score >= 40) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[600];
}

function getStatusBadgeColor(status: 'exceeding' | 'meeting' | 'below'): 'success' | 'primary' | 'warning' {
  switch (status) {
    case 'exceeding': return 'success';
    case 'meeting': return 'primary';
    case 'below': return 'warning';
  }
}

function getStatusLabel(status: 'exceeding' | 'meeting' | 'below'): string {
  switch (status) {
    case 'exceeding': return 'Exceeding';
    case 'meeting': return 'Meeting';
    case 'below': return 'Below';
  }
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhQualityOfHire = createPreset<BhQualityOfHireProps>({
  name: 'BhQualityOfHire.Compact',
  render: (ctx: PresetContext<BhQualityOfHireProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewHire,
      onViewAll,
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
        }} role="status" aria-label="Loading quality of hire data">
          <Box style={{ ...skeletonStyle, height: 20, width: '55%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '35%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '100%' }} />
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
              <Award size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No quality of hire data available
            </Text>
          </Box>
        </Box>
      );
    }

    const score = Math.round(n(data.overallScore));
    const scoreColor = getQohColor(score, t);
    const TrendIcon = data.trend === 'improving' ? TrendingUp
      : data.trend === 'declining' ? TrendingDown
      : Minus;
    const trendColor = data.trend === 'improving'
      ? t.colors.successScale[600]
      : data.trend === 'declining'
        ? t.colors.errorScale[600]
        : t.colors.neutral[500];

    // Circular gauge calculations
    const gaugeRadius = 30;
    const gaugeCircumference = 2 * Math.PI * gaugeRadius;
    const gaugeFill = (score / 100) * gaugeCircumference;

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Quality of Hire"
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
                <Award size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Quality of Hire
              </Text>
            </Box>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <TrendIcon size={ICON_SIZES.label} color={trendColor} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                color: trendColor,
                fontWeight: t.typography.fontWeight.medium,
              }}>
                {data.trend === 'improving' ? 'Improving' : data.trend === 'declining' ? 'Declining' : 'Stable'}
              </Text>
            </Box>
          </Box>

          {/* Overall QoH score: circular gauge */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[4],
            marginBottom: t.spacing[4],
          }}>
            <Box style={{
              position: 'relative' as const,
              width: 72,
              height: 72,
              flexShrink: 0,
            }}>
              <svg width="72" height="72" viewBox="0 0 72 72" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="36" cy="36" r={gaugeRadius}
                  fill="none"
                  stroke={t.colors.neutral[100]}
                  strokeWidth="6"
                />
                <circle
                  cx="36" cy="36" r={gaugeRadius}
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="6"
                  strokeDasharray={`${gaugeFill} ${gaugeCircumference - gaugeFill}`}
                  strokeLinecap="round"
                />
              </svg>
              <Box style={{
                position: 'absolute' as const,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center' as const,
              }}>
                <Text style={{
                  fontSize: t.typography.fontSize.lg,
                  fontWeight: t.typography.fontWeight.bold,
                  color: scoreColor,
                }}>
                  {score}
                </Text>
              </Box>
            </Box>
            <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
              Overall QoH Score
            </Text>
          </Box>

          {/* Key stats row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: t.spacing[2],
            marginBottom: t.spacing[4],
          }}>
            <Box style={{
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Clock size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
                marginTop: t.spacing[1],
              }}>
                {Math.round(n(data.avgTimeToProductivity))}d
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Ramp-up
              </Text>
            </Box>
            <Box style={{
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Users size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
                marginTop: t.spacing[1],
              }}>
                {Math.round(n(data.retentionRate6Month))}%
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                6mo Retention
              </Text>
            </Box>
            <Box style={{
              display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <ThumbsUp size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[800],
                marginTop: t.spacing[1],
              }}>
                {Math.round(n(data.managerSatisfaction))}%
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Mgr Sat.
              </Text>
            </Box>
          </Box>

          {/* Dimension mini-bars */}
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Dimensions</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {data.dimensions.slice(0, 5).map((dim) => {
                const dimColor = getQohColor(n(dim.score), t);
                const bar = createProgressBarStyle(t, {
                  color: dimColor,
                  percent: n(dim.score),
                });
                return (
                  <Box key={dim.name}>
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 2,
                    }}>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[600],
                      }}>
                        {dim.name}
                      </Text>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[700],
                      }}>
                        {Math.round(n(dim.score))}
                      </Text>
                    </Box>
                    <Box style={{ ...bar.track, height: 4 }}>
                      <Box style={bar.fill} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Recent hires */}
          {data.recentHires.length > 0 && (
            <Box style={{ marginBottom: t.spacing[2] }}>
              <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Recent Hires</Text>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
                {data.recentHires.slice(0, 2).map((hire, idx) => {
                  const hireEntrance = createEntranceAnimation(t, { index: idx });
                  return (
                    <Box
                      key={hire.candidateName}
                      {...(onViewHire ? clickableProps(() => onViewHire(hire.candidateName), `View hire: ${hire.candidateName}`) : {})}
                      onClick={onViewHire ? () => onViewHire(hire.candidateName) : undefined}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
                        borderRadius: t.borderRadius.md,
                        backgroundColor: t.colors.neutral[50],
                        border: `1px solid ${t.colors.neutral[100]}`,
                        cursor: onViewHire ? 'pointer' : 'default',
                        transition: `all ${t.motion.hover}`,
                        ...hireEntrance.animate,
                      }}
                    >
                      <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: 2 }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.sm,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[800],
                        }}>
                          {hire.candidateName}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {formatDate(hire.hireDate)}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{
                          ...createBadgeStyle(t, getStatusBadgeColor(hire.status)),
                          borderRadius: badgeRadius,
                        }}>
                          <Text style={{ fontSize: t.typography.fontSize.xs }}>
                            {getStatusLabel(hire.status)}
                          </Text>
                        </Box>
                        {onViewHire && (
                          <ChevronRight size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* View All Hires link */}
          {onViewAll && (
            <Box
              role="button"
              tabIndex={0}
              aria-label="View all hires"
              onClick={onViewAll}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewAll(); }
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: t.spacing[1],
                marginTop: t.spacing[2],
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
                View All Hires
              </Text>
              <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
            </Box>
          )}

        </Box>
      </div>
    );
  },
});
