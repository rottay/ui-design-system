'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { StatWidgetProps } from '../../core';

export default createPreset<StatWidgetProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const {
    title,
    value,
    icon,
    color = 'primary',
    onClick,
    loading,
    className,
    style,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = createCardStyle(tokens, { elevation: 'sm', interactive: !!onClick });
  const colorScale = tokens.colors[`${color}Scale`];

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
        gap: tokens.spacing[4],
        padding: tokens.spacing[4],
        ...style,
      }}
    >
      {/* Icon */}
      {icon && (
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: tokens.borderRadius.md,
            background: colorScale[50],
            color: colorScale[600],
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}

      {/* Value */}
      <Text
        style={{
          fontSize: tokens.typography.fontSize.xl,
          fontWeight: tokens.typography.fontWeight.bold,
          color: tokens.colors.neutral[900],
          lineHeight: 1,
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
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </Text>
    </Box>
  );
});
