'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { ChartCardProps } from '../../core';

export default createPreset<ChartCardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    title,
    value,
    description,
    data,
    labels,
    color = 'primary',
    icon,
    onClick,
    loading,
    className,
    style,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = createCardStyle(tokens, { elevation: 'sm', interactive: !!onClick });
  const colorScale = tokens.colors[`${color}Scale`];

  const total = data.reduce((sum, val) => sum + val, 0);
  const radius = 50;
  const innerRadius = 30;
  const centerX = 60;
  const centerY = 60;

  // Calculate segments
  let currentAngle = -90; // Start at top
  const segments = data.map((val, i) => {
    const percentage = (val / total) * 100;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Calculate arc path
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return {
      pathData,
      percentage,
      color: (colorScale as unknown as Record<number, string>)[200 + i * 100] || colorScale[500],
    };
  });

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
        flexDirection: 'column',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Header */}
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[2],
          marginBottom: tokens.spacing[4],
          alignSelf: 'flex-start',
        }}
      >
        {icon && (
          <Box style={{ display: 'flex', color: colorScale[600] }}>
            {icon}
          </Box>
        )}
        <Text
          style={{
            fontSize: tokens.typography.fontSize.sm,
            color: tokens.colors.neutral[500],
            fontWeight: tokens.typography.fontWeight.medium,
          }}
        >
          {title}
        </Text>
      </Box>

      {/* Donut Chart */}
      <Box style={{ position: 'relative', marginBottom: tokens.spacing[6] }}>
        <svg
          viewBox="0 0 120 120"
          style={{
            width: '140px',
            height: '140px',
          }}
        >
          {segments.map((segment, i) => (
            <path
              key={i}
              d={segment.pathData}
              fill={segment.color}
              style={{
                transition: `all ${tokens.motion.hover}`,
              }}
            />
          ))}
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
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              lineHeight: 1,
            }}
          >
            {value}
          </Text>
          {description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              {description}
            </Text>
          )}
        </Box>
      </Box>

      {/* Legend */}
      {labels && labels.length > 0 && (
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[4], justifyContent: 'center' }}>
          {labels.map((label, i) => (
            <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Box
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: tokens.borderRadius.sm,
                  background: segments[i]?.color || colorScale[500],
                }}
              />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                {label}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
});
