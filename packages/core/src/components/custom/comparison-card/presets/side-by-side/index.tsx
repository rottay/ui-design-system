'use client';

/**
 * ComparisonCard - Side-by-Side Preset
 * Premium two-column comparison with badge-styled column headers,
 * gradient background for the winning column, change indicator badges,
 * glass card support, accent bar, and hover highlight per metric row
 */

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ComparisonCardProps } from '../../core';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
} from '../../../helpers';

export const SideBySide = createPreset<ComparisonCardProps>((context: PresetContext<ComparisonCardProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const isGlass = engine === 'modern' && !!tokens.glass;

  const {
    metrics,
    title,
    period = { current: 'Current', previous: 'Previous' },
    className,
    style,
  } = props;

  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

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

  const currentHeaderBadge = useMemo(
    () => createBadgeStyle(tokens, 'primary'),
    [tokens],
  );

  const previousHeaderBadge = useMemo(
    () => createBadgeStyle(tokens, 'secondary'),
    [tokens],
  );

  const calculateChange = (current: number | string, previous: number | string) => {
    const curr = typeof current === 'number' ? current : parseFloat(String(current));
    const prev = typeof previous === 'number' ? previous : parseFloat(String(previous));
    if (isNaN(curr) || isNaN(prev) || prev === 0) return null;
    return ((curr - prev) / prev) * 100;
  };

  const isCurrentWinning = useMemo(() => {
    if (!metrics || metrics.length === 0) return false;
    let currentWins = 0;
    metrics.forEach((m) => {
      const change = calculateChange(m.current, m.previous);
      if (change !== null && change > 0) currentWins++;
    });
    return currentWins > metrics.length / 2;
  }, [metrics]);

  return (
    <Box style={cardStyle} className={className}>
      <div style={accentBarStyle} />

      {/* Title */}
      {title && (
        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px 0` }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[2],
            }}
          >
            {title}
          </Text>
        </Box>
      )}

      {/* Two-column grid */}
      <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, padding: tokens.spacing[4] }}>
        {/* Column headers */}
        <Box
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}
        >
          <Box style={currentHeaderBadge}>{period.current}</Box>
          {isCurrentWinning && (
            <Box
              style={{
                width: tokens.spacing[2],
                height: tokens.spacing[2],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.successScale[500],
              }}
            />
          )}
        </Box>
        <Box
          style={{
            padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
          }}
        >
          <Box style={previousHeaderBadge}>{period.previous}</Box>
          {!isCurrentWinning && (
            <Box
              style={{
                width: tokens.spacing[2],
                height: tokens.spacing[2],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.successScale[500],
              }}
            />
          )}
        </Box>

        {/* Metric rows */}
        {metrics.map((metric, index) => {
          const change = calculateChange(metric.current, metric.previous);
          const isHovered = hoveredRow === index;
          const isPositive = change !== null && change > 0;
          const isNegative = change !== null && change < 0;
          const isLast = index === metrics.length - 1;

          const changeBadge = change !== null
            ? createBadgeStyle(tokens, isPositive ? 'success' : isNegative ? 'error' : 'info')
            : {};

          // Current column cell
          const currentCellStyle = {
            padding: tokens.spacing[4],
            backgroundColor: isHovered
              ? tokens.colors.primaryScale[50]
              : isPositive
                ? `${tokens.colors.primaryScale[50]}`
                : tokens.colors.common.white,
            borderBottom: isLast ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            transition: `all ${tokens.motion.hover}`,
            cursor: 'default',
          };

          // Previous column cell
          const previousCellStyle = {
            padding: tokens.spacing[4],
            backgroundColor: isHovered
              ? tokens.colors.neutral[50]
              : tokens.colors.common.white,
            borderBottom: isLast ? 'none' : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            transition: `all ${tokens.motion.hover}`,
            cursor: 'default',
          };

          return (
            <React.Fragment key={index}>
              {/* Current value cell */}
              <div
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                style={currentCellStyle}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {metric.label}
                </Text>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xl,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.primaryScale[700],
                    }}
                  >
                    {metric.current}{metric.unit}
                  </Text>
                  {change !== null && (
                    <Box style={changeBadge}>
                      {isPositive ? '\u2191' : isNegative ? '\u2193' : '\u2192'}{' '}
                      {Math.abs(change).toFixed(1)}%
                    </Box>
                  )}
                </Box>
              </div>

              {/* Previous value cell */}
              <div
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
                style={previousCellStyle}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    marginBottom: tokens.spacing[1],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {metric.label}
                </Text>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xl,
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[600],
                  }}
                >
                  {metric.previous}{metric.unit}
                </Text>
              </div>
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
});
