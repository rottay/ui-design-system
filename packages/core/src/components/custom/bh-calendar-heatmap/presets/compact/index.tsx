'use client';

/**
 * BhCalendarHeatmap - Compact Preset
 * Condensed monthly summary with mini heatmap strips.
 */

import { useState, useMemo, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhCalendarHeatmapProps, HeatmapDay } from '../../core';
import type { DesignTokens } from '../../../../../types';

function generateMockDays(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date();
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    days.push({ date: dateStr, count: isWeekend ? 0 : Math.floor(Math.random() * 5) });
  }
  return days;
}

const MOCK_DAYS = generateMockDays();

function getHeatColor(count: number, max: number, t: DesignTokens): string {
  if (count === 0) return t.colors.neutral[100];
  const intensity = count / Math.max(max, 1);
  if (intensity <= 0.25) return t.colors.primaryScale[100];
  if (intensity <= 0.5) return t.colors.primaryScale[200];
  if (intensity <= 0.75) return t.colors.primaryScale[400];
  return t.colors.primaryScale[600];
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const CompactBhCalendarHeatmap = createPreset<BhCalendarHeatmapProps>({
  name: 'BhCalendarHeatmap.Compact',
  render: (ctx: PresetContext<BhCalendarHeatmapProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      days: rawDays = MOCK_DAYS,
      activityLabel = 'interviews',
      className,
      style,
    } = props;

    const days = Array.isArray(rawDays) ? rawDays : MOCK_DAYS;


    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);

    const maxCount = useMemo(() => Math.max(...days.map(d => d.count ?? 0), 1), [days]);
    const total = useMemo(() => days.reduce((s, d) => s + (d.count ?? 0), 0), [days]);

    /* Group by month */
    const months = useMemo(() => {
      const map = new Map<string, HeatmapDay[]>();
      days.forEach(day => {
        const month = (day.date ?? '').slice(0, 7);
        if (!map.has(month)) map.set(month, []);
        map.get(month)!.push(day);
      });
      return Array.from(map.entries()).map(([month, monthDays]) => ({
        label: MONTH_LABELS[parseInt(month.slice(5, 7)) - 1],
        total: monthDays.reduce((s, d) => s + (d.count ?? 0), 0),
        days: monthDays,
      }));
    }, [days]);

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
        <Box style={{
          padding: `${t.spacing[3]}px ${t.spacing[4]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          backgroundColor: t.colors.neutral[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Calendar size={14} color={t.colors.primaryScale[500]} />
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[800],
            }}>
              Activity
            </Text>
          </Box>
          <Box style={{
            ...createBadgeStyle(t, 'primary'),
            borderRadius: badgeRadius,
            padding: `1px ${t.spacing[2]}px`,
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs }}>{total} {activityLabel}</Text>
          </Box>
        </Box>

        <Box role="list" aria-label="Monthly activity" style={{ padding: `${t.spacing[3]}px ${t.spacing[4]}px` }}>
          {months.length === 0 && (
            <Box style={{ ...createEmptyStateStyle(t), padding: t.spacing[3] }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>No data</Text>
            </Box>
          )}
          {months.map((month) => (
            <Box key={month.label} role="listitem" style={{ marginBottom: t.spacing[2] }}>
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[1] }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[600] }}>
                  {month.label}
                </Text>
                <Text style={{ fontSize: t.typography.fontSize.xs, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[800] }}>
                  {month.total}
                </Text>
              </Box>
              <Box style={{ display: 'flex', gap: t.spacing[1], flexWrap: 'wrap' }}>
                {month.days.map((day) => (
                  <Box
                    key={day.date}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 1,
                      backgroundColor: getHeatColor((day.count ?? 0), maxCount, t),
                      transition: `background-color ${t.motion.hover}`,
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
});
