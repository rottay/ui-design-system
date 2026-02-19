'use client';

/**
 * BhProviderLatency - Chart Preset
 * SVG line chart with p50/p95/p99 lines, target threshold line, and legend.
 */

import { useState, useMemo, useCallback } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEntranceAnimation,
  createStaggerDelay,
  createCardHoverStyles,
  getPersonalityTypography,
  getPersonalityBadgeRadius,
  createPersonalitySectionHeaderStyle,
  createEmptyStateStyle,

  createPersonalityAccentBar,
  createDividerStyle,
} from '../../../helpers';
import type { BhProviderLatencyProps, LatencyDataPoint } from '../../core';
import type { DesignTokens } from '../../../../../types';
import { Activity, Clock, Server } from 'lucide-react';

const CHART_PAD = { top: 20, right: 20, bottom: 40, left: 60 };
const CHART_HEIGHT = 280;

function buildPolyline(
  points: { x: number; y: number }[],
): string {
  return points.map(p => `${p.x},${p.y}`).join(' ');
}

export const ChartBhProviderLatency = createPreset<BhProviderLatencyProps>({
  name: 'BhProviderLatency.Chart',
  render: ({ primitives, props, tokens }: PresetContext<BhProviderLatencyProps>) => {
    const { Box, Text } = primitives;
    const t = tokens;

    const {
      data: rawData = [],
      providers: rawProviders = [],
      selectedProvider: controlledProvider,
      targetLatency = 500,
      onProviderChange,
      onDataPointClick,
      loading = false,
      className,
      style,
    } = props;

    const data = Array.isArray(rawData) ? rawData : [];
    const providers = Array.isArray(rawProviders) ? rawProviders : [];

    const [localProvider, setLocalProvider] = useState<string | null>(null);
    const selectedProvider = controlledProvider ?? localProvider ?? (providers.length > 0 ? providers[0] : null);

    const handleProviderChange = useCallback((p: string) => {
      onProviderChange?.(p);
      if (controlledProvider === undefined) setLocalProvider(p);
    }, [onProviderChange, controlledProvider]);

    const isGlass = t.surface.useGlass && !!t.glass;
    const cardBase = useMemo(() => createCardStyle(t, { elevation: 'sm', glass: isGlass }), [t, isGlass]);
    const ptypo = useMemo(() => getPersonalityTypography(t), [t]);
    const badgeRadius = useMemo(() => getPersonalityBadgeRadius(t), [t]);
    const sectionLabel = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);
    const emptyState = useMemo(() => createEmptyStateStyle(t), [t]);

    // Filter data for selected provider
    const providerData = useMemo(() => {
      if (!selectedProvider) return [];
      return data.filter(d => d.provider === selectedProvider);
    }, [data, selectedProvider]);

    // Chart dimensions
    const chartWidth = 600;
    const innerWidth = chartWidth - CHART_PAD.left - CHART_PAD.right;
    const innerHeight = CHART_HEIGHT - CHART_PAD.top - CHART_PAD.bottom;

    // Scales
    const maxLatency = useMemo(() => {
      const allValues = providerData.flatMap(d => [d.p50, d.p95, d.p99]);
      return Math.max(targetLatency * 1.5, ...allValues, 100);
    }, [providerData, targetLatency]);

    const xScale = useCallback((i: number) => {
      const count = Math.max(1, providerData.length - 1);
      return CHART_PAD.left + (i / count) * innerWidth;
    }, [providerData.length, innerWidth]);

    const yScale = useCallback((v: number) => {
      return CHART_PAD.top + innerHeight - (v / maxLatency) * innerHeight;
    }, [maxLatency, innerHeight]);

    // Build polylines
    const p50Points = useMemo(() => providerData.map((d, i) => ({ x: xScale(i), y: yScale(d.p50) })), [providerData, xScale, yScale]);
    const p95Points = useMemo(() => providerData.map((d, i) => ({ x: xScale(i), y: yScale(d.p95) })), [providerData, xScale, yScale]);
    const p99Points = useMemo(() => providerData.map((d, i) => ({ x: xScale(i), y: yScale(d.p99) })), [providerData, xScale, yScale]);

    // Y-axis ticks
    const yTicks = useMemo(() => {
      const tickCount = 5;
      return Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxLatency / tickCount) * i));
    }, [maxLatency]);

    // Line colors
    const lineColors = useMemo(() => ({
      p50: t.colors.successScale[500],
      p95: t.colors.warningScale[500],
      p99: t.colors.errorScale[500],
    }), [t]);

    // Current values (latest data point)
    const currentValues = useMemo(() => {
      if (providerData.length === 0) return null;
      const last = providerData[providerData.length - 1];
      return { p50: last.p50, p95: last.p95, p99: last.p99 };
    }, [providerData]);
    const entrance = useMemo(() => createEntranceAnimation(t), [t]);
    const animStyle = (index: number) => ({
      ...entrance.animate,
      transition: entrance.transition,
      transitionDelay: `${createStaggerDelay(t, index)}ms`,
    });

    if (loading) {
      const accentBar = useMemo(() => createPersonalityAccentBar(t), [t]);
      const hoverStyles = useMemo(() => createCardHoverStyles(t), [t]);
      const divider = useMemo(() => createDividerStyle(t), [t]);
    const sectionHdr = useMemo(() => createPersonalitySectionHeaderStyle(t), [t]);

      return (
        <Box className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: t.spacing[10], ...style }}>
          <Activity size={24} color={t.colors.neutral[300]} style={{ marginRight: t.spacing[3] }} />
          <Text style={{ color: t.colors.neutral[400], fontSize: t.typography.fontSize.sm }}>Loading latency data...</Text>
        </Box>
      );
    }

    return (
      <Box className={className} style={{ ...cardBase, padding: t.spacing[4], ...style }}>
        {/* Header */}
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: t.spacing[4] }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
            <Clock size={18} strokeWidth={1.5} style={{ color: t.colors.primaryScale[600] }} />
            <Text style={{ fontSize: t.typography.fontSize.lg, fontWeight: ptypo.headingWeight, letterSpacing: ptypo.headingLetterSpacing, color: t.colors.neutral[900] }}>
              Provider Latency
            </Text>
          </Box>

          {/* Provider tabs */}
          <Box style={{ display: 'flex', gap: t.spacing[1] }}>
            {providers.map(p => {
              const isActive = selectedProvider === p;

              return (
                <Box
                  key={p}
                  role="tab"
                  tabIndex={0}
                  aria-selected={isActive}
                  onClick={() => handleProviderChange(p)}
                  onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.hover); }}
                  onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { Object.assign(e.currentTarget.style, hoverStyles.base); }}
                  style={{
                    padding: `${t.spacing[1]}px ${t.spacing[3]}px`,
                    borderRadius: badgeRadius,
                    fontSize: t.typography.fontSize.sm,
                    fontWeight: isActive ? t.typography.fontWeight.semibold : t.typography.fontWeight.medium,
                    color: isActive ? t.colors.primaryScale[700] : t.colors.neutral[600],
                    backgroundColor: isActive ? t.colors.primaryScale[50] : 'transparent',
                    border: `${t.surface.borderWidth} ${t.surface.borderStyle} ${isActive ? t.colors.primaryScale[200] : 'transparent'}`,
                    cursor: 'pointer',
                    transition: `all ${t.motion.hover}`,
                  }}
                >
                  <Text>{p}</Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Current values row */}
        {currentValues && (
          <Box style={{ display: 'flex', gap: t.spacing[4], marginBottom: t.spacing[4] }}>
            {([
              { key: 'p50', label: 'P50', value: currentValues.p50, color: lineColors.p50 },
              { key: 'p95', label: 'P95', value: currentValues.p95, color: lineColors.p95 },
              { key: 'p99', label: 'P99', value: currentValues.p99, color: lineColors.p99 },
            ] as const).map(metric => (
              <Box key={metric.key} style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2] }}>
                <Box style={{ width: 12, height: 3, borderRadius: t.borderRadius.full, backgroundColor: metric.color }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>{metric.label}</Text>
                <Text style={{ fontSize: t.typography.fontSize.md, fontWeight: t.typography.fontWeight.bold, color: t.colors.neutral[900] }}>
                  {metric.value}ms
                </Text>
              </Box>
            ))}
            {targetLatency && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: t.spacing[2], marginLeft: 'auto' }}>
                <Box style={{ width: 12, height: 2, borderRadius: t.borderRadius.full, backgroundColor: t.colors.neutral[400], borderTop: `1px dashed ${t.colors.neutral[400]}` }} />
                <Text style={{ fontSize: t.typography.fontSize.xs, color: t.colors.neutral[500] }}>Target: {targetLatency}ms</Text>
              </Box>
            )}
          </Box>
        )}

        {/* SVG Chart */}
        {providerData.length === 0 ? (
          <Box style={{ ...emptyState }}>
            <Server size={32} strokeWidth={1} style={{ color: t.colors.neutral[300], marginBottom: t.spacing[2] }} />
            <Text style={{ fontSize: t.typography.fontSize.sm, color: t.colors.neutral[400] }}>No latency data for this provider</Text>
          </Box>
        ) : (
          <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            {/* Grid lines */}
            {yTicks.map(tick => (
              <g key={tick}>
                <line
                  x1={CHART_PAD.left} y1={yScale(tick)}
                  x2={chartWidth - CHART_PAD.right} y2={yScale(tick)}
                  stroke={t.colors.neutral[100]}
                  strokeWidth={1}
                />
                <text
                  x={CHART_PAD.left - 8} y={yScale(tick) + 4}
                  fill={t.colors.neutral[400]}
                  fontSize={10}
                  textAnchor="end"
                >
                  {tick}ms
                </text>
              </g>
            ))}

            {/* Target threshold line */}
            {targetLatency && (
              <line
                x1={CHART_PAD.left} y1={yScale(targetLatency)}
                x2={chartWidth - CHART_PAD.right} y2={yScale(targetLatency)}
                stroke={t.colors.neutral[400]}
                strokeWidth={1}
                strokeDasharray="6,4"
              />
            )}

            {/* X-axis labels */}
            {providerData.map((d, i) => {
              if (providerData.length > 10 && i % Math.ceil(providerData.length / 8) !== 0) return null;
              return (
                <text
                  key={i}
                  x={xScale(i)} y={CHART_HEIGHT - 10}
                  fill={t.colors.neutral[400]}
                  fontSize={9}
                  textAnchor="middle"
                >
                  {d.timestamp.split('T')[1]?.substring(0, 5) || d.timestamp.substring(0, 10)}
                </text>
              );
            })}

            {/* P99 area fill */}
            <polygon
              points={`${CHART_PAD.left},${yScale(0)} ${buildPolyline(p99Points)} ${xScale(providerData.length - 1)},${yScale(0)}`}
              fill={t.colors.errorScale[100]}
              opacity={0.3}
            />

            {/* Lines */}
            <polyline points={buildPolyline(p99Points)} fill="none" stroke={lineColors.p99} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={buildPolyline(p95Points)} fill="none" stroke={lineColors.p95} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={buildPolyline(p50Points)} fill="none" stroke={lineColors.p50} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

            {/* Data point dots for latest */}
            {providerData.length > 0 && (
              <>
                <circle cx={p50Points[p50Points.length - 1].x} cy={p50Points[p50Points.length - 1].y} r={4} fill={lineColors.p50} stroke={t.colors.common.white} strokeWidth={2} />
                <circle cx={p95Points[p95Points.length - 1].x} cy={p95Points[p95Points.length - 1].y} r={4} fill={lineColors.p95} stroke={t.colors.common.white} strokeWidth={2} />
                <circle cx={p99Points[p99Points.length - 1].x} cy={p99Points[p99Points.length - 1].y} r={4} fill={lineColors.p99} stroke={t.colors.common.white} strokeWidth={2} />
              </>
            )}

            {/* Clickable hit areas */}
            {providerData.map((d, i) => (
              <rect
                key={i}
                x={xScale(i) - 10} y={CHART_PAD.top}
                width={20} height={innerHeight}
                fill="transparent"
                style={{ ...animStyle(i), cursor: 'pointer' }}
                onClick={() => onDataPointClick?.(d)}
              />
            ))}
          </svg>
        )}
      </Box>
    );
  },
});
