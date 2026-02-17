'use client';

/**
 * BhProctoringHeatmap - Compact Preset
 * Condensed heatmap with smaller cells, suitable for sidebars or widgets.
 * Shows fewer hour labels, tighter spacing.
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { Grid } from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createEntranceAnimation,
  getPersonalityTypography,
  createPersonalitySectionHeaderStyle,
} from '../../../helpers';
import type {
  BhProctoringHeatmapProps,
  HeatmapDataPoint,
} from '../../core';
import type { DesignTokens, ColorScale } from '../../../../../types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const DAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const HOUR_LABELS_SHORT = ['12a', '6a', '12p', '6p'];
const HOUR_LABEL_POSITIONS = [0, 6, 12, 18];

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
  if (ratio <= 0.25) return scale[100];
  if (ratio <= 0.5) return scale[200];
  if (ratio <= 0.75) return scale[400];
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
      data.push({ day, hour, count: Math.floor(Math.random() * base * 3) });
    }
  }
  return data;
}

const MOCK_DATA = generateMockData();

/* ================================================================== */
/*  Compact Preset                                                     */
/* ================================================================== */

export const CompactBhProctoringHeatmap = createPreset<BhProctoringHeatmapProps>({
  name: 'BhProctoringHeatmap.Compact',
  render: (ctx: PresetContext<BhProctoringHeatmapProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;

    const isGlass = t.surface.useGlass;
    const ptypo = getPersonalityTypography(t);

    const {
      data: rawData = MOCK_DATA,
      onCellClick,
      colorScale = 'error',
      showValues = false,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : MOCK_DATA;

    const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);

    const card = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const scale = useMemo(() => getColorScale(colorScale, t), [colorScale, t]);

    const dataMap = useMemo(() => {
      const map = new Map<string, number>();
      data.forEach(d => map.set(`${d.day}-${d.hour}`, d.count));
      return map;
    }, [data]);

    const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);
    const totalEvents = useMemo(() => data.reduce((s, d) => s + d.count, 0), [data]);

    const handleCellClick = useCallback((day: number, hour: number) => {
      const count = dataMap.get(`${day}-${hour}`) ?? 0;
      onCellClick?.(day, hour, count);
    }, [dataMap, onCellClick]);

    const cellSize = 16;
    const gap = 1;

    const animStyle = useMemo(() => ({
      ...entrance.animate,
      transition: entrance.transition,
    }), [entrance]);

    return (
      <Box
        className={className}
        style={{
          ...card,
          padding: t.spacing[3],
          fontFamily: 'inherit',
          ...animStyle,
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: t.spacing[2],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[1] }}>
            <Grid size={12} color={t.colors.neutral[400]} />
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: ptypo.headingWeight,
              color: t.colors.neutral[700],
            }}>
              Heatmap
            </Text>
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>
            {totalEvents} events
          </Text>
        </Box>

        {/* Compact grid */}
        <Box style={{ overflowX: 'auto' }}>
          <Box style={{ display: 'inline-block', minWidth: 'fit-content' }}>
            {/* Hour labels */}
            <Box style={{ display: 'flex', marginLeft: 16, marginBottom: t.spacing[1] }}>
              {HOUR_LABEL_POSITIONS.map((pos, i) => (
                <Text
                  key={pos}
                  style={{
                    width: (cellSize + gap) * 6,
                    fontSize: 9,
                    color: t.colors.neutral[400],
                    textAlign: 'left' as const,
                  }}
                >
                  {HOUR_LABELS_SHORT[i]}
                </Text>
              ))}
            </Box>

            {/* Rows */}
            {DAY_LABELS_SHORT.map((dayLabel, dayIdx) => (
              <Box key={dayIdx} style={{ display: 'flex', alignItems: 'center', marginBottom: gap }}>
                <Text style={{
                  width: 14,
                  fontSize: 9,
                  color: t.colors.neutral[400],
                  textAlign: 'center' as const,
                  flexShrink: 0,
                }}>
                  {dayLabel}
                </Text>
                <Box style={{ display: 'flex', gap, marginLeft: 2 }}>
                  {Array.from({ length: 24 }, (_, hourIdx) => {
                    const count = dataMap.get(`${dayIdx}-${hourIdx}`) ?? 0;
                    const isHovered = hoveredCell?.day === dayIdx && hoveredCell?.hour === hourIdx;

                    return (
                      <Box
                        key={hourIdx}
                        role="gridcell"
                        tabIndex={0}
                        aria-label={`${DAY_LABELS_SHORT[dayIdx]} ${hourIdx}:00: ${count} events`}
                        onClick={() => handleCellClick(dayIdx, hourIdx)}
                        onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCellClick(dayIdx, hourIdx); } }}
                        onMouseEnter={() => setHoveredCell({ day: dayIdx, hour: hourIdx })}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          borderRadius: 2,
                          backgroundColor: getCellColor(count, maxCount, scale, t),
                          cursor: 'pointer',
                          border: isHovered ? `1px solid ${t.colors.neutral[400]}` : '1px solid transparent',
                          transition: `background-color ${t.motion.hover}`,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            ))}

            {/* Legend */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: t.spacing[1],
              marginTop: t.spacing[2],
            }}>
              <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>Low</Text>
              {[t.colors.neutral[50], scale[100], scale[200], scale[400], scale[600]].map((color, i) => (
                <Box key={i} style={{ width: 10, height: 10, borderRadius: 1, backgroundColor: color }} />
              ))}
              <Text style={{ fontSize: 9, color: t.colors.neutral[400] }}>High</Text>
            </Box>
          </Box>
        </Box>

        {/* Hover tooltip */}
        {hoveredCell && (
          <Box style={{ 
            marginTop: t.spacing[1],
            display: 'inline-flex',
            alignItems: 'center',
            gap: t.spacing[1],
            padding: `1px ${t.spacing[1]}px`,
            backgroundColor: t.colors.neutral[800],
            borderRadius: 2,
          }}>
            <Text style={{ fontSize: 9, color: t.colors.common.white }}>
              {DAY_LABELS_SHORT[hoveredCell.day]} {hoveredCell.hour}:00 -
            </Text>
            <Text style={{ fontSize: 9, color: t.colors.common.white, fontWeight: t.typography.fontWeight.bold }}>
              {dataMap.get(`${hoveredCell.day}-${hoveredCell.hour}`) ?? 0}
            </Text>
          </Box>
        )}
      </Box>
    );
  },
});
