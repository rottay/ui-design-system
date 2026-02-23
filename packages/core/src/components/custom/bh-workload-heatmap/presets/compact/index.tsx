'use client';

/**
 * BhWorkloadHeatmap - Compact Preset
 * Small dashboard widget showing recruiter workload as a mini heatmap grid.
 * Includes utilization stats, SVG heatmap with hover tooltips,
 * color legend, and rebalance link.
 *
 * Personality-driven typography, glass-aware surfaces, entrance animations,
 * and full ARIA accessibility on all interactive elements.
 */

import { useMemo, useState, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { BhWorkloadHeatmapProps, RecruiterWorkload } from '../../core';
import { n } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createCardHoverStyles,
  createEntranceAnimation,
  createIconContainerStyle,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,
  createPersonalityAccentBar,
  createPersonalitySkeletonStyle,
  createStatValueStyle,
  createStatLabelStyle,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  getAccentAwareLayout,
  clickableProps,
  ICON_SIZES,
} from '../../../helpers';
import {
  LayoutGrid,
  ArrowRight,
  AlertCircle,
  ArrowDownCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** Maps a load value (0-max) to a color along neutral -> warning -> error scale */
function getHeatColor(value: number, max: number, tokens: any): string {
  if (max === 0) return tokens.colors.neutral[100];
  const ratio = Math.min(value / max, 1);
  if (ratio < 0.25) return tokens.colors.neutral[100];
  if (ratio < 0.5) return tokens.colors.warningScale[200];
  if (ratio < 0.75) return tokens.colors.warningScale[500];
  return tokens.colors.errorScale[500];
}

/* ------------------------------------------------------------------ */
/*  Preset                                                            */
/* ------------------------------------------------------------------ */

export const CompactBhWorkloadHeatmap = createPreset<BhWorkloadHeatmapProps>({
  name: 'BhWorkloadHeatmap.Compact',
  render: (ctx: PresetContext<BhWorkloadHeatmapProps>) => {
    const { primitives: { Box, Text }, props, tokens: t } = ctx;
    const isGlass = t.surface.useGlass;

    const {
      data,
      loading,
      onViewRecruiter,
      metric = 'hours',
      className,
      style,
    } = props;

    /* -- State for hover tooltip -------------------------------------- */
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; value: number; name: string } | null>(null);

    /* -- Token-based styles ------------------------------------------- */
    const personalityTypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const cardHover = useMemo(() => createCardHoverStyles(t), [t]);
    const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
    const accentLayout = useMemo(() => getAccentAwareLayout(t), [t]);
    const entranceAnim = useMemo(() => createEntranceAnimation(t), [t]);
    const sectionHeader = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyStyle = useMemo(() => createEmptyStateStyle(t), [t]);
    const skeletonStyle = useMemo(() => createPersonalitySkeletonStyle(t), [t]);

    /* -- Loading state ------------------------------------------------ */
    if (loading) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          display: 'flex', flexDirection: 'column' as const, gap: t.spacing[3],
          padding: `${t.spacing[5]}px`,
          ...style,
        }} role="status" aria-label="Loading workload heatmap">
          <Box style={{ ...skeletonStyle, height: 20, width: '60%' }} />
          <Box style={{ ...skeletonStyle, height: 32, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 120, width: '100%' }} />
          <Box style={{ ...skeletonStyle, height: 16, width: '80%' }} />
        </Box>
      );
    }

    /* -- Empty state -------------------------------------------------- */
    if (!data || data.recruiters.length === 0) {
      return (
        <Box className={className} style={{
          ...createCardStyle(t, { elevation: 'sm', glass: isGlass }),
          ...style,
        }}>
          <Box style={{ ...emptyStyle, padding: `${t.spacing[4]}px` }}>
            <Box style={createIconContainerStyle(t, { size: 40 })}>
              <LayoutGrid size={ICON_SIZES.feature} color={t.colors.neutral[300]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.sm,
              color: t.colors.neutral[400],
              marginTop: t.spacing[2],
            }}>
              No workload data available
            </Text>
          </Box>
        </Box>
      );
    }

    const recruiters = data.recruiters.slice(0, 5);
    const weekDays = data.weekDays.length > 0 ? data.weekDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const maxLoad = Math.max(
      ...recruiters.flatMap(r => r.dailyLoad),
      1,
    );

    /* -- Heatmap dimensions ------------------------------------------- */
    const cellSize = 28;
    const cellGap = 3;
    const labelWidth = 64;
    const dayLabelHeight = 18;
    const gridWidth = labelWidth + weekDays.length * (cellSize + cellGap);
    const gridHeight = dayLabelHeight + recruiters.length * (cellSize + cellGap);

    /* -- Render ------------------------------------------------------- */
    return (
      <div
        className={className}
        role="region"
        aria-label="Workload Distribution"
        onMouseEnter={(e: any) => { Object.assign(e.currentTarget.style, cardHover.hover); }}
        onMouseLeave={(e: any) => { Object.assign(e.currentTarget.style, cardHover.base); }}
        style={{
          ...createCardStyle(t, { elevation: 'sm', padding: 0, glass: isGlass }),
          borderRadius: t.borderRadius.lg,
          overflow: 'hidden',
          ...entranceAnim.animate,
          transition: entranceAnim.transition,
          ...accentLayout.outer,
          ...style,
        }}
      >
        {/* Accent bar */}
        {accentBar && <Box style={accentBar} />}
        <Box style={{ ...accentLayout.inner, padding: `${t.spacing[5]}px` }}>

        {/* Title row */}
        <Box style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={createIconContainerStyle(t, { size: 32, color: t.colors.infoScale[50] })}>
              <LayoutGrid size={ICON_SIZES.section} color={t.colors.infoScale[500]} aria-hidden="true" />
            </Box>
            <Text style={{
              fontSize: t.typography.fontSize.md,
              fontWeight: personalityTypo.headingWeight,
              letterSpacing: personalityTypo.headingLetterSpacing,
              color: t.colors.neutral[900],
            }}>
              Workload Distribution
            </Text>
          </Box>
        </Box>

        {/* Summary stats */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[3],
          marginBottom: t.spacing[4],
        }}>
          <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: t.spacing[1] }}>
            <Text style={createStatLabelStyle(t, { personality: personalityTypo })}>
              Avg Utilization
            </Text>
            <Text style={createStatValueStyle(t, { size: 'lg' })}>
              {Math.round(n(data.avgUtilization))}%
            </Text>
          </Box>
          <Box style={{
            width: 1,
            height: 32,
            backgroundColor: t.colors.neutral[200],
            flexShrink: 0,
          }} />
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Box style={{
              ...createBadgeStyle(t, 'error'),
              borderRadius: badgeRadius,
            }}>
              <AlertCircle size={ICON_SIZES.inline} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                {data.overloadedCount} overloaded
              </Text>
            </Box>
            <Box style={{
              ...createBadgeStyle(t, 'info'),
              borderRadius: badgeRadius,
            }}>
              <ArrowDownCircle size={ICON_SIZES.inline} aria-hidden="true" />
              <Text style={{ fontSize: t.typography.fontSize.xs, marginLeft: 2 }}>
                {data.underutilizedCount} under
              </Text>
            </Box>
          </Box>
        </Box>

        {/* Mini heatmap grid (SVG) */}
        <Box style={{ marginBottom: t.spacing[3], position: 'relative' as const, overflow: 'visible' as const }}>
          <svg
            width={gridWidth}
            height={gridHeight}
            viewBox={`0 0 ${gridWidth} ${gridHeight}`}
            role="img"
            aria-label={`Workload heatmap showing ${metric} for ${recruiters.length} recruiters across ${weekDays.length} days`}
            style={{ display: 'block', maxWidth: '100%' }}
          >
            {/* Day labels */}
            {weekDays.map((day, colIdx) => (
              <text
                key={`day-${colIdx}`}
                x={labelWidth + colIdx * (cellSize + cellGap) + cellSize / 2}
                y={14}
                textAnchor="middle"
                fontSize={t.typography.fontSize.xs}
                fill={t.colors.neutral[500]}
                fontFamily="inherit"
              >
                {day.slice(0, 3)}
              </text>
            ))}

            {/* Recruiter rows */}
            {recruiters.map((recruiter, rowIdx) => (
              <g key={recruiter.recruiterId}>
                {/* Name label */}
                <text
                  x={0}
                  y={dayLabelHeight + rowIdx * (cellSize + cellGap) + cellSize / 2 + 4}
                  fontSize={t.typography.fontSize.xs}
                  fill={t.colors.neutral[600]}
                  fontFamily="inherit"
                >
                  {recruiter.name.length > 8 ? `${recruiter.name.slice(0, 7)}...` : recruiter.name}
                </text>

                {/* Cells */}
                {recruiter.dailyLoad.map((load, colIdx) => {
                  const cx = labelWidth + colIdx * (cellSize + cellGap);
                  const cy = dayLabelHeight + rowIdx * (cellSize + cellGap);
                  const cellColor = getHeatColor(n(load), maxLoad, t);
                  const isHovered = hoveredCell?.row === rowIdx && hoveredCell?.col === colIdx;
                  return (
                    <rect
                      key={`${rowIdx}-${colIdx}`}
                      x={cx}
                      y={cy}
                      width={cellSize}
                      height={cellSize}
                      rx={4}
                      fill={cellColor}
                      stroke={isHovered ? t.colors.primaryScale[400] : 'none'}
                      strokeWidth={isHovered ? 2 : 0}
                      style={{ cursor: 'pointer', transition: `fill ${t.motion.hover}` }}
                      onMouseEnter={() => setHoveredCell({ row: rowIdx, col: colIdx, value: n(load), name: recruiter.name })}
                      onMouseLeave={() => setHoveredCell(null)}
                      onClick={onViewRecruiter ? () => onViewRecruiter(recruiter.recruiterId) : undefined}
                    >
                      <title>{`${recruiter.name} - ${weekDays[colIdx]}: ${n(load)} ${metric}`}</title>
                    </rect>
                  );
                })}
              </g>
            ))}
          </svg>

          {/* Hover tooltip */}
          {hoveredCell && (
            <Box style={{
              position: 'absolute' as const,
              top: -28,
              left: labelWidth + hoveredCell.col * (cellSize + cellGap),
              backgroundColor: t.colors.neutral[900],
              color: t.colors.common.white,
              padding: `${t.spacing[1]}px ${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              fontSize: t.typography.fontSize.xs,
              whiteSpace: 'nowrap' as const,
              pointerEvents: 'none' as const,
              zIndex: 10,
            }}>
              <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.common.white }}>
                {hoveredCell.name}: {hoveredCell.value} {metric}
              </Text>
            </Box>
          )}
        </Box>

        {/* Legend bar */}
        <Box style={{
          display: 'flex', alignItems: 'center', gap: t.spacing[2],
          marginBottom: t.spacing[3],
        }}>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>Low</Text>
          <Box style={{
            display: 'flex', flex: 1, height: 8, borderRadius: t.borderRadius.full, overflow: 'hidden',
          }}>
            <Box style={{ flex: 1, backgroundColor: t.colors.neutral[100] }} />
            <Box style={{ flex: 1, backgroundColor: t.colors.warningScale[200] }} />
            <Box style={{ flex: 1, backgroundColor: t.colors.warningScale[500] }} />
            <Box style={{ flex: 1, backgroundColor: t.colors.errorScale[500] }} />
          </Box>
          <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[400] }}>High</Text>
        </Box>

        {/* Rebalance link */}
        {onViewRecruiter && (
          <Box
            role="button"
            tabIndex={0}
            aria-label="Rebalance workloads"
            onClick={() => onViewRecruiter('__rebalance__')}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onViewRecruiter('__rebalance__'); }
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: t.spacing[1],
              padding: `${t.spacing[2]}px`,
              borderRadius: t.borderRadius.md,
              cursor: 'pointer',
              transition: `all ${t.motion.hover}`,
            }}
          >
            <Text style={{
              fontSize: t.typography.fontSize.xs,
              fontWeight: t.typography.fontWeight.semibold,
              color: t.colors.primaryScale[600],
            }}>
              Rebalance
            </Text>
            <ArrowRight size={ICON_SIZES.label} color={t.colors.primaryScale[600]} aria-hidden="true" />
          </Box>
        )}

        </Box>
      </div>
    );
  },
});
