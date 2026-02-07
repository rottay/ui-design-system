'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { MediaGalleryProps } from '../../core';
import { MEDIA_GALLERY_DEFAULTS } from '../../core';

export default createPreset<MediaGalleryProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { items, onSelect, columns = MEDIA_GALLERY_DEFAULTS.columns, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: tokens.spacing[4],
        ...style,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.id}
          onClick={() => onSelect?.(item)}
          style={{
            aspectRatio: '1 / 1',
            cursor: 'pointer',
            position: 'relative',
            borderRadius: tokens.borderRadius.md,
            overflow: 'hidden',
            backgroundColor: tokens.colors.neutral[100],
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
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
                width: '48px',
                height: '48px',
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
                  borderLeft: `12px solid ${tokens.colors.common.white}`,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  marginLeft: '4px',
                }}
              />
            </Box>
          )}
          {item.title && (
            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: tokens.spacing[2],
                background: `linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  color: tokens.colors.common.white,
                }}
              >
                {item.title}
              </Text>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
});
