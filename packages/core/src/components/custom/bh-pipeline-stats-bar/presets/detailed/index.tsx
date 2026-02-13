'use client';

/**
 * BhPipelineStatsBar - Detailed Preset
 * Full stats with mini bar charts for conversion, time-to-hire trend,
 * and bottleneck warning pulse. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, Clock, AlertTriangle,
  Users, Briefcase, ArrowRight, BarChart3, Activity,
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
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhPipelineStatsBarProps,
  StageConversion,
  TrendDirection,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getTrendIcon(trend: TrendDirection) {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    case 'flat': return Minus;
  }
}

function getTrendColor(trend: TrendDirection, t: DesignTokens, invertForTime = false): string {
  if (invertForTime) {
    switch (trend) {
      case 'up': return t.colors.errorScale[500];
      case 'down': return t.colors.successScale[500];
      case 'flat': return t.colors.neutral[400];
    }
  }
  switch (trend) {
    case 'up': return t.colors.successScale[500];
    case 'down': return t.colors.errorScale[500];
    case 'flat': return t.colors.neutral[400];
  }
}

function getConversionColor(rate: number, t: DesignTokens): string {
  if (rate >= 70) return t.colors.successScale[500];
  if (rate >= 40) return t.colors.warningScale[500];
  return t.colors.errorScale[500];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_CONVERSIONS: StageConversion[] = [
  { fromStage: 'Applied', toStage: 'Screening', rate: 68, candidateCount: 156, trend: 'up' },
  { fromStage: 'Screening', toStage: 'Interview', rate: 52, candidateCount: 106, trend: 'flat' },
  { fromStage: 'Interview', toStage: 'Assessment', rate: 45, candidateCount: 55, trend: 'down' },
  { fromStage: 'Assessment', toStage: 'Offer', rate: 38, candidateCount: 25, trend: 'up' },
  { fromStage: 'Offer', toStage: 'Hired', rate: 82, candidateCount: 20, trend: 'up' },
];

const MOCK_TIME_TO_HIRE = { days: 34, trend: 'down' as const, previousDays: 38 };
const MOCK_BOTTLENECK = 'Assessment';
const MOCK_TOTAL = 362;
const MOCK_ACTIVE_JOBS = 12;

/* ================================================================== */
/*  Detailed Preset                                                    */
/* ================================================================== */

