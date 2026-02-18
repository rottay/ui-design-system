'use client';

/**
 * BhPositionSla - Compact Preset
 * Condensed SLA countdown list for sidebar/widgets.
 * Personality-driven, glass-aware.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhPositionSlaProps, PositionSlaData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getStatusColor(status: PositionSlaData['status'], t: DesignTokens): string {
  switch (status) {
    case 'on-track': return t.colors.successScale[500];
    case 'at-risk': return t.colors.warningScale[500];
    case 'breached': return t.colors.errorScale[500];
  }
}

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhPositionSla = createPreset<BhPositionSlaProps>({
  name: 'BhPositionSla.Compact',
  render: (ctx: PresetContext<BhPositionSlaProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      positions: rawPositions = [],
      onPositionClick,
      className,
      style,
    } = props;

    const positions = Array.isArray(rawPositions) ? rawPositions : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    const sorted = useMemo(
      () => [...positions].sort((a, b) => a.daysRemaining - b.daysRemaining),
      [positions],
    );

    const atRiskCount = useMemo(
      () => positions.filter(p => p.status !== 'on-track').length,
      [positions],
    );

    const handleClick = useCallback((id: string) => {
      onPositionClick?.(id);
    }, [onPositionClick]);

    return (
      <Box
        className={className}
        style={{ ...card, ...animStyle, padding: 0, overflow: 'hidden', ...style }}
      >
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Clock size={14} color={t.colors.warningScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              SLA
            </Text>
          </Box>
          {atRiskCount > 0 && (
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
              padding: `1px ${t.spacing[2]}px`,
            }}>
              <AlertTriangle size={10} style={{ marginRight: 2 }} />
              <Text style={{ fontSize: t.typography.fontSize.xs }}>{atRiskCount}</Text>
            </Box>
          )}
        </Box>

        <Box role="list" aria-label="SLA positions">
          {sorted.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No positions</Text>
            </Box>
          )}
          {sorted.map((pos) => {
            const statusColor = getStatusColor(pos.status, t);

            return (
              <Box
                key={pos.id}
                role="listitem"
                tabIndex={0}
                aria-label={`${pos.positionTitle}: ${pos.daysRemaining} days remaining`}
                onClick={() => handleClick(pos.id)}
                onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(pos.id); } }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[2],
                  padding: `${t.spacing[2]}px ${t.spacing[4]}px`,
                  borderBottom: `1px solid ${t.colors.neutral[50]}`,
                  borderLeft: `2px solid ${statusColor}`,
                  cursor: 'pointer',
                  backgroundColor: t.colors.common.white,
                  transition: `background-color ${t.motion.hover}`,
                }}
              >
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1], flex: 1, minWidth: 0 }}>
                  <Text style={{
                    fontSize: t.typography.fontSize.xs,
                    fontWeight: t.typography.fontWeight.medium,
                    color: t.colors.neutral[800],
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {pos.positionTitle}
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                    {pos.clientName}
                  </Text>
                </Box>
                <Text style={{
                  fontSize: t.typography.fontSize.xs,
                  fontWeight: t.typography.fontWeight.bold,
                  color: statusColor,
                  flexShrink: 0,
                }}>
                  {pos.daysRemaining <= 0 ? `${Math.abs(pos.daysRemaining)}d over` : `${pos.daysRemaining}d`}
                </Text>
                <ChevronRight size={12} color={t.colors.neutral[300]} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
