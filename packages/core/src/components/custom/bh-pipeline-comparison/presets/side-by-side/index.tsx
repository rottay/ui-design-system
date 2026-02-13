'use client';

/**
 * BhPipelineComparison - Side-by-Side Preset
 * Two parallel pipelines with delta indicators, conversion rate comparison,
 * and color-coded differences. Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ArrowLeftRight, Briefcase, Users, Clock, ArrowRight,
  TrendingUp, TrendingDown, Minus, BarChart3, ChevronRight,
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

function getConversionBadge(rate: number): 'success' | 'warning' | 'error' {
  if (rate >= 60) return 'success';
  if (rate >= 35) return 'warning';
  return 'error';
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
/*  Side-by-Side Preset                                                */
/* ================================================================== */

export const SideBySideBhPipelineComparison = createPreset<BhPipelineComparisonProps>({
  name: 'BhPipelineComparison.SideBySide',
  render: (ctx: PresetContext<BhPipelineComparisonProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      jobA = MOCK_JOB_A,
      jobB = MOCK_JOB_B,
      onSwap,
      showDelta = true,
      onStageClick,
      className,
      style,
    } = props;


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

    /* Compute paired stages for comparison */
    const pairedStages = useMemo(() => {
      const stageNames = new Set([
        ...jobA.stages.map(s => s.name),
        ...jobB.stages.map(s => s.name),
      ]);
      return Array.from(stageNames).map(name => ({
        name,
        a: jobA.stages.find(s => s.name === name) ?? null,
        b: jobB.stages.find(s => s.name === name) ?? null,
      }));
    }, [jobA, jobB]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const colorA = t.colors.primaryScale;
    const colorB = t.colors.secondaryScale ?? t.colors.infoScale;

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
              <BarChart3 size={18} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Pipeline Comparison
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                Side-by-side analysis of two job pipelines
              </Text>
            </Box>
          </Box>
          {onSwap && (
            <button
              onClick={handleSwap}
              aria-label="Swap job positions"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: t.borderRadius.md,
                border: `1px solid ${t.colors.neutral[200]}`,
                backgroundColor: t.colors.common.white,
                cursor: 'pointer',
                transition: `all ${t.motion.hover}`,
                padding: 0,
              }}
            >
              <ArrowLeftRight size={16} color={t.colors.neutral[500]} />
            </button>
          )}
        </Box>

        {/* Job headers */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: showDelta ? '1fr auto 1fr' : '1fr 1fr',
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {/* Job A header */}
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            borderRight: `1px solid ${t.colors.neutral[100]}`,
            ...animStyle(0),
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
              <Box style={{ width: 4, height: 16, borderRadius: t.borderRadius.sm, backgroundColor: colorA[500], flexShrink: 0 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {jobA.title}
              </Text>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Users size={12} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{jobA.totalCandidates}</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Clock size={12} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{jobA.timeToHireDays}d</Text>
              </Box>
              <Box style={{
                ...createBadgeStyle(t, getConversionBadge(jobA.overallConversionRate)),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[1]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{jobA.overallConversionRate}%</Text>
              </Box>
            </Box>
          </Box>

          {/* Delta header */}
          {showDelta && (
            <Box style={{
              padding: `${t.spacing[3]}px ${t.spacing[3]}px`,
              borderRight: `1px solid ${t.colors.neutral[100]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: t.colors.neutral[50],
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                Delta
              </Text>
            </Box>
          )}

          {/* Job B header */}
          <Box style={{
            padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
            ...animStyle(1),
          }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
              <Box style={{ width: 4, height: 16, borderRadius: t.borderRadius.sm, backgroundColor: colorB[500], flexShrink: 0 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {jobB.title}
              </Text>
            </Box>
            <Box style={{ display: 'flex', gap: t.spacing[3] }}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Users size={12} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{jobB.totalCandidates}</Text>
              </Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                <Clock size={12} color={t.colors.neutral[400]} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{jobB.timeToHireDays}d</Text>
              </Box>
              <Box style={{
                ...createBadgeStyle(t, getConversionBadge(jobB.overallConversionRate)),
                borderRadius: badgeRadius,
                padding: `0 ${t.spacing[1]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{jobB.overallConversionRate}%</Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Stage rows */}
        <Box role="list" aria-label="Pipeline stage comparison">
          {pairedStages.map((pair, i) => {
            const convDelta = (pair.a?.conversionRate ?? 0) - (pair.b?.conversionRate ?? 0);
            const daysDelta = (pair.a?.avgDaysInStage ?? 0) - (pair.b?.avgDaysInStage ?? 0);
            const maxCandidates = Math.max(pair.a?.candidateCount ?? 0, pair.b?.candidateCount ?? 0, 1);

            return (
              <Box
                key={pair.name}
                role="listitem"
                style={{
                  display: 'grid',
                  gridTemplateColumns: showDelta ? '1fr auto 1fr' : '1fr 1fr',
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  ...animStyle(i + 2),
                }}
              >
                {/* Job A stage */}
                <Box
                  tabIndex={0}
                  aria-label={`${jobA.title} ${pair.name}: ${pair.a?.candidateCount ?? 0} candidates, ${pair.a?.conversionRate ?? 0}% conversion`}
                  onClick={() => pair.a && handleStageClick(jobA.id, pair.name)}
                  onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && pair.a) { e.preventDefault(); handleStageClick(jobA.id, pair.name); } }}
                  style={{
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderRight: `1px solid ${t.colors.neutral[100]}`,
                    cursor: pair.a ? 'pointer' : 'default',
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                      {pair.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                      {pair.a?.conversionRate ?? 0}%
                    </Text>
                  </Box>
                  {/* Mini bar */}
                  <Box style={{ height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                    <Box style={{
                      height: '100%',
                      width: `${((pair.a?.candidateCount ?? 0) / maxCandidates) * 100}%`,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: colorA[400],
                      transition: 'width 0.6s ease',
                    }} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1] }}>
                    {pair.a?.candidateCount ?? 0} candidates - {pair.a?.avgDaysInStage ?? 0}d avg
                  </Text>
                </Box>

                {/* Delta column */}
                {showDelta && (
                  <Box style={{ 
                    padding: `${t.spacing[3]}px ${t.spacing[2]}px`,
                    borderRight: `1px solid ${t.colors.neutral[100]}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: t.spacing[1],
                    backgroundColor: t.colors.neutral[50],
                    minWidth: 60,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: getDeltaColor(convDelta, t) }}>
                      {getDeltaLabel(convDelta, '%')}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: getDeltaColor(daysDelta, t, true) }}>
                      {getDeltaLabel(daysDelta, 'd')}
                    </Text>
                  </Box>
                )}

                {/* Job B stage */}
                <Box
                  tabIndex={0}
                  aria-label={`${jobB.title} ${pair.name}: ${pair.b?.candidateCount ?? 0} candidates, ${pair.b?.conversionRate ?? 0}% conversion`}
                  onClick={() => pair.b && handleStageClick(jobB.id, pair.name)}
                  onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && pair.b) { e.preventDefault(); handleStageClick(jobB.id, pair.name); } }}
                  style={{
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    cursor: pair.b ? 'pointer' : 'default',
                    transition: `background-color ${t.motion.hover}`,
                  }}
                >
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[700] }}>
                      {pair.name}
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                      {pair.b?.conversionRate ?? 0}%
                    </Text>
                  </Box>
                  <Box style={{ height: 6, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                    <Box style={{
                      height: '100%',
                      width: `${((pair.b?.candidateCount ?? 0) / maxCandidates) * 100}%`,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: colorB[400],
                      transition: 'width 0.6s ease',
                    }} />
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginTop: t.spacing[1] }}>
                    {pair.b?.candidateCount ?? 0} candidates - {pair.b?.avgDaysInStage ?? 0}d avg
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Summary footer */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: showDelta ? '1fr auto 1fr' : '1fr 1fr',
          borderTop: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
        }}>
          <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderRight: `1px solid ${t.colors.neutral[100]}` }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: colorA[600] }}>
              Overall: {jobA.overallConversionRate}% - {jobA.timeToHireDays}d
            </Text>
          </Box>
          {showDelta && (
            <Box style={{
              padding: `${t.spacing[3]}px ${t.spacing[2]}px`,
              borderRight: `1px solid ${t.colors.neutral[100]}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 60,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: getDeltaColor(jobA.overallConversionRate - jobB.overallConversionRate, t) }}>
                {getDeltaLabel(jobA.overallConversionRate - jobB.overallConversionRate, '%')}
              </Text>
            </Box>
          )}
          <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: colorB[600] }}>
              Overall: {jobB.overallConversionRate}% - {jobB.timeToHireDays}d
            </Text>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
