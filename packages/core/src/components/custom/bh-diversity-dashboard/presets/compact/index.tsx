'use client';

/**
 * BhDiversityDashboard - Compact Preset
 * Condensed diversity overview with mini stacked bars.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Heart,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
} from '../../../helpers';
import type { BhDiversityDashboardProps, DiversityMetric } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const SEGMENT_COLORS = (t: DesignTokens) => [
  t.colors.primaryScale[500],
  t.colors.secondaryScale[500],
  t.colors.successScale[500],
  t.colors.warningScale[500],
  t.colors.infoScale[500],
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_METRICS: DiversityMetric[] = [
  {
    category: 'Gender',
    segments: [
      { label: 'Female', count: 456, percentage: 42 },
      { label: 'Male', count: 534, percentage: 49 },
      { label: 'Other', count: 100, percentage: 9 },
    ],
  },
  {
    category: 'Ethnicity',
    segments: [
      { label: 'White', count: 380, percentage: 35 },
      { label: 'Asian', count: 280, percentage: 26 },
      { label: 'Hispanic', count: 185, percentage: 17 },
      { label: 'Other', count: 245, percentage: 22 },
    ],
  },
];

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhDiversityDashboard = createPreset<BhDiversityDashboardProps>({
  name: 'BhDiversityDashboard.Compact',
  render: (ctx: PresetContext<BhDiversityDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const colors = useMemo(() => SEGMENT_COLORS(t), [t]);

    const {
      metrics = MOCK_METRICS,
      totalCandidates = 1090,
      onSegmentClick,
      className,
      style,
    } = props;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const handleClick = useCallback((category: string, label: string) => {
      onSegmentClick?.(category, label);
    }, [onSegmentClick]);

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
            <Heart size={16} color={t.colors.secondaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Diversity
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
            {totalCandidates.toLocaleString()}
          </Text>
        </Box>

        {/* Metric bars */}
        <Box role="list" aria-label="Diversity metrics">
          {metrics.slice(0, 4).map((metric) => (
            <Box
              key={metric.category}
              role="listitem"
              aria-label={metric.category}
              style={{
                padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                borderBottom: `1px solid ${t.colors.neutral[50]}`,
              }}
            >
              <Text style={{
                fontSize: t.typography.fontSize.xs,
                fontWeight: t.typography.fontWeight.medium,
                color: t.colors.neutral[700],
                marginBottom: t.spacing[1],
              }}>
                {metric.category}
              </Text>
              {/* Mini stacked bar */}
              <Box style={{
                display: 'flex',
                height: 6,
                borderRadius: t.borderRadius.full,
                overflow: 'hidden',
                marginBottom: t.spacing[1],
              }}>
                {metric.segments.map((seg, si) => (
                  <Box
                    key={seg.label}
                    role="button"
                    tabIndex={0}
                    aria-label={`${seg.label}: ${seg.percentage}%`}
                    onClick={() => handleClick(metric.category, seg.label)}
                    onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(metric.category, seg.label); } }}
                    style={{
                      flex: seg.percentage,
                      backgroundColor: colors[si % colors.length],
                      cursor: 'pointer',
                      transition: `flex ${t.motion.hover}`,
                    }}
                  />
                ))}
              </Box>
              {/* Mini legend */}
              <Box style={{ display: 'flex', gap: t.spacing[2], flexWrap: 'wrap' }}>
                {metric.segments.slice(0, 3).map((seg, si) => (
                  <Box key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box style={{
                      width: 6, height: 6,
                      borderRadius: t.borderRadius.full,
                      backgroundColor: colors[si % colors.length],
                    }} />
                    <Text style={{ fontSize: 9, color: t.colors.neutral[500] }}>
                      {seg.label} {seg.percentage}%
                    </Text>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
          {metrics.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[4] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                No data
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
