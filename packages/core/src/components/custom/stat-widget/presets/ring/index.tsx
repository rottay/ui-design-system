'use client';

import React, {useState, useMemo} from 'react';
import { createPreset } from '../../../factory';
import {
  createAccentBarStyle, createCardStyle 
} from '../../../helpers';
import type { StatWidgetProps } from '../../core';

export default createPreset<StatWidgetProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const isGlass = engine === 'modern' && !!tokens.glass;
  const { Box, Text } = primitives;
  const {
    title,
    value,
    description,
    trend,
    progress = 0,
    color = 'primary',
    onClick,
    loading,
    className,
    style,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = useMemo(() => createCardStyle(tokens, { glass: isGlass, elevation: 'sm', interactive: !!onClick }), [tokens, onClick]);
  const colorScale = tokens.colors[`${color}Scale`];

  // Ring calculations
  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

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
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[6],
        ...style,
      }}
    >
      <div style={createAccentBarStyle(tokens, { position: 'top' })} />
      {/* Progress Ring */}
      <Box style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tokens.colors.neutral[100]}
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colorScale[500]}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            style={{
              transition: `stroke-dashoffset ${tokens.motion.hover}`,
            }}
          />
        </svg>

        {/* Center Value */}
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: 1,
            }}
          >
            {value}
          </Text>
        </Box>
      </Box>

      {/* Content */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.semibold,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[1],
          }}
        >
          {title}
        </Text>

        {/* Description */}
        {description && (
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              color: tokens.colors.neutral[500],
              marginBottom: trend ? tokens.spacing[2] : 0,
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
    </Box>
  );
});