export const DetailedBhPipelineStatsBar = createPreset<BhPipelineStatsBarProps>({
  name: 'BhPipelineStatsBar.Detailed',
  render: (ctx: PresetContext<BhPipelineStatsBarProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      conversionRates = MOCK_CONVERSIONS,
      avgTimeToHire = MOCK_TIME_TO_HIRE,
      bottleneckStage = MOCK_BOTTLENECK,
      totalCandidates = MOCK_TOTAL,
      activeJobs = MOCK_ACTIVE_JOBS,
      onConversionClick,
      onBottleneckClick,
      className,
      style,
    } = props;

    const [hoveredConversion, setHoveredConversion] = useState<number | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleConversionClick = useCallback((from: string, to: string) => {
      onConversionClick?.(from, to);
    }, [onConversionClick]);

    const handleBottleneckClick = useCallback(() => {
      if (bottleneckStage) onBottleneckClick?.(bottleneckStage);
    }, [onBottleneckClick, bottleneckStage]);

    const maxRate = useMemo(() => Math.max(...conversionRates.map(c => c.rate), 1), [conversionRates]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: t.spacing[4],
          width: '100%',
          ...style,
        }}
      >
        {/* Top Stats Row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: t.spacing[4],
        }}>
          {/* Total Candidates */}
          <Box style={{ ...card, ...hoverStyles.base, ...animStyle(0) }} role="status" aria-label={`Total candidates: ${totalCandidates}`}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
                <Users size={20} color={t.colors.primaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                  {totalCandidates}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                  Total Candidates
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Active Jobs */}
          <Box style={{ ...card, ...hoverStyles.base, ...animStyle(1) }} role="status" aria-label={`Active jobs: ${activeJobs}`}>
            {accentBar && <Box style={accentBar} />}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.infoScale[50] })}>
                <Briefcase size={20} color={t.colors.infoScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                  {activeJobs}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                  Active Jobs
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Time to Hire */}
          <Box style={{ ...card, ...hoverStyles.base, ...animStyle(2) }} role="status" aria-label={`Average time to hire: ${avgTimeToHire.days} days`}>
            {accentBar && <Box style={accentBar} />}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.warningScale[50] })}>
                <Clock size={20} color={t.colors.warningScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                    {avgTimeToHire.days}d
                  </Text>
                  {(() => {
                    const TrendIcon = getTrendIcon(avgTimeToHire.trend);
                    return <TrendIcon size={16} color={getTrendColor(avgTimeToHire.trend, t, true)} />;
                  })()}
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                  Avg Time to Hire
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Bottleneck */}
          <Box
            style={{
              ...card,
              ...hoverStyles.base,
              ...animStyle(3),
              position: 'relative' as const,
              cursor: bottleneckStage ? 'pointer' : 'default',
              borderLeft: bottleneckStage ? `3px solid ${t.colors.errorScale[400]}` : undefined,
            }}
            role="status"
            aria-label={`Bottleneck stage: ${bottleneckStage ?? 'None'}`}
            tabIndex={bottleneckStage ? 0 : undefined}
            onClick={handleBottleneckClick}
            onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && bottleneckStage) { e.preventDefault(); handleBottleneckClick(); } }}
          >
            {accentBar && <Box style={accentBar} />}
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
              <Box style={createIconContainerStyle(t, { size: 40, color: bottleneckStage ? t.colors.errorScale[50] : t.colors.successScale[50] })}>
                {bottleneckStage ? (
                  <AlertTriangle size={20} color={t.colors.errorScale[600]} />
                ) : (
                  <Activity size={20} color={t.colors.successScale[600]} />
                )}
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: bottleneckStage ? t.colors.errorScale[700] : t.colors.successScale[700], display: 'block' }}>
                  {bottleneckStage ?? 'No Bottleneck'}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                  {bottleneckStage ? 'Bottleneck Stage' : 'Pipeline Healthy'}
                </Text>
              </Box>
            </Box>
            {bottleneckStage && (
              <Box style={{
                position: 'absolute',
                top: t.spacing[2],
                right: t.spacing[2],
                width: 8,
                height: 8,
                borderRadius: t.borderRadius.full,
                backgroundColor: t.colors.errorScale[400],
                animation: 'pulse 2s ease-in-out infinite',
              }} />
            )}
          </Box>
        </Box>

        {/* Conversion Funnel */}
        <Box style={{ ...card, ...animStyle(4), padding: 0 }}>
          <Box style={{
            padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
              <BarChart3 size={16} color={t.colors.primaryScale[500]} />
              <Text style={{ ...sectionLabel, marginBottom: 0 }}>Stage Conversion Rates</Text>
            </Box>
          </Box>

          <Box style={{ padding: t.spacing[4] }}>
            <Box style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: t.spacing[3],
              flexWrap: 'wrap',
            }}>
              {conversionRates.map((conv, i) => {
                const barColor = getConversionColor(conv.rate, t);
                const isHovered = hoveredConversion === i;
                const TrendIcon = conv.trend ? getTrendIcon(conv.trend) : null;

                return (
                  <Box
                    key={`${conv.fromStage}-${conv.toStage}`}
                    style={{
                      flex: '1 1 120px',
                      minWidth: 120,
                      cursor: onConversionClick ? 'pointer' : 'default',
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${conv.fromStage} to ${conv.toStage}: ${conv.rate}% conversion`}
                    onClick={() => handleConversionClick(conv.fromStage, conv.toStage)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleConversionClick(conv.fromStage, conv.toStage); } }}
                    onMouseEnter={() => setHoveredConversion(i)}
                    onMouseLeave={() => setHoveredConversion(null)}
                  >
                    {/* Stage labels */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[2] }}>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>
                        {conv.fromStage}
                      </Text>
                      <ArrowRight size={10} color={t.colors.neutral[300]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], fontWeight: t.typography.fontWeight.medium }}>
                        {conv.toStage}
                      </Text>
                    </Box>

                    {/* Mini bar chart */}
                    <Box style={{
                      height: 80,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      marginBottom: t.spacing[2],
                    }}>
                      <Box style={{
                        width: '60%',
                        maxWidth: 40,
                        height: `${(conv.rate / 100) * 100}%`,
                        backgroundColor: isHovered ? barColor : barColor,
                        opacity: isHovered ? 1 : 0.8,
                        borderRadius: `${t.borderRadius.sm} ${t.borderRadius.sm} 0 0`,
                        transition: `all ${t.motion.hover}`,
                        minHeight: 4,
                      }} />
                    </Box>

                    {/* Rate + trend */}
                    <Box style={{ textAlign: 'center' }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: t.spacing[1] }}>
                        <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                          {conv.rate}%
                        </Text>
                        {TrendIcon && conv.trend && (
                          <TrendIcon size={12} color={getTrendColor(conv.trend, t)} />
                        )}
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                        {conv.candidateCount} candidates
                      </Text>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
