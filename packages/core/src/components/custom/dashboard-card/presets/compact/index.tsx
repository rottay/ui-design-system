'use client';

/**
 * DashboardCard - Compact Preset
 * Dense metric card with trend badge, mini sparkline SVG, progress indicator,
 * icon container, description text, and hover elevation with engine-aware glass.
 */

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createProgressBarStyle,
  getCardHoverShadow,
} from '../../../helpers';
import type { DashboardCardProps } from '../../core';

export const CompactDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<DashboardCardProps>) => {
    const { Box, Spinner } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const {
      title,
      value,
      description,
      icon,
      trend,
      chartData,
      breakdown,
      color = 'default',
      onClick,
      loading,
      className,
      style,
    } = props;
    const [isHovered, setIsHovered] = useState(false);

    const scaleMap: Record<string, any> = {
      default: tokens.colors.neutral,
      primary: tokens.colors.primaryScale,
      success: tokens.colors.successScale,
      warning: tokens.colors.warningScale,
      error: tokens.colors.errorScale,
    };
    const scale = scaleMap[color] || tokens.colors.neutral;

    const trendIcon = trend?.direction === 'up' ? '\u2191'
      : trend?.direction === 'down' ? '\u2193' : '\u2192';

    const cardStyle = useMemo(() => ({
      ...createCardStyle(tokens, {
        glass: isGlass,
        elevation: 'sm',
        padding: tokens.spacing[4],
        interactive: !!onClick,
      }),
      position: 'relative' as const,
      overflow: 'hidden' as const,
    }), [tokens, isGlass, onClick]);

    const accentBar = useMemo(() => createAccentBarStyle(tokens, {
      position: 'top',
      color: color !== 'default' ? scale[500] : undefined,
    }), [tokens, color, scale]);

    const trendBadge = useMemo(() => {
      if (!trend) return {};
      const badgeColor = trend.direction === 'up' ? 'success' as const
        : trend.direction === 'down' ? 'error' as const : 'secondary' as const;
      return createBadgeStyle(tokens, badgeColor);
    }, [tokens, trend]);

    const hoverShadow = useMemo(() => getCardHoverShadow(tokens, 'sm'), [tokens]);

    /** Generate a simple mini sparkline SVG from chartData */
    const sparklineSvg = useMemo(() => {
      if (!chartData || chartData.length < 2) return null;
      const width = 64;
      const height = 24;
      const max = Math.max(...chartData);
      const min = Math.min(...chartData);
      const range = max - min || 1;
      const step = width / (chartData.length - 1);

      const points = chartData.map((val, i) => {
        const x = i * step;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      }).join(' ');

      const lineColor = color !== 'default' ? scale[500] : tokens.colors.primaryScale[400];
      const fillColor = color !== 'default' ? scale[100] : tokens.colors.primaryScale[50];

      const areaPoints = `0,${height} ${points} ${width},${height}`;

      return (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ flexShrink: 0, overflow: 'visible' }}
        >
          <polygon points={areaPoints} fill={fillColor} opacity={0.5} />
          <polyline
            points={points}
            fill="none"
            stroke={lineColor}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }, [chartData, tokens, color, scale]);

    const progressBar = useMemo(() => {
      if (!breakdown?.[0]?.percentage) return null;
      return createProgressBarStyle(tokens, {
        color: color !== 'default' ? scale[500] : undefined, percent: breakdown[0].percentage,
      });
    }, [tokens, breakdown, color, scale]);

    return (
      <div
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        style={{
          ...cardStyle,
          transform: isHovered && onClick ? tokens.motion.transform : 'none',
          boxShadow: isHovered && onClick ? hoverShadow : cardStyle.boxShadow,
          transition: `all ${tokens.motion.hover}`,
          ...style,
        }}
      >
        {/* Accent bar */}
        <div style={{ ...accentBar, position: 'absolute', top: 0, left: 0 }} />

        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[4] }}>
            <Spinner size="md" />
          </Box>
        ) : (
          <>
            {/* Top row: icon + title + sparkline */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[3],
                marginBottom: tokens.spacing[2],
              }}
            >
              {/* Icon container */}
              {icon && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: tokens.spacing[9],
                    height: tokens.spacing[9],
                    borderRadius: tokens.borderRadius.lg,
                    backgroundColor: scale[50],
                    color: scale[600],
                    fontSize: tokens.typography.fontSize.xl,
                    flexShrink: 0,
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${scale[100]}`,
                  }}
                >
                  {icon}
                </div>
              )}

              {/* Title + value */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.medium,
                    lineHeight: tokens.typography.lineHeight.tight,
                    marginBottom: tokens.spacing[1],
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: color === 'default' ? tokens.colors.neutral[900] : scale[700],
                    lineHeight: tokens.typography.lineHeight.tight,
                  }}
                >
                  {value}
                </div>
              </div>

              {/* Sparkline chart */}
              {sparklineSvg}
            </div>

            {/* Trend badge + description row */}
            {(trend || description) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginTop: tokens.spacing[1],
                }}
              >
                {trend && (
                  <span
                    style={{
                      ...trendBadge,
                      gap: tokens.spacing[1],
                    }}
                  >
                    <span>{trendIcon}</span>
                    <span>{trend.value}%</span>
                  </span>
                )}
                {(trend?.label || description) && (
                  <span
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      fontWeight: tokens.typography.fontWeight.normal,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {trend?.label || description}
                  </span>
                )}
              </div>
            )}

            {/* Progress bar from first breakdown */}
            {progressBar && (
              <div style={{ marginTop: tokens.spacing[3] }}>
                <div style={progressBar.track}>
                  <div style={progressBar.fill} />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  },
});
