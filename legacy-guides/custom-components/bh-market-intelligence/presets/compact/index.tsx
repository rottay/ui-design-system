'use client';

/**
 * BhMarketIntelligence - Compact Preset
 * Dashboard widget showing labor market data and salary benchmarking.
 * Includes salary range visualization, demand trend badge, time-to-fill
 * comparison, talent pool indicator, top insight, and full report link.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhMarketIntelligenceProps } from '../../core';
import { n, getDemandColor, getDemandBadgeColor, formatSalary } from '../../core';
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
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  formatAbbreviated,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  Globe,
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  Lightbulb,
  MapPin,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Preset                                                              */
/* ------------------------------------------------------------------ */

export const CompactBhMarketIntelligence = createPreset<BhMarketIntelligenceProps>({
  name: 'BhMarketIntelligence.Compact',
  render: (ctx: PresetContext<BhMarketIntelligenceProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewReport,
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

    /* -- Salary range visualization ----------------------------------- */
    const salaryViz = useMemo(() => {
      if (!data) return null;
      const { p25, p50, p75, offered } = data.salaryRange;
      const min = Math.min(p25, offered) * 0.9;
      const max = Math.max(p75, offered) * 1.1;
      const range = max - min;
      if (range <= 0) return null;

      const toPercent = (v: number) => ((v - min) / range) * 100;

      const p25Pct = toPercent(p25);
      const p50Pct = toPercent(p50);
      const p75Pct = toPercent(p75);
      const offeredPct = toPercent(offered);

      const isCompetitive = offered >= p50;
      const isBelowP25 = offered < p25;

      return { p25Pct, p50Pct, p75Pct, offeredPct, isCompetitive, isBelowP25 };
    }, [data]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading market intelligence">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '40%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 40, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 24, width: '80%' }} />
        </Box>
      );
    }

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Market Intelligence"
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
          marginBottom: t.spacing[3],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 32 })}>
              <Globe size={ICON_SIZES.section} color={t.colors.primaryScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Market Intelligence
            </Text>
          </Box>
          {data && (
            <Box style={{
              ...createBadgeStyle(t, getDemandBadgeColor(data.demandTrend)),
              borderRadius: badgeRadius,
            }}>
              <TrendingUp size={ICON_SIZES.inline} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                {data.demandTrend}
              </Text>
            </Box>
          )}
        </Box>

        {/* Job title + location */}
        {data && (
          <Box style={{
            display: 'flex', alignItems: 'center', gap: t.spacing[2],
            marginBottom: t.spacing[4],
          }}>
            <MapPin size={ICON_SIZES.label} color={t.colors.neutral[400]} aria-hidden="true" />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[600],
            }}>
              {data.jobTitle} &middot; {data.location}
            </Text>
          </Box>
        )}

        {/* Salary range visualization */}
        {data && salaryViz && (
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Salary Range</Text>

            {/* Range bar */}
            <Box style={{
              position: 'relative' as const,
              height: 24,
              marginBottom: t.spacing[2],
            }}>
              {/* Full track */}
              <Box style={{
                position: 'absolute' as const,
                top: 8,
                left: 0,
                right: 0,
                height: 8,
                borderRadius: t.borderRadius.full,
                backgroundColor: t.colors.neutral[100],
              }} />

              {/* P25-P75 range */}
              <Box style={{
                position: 'absolute' as const,
                top: 8,
                left: `${salaryViz.p25Pct}%`,
                width: `${salaryViz.p75Pct - salaryViz.p25Pct}%`,
                height: 8,
                borderRadius: t.borderRadius.full,
                backgroundColor: t.colors.neutral[200],
              }} />

              {/* P50 marker */}
              <Box style={{
                position: 'absolute' as const,
                top: 4,
                left: `${salaryViz.p50Pct}%`,
                width: 3,
                height: 16,
                borderRadius: t.borderRadius.sm,
                backgroundColor: t.colors.primaryScale[500],
                transform: 'translateX(-50%)',
              }} />

              {/* Offered marker */}
              <Box style={{
                position: 'absolute' as const,
                top: 2,
                left: `${salaryViz.offeredPct}%`,
                width: 10,
                height: 20,
                borderRadius: t.borderRadius.sm,
                backgroundColor: salaryViz.isBelowP25
                  ? t.colors.errorScale[500]
                  : salaryViz.isCompetitive
                    ? t.colors.successScale[500]
                    : t.colors.warningScale[500],
                transform: 'translateX(-50%)',
                border: `2px solid ${t.colors.common.white}`,
              }} />
            </Box>

            {/* Labels */}
            <Box style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: t.spacing[1],
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                P25: {formatSalary(n(data.salaryRange.p25))}
              </Text>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.primaryScale[600],
              }}>
                P50: {formatSalary(n(data.salaryRange.p50))}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                P75: {formatSalary(n(data.salaryRange.p75))}
              </Text>
            </Box>

            {/* Offered comparison */}
            <Box style={{
              display: 'flex', alignItems: 'center', gap: t.spacing[1],
              marginTop: t.spacing[1],
            }}>
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.semibold,
                color: salaryViz.isBelowP25
                  ? t.colors.errorScale[600]
                  : salaryViz.isCompetitive
                    ? t.colors.successScale[600]
                    : t.colors.warningScale[600],
              }}>
                Offered: {formatSalary(n(data.salaryRange.offered))}
                {salaryViz.isCompetitive ? ' (Competitive)' : salaryViz.isBelowP25 ? ' (Below Market)' : ' (Below Median)'}
              </Text>
            </Box>
          </Box>
        )}

        {/* Time to fill comparison */}
        {data && (
          <Box style={{ marginBottom: t.spacing[4] }}>
            <Text style={{ ...sectionHeader, marginBottom: t.spacing[2] }}>Time to Fill</Text>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[2] }}>
              {/* Your avg */}
              {(() => {
                const yourDays = n(data.avgTimeToFill);
                const industryDays = n(data.industryAvgTimeToFill);
                const maxDays = Math.max(yourDays, industryDays) * 1.2;
                const yourPct = maxDays > 0 ? (yourDays / maxDays) * 100 : 0;
                const industryPct = maxDays > 0 ? (industryDays / maxDays) * 100 : 0;
                const yourColor = yourDays <= industryDays
                  ? t.colors.successScale[500]
                  : t.colors.warningScale[500];
                const yourBarStyles = createProgressBarStyle(t, { color: yourColor, percent: yourPct });
                const industryBarStyles = createProgressBarStyle(t, { color: t.colors.neutral[300], percent: industryPct });

                return (
                  <>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], width: 52, flexShrink: 0 }}>
                        Yours
                      </Text>
                      <Box style={{ ...yourBarStyles.track, flex: 1, height: 8 }}>
                        <Box style={{ ...yourBarStyles.fill, height: 8 }} />
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[800],
                        width: 40,
                        textAlign: 'right' as const,
                        flexShrink: 0,
                      }}>
                        {Math.round(yourDays)}d
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], width: 52, flexShrink: 0 }}>
                        Industry
                      </Text>
                      <Box style={{ ...industryBarStyles.track, flex: 1, height: 8 }}>
                        <Box style={{ ...industryBarStyles.fill, height: 8 }} />
                      </Box>
                      <Text style={{
                        fontSize: t.typography.fontSize.xs,
                        fontWeight: t.typography.fontWeight.semibold,
                        color: t.colors.neutral[800],
                        width: 40,
                        textAlign: 'right' as const,
                        flexShrink: 0,
                      }}>
                        {Math.round(industryDays)}d
                      </Text>
                    </Box>
                  </>
                );
              })()}
            </Box>
          </Box>
        )}

        {/* Talent pool + competitor stats */}
        {data && (
          <Box style={{
            display: 'flex', gap: t.spacing[3],
            marginBottom: t.spacing[3],
          }}>
            <Box style={{
              flex: 1,
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: 2 }}>
                <Users size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Talent Pool
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {formatAbbreviated(n(data.talentPoolSize))}
              </Text>
            </Box>
            <Box style={{
              flex: 1,
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.neutral[50],
              border: `1px solid ${t.colors.neutral[100]}`,
            }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: 2 }}>
                <Globe size={ICON_SIZES.inline} color={t.colors.neutral[400]} aria-hidden="true" />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                  Competitors
                </Text>
              </Box>
              <Text style={{
                fontSize: t.typography.fontSize.sm,
                fontWeight: t.typography.fontWeight.semibold,
                color: t.colors.neutral[900],
              }}>
                {n(data.competitorCount)}
              </Text>
            </Box>
          </Box>
        )}

        {/* Top insight */}
        {data && data.insights.length > 0 && (
          <Box style={{
            display: 'flex', alignItems: 'flex-start', gap: t.spacing[2],
            padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
            borderRadius: t.borderRadius.md,
            backgroundColor: t.colors.warningScale[50],
            border: `1px solid ${t.colors.warningScale[100]}`,
            marginBottom: t.spacing[3],
          }}>
            <Lightbulb size={ICON_SIZES.label} color={t.colors.warningScale[500]} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              color: t.colors.neutral[700],
              lineHeight: 1.4,
            }}>
              {data.insights[0]}
            </Text>
          </Box>
        )}

        {/* Empty state */}
        {!data && (
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <Globe size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No market data available
            </Text>
          </Box>
        )}

        {/* Full Report link */}
        {onViewReport && data && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="View full market report"
            onClick={onViewReport}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewReport(); }
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
              Full Report
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
