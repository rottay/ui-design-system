'use client';

/**
 * BhSourceEffectiveness - Detailed Preset
 * Grouped bars showing applicant volume, qualified, and hired counts
 * with a hire rate line overlay. Glass-aware, personality-driven.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Globe, Users, Award, TrendingUp, Star,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getChartConfig,
  createEmptyStateStyle,
  getAccentAwareLayout,
} from '../../../helpers';
import type { BhSourceEffectivenessProps, SourceMetrics } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const MOCK_SOURCES: SourceMetrics[] = [
  { source: 'LinkedIn', applicants: 420, qualified: 168, hired: 34, hireRate: 8.1, qualityScore: 82 },
  { source: 'Indeed', applicants: 680, qualified: 136, hired: 22, hireRate: 3.2, qualityScore: 58 },
  { source: 'Referrals', applicants: 95, qualified: 62, hired: 28, hireRate: 29.5, qualityScore: 94 },
  { source: 'Career Page', applicants: 310, qualified: 124, hired: 18, hireRate: 5.8, qualityScore: 72 },
  { source: 'University', applicants: 180, qualified: 90, hired: 15, hireRate: 8.3, qualityScore: 76 },
];

/* ================================================================== */
/*  Detailed Preset                                                    */
/* ================================================================== */

export const DetailedBhSourceEffectiveness = createPreset<BhSourceEffectivenessProps>({
  name: 'BhSourceEffectiveness.Detailed',
  render: (ctx: PresetContext<BhSourceEffectivenessProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);
    const chartCfg = getChartConfig(t);

    const {
      sources: rawSources = MOCK_SOURCES,
      title = 'Source Effectiveness',
      onSourceClick,
      selectedSource,
      loading,
      className,
      style,
    } = props;

    const sources = Array.isArray(rawSources) ? rawSources : MOCK_SOURCES;

    const [hoveredSource, setHoveredSource] = useState<string | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const maxApplicants = useMemo(() => Math.max(...sources.map(s => s.applicants), 1), [sources]);

    const handleSourceClick = useCallback((source: string) => {
      onSourceClick?.(source);
    }, [onSourceClick]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const sortedSources = useMemo(
      () => [...sources].sort((a, b) => b.hireRate - a.hireRate),
      [sources],
    );

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
          ...accentLayout.outer,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>

        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <Globe size={20} color={t.colors.primaryScale[600]} />
            </Box>
            <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
              <Text style={{
                fontSize: t.typography.fontSize.lg,
                fontWeight: ptypo.headingWeight,
                color: t.colors.neutral[900],
                letterSpacing: ptypo.headingLetterSpacing,
              }}>
                {title}
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500]}}>
                Volume, quality, and hire rate by source
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Legend */}
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[50]}`,
          display: 'flex',
          gap: t.spacing[4],
        }}>
          {[
            { label: 'Applicants', color: t.colors.primaryScale[300] },
            { label: 'Qualified', color: t.colors.primaryScale[500] },
            { label: 'Hired', color: t.colors.successScale[500] },
          ].map(item => (
            <Box key={item.label} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
              <Box style={{ width: 10, height: 10, borderRadius: t.borderRadius.sm, backgroundColor: item.color, flexShrink: 0 }} />
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{item.label}</Text>
            </Box>
          ))}
        </Box>

        {/* Source rows */}
        <Box style={{ padding: t.spacing[5] }}>
          {sources.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Globe size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No source data available
              </Text>
            </Box>
          )}

          <Box role="list" aria-label="Source effectiveness metrics" style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[4] }}>
            {sortedSources.map((source, i) => {
              const isHovered = hoveredSource === source.source;
              const isSelected = selectedSource === source.source;
              const applicantPct = (source.applicants / maxApplicants) * 100;
              const qualifiedPct = (source.qualified / maxApplicants) * 100;
              const hiredPct = (source.hired / maxApplicants) * 100;

              return (
                <Box
                  key={source.source}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${source.source}: ${source.applicants} applicants, ${source.hired} hired, ${source.hireRate}% hire rate`}
                  onClick={() => handleSourceClick(source.source)}
                  onMouseEnter={() => setHoveredSource(source.source)}
                  onMouseLeave={() => setHoveredSource(null)}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSourceClick(source.source);
                    }
                  }}
                  style={{
                    ...animStyle(i),
                    padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
                    borderRadius: t.borderRadius.lg,
                    border: isSelected
                      ? `1px solid ${t.colors.primaryScale[200]}`
                      : `1px solid ${t.colors.neutral[100]}`,
                    backgroundColor: isSelected
                      ? t.colors.primaryScale[50]
                      : isHovered
                        ? t.colors.neutral[50]
                        : t.colors.common.white,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  {/* Source name + hire rate */}
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[3] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize.sm,
                      fontWeight: t.typography.fontWeight.semibold,
                      color: t.colors.neutral[800],
                    }}>
                      {source.source}
                    </Text>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{
                        ...createBadgeStyle(t, source.hireRate >= 10 ? 'success' : source.hireRate >= 5 ? 'warning' : 'error'),
                        borderRadius: badgeRadius,
                      }}>
                        <TrendingUp size={10} style={{ marginRight: 3 }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{source.hireRate}%</Text>
                      </Box>
                      <Box style={{
                        ...createBadgeStyle(t, source.qualityScore >= 80 ? 'success' : source.qualityScore >= 60 ? 'info' : 'warning'),
                        borderRadius: badgeRadius,
                      }}>
                        <Star size={10} style={{ marginRight: 3 }} />
                        <Text style={{ fontSize: t.typography.fontSize.xs }}>{source.qualityScore}</Text>
                      </Box>
                    </Box>
                  </Box>

                  {/* Grouped bars */}
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    {/* Applicants bar */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ flex: 1, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                        <Box style={{
                          height: '100%',
                          width: `${applicantPct}%`,
                          backgroundColor: t.colors.primaryScale[300],
                          borderRadius: t.borderRadius.full,
                          transition: `width ${chartCfg.animationDuration}ms ease`,
                        }} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 36, textAlign: 'right' }}>
                        {source.applicants}
                      </Text>
                    </Box>
                    {/* Qualified bar */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ flex: 1, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                        <Box style={{
                          height: '100%',
                          width: `${qualifiedPct}%`,
                          backgroundColor: t.colors.primaryScale[500],
                          borderRadius: t.borderRadius.full,
                          transition: `width ${chartCfg.animationDuration}ms ease`,
                        }} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 36, textAlign: 'right' }}>
                        {source.qualified}
                      </Text>
                    </Box>
                    {/* Hired bar */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                      <Box style={{ flex: 1, height: 8, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[100], overflow: 'hidden' }}>
                        <Box style={{
                          height: '100%',
                          width: `${hiredPct}%`,
                          backgroundColor: t.colors.successScale[500],
                          borderRadius: t.borderRadius.full,
                          transition: `width ${chartCfg.animationDuration}ms ease`,
                        }} />
                      </Box>
                      <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], width: 36, textAlign: 'right' }}>
                        {source.hired}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
