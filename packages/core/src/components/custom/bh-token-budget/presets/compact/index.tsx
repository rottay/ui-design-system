'use client';

/**
 * BhTokenBudget - Compact Preset
 * Condensed budget summary with mini progress bars.
 * Designed for sidebar or widget placement.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Wallet, AlertTriangle, DollarSign,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createProgressBarStyle,
  createIconContainerStyle,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhTokenBudgetProps, BudgetAllocation } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_ALLOCATIONS: BudgetAllocation[] = [
  { teamId: 't-1', teamName: 'Engineering', allocated: 5000, used: 3200, alertThreshold: 80 },
  { teamId: 't-2', teamName: 'Product', allocated: 3000, used: 2700, alertThreshold: 75 },
  { teamId: 't-3', teamName: 'Design', allocated: 2000, used: 800, alertThreshold: 90 },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhTokenBudget = createPreset<BhTokenBudgetProps>({
  name: 'BhTokenBudget.Compact',
  render: (ctx: PresetContext<BhTokenBudgetProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      allocations: rawAllocations = MOCK_ALLOCATIONS,
      totalBudget = 10000,
      totalUsed = 6700,
      currency = '$',
      className,
      style,
    } = props;

    const allocations = Array.isArray(rawAllocations) ? rawAllocations : MOCK_ALLOCATIONS;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const totalPct = useMemo(() => totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0, [totalBudget, totalUsed]);

    const overallProgress = useMemo(() => createProgressBarStyle(t, {
      percent: totalPct,
      color: totalPct > 90 ? t.colors.errorScale[500] : totalPct > 70 ? t.colors.warningScale[500] : undefined,
    }), [t, totalPct]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
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
            <Wallet size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Budget
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
            {totalPct.toFixed(0)}%
          </Text>
        </Box>

        {/* Overall progress */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px`, borderBottom: `1px solid ${t.colors.neutral[100]}` }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {currency}{totalUsed.toLocaleString()} used
            </Text>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
              {currency}{totalBudget.toLocaleString()}
            </Text>
          </Box>
          <Box style={overallProgress.track}>
            <Box style={overallProgress.fill} />
          </Box>
        </Box>

        {/* Team list */}
        <Box role="list" aria-label="Team budget allocations">
          {allocations.slice(0, 5).map((alloc) => {
            const usePct = alloc.allocated > 0 ? (alloc.used / alloc.allocated) * 100 : 0;
            const isOverThreshold = usePct >= alloc.alertThreshold;
            const prog = createProgressBarStyle(t, {
              percent: usePct,
              color: isOverThreshold ? t.colors.errorScale[500] : undefined,
            });

            return (
              <Box
                key={alloc.teamId}
                role="listitem"
                aria-label={`${alloc.teamName}: ${usePct.toFixed(0)}% used`}
                style={{
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                }}
              >
                <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                  }}>
                    {alloc.teamName}
                  </Text>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
                    {isOverThreshold && <AlertTriangle size={10} color={t.colors.errorScale[500]} />}
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                      {usePct.toFixed(0)}%
                    </Text>
                  </Box>
                </Box>
                <Box style={{ ...prog.track, height: 4 }}>
                  <Box style={prog.fill} />
                </Box>
              </Box>
            );
          })}
          {allocations.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No allocations
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
