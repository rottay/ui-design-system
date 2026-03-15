'use client';

/**
 * BhOutreachResponse - Analytics Preset
 * Heatmap grid of response rates by hour and day of week,
 * overall rate gauge, and best time recommendation. Personality-driven, glass-aware.
 */

import { useMemo } from 'react';
import {
  BarChart3, Clock, TrendingUp, Star,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
  createPersonalityAccentBar,

  createCardHoverStyles,
  createDividerStyle,
  formatAbbreviated,
} from '../../../helpers';
import type { BhOutreachResponseProps, ResponseData } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

function generateMockData(): ResponseData[] {
  const data: ResponseData[] = [];
  for (let d = 0; d < 7; d++) {
    for (const h of HOURS) {
      const base = d < 5 ? 0.15 : 0.05;
      const peak = (h >= 9 && h <= 11) || (h >= 14 && h <= 16) ? 0.2 : 0;
      const rate = Math.min(0.6, base + peak + Math.random() * 0.15);
      data.push({ hour: h, dayOfWeek: d, responseRate: Math.round(rate * 100) / 100, count: Math.floor(rate * 50) });
    }
  }
  return data;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getHeatColor(rate: number, t: DesignTokens): string {
  if (rate >= 0.4) return t.colors.successScale[500];
  if (rate >= 0.3) return t.colors.successScale[300];
  if (rate >= 0.2) return t.colors.warningScale[400];
  if (rate >= 0.1) return t.colors.warningScale[200];
  return t.colors.neutral[100];
}

/* ================================================================== */
/*  Analytics Preset                                                   */
/* ================================================================== */

export const AnalyticsBhOutreachResponse = createPreset<BhOutreachResponseProps>({
  name: 'BhOutreachResponse.Analytics',
  render: (ctx: PresetContext<BhOutreachResponseProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);

    const {
      data: rawData = undefined,
      overallResponseRate = 28.5,
      bestTime = { hour: 10, day: 'Tuesday' },
      title = 'Response Analytics',
      channel,
      period,
      loading,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : [] as ResponseData[];

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);

    const heatmapGrid = useMemo(() => {
      const grid: Record<string, ResponseData> = {};
      data.forEach(d => { grid[`${d.dayOfWeek}-${d.hour}`] = d; });
      return grid;
    }, [data]);

    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    const rateColor = useMemo(() => {
      if (overallResponseRate >= 30) return t.colors.successScale[600];
      if (overallResponseRate >= 20) return t.colors.warningScale[600];
      return t.colors.errorScale[600];
    }, [overallResponseRate, t]);

    const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);

    const divider = useMemo(() => createDividerStyle(t), [t]);

    return (
      <Box
        className={className}
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: t.colors.neutral[50],
          fontFamily: 'inherit',
          overflow: 'auto',
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[6]}px ${t.spacing[7]}px`,
          backgroundColor: t.colors.common.white,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          ...(isGlass && t.glass ? { backdropFilter: t.glass.blur, WebkitBackdropFilter: t.glass.blur, backgroundColor: t.glass.bg } : {}),
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[4] }}>
            <Box style={createIconContainerStyle(t, { size: 44, color: t.colors.primaryScale[50] })}>
              <BarChart3 size={22} color={t.colors.primaryScale[600]} />
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
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[500]}}>
                  Response patterns and optimal send times
                </Text>
                {channel && (
                  <Box style={{
                    ...createBadgeStyle(t, 'secondary'),
                    borderRadius: badgeRadius,
                    padding: `1px ${t.spacing[2]}px`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, textTransform: 'capitalize' as const }}>{channel}</Text>
                  </Box>
                )}
                {period && (
                  <Box style={{
                    ...createBadgeStyle(t, 'info'),
                    borderRadius: badgeRadius,
                    padding: `1px ${t.spacing[2]}px`,
                  }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs }}>{period}</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box style={{ padding: t.spacing[7], flex: 1 }}>
          {/* Stats row */}
          <Box style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: t.spacing[4],
            marginBottom: t.spacing[6],
          }}>
            <Box style={{ ...card, ...animStyle(0) }} role="status" aria-label={`Overall response rate: ${overallResponseRate}%`}>
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.successScale[50] })}>
                  <TrendingUp size={18} color={rateColor} />
                </Box>
                <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                  <Text style={{ fontSize: t.typography.fontSize['2xl'], fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                    {overallResponseRate}%
                  </Text>
                  <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                    Overall Response Rate
                  </Text>
                </Box>
              </Box>
            </Box>
            {bestTime && (
              <Box style={{ ...card, ...animStyle(1) }} role="status" aria-label={`Best time: ${bestTime.day} at ${bestTime.hour}:00`}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
                  <Box style={createIconContainerStyle(t, { size: 36, color: t.colors.warningScale[50] })}>
                    <Star size={18} color={t.colors.warningScale[600]} />
                  </Box>
                  <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
                    <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900], display: 'block' }}>
                      {bestTime.day}, {bestTime.hour}:00
                    </Text>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textTransform: ptypo.labelTransform, letterSpacing: ptypo.labelLetterSpacing }}>
                      Best Time to Send
                    </Text>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {/* Heatmap */}
          <Box style={{ ...card, ...animStyle(2) }}>
            <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Response Heatmap</Text>
            <Box style={{ overflowX: 'auto' }}>
              {/* Hour labels row */}
              <Box style={{ display: 'flex', gap: t.spacing[1], marginBottom: t.spacing[1], paddingLeft: 40 }}>
                {HOURS.map(h => (
                  <Box key={h} style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>{h}:00</Text>
                  </Box>
                ))}
              </Box>
              {/* Day rows */}
              {DAYS.map((day, di) => (
                <Box key={day} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1], marginBottom: t.spacing[1] }}>
                  <Box style={{ width: 36, flexShrink: 0 }}>
                    <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500], textAlign: 'right' }}>{day}</Text>
                  </Box>
                  {HOURS.map(h => {
                    const cell = heatmapGrid[`${di}-${h}`];
                    const rate = cell?.responseRate ?? 0;
                    return (
                      <Box
                        key={h}
                        role="gridcell"
                        aria-label={`${day} ${h}:00 - ${(rate * 100).toFixed(0)}% response rate`}
                        style={{
                          width: 36,
                          height: 24,
                          borderRadius: t.borderRadius.sm,
                          backgroundColor: getHeatColor(rate, t),
                          flexShrink: 0,
                          transition: `background-color ${t.motion.hover}`,
                        }}
                      />
                    );
                  })}
                </Box>
              ))}
              {/* Legend */}
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginTop: t.spacing[3], paddingLeft: 40 }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Low</Text>
                {[t.colors.neutral[100], t.colors.warningScale[200], t.colors.warningScale[400], t.colors.successScale[300], t.colors.successScale[500]].map((c, i) => (
                  <Box key={i} style={{ width: 20, height: 10, borderRadius: 2, backgroundColor: c }} />
                ))}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>High</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  },
});
