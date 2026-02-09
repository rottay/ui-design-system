'use client';

/**
 * StatWidget - Compact Preset
 * Premium compact stat card with colored icon ring, trend badge with arrow,
 * mini progress bar, description text, hover elevation, loading state with
 * Spinner, accent bar, and engine-aware glass container.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createProgressBarStyle,
  getCardHoverShadow,
} from '../../../helpers';
import type { StatWidgetProps } from '../../core';

export default createPreset<StatWidgetProps>((context: PresetContext<StatWidgetProps>) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text, Spinner } = primitives;

  const {
    title,
    value,
    description,
    icon,
    trend,
    progress,
    color = 'primary',
    onClick,
    loading,
    className,
    style,
  } = props;

  const [isHovered, setIsHovered] = useState(false);

  const colorScale = tokens.colors[`${color}Scale`];

  const cardStyle = useMemo(() => ({
    ...createCardStyle(tokens, {
      glass: isGlass,
      elevation: 'sm',
      interactive: !!onClick,
    }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    cursor: onClick ? 'pointer' : 'default',
    transition: `all ${tokens.motion.hover}`,
    ...style,
  }), [tokens, isGlass, onClick, style]);

  const progressStyles = useMemo(() => {
    if (progress === undefined) return null;
    return createProgressBarStyle(tokens, { percent: progress, color: colorScale[500] });
  }, [tokens, progress, colorScale]);

  const getTrendArrow = () => {
    if (!trend) return '';
    return trend.direction === 'up' ? '\u2191' : trend.direction === 'down' ? '\u2193' : '\u2192';
  };

  const getTrendColor = (): 'success' | 'error' | 'info' => {
    if (!trend) return 'info';
    return trend.direction === 'up' ? 'success' : trend.direction === 'down' ? 'error' : 'info';
  };

  // Loading state
  if (loading) {
    return (
      <Box
        className={className}
        style={{
          ...cardStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: tokens.spacing[24],
          opacity: 0.7,
        }}
      >
        <div style={createAccentBarStyle(tokens, { position: 'top', color: colorScale[400] })} />
        <Spinner size="md" />
      </Box>
    );
  }

  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        transform: isHovered && onClick ? tokens.motion.transform : 'none',
        boxShadow: isHovered ? getCardHoverShadow(tokens, 'sm') : cardStyle.boxShadow,
      }}
    >
      {/* Accent bar */}
      <div style={createAccentBarStyle(tokens, { position: 'top', color: colorScale[400] })} />

      <Box style={{
        padding: tokens.spacing[4],
        display: 'flex',
        flexDirection: 'column' as const,
        gap: tokens.spacing[3],
      }}>
        {/* Top row: icon + trend */}
        <Box style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Icon with colored ring */}
          {icon && (
            <Box style={{
              width: tokens.spacing[10],
              height: tokens.spacing[10],
              borderRadius: tokens.borderRadius.full,
              backgroundColor: colorScale[50],
              border: `2px solid ${colorScale[200]}`,
              color: colorScale[600],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: tokens.typography.fontSize.lg,
              flexShrink: 0,
              transition: `all ${tokens.motion.hover}`,
              boxShadow: isHovered ? `0 0 0 ${tokens.spacing[1]}px ${colorScale[100]}` : 'none',
            }}>
              {icon}
            </Box>
          )}

          {/* Trend badge */}
          {trend && (
            <Box style={{
              ...createBadgeStyle(tokens, getTrendColor()),
              gap: tokens.spacing[1],
            }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, lineHeight: 1 }}>
                {getTrendArrow()}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold }}>
                {trend.value}%
              </Text>
            </Box>
          )}
        </Box>

        {/* Value */}
        <Text style={{
          fontSize: tokens.typography.fontSize['2xl'],
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.neutral[900],
          lineHeight: tokens.typography.lineHeight.tight,
        }}>
          {value}
        </Text>

        {/* Title */}
        <Text style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          fontWeight: tokens.typography.fontWeight.medium,
          overflow: 'hidden' as const,
          textOverflow: 'ellipsis' as const,
          whiteSpace: 'nowrap' as const,
        }}>
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            lineHeight: tokens.typography.lineHeight.relaxed,
          }}>
            {description}
          </Text>
        )}

        {/* Mini progress bar */}
        {progressStyles && (
          <Box style={{ marginTop: tokens.spacing[1] }}>
            <Box style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: tokens.spacing[1],
            }}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                fontWeight: tokens.typography.fontWeight.medium,
              }}>
                Progress
              </Text>
              <Text style={{
                fontSize: tokens.typography.fontSize.xs,
                color: colorScale[600],
                fontWeight: tokens.typography.fontWeight.bold,
              }}>
                {progress}%
              </Text>
            </Box>
            <Box style={{ ...progressStyles.track, height: tokens.spacing[1] }}>
              <Box style={{ ...progressStyles.fill, height: '100%' }} />
            </Box>
          </Box>
        )}

        {/* Trend label */}
        {trend?.label && (
          <Text style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            paddingTop: tokens.spacing[2],
          }}>
            {trend.label}
          </Text>
        )}
      </Box>
    </div>
  );
});
