'use client';

/**
 * BhDiversityDashboard - Dashboard Preset
 * Full diversity metrics view with horizontal stacked bars per category,
 * segment legend, stats summary, and click-to-filter interaction.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Heart, Users, BarChart3, PieChart,
  ChevronRight,
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
  createEmptyStateStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalityAccentBar,
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
  t.colors.errorScale[400],
  t.colors.primaryScale[300],
  t.colors.secondaryScale[300],
];

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

/* ================================================================== */
/*  Dashboard Preset                                                   */
/* ================================================================== */

export const DashboardBhDiversityDashboard = createPreset<BhDiversityDashboardProps>({
  name: 'BhDiversityDashboard.Dashboard',
  render: (ctx: PresetContext<BhDiversityDashboardProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = getPersonalityBadgeRadius(t);
    const ptypo = getPersonalityTypography(t);

    const {
      metrics: rawMetrics = [],
      totalCandidates = 0,
      title = 'Diversity & Inclusion',
      onSegmentClick,
      loading,
      className,
      style,
    } = props;

    const metrics = Array.isArray(rawMetrics) ? rawMetrics : [];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const colors = useMemo(() => SEGMENT_COLORS(t), [t]);

    const handleSegmentClick = useCallback((category: string, label: string) => {
      onSegmentClick?.(category, label);
    }, [onSegmentClick]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    return (
      <Box
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
              <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.secondaryScale[50] })}>
                <Heart size={22} color={t.colors.secondaryScale[600]} />
              </Box>
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                <Text style={{
                  fontSize: t.typography.fontSize.xl,
                  fontWeight: ptypo.headingWeight,
                  color: t.colors.neutral[900],
                  letterSpacing: ptypo.headingLetterSpacing,
                }}>
                  {title}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  {totalCandidates.toLocaleString()} total candidates across {metrics.length} categories
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>

          {/* Summary Cards */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: t.spacing[4],
            marginBottom: t.spacing[7],
          }}>
            {[
              { label: 'Total Candidates', value: totalCandidates.toLocaleString(), icon: Users, color: t.colors.primaryScale },
              { label: 'Categories', value: metrics.length.toString(), icon: PieChart, color: t.colors.secondaryScale },
              { label: 'Segments', value: metrics.reduce((s, m) => s + (m.segments ?? []).length, 0).toString(), icon: BarChart3, color: t.colors.infoScale },
            ].map((sc, i) => {
              const Icon = sc.icon;
              return (
                <Box
                  key={sc.label}
                  style={{ ...card, ...hoverStyles.base, ...animStyle(i) }}
                  role="status"
                  aria-label={`${sc.label}: ${sc.value}`}
                >
                  {accentBar && <Box style={accentBar} />}

                  <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[2] }}>
                    <Box style={createIconContainerStyle(t, { size: 32, color: sc.color[50] })}>
                      <Icon size={16} color={sc.color[600]} />
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{
                      fontSize: t.typography.fontSize['2xl'],
                      fontWeight: t.typography.fontWeight.bold,
                      color: t.colors.neutral[900],
                      display: 'block',
                    }}>
                      {sc.value}
                    </Text>
                    <Text style={{
                      fontSize: t.typography.fontSize.xs,
                      color: t.colors.neutral[500],
                      textTransform: ptypo.labelTransform,
                      letterSpacing: ptypo.labelLetterSpacing,
                    }}>
                      {sc.label}
                    </Text>
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Metrics Cards */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: t.spacing[5],
          }}>
            {metrics.map((metric, mi) => (
              <Box key={metric.category} style={{ ...card, ...animStyle(mi + 3) }}>
                <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>{metric.category}</Text>

                {/* Stacked horizontal bar */}
                <Box style={{
                  display: 'flex',
                  height: 12,
                  borderRadius: t.borderRadius.full,
                  overflow: 'hidden',
                  marginBottom: t.spacing[4],
                }} role="img" aria-label={`${metric.category} distribution`}>
                  {(metric.segments ?? []).map((seg, si) => (
                    <Box
                      key={seg.label}
                      style={{
                        flex: seg.percentage ?? 0,
                        backgroundColor: colors[si % colors.length],
                        transition: `flex ${t.motion.hover}`,
                      }}
                    />
                  ))}
                </Box>

                {/* Legend */}
                <Box style={{ display: 'flex', flexDirection: 'column', gap: t.spacing[2] }}>
                  {(metric.segments ?? []).map((seg, si) => (
                    <Box
                      key={seg.label}
                      role="button"
                      tabIndex={0}
                      aria-label={`${seg.label}: ${seg.count ?? 0} (${seg.percentage ?? 0}%)`}
                      onClick={() => handleSegmentClick((metric.category ?? ''), (seg.label ?? ''))}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSegmentClick((metric.category ?? ''), (seg.label ?? '')); } }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        padding: `${t.spacing[1]}px 0`,
                      }}
                    >
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Box style={{
                          width: 10,
                          height: 10,
                          borderRadius: t.borderRadius.full,
                          backgroundColor: colors[si % colors.length],
                          flexShrink: 0,
                        }} />
                        <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[700] }}>
                          {seg.label}
                        </Text>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                        <Text style={{ fontSize: t.typography.fontSize.sm, fontWeight: t.typography.fontWeight.medium, color: t.colors.neutral[900] }}>
                          {seg.count ?? 0}
                        </Text>
                        <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
                          {seg.percentage ?? 0}%
                        </Text>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {metrics.length === 0 && (
            <Box style={createEmptyStateStyle(t)}>
              <Heart size={32} style={{ marginBottom: t.spacing[2], opacity: 0.4 }} />
              <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>
                No diversity data available
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
