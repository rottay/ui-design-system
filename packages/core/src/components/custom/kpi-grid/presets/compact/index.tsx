'use client';

/**
 * KpiGrid - Compact Preset
 * Dense KPI cards with accent bars, trend arrows, mini sparklines,
 * target progress bars, icon containers, and hover elevation.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createProgressBarStyle,
  createBadgeStyle,
  createHoverStyle,
  getHoverTransform,
  getCardHoverShadow,
} from '../../../helpers';
import type { KpiGridProps, KpiItem } from '../../core';

const KpiCompactCard = ({ item, tokens, engine, primitives }: {
  item: KpiItem;
  tokens: any;
  engine: string;
  primitives: any;
}) => {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);
  const isGlass = engine === 'modern' && !!tokens.glass;

  const colorKey = item.color || 'primary';
  const scaleMap: Record<string, any> = {
    primary: tokens.colors.primaryScale,
    success: tokens.colors.successScale,
    warning: tokens.colors.warningScale,
    error: tokens.colors.errorScale,
    info: tokens.colors.infoScale,
  };
  const scale = scaleMap[colorKey] || tokens.colors.primaryScale;

  const cardStyle = useMemo(() => ({
    ...createCardStyle(tokens, {
      elevation: isHovered ? 'md' : 'sm',
      glass: isGlass,
      interactive: true,
    }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderLeft: `3px solid ${scale[400]}`,
  }), [tokens, isGlass, isHovered, scale]);

  const getTrendArrow = (trend?: number) => {
    if (trend === undefined) return null;
    return trend > 0 ? '\u2191' : trend < 0 ? '\u2193' : '\u2192';
  };

  const getTrendColor = (trend?: number) => {
    if (trend === undefined) return 'primary' as const;
    return trend > 0 ? 'success' as const : trend < 0 ? 'error' as const : 'info' as const;
  };

  // Mini sparkline points (synthetic from value for decoration)
  const sparkPoints = useMemo(() => {
    const val = typeof item.value === 'number' ? item.value : parseFloat(String(item.value)) || 50;
    const seed = val * 7 + (item.trend || 0) * 13;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const noise = Math.sin(seed + i * 2.1) * 0.3 + 0.5;
      return noise;
    });
    // Last point trends in the right direction
    if (item.trend !== undefined) {
      pts[5] = item.trend > 0 ? 0.8 : item.trend < 0 ? 0.2 : 0.5;
    }
    return pts;
  }, [item.value, item.trend]);

  const sparkW = 48;
  const sparkH = 20;
  const sparkLine = sparkPoints
    .map((p, i) => `${(i / (sparkPoints.length - 1)) * sparkW},${sparkH - p * sparkH}`)
    .join(' ');

  const targetPercent = item.target && typeof item.value === 'number'
    ? Math.min(100, (item.value / item.target) * 100)
    : null;

  const progressStyles = targetPercent !== null
    ? createProgressBarStyle(tokens, { color: scale[500], percent: targetPercent })
    : null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        transform: isHovered ? tokens.motion.transform : 'none',
      }}
    >
      <div style={createAccentBarStyle(tokens, { position: 'top', color: scale[400] })} />

      <Box style={{ padding: tokens.spacing[3], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
        {/* Top row: icon + label */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
          {item.icon && (
            <Box style={{
              width: tokens.spacing[7],
              height: tokens.spacing[7],
              borderRadius: tokens.borderRadius.full,
              backgroundColor: scale[100],
              color: scale[600],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: tokens.typography.fontSize.sm,
              flexShrink: 0,
            }}>
              {item.icon}
            </Box>
          )}
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium, flex: 1 }}>
            {item.label}
          </Text>
          {/* Mini sparkline */}
          <svg width={sparkW} height={sparkH} style={{ flexShrink: 0, opacity: 0.7 }}>
            <polyline
              points={sparkLine}
              fill="none"
              stroke={scale[400]}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Box>

        {/* Value row */}
        <Box style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>
            {item.value}{item.unit && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginLeft: tokens.spacing[1] }}>{item.unit}</span>}
          </Text>
          {item.trend !== undefined && (
            <Box style={{ ...createBadgeStyle(tokens, getTrendColor(item.trend)), gap: tokens.spacing[1] }}>
              <span>{getTrendArrow(item.trend)}</span>
              <span>{Math.abs(item.trend)}%</span>
            </Box>
          )}
        </Box>

        {/* Target progress bar */}
        {progressStyles && targetPercent !== null && (
          <Box>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                Target: {item.target}{item.unit || ''}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: scale[600] }}>
                {targetPercent.toFixed(0)}%
              </Text>
            </Box>
            <Box style={progressStyles.track}>
              <div style={progressStyles.fill} />
            </Box>
          </Box>
        )}
      </Box>
    </div>
  );
};

export const Compact = createPreset<KpiGridProps>((context: PresetContext<KpiGridProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Spinner } = primitives;
  const { items, columns = 3, className, style } = props;

  const loading = !items || items.length === 0;
  if (loading) {
    return (
      <Box className={className} style={{ ...createCardStyle(tokens), display: 'flex', justifyContent: 'center', alignItems: 'center', padding: tokens.spacing[8], ...style }}>
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: tokens.spacing[3],
        ...style,
      }}
    >
      {items.map((item) => (
        <KpiCompactCard
          key={item.key}
          item={item}
          tokens={tokens}
          engine={engine}
          primitives={primitives}
        />
      ))}
    </Box>
  );
});
