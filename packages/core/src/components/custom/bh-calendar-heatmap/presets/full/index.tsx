'use client';

/**
 * BhCalendarHeatmap - Full Preset
 * 12-month GitHub-style activity heatmap using SVG cells.
 * Personality-driven colors and glass-aware surface.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Calendar, Activity } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createEmptyStateStyle,
} from '../../../helpers';
import type { BhCalendarHeatmapProps, HeatmapDay } from '../../core';
import type { DesignTokens } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Mock data generator                                                */
/* ------------------------------------------------------------------ */

function generateMockDays(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const now = new Date();
  for (let i = 364; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 0 : Math.floor(Math.random() * 6);
    const count = Math.random() > 0.3 ? base : 0;
    days.push({ date: dateStr, count });
  }
  return days;
}

const MOCK_DAYS = generateMockDays();

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getHeatColor(count: number, max: number, t: DesignTokens): string {
  if (count === 0) return t.colors.neutral[100];
  const intensity = count / Math.max(max, 1);
  if (intensity <= 0.25) return t.colors.primaryScale[100];
  if (intensity <= 0.5) return t.colors.primaryScale[200];
  if (intensity <= 0.75) return t.colors.primaryScale[400];
  return t.colors.primaryScale[600];
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', 'Wed', 'Fri'];

/* ================================================================== */
/*  Full Preset                                                        */
/* ================================================================== */

export const FullBhCalendarHeatmap = createPreset<BhCalendarHeatmapProps>({
  name: 'BhCalendarHeatmap.Full',
  render: (ctx: PresetContext<BhCalendarHeatmapProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);
    const badgeRadius = getPersonalityBadgeRadius(t);

    const {
      days: rawDays = MOCK_DAYS,
      title = 'Interview Activity',
      activityLabel = 'interviews',
      onDayClick,
      selectedDate,
      className,
      style,
    } = props;

    const days = Array.isArray(rawDays) ? rawDays : MOCK_DAYS;

    const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);

    const maxCount = useMemo(() => Math.max(...days.map(d => d.count ?? 0), 1), [days]);
    const totalActivity = useMemo(() => days.reduce((s, d) => s + (d.count ?? 0), 0), [days]);

    /* Build week columns */
    const { weeks, monthPositions } = useMemo(() => {
      const dayMap = new Map(days.map(d => [d.date, d.count ?? 0]));
      const weeksCols: Array<Array<{ date: string; count: number; dayOfWeek: number }>> = [];
      const monthPos: Array<{ label: string; weekIndex: number }> = [];

      if (days.length === 0) return { weeks: weeksCols, monthPositions: monthPos };

      const startDate = new Date(days[0].date ?? '');
      const endDate = new Date(days[days.length - 1].date ?? '');
      let currentDate = new Date(startDate);
      let currentWeek: Array<{ date: string; count: number; dayOfWeek: number }> = [];
      let lastMonth = -1;

      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        const dayOfWeek = currentDate.getDay();
        const month = currentDate.getMonth();

        if (dayOfWeek === 0 && currentWeek.length > 0) {
          weeksCols.push(currentWeek);
          currentWeek = [];
        }

        if (month !== lastMonth) {
          monthPos.push({ label: MONTH_LABELS[month], weekIndex: weeksCols.length });
          lastMonth = month;
        }

        currentWeek.push({
          date: dateStr,
          count: dayMap.get(dateStr) ?? 0,
          dayOfWeek,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      if (currentWeek.length > 0) {
        weeksCols.push(currentWeek);
      }

      return { weeks: weeksCols, monthPositions: monthPos };
    }, [days]);

    const cellSize = 12;
    const cellGap = 2;
    const leftPad = 30;
    const topPad = 20;
    const svgW = leftPad + weeks.length * (cellSize + cellGap) + 10;
    const svgH = topPad + 7 * (cellSize + cellGap) + 10;

    const handleDayClick = useCallback((date: string, count: number) => {
      onDayClick?.(date, count);
    }, [onDayClick]);

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
          ...accentLayout.outer,
          ...animStyle,
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentLayout.inner}>
        {/* Header */}
        <Box style={{
          padding: `${t.spacing[5]}px ${t.spacing[6]}px`,
          borderBottom: `1px solid ${t.colors.neutral[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[3] }}>
            <Box style={createIconContainerStyle(t, { size: 40, color: t.colors.primaryScale[50] })}>
              <Calendar size={20} color={t.colors.primaryScale[600]} />
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
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>
                {totalActivity.toLocaleString()} {activityLabel} in the past year
              </Text>
            </Box>
          </Box>
          {hoveredDay && (
            <Box style={{
              ...createBadgeStyle(t, 'info'),
              borderRadius: badgeRadius,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs }}>
                {hoveredDay.date}: {hoveredDay.count ?? 0} {activityLabel}
              </Text>
            </Box>
          )}
        </Box>

        {/* Heatmap grid */}
        <Box style={{ padding: t.spacing[5], overflow: 'auto' }}>
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            role="img"
            aria-label={`Calendar heatmap showing ${totalActivity} ${activityLabel} over the past year`}
            style={{ display: 'block', maxWidth: '100%' }}
          >
            {/* Month labels */}
            {monthPositions.map((mp, i) => (
              <text
                key={`${mp.label}-${i}`}
                x={leftPad + mp.weekIndex * (cellSize + cellGap)}
                y={12}
                fill={t.colors.neutral[400]}
                fontSize={10}
              >
                {mp.label}
              </text>
            ))}

            {/* Day labels */}
            {DAY_LABELS.map((label, i) => {
              const dayIndex = [1, 3, 5][i];
              return (
                <text
                  key={label}
                  x={0}
                  y={topPad + dayIndex * (cellSize + cellGap) + cellSize - 2}
                  fill={t.colors.neutral[400]}
                  fontSize={9}
                >
                  {label}
                </text>
              );
            })}

            {/* Cells */}
            {weeks.map((week, wi) => (
              <g key={wi}>
                {week.map((day) => {
                  const x = leftPad + wi * (cellSize + cellGap);
                  const y = topPad + day.dayOfWeek * (cellSize + cellGap);
                  const isSelected = selectedDate === day.date;

                  return (
                    <rect
                      key={day.date}
                      x={x}
                      y={y}
                      width={cellSize}
                      height={cellSize}
                      rx={2}
                      fill={getHeatColor(day.count, maxCount, t)}
                      stroke={isSelected ? t.colors.primaryScale[600] : 'none'}
                      strokeWidth={isSelected ? 1.5 : 0}
                      style={{
                        cursor: 'pointer',
                        transition: `fill ${t.motion.hover}`,
                      }}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      onClick={() => handleDayClick(day.date, day.count)}
                    />
                  );
                })}
              </g>
            ))}
          </svg>

          {/* Legend */}
          <Box style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: t.spacing[1],
            marginTop: t.spacing[3],
          }}>
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginRight: t.spacing[1] }}>Less</Text>
            {[0, 0.25, 0.5, 0.75, 1].map((level, i) => (
              <Box
                key={i}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 2,
                  backgroundColor: getHeatColor(level * maxCount, maxCount, t),
                }}
              />
            ))}
            <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400], marginLeft: t.spacing[1] }}>More</Text>
          </Box>
        </Box>
        </Box>
      </Box>
    );
  },
});
