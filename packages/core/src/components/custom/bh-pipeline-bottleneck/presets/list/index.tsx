'use client';

/**
 * BhPipelineBottleneck - List Preset
 * Ranked list of slow stages with bottleneck indicators,
 * candidate counts, and days-in-stage metrics.
 * Designed for sidebar or widget placement.
 */

import { useMemo, useCallback } from 'react';
import {
  AlertTriangle, Clock, Users, ChevronRight, Zap,
  TrendingUp, ArrowRight,
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
  BhPipelineBottleneckProps,
  BottleneckStage,
} from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStageStatusColor(stage: BottleneckStage, t: DesignTokens): string {
  if (stage.isBottleneck) return t.colors.errorScale[500];
  const ratio = (stage.avgDaysInStage ?? 0) / Math.max(stage.expectedDays ?? 1, 1);
  if (ratio > 1.5) return t.colors.warningScale[500];
  if (ratio > 1) return t.colors.warningScale[300];
  return t.colors.successScale[500];
}

function getStageStatusBadge(stage: BottleneckStage): 'error' | 'warning' | 'success' {
  if (stage.isBottleneck) return 'error';
  const ratio = (stage.avgDaysInStage ?? 0) / Math.max(stage.expectedDays ?? 1, 1);
  if (ratio > 1) return 'warning';
  return 'success';
}

function getDelayLabel(stage: BottleneckStage): string {
  const diff = (stage.avgDaysInStage ?? 0) - (stage.expectedDays ?? 0);
  if (diff <= 0) return 'On track';
  return `+${diff}d over`;
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_TOTAL = 362;

/* ================================================================== */
/*  List Preset                                                        */
/* ================================================================== */

export const ListBhPipelineBottleneck = createPreset<BhPipelineBottleneckProps>({
  name: 'BhPipelineBottleneck.List',
  render: (ctx: PresetContext<BhPipelineBottleneckProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      stages: rawStages = [],
      totalCandidates = MOCK_TOTAL,
      summary,
      onStageClick,
      className,
      style,
    } = props;

    const stages = Array.isArray(rawStages) ? rawStages : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const handleStageClick = useCallback((stageId: string) => {
      onStageClick?.(stageId);
    }, [onStageClick]);

    /* Sort stages: bottlenecks first, then by delay ratio */
    const sortedStages = useMemo(() => {
      return [...stages].sort((a, b) => {
        if (a.isBottleneck !== b.isBottleneck) return a.isBottleneck ? -1 : 1;
        const ratioA = (a.avgDaysInStage ?? 0) / Math.max(a.expectedDays ?? 1, 1);
        const ratioB = (b.avgDaysInStage ?? 0) / Math.max(b.expectedDays ?? 1, 1);
        return ratioB - ratioA;
      });
    }, [stages]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Zap size={16} color={t.colors.errorScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Bottleneck Analysis
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {totalCandidates} candidates
          </Text>
        </Box>

        {/* Summary metrics */}
        {summary && (
          <Box style={{
            display: 'flex',
            gap: t.spacing[4],
            padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
            borderBottom: `1px solid ${t.colors.neutral[100]}`,
            backgroundColor: t.colors.neutral[50],
          }}>
            {summary.totalBottlenecks != null && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Bottlenecks: <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[600] }}>{summary.totalBottlenecks}</Text>
              </Text>
            )}
            {summary.worstStage && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Worst: <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.errorScale[600] }}>{summary.worstStage}</Text>
              </Text>
            )}
            {summary.avgResolutionDays != null && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Avg resolution: <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700] }}>{summary.avgResolutionDays}d</Text>
              </Text>
            )}
            {summary.costImpact != null && (
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                Cost impact: <Text style={{ fontWeight: t.typography.fontWeight.semibold, color: t.colors.warningScale[700] }}>${summary.costImpact.toLocaleString()}</Text>
              </Text>
            )}
          </Box>
        )}

        {/* Stage list */}
        <Box role="list" aria-label="Pipeline stages ranked by delay">
          {sortedStages.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Zap size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No stage data available
              </Text>
            </Box>
          )}
          {sortedStages.map((stage, i) => {
            const statusColor = getStageStatusColor(stage, t);
            const maxDays = Math.max(...(stages ?? []).map(s => s.avgDaysInStage ?? 0), 1);
            const barWidth = ((stage.avgDaysInStage ?? 0) / maxDays) * 100;

            return (
              <Box
                key={stage.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${stage.name ?? 'Unknown'}: ${stage.candidateCount ?? 0} candidates, ${stage.avgDaysInStage ?? 0} days average, ${stage.isBottleneck ? 'bottleneck' : getDelayLabel(stage)}`}
                onClick={() => stage.id && handleStageClick(stage.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if ((e.key === 'Enter' || e.key === ' ') && stage.id) { e.preventDefault(); handleStageClick(stage.id); } }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: t.spacing[2],
                  padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: `3px solid ${statusColor}`,
                  cursor: 'pointer',
                  backgroundColor: t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                  ...entrance.animate,
                  transitionDelay: `${createStaggerDelay(t, i)}ms`,
                }}
              >
                {/* Top row: name + badges */}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: stage.isBottleneck ? t.typography.fontWeight.bold : t.typography.fontWeight.medium,
                      color: stage.isBottleneck ? t.colors.errorScale[700] : t.colors.neutral[800],
                    }}>
                      {stage.name ?? 'Unknown'}
                    </Text>
                    {stage.isBottleneck && (
                      <Box style={{
                        ...createBadgeStyle(t, 'error'),
                        borderRadius: badgeRadius,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: `0 ${t.spacing[2]}px`,
                      }}>
                        <AlertTriangle size={10} />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>Bottleneck</Text>
                      </Box>
                    )}
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Users size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {stage.candidateCount ?? 0}
                      </Text>
                    </Box>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                      <Clock size={12} color={t.colors.neutral[400]} />
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                        {stage.avgDaysInStage ?? 0}d
                      </Text>
                    </Box>
                    <ChevronRight size={14} color={t.colors.neutral[300]} />
                  </Box>
                </Box>

                {/* Days bar */}
                <Box style={{
                  position: 'relative',
                  height: 6,
                  borderRadius: t.borderRadius.full,
                  backgroundColor: t.colors.neutral[100],
                  overflow: 'hidden',
                }}>
                  <Box style={{
                    height: '100%',
                    width: `${barWidth}%`,
                    borderRadius: t.borderRadius.full,
                    backgroundColor: statusColor,
                    transition: 'width 0.6s ease',
                  }} />
                </Box>

                {/* Delay label */}
                <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box style={{
                    ...createBadgeStyle(t, getStageStatusBadge(stage)),
                    borderRadius: badgeRadius,
                    padding: `0 ${t.spacing[1]}px`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{getDelayLabel(stage)}</Text>
                  </Box>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                    Expected: {stage.expectedDays ?? 0}d
                  </Text>
                </Box>
              </Box>
            );
          })}
        </Box>
        </Box>
      </Box>
    );
  },
});
