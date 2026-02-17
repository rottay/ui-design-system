'use client';

/**
 * BhPipelineComparison - Overlay Preset
 * Overlaid stats comparison with merged bar charts and color-coded
 * differences between two jobs. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ArrowLeftRight, Briefcase, Users, Clock, BarChart3,
  TrendingUp, TrendingDown, Minus, Layers,
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
  BhPipelineComparisonProps,
  ComparisonJob,
  ComparisonStage,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getDeltaColor(delta: number, t: DesignTokens, invertForTime = false): string {
  if (delta === 0) return t.colors.neutral[400];
  if (invertForTime) {
    return delta > 0 ? t.colors.errorScale[500] : t.colors.successScale[500];
  }
  return delta > 0 ? t.colors.successScale[500] : t.colors.errorScale[500];
}

function getDeltaLabel(delta: number, suffix = ''): string {
  if (delta === 0) return '--';
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}${suffix}`;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_JOB_A: ComparisonJob = {
  id: 'j-1',
  title: 'Senior Software Engineer',
  department: 'Engineering',
  recruiter: 'Anna Smith',
  totalCandidates: 156,
  timeToHireDays: 34,
  overallConversionRate: 10,
  stages: [
    { name: 'Applied', candidateCount: 156, conversionRate: 68, avgDaysInStage: 2 },
    { name: 'Screening', candidateCount: 106, conversionRate: 52, avgDaysInStage: 4 },
    { name: 'Interview', candidateCount: 55, conversionRate: 45, avgDaysInStage: 8 },
    { name: 'Assessment', candidateCount: 25, conversionRate: 64, avgDaysInStage: 6 },
    { name: 'Offer', candidateCount: 16, conversionRate: 82, avgDaysInStage: 3 },
  ],
};

const MOCK_JOB_B: ComparisonJob = {
  id: 'j-2',
  title: 'Product Manager',
  department: 'Product',
  recruiter: 'Bob Jones',
  totalCandidates: 98,
  timeToHireDays: 28,
  overallConversionRate: 14,
  stages: [
    { name: 'Applied', candidateCount: 98, conversionRate: 72, avgDaysInStage: 1 },
    { name: 'Screening', candidateCount: 71, conversionRate: 58, avgDaysInStage: 3 },
    { name: 'Interview', candidateCount: 41, conversionRate: 56, avgDaysInStage: 5 },
    { name: 'Assessment', candidateCount: 23, conversionRate: 61, avgDaysInStage: 4 },
    { name: 'Offer', candidateCount: 14, conversionRate: 86, avgDaysInStage: 2 },
  ],
};

/* ================================================================== */
/*  Overlay Preset                                                     */
/* ================================================================== */

