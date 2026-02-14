'use client';

/**
 * BhSprintVelocity - Compact Preset
 * Condensed bar chart widget with key velocity stats.
 * Designed for sidebar or dashboard widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  BarChart3, Zap, Activity,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getChartConfig,
} from '../../../helpers';
import type { BhSprintVelocityProps, SprintVelocityData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_SPRINTS: SprintVelocityData[] = [
  { sprintName: 'Sprint 7', planned: 32, completed: 28, carryOver: 4 },
  { sprintName: 'Sprint 8', planned: 35, completed: 30, carryOver: 5 },
  { sprintName: 'Sprint 9', planned: 30, completed: 30, carryOver: 0 },
  { sprintName: 'Sprint 10', planned: 38, completed: 32, carryOver: 6 },
  { sprintName: 'Sprint 11', planned: 36, completed: 34, carryOver: 2 },
  { sprintName: 'Sprint 12', planned: 40, completed: 25, carryOver: 0 },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhSprintVelocity = createPreset<BhSprintVelocityProps>({
  name: 'BhSprintVelocity.Compact',
  render: (ctx: PresetContext<BhSprintVelocityProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);
    const chartCfg = getChartConfig(t);

    const {
      sprints = MOCK_SPRINTS,
      averageVelocity,
      title,
      onSprintClick,
      loading = false,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const handleSprintClick = useCallback((name: string) => {
      onSprintClick?.(name);
    }, [onSprintClick]);

    const avgVel = useMemo(() => {
      if (averageVelocity !== undefined) return averageVelocity;
      if ((sprints ?? []).length === 0) return 0;
      return Math.round((sprints ?? []).reduce((sum, s) => sum + (s.completed ?? 0), 0) / (sprints ?? []).length);
    }, [averageVelocity, sprints]);

    const maxVal = useMemo(() => Math.max(...(sprints ?? []).map(s => s.planned ?? 0), 1), [sprints]);

    const trend = useMemo(() => {
      if (sprints.length < 2) return 0;
      const recent = (sprints ?? []).slice(-3);
      const older = (sprints ?? []).slice(-6, -3);
      if (older.length === 0) return 0;
      const recentAvg = recent.reduce((s, d) => s + (d.completed ?? 0), 0) / recent.length;
      const olderAvg = older.reduce((s, d) => s + (d.completed ?? 0), 0) / older.length;
      return Math.round(((recentAvg - olderAvg) / Math.max(olderAvg, 1)) * 100);
    }, [sprints]);

    if (loading) {
      return (
        <Box className={className} style={{ ...card, ...animStyle, ...style }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[4] }}>
            <Activity size={20} color={t.colors.neutral[300]} style={{ animation: 'pulse 1.5s infinite' }} />
          </Box>
        </Box>
      );
    }

    return (
      <Box
        className={className}
        role="region"
        aria-label="Sprint velocity"
        style={{
          ...card,
          width: '100%',
          padding: 0,
          overflow: 'hidden',
          ...animStyle,
          ...style,
        }}
      >
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
            <BarChart3 size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Velocity
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{
              ...createBadgeStyle(t, trend >= 0 ? 'success' : 'warning'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {trend >= 0 ? '+' : ''}{trend}%
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Stats */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box role="status" aria-label={`Average velocity: ${avgVel}`} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' }}>
            <Zap size={12} color={t.colors.primaryScale[500]} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
              {avgVel}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Avg</Text>
          </Box>
          <Box role="status" aria-label={`${sprints.length} sprints`} style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], textAlign: 'center' }}>
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
              {sprints.length}
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Sprints</Text>
          </Box>
        </Box>

        {/* Mini bar chart */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          {sprints.length === 0 ? (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No sprint data
              </Text>
            </Box>
          ) : (
            <Box style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 48 }}>
              {sprints.map(sprint => {
                const pct = ((sprint.completed ?? 0) / maxVal) * 100;
                return (
                  <Box
                    key={sprint.sprintName}
                    tabIndex={onSprintClick ? 0 : undefined}
                    role={onSprintClick ? 'button' : undefined}
                    aria-label={onSprintClick ? `${sprint.sprintName}: ${sprint.completed} completed` : undefined}
                    onClick={onSprintClick ? () => handleSprintClick((sprint.sprintName ?? '')) : undefined}
                    onKeyDown={onSprintClick ? (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSprintClick((sprint.sprintName ?? '')); } } : undefined}
                    style={{
                      flex: 1,
                      height: `${pct}%`,
                      minHeight: 4,
                      backgroundColor: t.colors.successScale[400],
                      borderRadius: t.borderRadius.sm,
                      cursor: onSprintClick ? 'pointer' : 'default',
                      transition: `height ${chartCfg.animationDuration}ms ease, background-color ${t.motion.hover}`,
                    }}
                  />
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
