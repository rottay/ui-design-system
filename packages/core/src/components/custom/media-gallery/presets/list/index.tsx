'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { MediaGalleryProps } from '../../core';

export default createPreset<MediaGalleryProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { items, onSelect, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[4],
        ...style,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.id}
          onClick={() => onSelect?.(item)}
          style={{
            display: 'flex',
            gap: tokens.spacing[4],
            padding: tokens.spacing[4],
            backgroundColor: tokens.colors.common.white,
            borderRadius: tokens.borderRadius.md,
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
            cursor: 'pointer',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tokens.colors.common.white;
          }}
        >
          {/* Thumbnail */}
          <Box
            style={{
              width: '120px',
              height: '80px',
              flexShrink: 0,
              borderRadius: tokens.borderRadius.md,
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: tokens.colors.neutral[100],
            }}
          >
            {item.type === 'image' ? (
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${item.thumbnail || item.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            ) : (
              <video
                src={item.src}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            )}
            {item.type === 'video' && (
              <Box
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '32px',
                  height: '32px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: `8px solid ${tokens.colors.common.white}`,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    marginLeft: '2px',
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Details */}
          <Box style={{ flex: 1, minWidth: 0 }}>
            {item.title && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[1],
                }}
              >
                {item.title}
              </Text>
            )}
            {item.description && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[600],
                  lineHeight: tokens.typography.lineHeight.normal,
                }}
              >
                {item.description}
              </Text>
            )}
            {(item.width || item.height) && (
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}
              >
                {item.width} × {item.height}
              </Text>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
});
