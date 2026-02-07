'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { ContentCardProps } from '../../core';

export default createPreset<ContentCardProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { title, fileSize, fileType, onClick, className, style } = props;
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = (type?: string): string => {
    if (!type) return '📄';
    if (type.includes('pdf')) return '📕';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎬';
    if (type.includes('audio')) return '🎵';
    if (type.includes('zip') || type.includes('archive')) return '📦';
    if (type.includes('code') || type.includes('text')) return '📝';
    return '📄';
  };

  return (
    <Box
      onClick={onClick}
      className={className}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (onClick) {
          e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (onClick) {
          e.currentTarget.style.backgroundColor = tokens.colors.common.white;
        }
      }}
      style={{
        transition: `all ${tokens.motion.hover}`,
        transform: isHovered && onClick ? tokens.motion.transform : 'none',
        boxShadow: tokens.shadows.md,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[4],
        padding: tokens.spacing[4],
        backgroundColor: tokens.colors.common.white,
        borderRadius: tokens.borderRadius.md,
        border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {/* File Icon */}
      <Box
        style={{
          width: '40px',
          height: '40px',
          borderRadius: tokens.borderRadius.md,
          backgroundColor: tokens.colors.primaryScale[50],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '20px',
        }}
      >
        {getFileIcon(fileType)}
      </Box>

      {/* File Info */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text
          style={{
            fontSize: tokens.typography.fontSize.md,
            fontWeight: tokens.typography.fontWeight.medium,
            color: tokens.colors.neutral[900],
            marginBottom: tokens.spacing[1],
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </Text>
        <Box style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
          {fileType && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
              }}
            >
              {fileType.toUpperCase()}
            </Text>
          )}
          {fileSize && (
            <>
              {fileType && (
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                  •
                </Text>
              )}
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                }}
              >
                {fileSize}
              </Text>
            </>
          )}
        </Box>
      </Box>

      {/* Download Icon */}
      <Box
        style={{
          width: '32px',
          height: '32px',
          borderRadius: tokens.borderRadius.md,
          backgroundColor: tokens.colors.neutral[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: '16px' }}>⬇️</Text>
      </Box>
    </Box>
  );
});
