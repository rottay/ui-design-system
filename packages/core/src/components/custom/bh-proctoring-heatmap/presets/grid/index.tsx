'use client';

/**
 * BhProctoringHeatmap - Grid Preset
 * Traditional heatmap grid: hours on x-axis, days of week on y-axis.
 * Color intensity represents event count.
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Grid } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  createPersonalitySectionHeaderStyle,
  createPersonalityAccentBar,
  getAccentAwareLayout,
} from '../../../helpers';
import type {
  BhProctoringHeatmapProps,
  HeatmapDataPoint,
} from '../../core';
import type { DesignTokens, ColorScale } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) => {
  if (i === 0) return '12a';
  if (i < 12) return `${i}a`;
  if (i === 12) return '12p';
  return `${i - 12}p`;
});

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getColorScale(scaleName: string, t: DesignTokens) {
  switch (scaleName) {
    case 'error': return t.colors.errorScale;
    case 'warning': return t.colors.warningScale;
    case 'primary': return t.colors.primaryScale;
    case 'info': return t.colors.infoScale;
    default: return t.colors.errorScale;
  }
}

function getCellColor(count: number, maxCount: number, scale: ColorScale, t: DesignTokens): string {
  if (count === 0) return t.colors.neutral[50];
  const ratio = count / maxCount;
  if (ratio <= 0.2) return scale[100];
  if (ratio <= 0.4) return scale[200];
  if (ratio <= 0.6) return scale[300];
  if (ratio <= 0.8) return scale[400];
  return scale[600];
}

/* ------------------------------------------------------------------ */
/*  Mock data                                                          */
/* ------------------------------------------------------------------ */

function generateMockData(): HeatmapDataPoint[] {
  const data: HeatmapDataPoint[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isWorkHour = hour >= 9 && hour <= 17;
      const isWeekday = day >= 1 && day <= 5;
      const base = isWorkHour && isWeekday ? 4 : 1;
      const count = Math.floor(Math.random() * base * 3);
      data.push({ day, hour, count });
    }
  }
  return data;
}

const MOCK_DATA = generateMockData();

/* ================================================================== */
/*  Grid Preset                                                        */
/* ================================================================== */

export const GridBhProctoringHeatmap = createPreset<BhProctoringHeatmapProps>({
  name: 'BhProctoringHeatmap.Grid',
  render: (ctx: PresetContext<BhProctoringHeatmapProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);

    const {
      data = MOCK_DATA,
      onCellClick,
      colorScale = 'error',
      showValues = false,
      className,
      style,
    } = props;

    const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const scale = useMemo(() => getColorScale(colorScale, t), [colorScale, t]);

    const dataMap = useMemo(() => {
      const map = new Map<string, number>();
      data.forEach(d => map.set(`${d.day}-${d.hour}`, d.count));
      return map;
    }, [data]);

    const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

    const handleCellClick = useCallback((day: number, hour: number) => {
      const count = dataMap.get(`${day}-${hour}`) ?? 0;
      onCellClick?.(day, hour, count);
    }, [dataMap, onCellClick]);

    const cellSize = 28;
    const gap = 2;

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
          fontFamily: 'inherit',
          ...animStyle,
          ...(accentBar ? accentLayout.outer : {}),
          ...style,
        }}
      >
        {accentBar && <Box style={accentBar} />}

        <Box style={accentBar ? accentLayout.inner : {}}>
        <Box style={{ padding: t.spacing[5] }}>
          <Text style={{ ...sectionLabel, marginBottom: t.spacing[4] }}>Event Heatmap</Text>

          <Box style={{ overflowX: 'auto' }}>
            <Box style={{ display: 'inline-block', minWidth: 'fit-content' }}>
              {/* Hour labels */}
              <Box style={{ display: 'flex', marginLeft: 40, marginBottom: t.spacing[1] }}>
                {HOUR_LABELS.map((label, i) => (
                  i % 3 === 0 ? (
                    <Text
                      key={i}
                      style={{
                        width: (cellSize + gap) * 3,
                        fontSize: t.typography.fontSize.xs,
                        color: t.colors.neutral[400],
                        textAlign: 'left' as const,
                      }}
                    >
                      {label}
                    </Text>
                  ) : null
                ))}
              </Box>

              {/* Grid rows */}
              {DAY_LABELS.map((dayLabel, dayIdx) => (
                <Box key={dayIdx} style={{ display: 'flex', alignItems: 'center', marginBottom: gap }}>
                  {/* Day label */}
                  <Text style={{
                    width: 36,
                    fontSize: t.typography.fontSize.xs,
                    color: t.colors.neutral[500],
                    textAlign: 'right' as const,
                    paddingRight: t.spacing[1],
                    flexShrink: 0,
                  }}>
                    {dayLabel}
                  </Text>

                  {/* Hour cells */}
                  <Box style={{ display: 'flex', gap }}>
                    {Array.from({ length: 24 }, (_, hourIdx) => {
                      const count = dataMap.get(`${dayIdx}-${hourIdx}`) ?? 0;
                      const isHovered = hoveredCell?.day === dayIdx && hoveredCell?.hour === hourIdx;

                      return (
                        <Box
                          key={hourIdx}
                          role="gridcell"
                          tabIndex={0}
                          aria-label={`${dayLabel} ${HOUR_LABELS[hourIdx]}: ${count} events`}
                          onClick={() => handleCellClick(dayIdx, hourIdx)}
                          onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCellClick(dayIdx, hourIdx); } }}
                          onMouseEnter={() => setHoveredCell({ day: dayIdx, hour: hourIdx })}
                          onMouseLeave={() => setHoveredCell(null)}
                          style={{
                            width: cellSize,
                            height: cellSize,
                            borderRadius: t.borderRadius.sm,
                            backgroundColor: getCellColor(count, maxCount, scale, t),
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: isHovered ? `2px solid ${t.colors.neutral[400]}` : '2px solid transparent',
                            transition: `background-color ${t.motion.hover}, border-color ${t.motion.hover}`,
                            position: 'relative',
                          }}
                        >
                          {showValues && count > 0 && (
                            <Text style={{
                              fontSize: 9,
                              fontWeight: t.typography.fontWeight.bold,
                              color: count / maxCount > 0.5 ? t.colors.common.white : t.colors.neutral[600],
                            }}>
                              {count}
                            </Text>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              ))}

              {/* Color legend */}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: t.spacing[1],
                marginTop: t.spacing[3],
              }}>
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Less</Text>
                {[t.colors.neutral[50], scale[100], scale[200], scale[400], scale[600]].map((color, i) => (
                  <Box
                    key={i}
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: color,
                    }}
                  />
                ))}
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>More</Text>
              </Box>
            </Box>
          </Box>

          {/* Tooltip */}
          {hoveredCell && (
            <Box style={{
              marginTop: t.spacing[2],
              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
              backgroundColor: t.colors.neutral[800],
              borderRadius: t.borderRadius.sm,
              display: 'inline-flex',
              gap: t.spacing[1],
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>
                {DAY_LABELS[hoveredCell.day]} {HOUR_LABELS[hoveredCell.hour]}:
              </Text>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white, fontWeight: t.typography.fontWeight.bold }}>
                {dataMap.get(`${hoveredCell.day}-${hoveredCell.hour}`) ?? 0} events
              </Text>
            </Box>
          )}
        </Box>
        </Box>
      </Box>
    );
  },
});
