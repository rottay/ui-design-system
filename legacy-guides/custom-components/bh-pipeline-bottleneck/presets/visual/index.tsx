'use client';

/**
 * BhPipelineBottleneck - Visual Preset
 * Animated pipeline visualization with bottleneck glow effect,
 * candidate count per stage, and narrowing pipeline at bottleneck.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle, Users, Clock, ArrowRight,
  ChevronRight, Zap, Activity,
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

  createDividerStyle,
  createPersonalitySkeletonStyle,
} from '../../../helpers';
import type {
  BhPipelineBottleneckProps,
  BottleneckStage,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStageColor(stage: BottleneckStage, t: DesignTokens): string {
  if (stage.isBottleneck) return t.colors.errorScale[500];
  const ratio = (stage.avgDaysInStage ?? 0) / Math.max(stage.expectedDays ?? 1, 1);
  if (ratio > 1.5) return t.colors.warningScale[500];
  if (ratio > 1) return t.colors.warningScale[300];
  return t.colors.successScale[500];
}

function getStageBg(stage: BottleneckStage, t: DesignTokens): string {
  if (stage.isBottleneck) return t.colors.errorScale[50];
  const ratio = (stage.avgDaysInStage ?? 0) / Math.max(stage.expectedDays ?? 1, 1);
  if (ratio > 1.5) return t.colors.warningScale[50];
  if (ratio > 1) return t.colors.warningScale[50];
  return t.colors.successScale[50];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_TOTAL = 362;

/* ================================================================== */
/*  Visual Preset                                                      */
/* ================================================================== */