export const OverlayBhPipelineComparison = createPreset<BhPipelineComparisonProps>({
  name: 'BhPipelineComparison.Overlay',
  render: (ctx: PresetContext<BhPipelineComparisonProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      jobA: rawJobA = MOCK_JOB_A,
      jobB: rawJobB = MOCK_JOB_B,
      onSwap,
      showDelta = true,
      onStageClick,
      className,
      style,
    } = props;

    const jobA = Array.isArray(rawJobA) ? rawJobA : MOCK_JOB_A;
    const jobB = Array.isArray(rawJobB) ? rawJobB : MOCK_JOB_B;

    const [hoveredStage, setHoveredStage] = useState<string | null>(null);


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleSwap = useCallback(() => {
      onSwap?.();
    }, [onSwap]);

    const handleStageClick = useCallback((jobId: string, stageName: string) => {
      onStageClick?.(jobId, stageName);
    }, [onStageClick]);

    const colorA = t.colors.primaryScale;
    const colorB = t.colors.secondaryScale ?? t.colors.infoScale;

    /* Compute paired stages */
    const pairedStages = useMemo(() => {
      const stageNames = new Set([
        ...(jobA.stages ?? []).map(s => s.name),
        ...(jobB.stages ?? []).map(s => s.name),
      ]);
      return Array.from(stageNames).map(name => ({
        name,
        a: (jobA.stages ?? []).find(s => s.name === name) ?? null,
        b: (jobB.stages ?? []).find(s => s.name === name) ?? null,
      }));
    }, [jobA, jobB]);

    const maxConversion = useMemo(
      () => Math.max(
        ...pairedStages.map(p => Math.max(p.a?.conversionRate ?? 0, p.b?.conversionRate ?? 0)),
        1,
      ),
      [pairedStages],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...entrance.animate,
          transition: entrance.transition,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.primaryScale[50] })}>
              <Layers size={18} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Pipeline Overlay
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                Overlaid metrics comparison
              </Text>
            </Box>
          </Box>
          {onSwap && (
            <button
              onClick={handleSwap}
              aria-label="Swap job positions"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`, backgroundColor: t.colors.common.white,
                cursor: 'pointer', transition: `all ${t.motion.hover}`, padding: 0,
              }}
            >
              <ArrowLeftRight size={16} color={t.colors.neutral[500]} />
            </button>
          )}
        </Box>

        {/* Legend */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          gap: t.spacing[4],
          padding: `${t.spacing[3]}px ${t.spacing[5]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.sm, backgroundColor: colorA[400], flexShrink: 0 }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
              {jobA.title}
            </Text>
            <Box style={{
              ...createBadgeStyle(t, 'primary'),
              borderRadius: badgeRadius,
              padding: `0 ${t.spacing[1]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{jobA.totalCandidates} candidates</Text>
            </Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{ width: 12, height: 12, borderRadius: t.borderRadius.sm, backgroundColor: colorB[400], flexShrink: 0 }} />
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
              {jobB.title}
            </Text>
            <Box style={{
              ...createBadgeStyle(t, 'info'),
              borderRadius: badgeRadius,
              padding: `0 ${t.spacing[1]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{jobB.totalCandidates} candidates</Text>
            </Box>
          </Box>
        </Box>

        {/* Overlaid bar chart */}
        <Box style={{ padding: t.spacing[5] }}>
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Conversion Rate by Stage</Text>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[4] }}>
            {pairedStages.map((pair, i) => {
              const rateA = pair.a?.conversionRate ?? 0;
              const rateB = pair.b?.conversionRate ?? 0;
              const delta = rateA - rateB;
              const isHovered = hoveredStage === pair.name;

              return (
                <Box
                  key={pair.name}
                  onMouseEnter={() => setHoveredStage((pair.name ?? null))}
                  onMouseLeave={() => setHoveredStage(null)}
                  style={{ ...animStyle(i) }}
                >
                  {/* Stage label + delta */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[2] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.medium,
                      color: t.colors.neutral[700],
                    }}>
                      {pair.name}
                    </Text>
                    {showDelta && (
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: colorA[600], fontWeight: t.typography.fontWeight.bold }}>
                          {rateA}%
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[300] }}>vs</Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: colorB[600], fontWeight: t.typography.fontWeight.bold }}>
                          {rateB}%
                        </Text>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: t.typography.fontWeight.bold,
                          color: getDeltaColor(delta, t),
                        }}>
                          ({getDeltaLabel(delta, '%')})
                        </Text>
                      </Box>
                    )}
                  </Box>

                  {/* Overlaid bars */}
                  <Box
                    style={{
                      position: 'relative',
                      height: 24,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: t.colors.neutral[100],
                      overflow: 'hidden',
                    }}
                    role="img"
                    aria-label={`${pair.name}: ${jobA.title} ${rateA}%, ${jobB.title} ${rateB}%`}
                  >
                    {/* Job A bar (behind) */}
                    <Box style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '50%',
                      width: `${(rateA / 100) * 100}%`,
                      backgroundColor: colorA[isHovered ? 500 : 400],
                      borderRadius: `${t.borderRadius.md} ${t.borderRadius.md} 0 0`,
                      transition: `all ${t.motion.hover}`,
                    }} />
                    {/* Job B bar (front) */}
                    <Box style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      height: '50%',
                      width: `${(rateB / 100) * 100}%`,
                      backgroundColor: colorB[isHovered ? 500 : 400],
                      borderRadius: `0 0 ${t.borderRadius.md} ${t.borderRadius.md}`,
                      transition: `all ${t.motion.hover}`,
                    }} />
                  </Box>

                  {/* Days comparison */}
                  {pair.a && pair.b && (
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: t.spacing[1] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Clock size={10} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {pair.a.avgDaysInStage}d vs {pair.b.avgDaysInStage}d
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                        <Users size={10} color={t.colors.neutral[400]} />
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                          {pair.a.candidateCount} vs {pair.b.candidateCount}
                        </Text>
                      </Box>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Summary section */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: t.spacing[3],
          padding: `${t.spacing[4]}px ${t.spacing[5]}px`,
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          {/* Job A summary */}
          <Box style={{
            ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
            ...animStyle(pairedStages.length),
          }} role="status" aria-label={`${jobA.title} summary`}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
              <Box style={{ width: 4, height: 16, borderRadius: t.borderRadius.sm, backgroundColor: colorA[500], flexShrink: 0 }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>
                {jobA.title}
              </Text>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                  {jobA.overallConversionRate}%
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Conversion</Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                  {jobA.timeToHireDays}d
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Time to Hire</Text>
              </Box>
            </Box>
          </Box>

          {/* Job B summary */}
          <Box style={{
            ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
            ...animStyle(pairedStages.length + 1),
          }} role="status" aria-label={`${jobB.title} summary`}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
              <Box style={{ width: 4, height: 16, borderRadius: t.borderRadius.sm, backgroundColor: colorB[500], flexShrink: 0 }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>
                {jobB.title}
              </Text>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                  {jobB.overallConversionRate}%
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Conversion</Text>
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                  {jobB.timeToHireDays}d
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Time to Hire</Text>
              </Box>
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
