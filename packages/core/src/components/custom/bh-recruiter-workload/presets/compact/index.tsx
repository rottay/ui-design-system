'use client';

/**
 * BhRecruiterWorkload - Compact Preset
 * Condensed workload bars for sidebar or widget placement.
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Scale, AlertTriangle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createProgressBarStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhRecruiterWorkloadProps, RecruiterWorkload } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_RECRUITERS: RecruiterWorkload[] = [
  { recruiterId: 'r-1', name: 'Alice Morgan', activePositions: 6, capacity: 8, interviews: 12, pendingTasks: 5 },
  { recruiterId: 'r-2', name: 'Bob Chen', activePositions: 8, capacity: 8, interviews: 15, pendingTasks: 10 },
  { recruiterId: 'r-3', name: 'Carla Ruiz', activePositions: 4, capacity: 8, interviews: 8, pendingTasks: 3 },
  { recruiterId: 'r-4', name: 'Dan Patel', activePositions: 10, capacity: 8, interviews: 20, pendingTasks: 14 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getUtilizationColor(pct: number, t: DesignTokens): string {
  if (pct > 100) return t.colors.errorScale[500];
  if (pct >= 85) return t.colors.warningScale[500];
  return t.colors.successScale[500];
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhRecruiterWorkload = createPreset<BhRecruiterWorkloadProps>({
  name: 'BhRecruiterWorkload.Compact',
  render: (ctx: PresetContext<BhRecruiterWorkloadProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      recruiters = MOCK_RECRUITERS,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const overloadedCount = useMemo(() => recruiters.filter(r => r.activePositions > r.capacity).length, [recruiters]);

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
            <Scale size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Workload
            </Text>
          </Box>
          {overloadedCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{overloadedCount} over</Text>
            </Box>
          )}
        </Box>

        {/* Workload bars */}
        <Box style={{ padding: `${t.spacing[2]}px ${t.spacing[4]}px` }}>
          {recruiters.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No data
              </Text>
            </Box>
          )}
          {recruiters.map((r) => {
            const pct = Math.round((r.activePositions / r.capacity) * 100);
            const color = getUtilizationColor(pct, t);
            const bar = createProgressBarStyle(t, { percent: Math.min(pct, 100), color });
            return (
              <Box key={r.recruiterId} style={{ marginBottom: t.spacing[2] }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[700] }}>{r.name}</Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: pct > 100 ? t.colors.errorScale[600] : t.colors.neutral[500] }}>
                    {pct}%
                  </Text>
                </Box>
                <Box style={bar.track}><Box style={bar.fill} /></Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
