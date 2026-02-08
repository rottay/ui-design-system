'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { ContentCardProps } from '../../core';

export default createPreset<ContentCardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { title, description, icon, meta, tags, onClick, className, style } = props;
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      onClick={onClick}
      className={className}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (onClick) {
          e.currentTarget.style.borderColor = tokens.colors.primaryScale[300];
          e.currentTarget.style.boxShadow = tokens.shadows.md;
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (onClick) {
          e.currentTarget.style.borderColor = tokens.colors.neutral[200];
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
      style={{
        transition: `all ${tokens.motion.hover}`,
        transform: isHovered && onClick ? tokens.motion.transform : 'none',
        padding: tokens.spacing[6],
        backgroundColor: tokens.colors.common.white,
        borderRadius: tokens.borderRadius.lg,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      <Box style={{ display: 'flex', gap: tokens.spacing[4] }}>
        {/* Icon */}
        {icon && (
          <Box
            style={{
              width: '48px',
              height: '48px',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[50],
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: tokens.typography.fontSize['2xl'],
            }}
          >
            {icon}
          </Box>
        )}

        {/* Content */}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[1],
            }}
          >
            {title}
          </Text>
          {description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
                lineHeight: tokens.typography.lineHeight.normal,
                marginBottom: tokens.spacing[4],
              }}
            >
              {description}
            </Text>
          )}

          {/* Meta */}
          {meta && meta.length > 0 && (
            <Box
              style={{
                display: 'flex',
                gap: tokens.spacing[6],
                marginBottom: tags && tags.length > 0 ? tokens.spacing[4] : 0,
              }}
            >
              {meta.map((item, idx) => (
                <Box key={idx}>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginBottom: tokens.spacing[1],
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.neutral[900],
                    }}
                  >
                    {item.value}
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
              {tags.map((tag, idx) => (
                <Box
                  key={idx}
                  style={{
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    borderRadius: tokens.borderRadius.sm,
                    backgroundColor: tokens.colors.neutral[100],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[700],
                    }}
                  >
                    {tag}
                  </Text>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
});
