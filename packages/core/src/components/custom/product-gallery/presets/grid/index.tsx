'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { ProductGalleryProps } from '../../core';
import {
  createHoverStyle,
} from '../../../helpers';

export default createPreset<ProductGalleryProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const { images, onImageClick, className, style } = props;

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex] || images[0];

  return (
    <Box className={className} style={{
      boxShadow: tokens.shadows.md, display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
      {/* Main Image */}
      <Box
        onClick={() => onImageClick?.(selectedImage)}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: tokens.borderRadius.lg,
          backgroundImage: `url(${selectedImage?.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: tokens.colors.neutral[100],
          cursor: onImageClick ? 'pointer' : 'default',
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
        }}
      />

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            overflowX: 'auto',
          }}
        >
          {images.map((image, idx) => (
            <Box
              key={image.id}
              onClick={() => setSelectedIndex(idx)}
              style={{
                width: '80px',
                height: '80px',
                flexShrink: 0,
                borderRadius: tokens.borderRadius.md,
                backgroundImage: `url(${image.thumbnail || image.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: tokens.colors.neutral[100],
                cursor: 'pointer',
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                  selectedIndex === idx ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200]
                }`,
                transition: `all ${tokens.motion.hover}`,
                opacity: selectedIndex === idx ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = tokens.motion.transform;
              }}
              onMouseLeave={(e) => {
                if (selectedIndex !== idx) {
                  e.currentTarget.style.opacity = '0.6';
                  e.currentTarget.style.transform = 'none';
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});
