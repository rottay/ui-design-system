'use client';

import React, {useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {
  createAccentBarStyle,
  createBadgeStyle,
  createCardStyle,

} from '../../../helpers';
import type { StatWidgetProps } from '../../core';

export default createPreset<StatWidgetProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { Box, Text } = primitives;
  const {
    title,
    value,
    description,
    icon,
    trend,
    color = 'primary',
    onClick,
    loading,
    className,
    style,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = useMemo(() => createCardStyle(tokens, { glass: isGlass, elevation: 'sm', interactive: !!onClick }), [tokens, onClick]);
  const colorScale = tokens.colors[`${color}Scale`];

  const getTrendColor = () => {
    if (!trend) return tokens.colors.neutral[500];
    if (trend.direction === 'up') return tokens.colors.successScale[600];
    if (trend.direction === 'down') return tokens.colors.errorScale[600];
    return tokens.colors.neutral[500];
  };

  const getTrendBg = () => {
    if (!trend) return tokens.colors.neutral[50];
    if (trend.direction === 'up') return tokens.colors.successScale[50];
    if (trend.direction === 'down') return tokens.colors.errorScale[50];
    return tokens.colors.neutral[50];
  };

  return (
    <Box
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...cardStyle,
        cursor: onClick ? 'pointer' : 'default',
        transition: `all ${tokens.motion.hover}`,
        transform: isHovered && onClick ? tokens.motion.transform : 'none',
        opacity: loading ? 0.6 : 1,
        pointerEvents: loading ? 'none' : 'auto',
        ...style,
      }}
    >
      <div style={createAccentBarStyle(tokens, { position: 'top' })} />
      {/* Icon */}
      {icon && (
        <Box
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: tokens.borderRadius.full,
            background: colorScale[50],
            color: colorScale[600],
            marginBottom: tokens.spacing[4],
          }}
        >
          {icon}
        </Box>
      )}

      {/* Value */}
      <Text
        style={{
          fontSize: tokens.typography.fontSize['3xl'],
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.neutral[900],
          lineHeight: 1.2,
          marginBottom: tokens.spacing[1],
        }}
      >
        {value}
      </Text>

      {/* Title */}
      <Text
        style={{
          fontSize: tokens.typography.fontSize.sm,
          color: tokens.colors.neutral[500],
          fontWeight: tokens.typography.fontWeight.medium,
          marginBottom: description || trend ? tokens.spacing[1] : 0,
        }}
      >
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text
          style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[400],
            marginBottom: trend ? tokens.spacing[4] : 0,
          }}
        >
          {description}
        </Text>
      )}

      {/* Trend Badge */}
      {trend && (
        <Box
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: tokens.spacing[1],
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            borderRadius: tokens.borderRadius.md,
            background: getTrendBg(),
            fontSize: tokens.typography.fontSize.xs,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: getTrendColor(),
            marginTop: tokens.spacing[2],
          }}
        >
          {trend.direction === 'up' && '↑'}
          {trend.direction === 'down' && '↓'}
          {trend.direction === 'neutral' && '→'}
          {trend.value}%
          {trend.label && ` ${trend.label}`}
        </Box>
      )}
    </Box>
  );
});
