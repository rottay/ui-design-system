'use client';

/**
 * KpiGrid - Cards Preset
 * Large KPI cards with icon circles, trend badges, SVG progress rings,
 * previous value comparison, accent bar, and hover elevation.
 */

import { useState, useMemo, useId } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createHoverStyle,
  getHoverTransform,
  getCardHoverShadow,
} from '../../../helpers';
import type { KpiGridProps, KpiItem } from '../../core';

const KpiCardItem = ({ item, tokens, engine, primitives }: {
  item: KpiItem;
  tokens: any;
  engine: string;
  primitives: any;
}) => {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);
  const ringId = useId();
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

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
  }), [tokens, isGlass, isHovered]);

  const getTrendArrow = (trend?: number) => {
    if (trend === undefined) return '';
    return trend > 0 ? '\u2191' : trend < 0 ? '\u2193' : '\u2192';
  };

  const getTrendBadgeColor = (trend?: number) => {
    if (trend === undefined) return 'info' as const;
    return trend > 0 ? 'success' as const : trend < 0 ? 'error' as const : 'info' as const;
  };

  // Progress ring calculations
  const targetPercent = item.target && typeof item.value === 'number'
    ? Math.min(100, (item.value / item.target) * 100)
    : null;

  const ringSize = 44;
  const ringStroke = 4;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = targetPercent !== null
    ? ringCircumference - (targetPercent / 100) * ringCircumference
    : ringCircumference;

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

      <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
        {/* Top row: icon + progress ring */}
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Icon circle */}
          {item.icon ? (
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.full,
              backgroundColor: scale[100],
              color: scale[600],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: tokens.typography.fontSize.xl,
              flexShrink: 0,
            }}>
              {item.icon}
            </Box>
          ) : (
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.full,
              backgroundColor: scale[50],
              border: `2px solid ${scale[200]}`,
              flexShrink: 0,
            }} />
          )}

          {/* Progress ring or trend badge */}
          {targetPercent !== null ? (
            <Box style={{ position: 'relative' as const }}>
              <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
                {/* Track */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke={tokens.colors.neutral[100]}
                  strokeWidth={ringStroke}
                />
                {/* Fill */}
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  fill="none"
                  stroke={scale[500]}
                  strokeWidth={ringStroke}
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  style={{ transition: `stroke-dashoffset ${tokens.transitions?.normal || tokens.motion.hover}` }}
                />
              </svg>
              <Text style={{
                position: 'absolute' as const,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: tokens.typography.fontSize.xs,
                fontWeight: tokens.typography.fontWeight.bold,
                color: scale[700],
              }}>
                {targetPercent.toFixed(0)}%
              </Text>
            </Box>
          ) : item.trend !== undefined ? (
            <Box style={{
              ...createBadgeStyle(tokens, getTrendBadgeColor(item.trend)),
              gap: tokens.spacing[1],
            }}>
              <span>{getTrendArrow(item.trend)}</span>
              <span>{Math.abs(item.trend)}%</span>
            </Box>
          ) : null}
        </Box>

        {/* Label */}
        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], fontWeight: tokens.typography.fontWeight.medium }}>
          {item.label}
        </Text>

        {/* Value */}
        <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], lineHeight: tokens.typography.lineHeight.tight }}>
          {item.value}
          {item.unit && (
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginLeft: tokens.spacing[1] }}>
              {item.unit}
            </span>
          )}
        </Text>

        {/* Trend + previous value row */}
        <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`, paddingTop: tokens.spacing[2] }}>
          {item.trend !== undefined && targetPercent !== null && (
            <Box style={{
              ...createBadgeStyle(tokens, getTrendBadgeColor(item.trend)),
              gap: tokens.spacing[1],
            }}>
              <span>{getTrendArrow(item.trend)}</span>
              <span>{Math.abs(item.trend)}%</span>
            </Box>
          )}
          {item.previousValue !== undefined && (
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
              prev: {item.previousValue}{item.unit || ''}
            </Text>
          )}
          {item.target !== undefined && (
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginLeft: 'auto' }}>
              Target: {item.target}{item.unit || ''}
            </Text>
          )}
        </Box>
      </Box>
    </div>
  );
};

export const Cards = createPreset<KpiGridProps>((context: PresetContext<KpiGridProps>) => {
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
        gap: tokens.spacing[4],
        ...style,
      }}
    >
      {items.map((item) => (
        <KpiCardItem
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
