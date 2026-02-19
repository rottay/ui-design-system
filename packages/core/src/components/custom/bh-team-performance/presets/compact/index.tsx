'use client';

/**
 * BhTeamPerformance - Compact Preset
 * Horizontal inline bar chart showing a single metric across teams.
 */

import { useMemo, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  Users,
  Loader2,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityBadgeRadius,
  getPersonalityTypography,
  createEntranceAnimation,
  createStaggerDelay,
  createProgressBarStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
} from '../../../helpers';
import type { BhTeamPerformanceProps, TeamPerfData } from '../../core';

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const METRIC_LABELS: Record<string, string> = {
  hires: 'Hires',
  timeToFill: 'Time to Fill (days)',
  qualityScore: 'Quality Score',
  satisfaction: 'Satisfaction',
};

/* ------------------------------------------------------------------ */
/*  Compact Preset                                                     */
/* ------------------------------------------------------------------ */
export const CompactBhTeamPerformance = createPreset<BhTeamPerformanceProps>({
  name: 'BhTeamPerformance.Compact',
  render: ({ primitives, props, tokens }: PresetContext<BhTeamPerformanceProps>) => {
    const isGlass = tokens.surface.useGlass;
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      teams: teamsProp,
      metric: controlledMetric,
      title = 'Team Performance',
      onTeamClick,
      loading,
      className,
      style,
    } = props;

    const teams = teamsProp?.length ? teamsProp : [];
    const activeMetric = controlledMetric ?? 'hires';

    /* -- Styles ---------------------------------------------------- */
    const card = useMemo(() => createCardStyle(t, { padding: t.spacing[5] }), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const badgeR = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const typo = useMemo(() => getPersonalityTypography(t), [t]);
    const handleTeamClick = useCallback((teamName: string) => { onTeamClick?.(teamName); }, [onTeamClick]);

    const values = useMemo(() => teams.map((team, i) => team[activeMetric]), [teams, activeMetric]);
    const maxValue = useMemo(() => Math.max(...values, 1), [values]);

    const barColors = useMemo(() => [
      t.colors.primaryScale[500],
      t.colors.successScale[500],
      t.colors.warningScale[500],
      t.colors.infoScale[500],
      t.colors.secondaryScale[500],
      t.colors.errorScale[500],
    ], [t]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    if (loading) {
      return (
        <Box className={className} style={{ ...animStyle(0), ...card, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
          <Loader2 size={18} style={{ color: t.colors.primaryScale[500], animation: 'spin 1s linear infinite' }} />
          <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500], marginLeft: t.spacing[2] }}>Loading...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...card, width: '100%', ...entrance.animate, ...style }}>
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginBottom: t.spacing[4] }}>
          <BarChart3 size={16} style={{ color: t.colors.primaryScale[500] }} />
          <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: typo.headingWeight, color: t.colors.neutral[900], letterSpacing: typo.headingLetterSpacing }}>
            {title}
          </Text>
          <Box style={{ ...createBadgeStyle(t, 'info'), borderRadius: badgeR, marginLeft: 'auto' }}>
            <Text style={{ fontSize: 'inherit' }}>{METRIC_LABELS[activeMetric] || activeMetric}</Text>
          </Box>
        </Box>

        {/* Horizontal bars */}
        <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3] }}>
          {teams.map((team, idx) => {
            const val = team[activeMetric];
            const pct = maxValue > 0 ? (val / maxValue) * 100 : 0;
            const color = barColors[idx % barColors.length];
            const bar = createProgressBarStyle(t, { color, percent: pct });
            const rowEntrance = createEntranceAnimation(t, { index: idx });

            return (
              <Box
                key={team.teamName}
                role={onTeamClick ? 'button' : undefined}
                tabIndex={onTeamClick ? 0 : undefined}
                aria-label={onTeamClick ? `View ${team.teamName} team` : undefined}
                onClick={onTeamClick ? () => handleTeamClick(team.teamName) : undefined}
                onKeyDown={onTeamClick ? (e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTeamClick(team.teamName); }
                } : undefined}
                onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                style={{
                  ...animStyle(idx),
                  display: 'flex',
                  alignItems: 'center',
                  gap: t.spacing[3],
                  cursor: onTeamClick ? 'pointer' : 'default',
                  ...rowEntrance.animate,
                }}
              >
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600], width: 80, flexShrink: 0, textAlign: 'right' as const }}>
                  {team.teamName}
                </Text>
                <Box style={{ ...bar.track, flex: 1, height: 8 }}>
                  <Box style={bar.fill} />
                </Box>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.semibold, color: t.colors.neutral[700], width: 36, textAlign: 'right' as const }}>
                  {val}
                </Text>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
