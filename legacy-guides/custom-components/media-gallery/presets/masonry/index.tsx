'use client';

import React from 'react';
import { createPreset } from '../../../factory';
import type { MediaGalleryProps } from '../../core';
import { MEDIA_GALLERY_DEFAULTS } from '../../core';
import {
  createHoverStyle,
} from '../../../helpers';

export default createPreset<MediaGalleryProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { items, onSelect, columns = MEDIA_GALLERY_DEFAULTS.columns, className, style } = props;

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.md,
        columnCount: columns,
        columnGap: tokens.spacing[4],
        ...style,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.id}
          onClick={() => onSelect?.(item)}
          style={{
            breakInside: 'avoid',
            marginBottom: tokens.spacing[4],
            cursor: 'pointer',
            position: 'relative',
            borderRadius: tokens.borderRadius.md,
            overflow: 'hidden',
            transition: `all ${tokens.motion.hover}`,
          }}
          onMouseEnter={(e) => {
            const overlay = e.currentTarget.querySelector('[data-overlay="true"]') as HTMLElement;
            if (overlay) {
              overlay.style.opacity = '1';
            }
            (e.currentTarget as HTMLElement).style.transform = tokens.motion.transform;
          }}
          onMouseLeave={(e) => {
            const overlay = e.currentTarget.querySelector('[data-overlay="true"]') as HTMLElement;
            if (overlay) {
              overlay.style.opacity = '0';
            }
            (e.currentTarget as HTMLElement).style.transform = 'none';
          }}
        >
          {item.type === 'image' ? (
            <img
              src={item.thumbnail || item.src}
              alt={item.title || 'Gallery item'}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: tokens.borderRadius.md,
              }}
            />
          ) : (
            <video
              src={item.src}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: tokens.borderRadius.md,
              }}
            />
          )}
          {item.title && (
            <Box
              data-overlay="true"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: tokens.spacing[4],
                background: `linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)`,
                opacity: 0,
                transition: `opacity ${tokens.transitions?.fast || tokens.motion.hover}`,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  color: tokens.colors.common.white,
                }}
              >
                {item.title}
              </Text>
              {item.description && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.common.white,
                    marginTop: tokens.spacing[1],
                  }}
                >
                  {item.description}
                </Text>
              )}
            </Box>
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
                backgroundColor: tokens.overlay?.medium,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `10px solid ${tokens.colors.common.white}`,
                  borderTop: '8px solid transparent',
                  borderBottom: '8px solid transparent',
                  marginLeft: '4px',
                }}
              />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
});
