'use client';

/**
 * BhBenchmarkComparison - Compact Preset
 * Dashboard widget comparing recruitment metrics against industry benchmarks.
 * Shows overall percentile, metric comparison bars with markers for your value,
 * industry average, and top quartile, plus win/lose indicators per metric.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhBenchmarkComparisonProps, BenchmarkMetric } from '../../core';
import { n, getBenchmarkColor } from '../../core';
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
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  BarChart3,
  Check,
  ArrowDown,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getOrdinalSuffix(num: number): string {
  const mod10 = num % 10;
  const mod100 = num % 100;
  if (mod10 === 1 && mod100 !== 11) return 'st';
  if (mod10 === 2 && mod100 !== 12) return 'nd';
  if (mod10 === 3 && mod100 !== 13) return 'rd';
  return 'th';
}

function getPercentileColor(percentile: number, tokens: any): string {
  if (percentile >= 75) return tokens.colors.successScale[600];
  if (percentile >= 50) return tokens.colors.infoScale[600];
  if (percentile >= 25) return tokens.colors.warningScale[600];
  return tokens.colors.errorScale[600];
}

/* ------------------------------------------------------------------ */
/*  Preset                                                             */
/* ------------------------------------------------------------------ */

export const CompactBhBenchmarkComparison = createPreset<BhBenchmarkComparisonProps>({
  name: 'BhBenchmarkComparison.Compact',
  render: (ctx: PresetContext<BhBenchmarkComparisonProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewDetails,
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
        }} role="status" aria-label="Loading benchmark comparison">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 48, width: '40%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 60, width: '100%' }} />
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
              <BarChart3 size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No benchmark data available
            </Text>
          </Box>
        </Box>
      );
    }

    const metrics = data.metrics.slice(0, 3);
    const percentile = Math.round(n(data.overallPercentile));
    const percentileColor = getPercentileColor(percentile, t);

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Industry Benchmarks"
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
                <BarChart3 size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: personalityTypo.headingWeight,
                letterSpacing: personalityTypo.headingLetterSpacing,
                color: t.colors.neutral[900],
              }}>
                Industry Benchmarks
              </Text>
            </Box>
          </Box>

          {/* Industry + company size labels */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            marginBottom: t.spacing[3],
          }}>
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{data.industry}</Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, 'secondary'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{data.companySize}</Text>
            </Box>
          </Box>

          {/* Overall percentile */}
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[3],
            marginBottom: t.spacing[4],
          }}>
            <Text style={{
              ...createStatValueStyle(t, { size: '2xl' }),
              color: percentileColor,
            }}>
              {percentile}
              <Text as="span" style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.medium,
                color: percentileColor,
              }}>
                {getOrdinalSuffix(percentile)}
              </Text>
            </Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
                Overall Percentile
              </Text>
            </Box>
          </Box>

          {/* Metric comparison bars */}
          <Box style={{ marginBottom: t.spacing[3] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[3] }}>Key Metrics</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
              {metrics.map((metric, idx) => {
                const benchColor = getBenchmarkColor(
                  metric.yourValue, metric.industryAvg, metric.topQuartile, metric.betterDirection, t,
                );
                const isWin = metric.betterDirection === 'higher'
                  ? metric.yourValue >= metric.industryAvg
                  : metric.yourValue <= metric.industryAvg;

                // Calculate bar positions (normalize to 0-100 range)
                const allValues = [metric.yourValue, metric.industryAvg, metric.topQuartile];
                const maxVal = Math.max(...allValues) * 1.2;
                const minVal = 0;
                const range = maxVal - minVal || 1;
                const yourPos = ((metric.yourValue - minVal) / range) * 100;
                const avgPos = ((metric.industryAvg - minVal) / range) * 100;
                const topQPos = ((metric.topQuartile - minVal) / range) * 100;

                const metricEntrance = createEntranceAnimation(t, { index: idx });

                return (
                  <Box
                    key={metric.name}
                    style={{
                      ...metricEntrance.animate,
                      transition: metricEntrance.transition,
                    }}
                  >
                    {/* Metric label row */}
                    <Box style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: t.spacing[1],
                    }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        {isWin ? (
                          <Check size={ICON_SIZES.label} color={t.colors.successScale[500]} aria-hidden="true" />
                        ) : (
                          <ArrowDown size={ICON_SIZES.label} color={t.colors.warningScale[500]} aria-hidden="true" />
                        )}
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.medium,
                          color: t.colors.neutral[700],
                        }}>
                          {metric.name}
                        </Text>
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: benchColor.text,
                      }}>
                        {metric.yourValue}{metric.unit}
                      </Text>
                    </Box>

                    {/* Comparison bar */}
                    <Box style={{
                      position: 'relative' as const,
                      height: 8,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: t.colors.neutral[100],
                      overflow: 'visible',
                    }}>
                      {/* Your value fill */}
                      <Box style={{
                        position: 'absolute' as const,
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${Math.min(100, yourPos)}%`,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: benchColor.text,
                        opacity: 0.3,
                        transition: `width ${t.motion.hover}`,
                      }} />

                      {/* Your value dot */}
                      <Box style={{
                        position: 'absolute' as const,
                        top: '50%',
                        left: `${Math.min(96, yourPos)}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 10,
                        height: 10,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.primaryScale[500],
                        border: `2px solid ${t.colors.common.white}`,
                        boxShadow: t.shadows.sm,
                        zIndex: 2,
                      }} />

                      {/* Industry avg line (dashed) */}
                      <Box style={{
                        position: 'absolute' as const,
                        top: -2,
                        left: `${Math.min(98, avgPos)}%`,
                        width: 1,
                        height: 12,
                        borderLeft: `2px dashed ${t.colors.neutral[400]}`,
                        zIndex: 1,
                      }} />

                      {/* Top quartile line (dashed) */}
                      <Box style={{
                        position: 'absolute' as const,
                        top: -2,
                        left: `${Math.min(98, topQPos)}%`,
                        width: 1,
                        height: 12,
                        borderLeft: `2px dashed ${t.colors.successScale[400]}`,
                        zIndex: 1,
                      }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* View Full Comparison link */}
          {onViewDetails && (
            <Box
              role="button"
              tabIndex={0}
              aria-label="View full benchmark comparison"
              onClick={onViewDetails}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewDetails(); }
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
                View Full Comparison
              </Text>
              <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
            </Box>
          )}

        </Box>
      </div>
    );
  },
});
