'use client';

/**
 * BhOutreachResponse - Compact Preset
 * Condensed response rate summary with best time indicator.
 */

import { useState, useMemo, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Star, Clock,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createProgressBarStyle,
} from '../../../helpers';
import type { BhOutreachResponseProps } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhOutreachResponse = createPreset<BhOutreachResponseProps>({
  name: 'BhOutreachResponse.Compact',
  render: (ctx: PresetContext<BhOutreachResponseProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      overallResponseRate = 28.5,
      bestTime = { hour: 10, day: 'Tuesday' },
      channel,
      period,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const progressBar = useMemo(
      () => createProgressBarStyle(t, { percent: overallResponseRate, color: overallResponseRate >= 30 ? t.colors.successScale[500] : t.colors.warningScale[500] }),
      [t, overallResponseRate],
    );

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
            <BarChart3 size={16} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Response Rate
            </Text>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            {channel && (
              <Box style={{
                ...createBadgeStyle(t, 'secondary'),
                borderRadius: badgeRadius,
                padding: `1px ${t.spacing[1]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>{channel}</Text>
              </Box>
            )}
            {period && (
              <Box style={{
                ...createBadgeStyle(t, 'info'),
                borderRadius: badgeRadius,
                padding: `1px ${t.spacing[1]}px`,
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs }}>{period}</Text>
              </Box>
            )}
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          {/* Overall rate */}
          <Box role="status" aria-label={`Overall response rate: ${overallResponseRate}%`} style={{ marginBottom: t.spacing[3] }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: t.spacing[1] }}>
              <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                {overallResponseRate}%
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>response rate</Text>
            </Box>
            <Box style={progressBar.track}>
              <Box style={progressBar.fill} />
            </Box>
          </Box>

          {/* Best time */}
          {bestTime && (
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: t.spacing[2],
              padding: `${t.spacing[2]}px ${t.spacing[3]}px`,
              borderRadius: t.borderRadius.md,
              backgroundColor: t.colors.warningScale[50],
              border: `1px solid ${t.colors.warningScale[200]}`,
            }} role="status" aria-label={`Best send time: ${bestTime.day} at ${bestTime.hour}:00`}>
              <Star size={14} color={t.colors.warningScale[600]} />
              <Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.medium, color: t.colors.warningScale[700] }}>
                  Best: {bestTime.day} at {bestTime.hour}:00
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
