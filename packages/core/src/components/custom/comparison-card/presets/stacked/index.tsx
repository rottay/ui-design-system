'use client';

/**
 * ComparisonCard - Stacked Preset
 * Premium stacked metric cards with glass support, change percentage badges,
 * visual progress bars for current vs previous, hover on each metric card,
 * panel header, period label badges, and loading spinner
 */

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ComparisonCardProps } from '../../core';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const Stacked = createPreset<ComparisonCardProps>((context: PresetContext<ComparisonCardProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Spinner } = primitives;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

  const {
    metrics,
    title,
    period = { current: 'Current', previous: 'Previous' },
    className,
    style,
  } = props;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const cardStyle = useMemo(() => ({
    ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  }), [tokens, isGlass, style]);

  const accentBarStyle = useMemo(
    () => createAccentBarStyle(tokens, { position: 'top' }),
    [tokens],
  );

  const headerStyle = useMemo(
    () => createPanelHeaderStyle(tokens),
    [tokens],
  );

  const periodCurrentBadge = useMemo(
    () => createBadgeStyle(tokens, 'primary'),
    [tokens],
  );

  const periodPreviousBadge = useMemo(
    () => createBadgeStyle(tokens, 'secondary'),
    [tokens],
  );

  const calculateChange = (current: number | string, previous: number | string) => {
    const curr = typeof current === 'number' ? current : parseFloat(String(current));
    const prev = typeof previous === 'number' ? previous : parseFloat(String(previous));
    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  if (!metrics || metrics.length === 0) {
    return (
      <Box style={cardStyle} className={className}>
        <div style={accentBarStyle} />
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: tokens.spacing[8] }}>
          <Spinner size="md" />
        </Box>
      </Box>
    );
  }

  return (
    <Box style={cardStyle} className={className}>
      <div style={accentBarStyle} />

      {/* Panel header with title + period badges */}
      <Box
        style={{
          ...headerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap' as const,
          gap: tokens.spacing[2],
        }}
      >
        {title && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            {title}
          </Text>
        )}
        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
          <Box style={periodCurrentBadge}>{period.current}</Box>
          <Box style={periodPreviousBadge}>{period.previous}</Box>
        </Box>
      </Box>

      {/* Metric cards */}
      <Box style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
        {metrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          const isHovered = hoveredIndex === index;
          const isPositive = change !== null && change > 0;
          const isNegative = change !== null && change < 0;

          const currNum = typeof metric.current === 'number' ? metric.current : parseFloat(String(metric.current));
          const prevNum = typeof metric.previous === 'number' ? metric.previous : parseFloat(String(metric.previous));
          const maxVal = Math.max(currNum || 0, prevNum || 0);
          const currPercent = maxVal > 0 ? (currNum / maxVal) * 100 : 0;
          const prevPercent = maxVal > 0 ? (prevNum / maxVal) * 100 : 0;

          const currBar = createProgressBarStyle(tokens, { percent: currPercent, color: tokens.colors.primaryScale[500] });
          const prevBar = createProgressBarStyle(tokens, { percent: prevPercent, color: tokens.colors.neutral[400] });

          const changeBadge = change !== null
            ? createBadgeStyle(tokens, isPositive ? 'success' : isNegative ? 'error' : 'info')
            : {};

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                padding: tokens.spacing[4],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  isHovered ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]
                }`,
                borderRadius: tokens.borderRadius.md,
                transition: `all ${tokens.motion.hover}`,
                backgroundColor: isHovered ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                boxShadow: isHovered ? tokens.shadows.sm : 'none',
                transform: isHovered ? tokens.motion.transform : 'none',
              }}
            >
              {/* Label + change badge row */}
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[700],
                }}>
                  {metric.label}
                </Text>
                {change !== null && (
                  <Box style={changeBadge}>
                    {isPositive ? '+' : ''}{change.toFixed(1)}%
                  </Box>
                )}
              </Box>

              {/* Values row */}
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[3] }}>
                <Box>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                    {period.previous}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[600] }}>
                    {metric.previous}{metric.unit}
                  </Text>
                </Box>

                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], color: isPositive ? tokens.colors.successScale[600] : isNegative ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xl }}>
                    {isPositive ? '\u2191' : isNegative ? '\u2193' : '\u2192'}
                  </Text>
                </Box>

                <Box style={{ textAlign: 'right' as const }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                    {period.current}
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                    {metric.current}{metric.unit}
                  </Text>
                </Box>
              </Box>

              {/* Progress bars */}
              <Box style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[2] }}>
                <Box style={currBar.track}>
                  <div style={currBar.fill} />
                </Box>
                <Box style={prevBar.track}>
                  <div style={prevBar.fill} />
                </Box>
              </Box>
            </div>
          );
        })}
      </Box>
    </Box>
  );
});
