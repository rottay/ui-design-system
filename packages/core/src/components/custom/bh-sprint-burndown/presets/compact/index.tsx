'use client';

/**
 * BhSprintBurndown - Compact Preset
 * Condensed burndown mini-chart with key metrics.
 * Designed for sidebar or widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  TrendingDown, Activity,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createProgressBarStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getChartConfig,
} from '../../../helpers';
import type { BhSprintBurndownProps, BurndownDataPoint } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getVelocityBadge(data: BurndownDataPoint[], t: DesignTokens): 'success' | 'warning' | 'error' | 'info' {
  if ((data ?? []).length < 2) return 'info';
  const last = data[data.length - 1];
  const ratio = (last?.actual ?? 0) / Math.max(last?.ideal ?? 1, 1);
  if (ratio <= 1) return 'success';
  if (ratio <= 1.15) return 'info';
  if (ratio <= 1.3) return 'warning';
  return 'error';
}

function getVelocityLabel(data: BurndownDataPoint[]): string {
  if ((data ?? []).length < 2) return 'No data';
  const last = data[data.length - 1];
  const ratio = (last?.actual ?? 0) / Math.max(last?.ideal ?? 1, 1);
  if (ratio <= 1) return 'Ahead';
  if (ratio <= 1.15) return 'On Track';
  if (ratio <= 1.3) return 'Slightly Behind';
  return 'Behind';
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhSprintBurndown = createPreset<BhSprintBurndownProps>({
  name: 'BhSprintBurndown.Compact',
  render: (ctx: PresetContext<BhSprintBurndownProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass && !!t.glass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);
    const chartCfg = getChartConfig(t);

    const {
      data: rawData = [],
      sprintName = 'Sprint 12',
      totalPoints = 40,
      daysTotal = 10,
      daysElapsed = 7,
      title,
      loading = false,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const remainingPoints = useMemo(() => {
      if ((data ?? []).length === 0) return totalPoints ?? 0;
      return data[data.length - 1]?.actual ?? 0;
    }, [data, totalPoints]);

    const completedPct = useMemo(
      () => Math.round(((totalPoints - remainingPoints) / totalPoints) * 100),
      [totalPoints, remainingPoints],
    );

    const progress = useMemo(() => createProgressBarStyle(t, { percent: completedPct }), [t, completedPct]);

    /* Mini sparkline */
    const sparkW = 200;
    const sparkH = 40;

    const maxPts = useMemo(() => Math.max(totalPoints ?? 0, ...(data ?? []).map(d => Math.max(d.ideal ?? 0, d.actual ?? 0))), [data, totalPoints]);
    const maxDay = useMemo(() => Math.max(daysTotal ?? 0, ...(data ?? []).map(d => d.day ?? 0)), [data, daysTotal]);

    const sparkline = useMemo(() => {
      if (data.length === 0) return '';
      return data.map((d, i) => {
        const x = ((d.day ?? 0) / maxDay) * sparkW;
        const y = (1 - (d.actual ?? 0) / maxPts) * sparkH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    }, [data, maxDay, maxPts]);

    const idealLine = useMemo(() => {
      if (data.length === 0) return '';
      return data.map((d, i) => {
        const x = ((d.day ?? 0) / maxDay) * sparkW;
        const y = (1 - (d.ideal ?? 0) / maxPts) * sparkH;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ');
    }, [data, maxDay, maxPts]);

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
        aria-label={`Burndown: ${sprintName}`}
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
            <TrendingDown size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              {sprintName}
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, getVelocityBadge(data, t)),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{getVelocityLabel(data)}</Text>
          </Box>
        </Box>

        {/* Stats row */}
        <Box style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          {[
            { label: 'Remaining', value: remainingPoints },
            { label: 'Day', value: `${daysElapsed}/${daysTotal}` },
            { label: 'Done', value: `${completedPct}%` },
          ].map(s => (
            <Box key={s.label} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }} role="status" aria-label={`${s.label}: ${s.value}`}>
              <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                {s.value}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {s.label}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Mini chart */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          {data.length === 0 ? (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No data yet
              </Text>
            </Box>
          ) : (
            <Box>
              <svg
                width="100%"
                viewBox={`0 0 ${sparkW} ${sparkH}`}
                role="img"
                aria-label="Burndown sparkline"
                style={{ display: 'block' }}
              >
                <path d={idealLine} fill="none" stroke={t.colors.neutral[200]} strokeWidth={1.5} strokeDasharray="3 2" />
                <path d={sparkline} fill="none" stroke={t.colors.primaryScale[500]} strokeWidth={2} strokeLinecap="round" />
              </svg>
              <Box style={{ ...progress.track, marginTop: t.spacing[2], height: 4 }}>
                <Box style={{ ...progress.fill, height: 4 }} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