export const VisualBhPipelineBottleneck = createPreset<BhPipelineBottleneckProps>({
  name: 'BhPipelineBottleneck.Visual',
  render: (ctx: PresetContext<BhPipelineBottleneckProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      stages: rawStages = [],
      totalCandidates = MOCK_TOTAL,
      summary,
      onStageClick,
      className,
      style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];

    const [hoveredStage, setHoveredStage] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

    const handleStageClick = useCallback((stageId: string) => {
      onStageClick?.(stageId);
    }, [onStageClick]);

    const maxCandidates = useMemo(
      () => Math.max(...(stages ?? []).map(s => s.candidateCount ?? 0), 1),
      [stages],
    );

    const bottleneckStage = useMemo(
      () => (stages ?? []).find(s => s.isBottleneck),
      [stages],
    );

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const divider = useMemo(() => createDividerStyle(t), [t]);

    const skeleton = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

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
            <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.errorScale[50] })}>
              <Zap size={18} color={t.colors.errorScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.md,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                Pipeline Bottleneck Analysis
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                {totalCandidates} candidates across {stages.length} stages{summary?.worstStage ? ` | Worst: ${summary.worstStage}` : ''}{summary?.avgResolutionDays != null ? ` | Avg ${summary.avgResolutionDays}d` : ''}
              </Text>
            </Box>
          </Box>
          {bottleneckStage && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <AlertTriangle size={12} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>Bottleneck: {bottleneckStage.name ?? 'Unknown'}</Text>
            </Box>
          )}
        </Box>

        {/* Visual pipeline */}
        <Box style={{ padding: t.spacing[5] }}>
          {/* Pipeline visualization - narrowing funnel */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            gap: t.spacing[2],
            marginBottom: t.spacing[6],
          }} role="list" aria-label="Pipeline stages visualization">
            {(stages ?? []).map((stage, i) => {
              const widthPct = ((stage.candidateCount ?? 0) / maxCandidates) * 100;
              const stageColor = getStageColor(stage, t);
              const isHovered = hoveredStage === stage.id;
              const isBottleneck = stage.isBottleneck;

              return (
                <Box
                  key={stage.id}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    ...animStyle(i),
                  }}
                  role="listitem"
                >
                  {/* Stage bar (narrowing) */}
                  <Box
                    tabIndex={0}
                    aria-label={`${stage.name ?? 'Unknown'}: ${stage.candidateCount ?? 0} candidates, ${stage.avgDaysInStage ?? 0} days average${isBottleneck ? ', bottleneck' : ''}`}
                    onClick={() => stage.id && handleStageClick(stage.id)}
                    onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && stage.id) { e.preventDefault(); handleStageClick(stage.id); } }}
                    onMouseEnter={() => setHoveredStage((stage.id ?? null))}
                    onMouseLeave={() => setHoveredStage(null)}
                    style={{
                      width: `${Math.max(widthPct, 20)}%`,
                      height: 48,
                      borderRadius: t.borderRadius.md,
                      backgroundColor: isHovered ? stageColor : getStageBg(stage, t),
                      border: `2px solid ${stageColor}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: `all ${t.motion.hover}`,
                      position: 'relative',
                      boxShadow: isBottleneck
                        ? `0 0 12px ${t.colors.errorScale[200]}, 0 0 24px ${t.colors.errorScale[100]}`
                        : 'none',
                    }}
                  >
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.bold,
                      color: isHovered ? t.colors.common.white : stageColor,
                    }}>
                      {stage.candidateCount ?? 0}
                    </Text>
                    {isBottleneck && (
                      <Box style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 12,
                        height: 12,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: t.colors.errorScale[500],
                        animation: 'pulse 2s ease-in-out infinite',
                      }} />
                    )}
                  </Box>

                  {/* Arrow connector */}
                  {i < stages.length - 1 && (
                    <Box style={{
                      position: 'absolute',
                      right: -t.spacing[2],
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}>
                      <ChevronRight size={12} color={t.colors.neutral[300]} />
                    </Box>
                  )}

                  {/* Stage name */}
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: isBottleneck ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                    color: isBottleneck ? t.colors.errorScale[700] : t.colors.neutral[600],
                    marginTop: t.spacing[2],
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}>
                    {stage.name ?? 'Unknown'}
                  </Text>
                </Box>
              );
            })}
          </Box>

          {/* Days-in-stage bars */}
          <Box>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[3] }}>Days in Stage</Text>
            <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
              {(stages ?? []).map((stage, i) => {
                const maxDays = Math.max(...(stages ?? []).map(s => s.avgDaysInStage ?? 0), 1);
                const barWidth = ((stage.avgDaysInStage ?? 0) / maxDays) * 100;
                const expectedWidth = ((stage.expectedDays ?? 0) / maxDays) * 100;
                const stageColor = getStageColor(stage, t);

                return (
                  <Box key={stage.id} style={{ ...animStyle(stages.length + i) }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{
                          fontSize: t.typography.fontSize.xs,
                          fontWeight: stage.isBottleneck ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                          color: stage.isBottleneck ? t.colors.errorScale[700] : t.colors.neutral[700],
                          minWidth: 80,
                        }}>
                          {stage.name ?? 'Unknown'}
                        </Text>
                        {stage.isBottleneck && (
                          <Box style={{
                            ...createBadgeStyle(t, 'error'),
                            borderRadius: badgeRadius,
                            padding: `0 ${t.spacing[1]}px`,
                          }}>
                            <Text style={{ fontSize: t.typography.fontSize.xs }}>Bottleneck</Text>
                          </Box>
                        )}
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {stage.avgDaysInStage ?? 0}d / {stage.expectedDays ?? 0}d expected
                      </Text>
                    </Box>
                    <Box style={{ position: 'relative', height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                      {/* Expected marker */}
                      <Box style={{
                        position: 'absolute',
                        left: `${expectedWidth}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        backgroundColor: t.colors.neutral[300],
                        zIndex: 2,
                      }} />
                      {/* Actual bar */}
                      <Box style={{
                        height: '100%',
                        width: `${barWidth}%`,
                        borderRadius: t.borderRadius.full,
                        backgroundColor: stageColor,
                        transition: `width 0.6s ease`,
                      }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
