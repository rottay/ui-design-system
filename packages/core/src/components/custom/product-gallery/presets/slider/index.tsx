'use client';

import React, { useState } from 'react';
import { createPreset } from '../../../factory';
import type { ProductGalleryProps } from '../../core';

export default createPreset<ProductGalleryProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const { images, onImageClick, className, style } = props;

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedImage = images[selectedIndex] || images[0];

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <Box className={className} style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4], ...style }}>
      {/* Main Slider */}
      <Box style={{ position: 'relative' }}>
        <Box
          onClick={() => onImageClick?.(selectedImage)}
          style={{
            width: '100%',
            height: '500px',
            borderRadius: tokens.borderRadius.lg,
            backgroundImage: `url(${selectedImage?.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: tokens.colors.neutral[100],
            cursor: onImageClick ? 'pointer' : 'default',
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Box
              as="button"
              onClick={goToPrevious}
              style={{
                position: 'absolute',
                left: tokens.spacing[4],
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: tokens.colors.neutral[700],
                boxShadow: tokens.shadows.md,
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.common.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              }}
            >
              ‹
            </Box>
            <Box
              as="button"
              onClick={goToNext}
              style={{
                position: 'absolute',
                right: tokens.spacing[4],
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: tokens.colors.neutral[700],
                boxShadow: tokens.shadows.md,
                transition: `all ${tokens.motion.hover}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.common.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              }}
            >
              ›
            </Box>
          </>
        )}

        {/* Indicators */}
        {images.length > 1 && (
          <Box
            style={{
              position: 'absolute',
              bottom: tokens.spacing[4],
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: tokens.spacing[1],
            }}
          >
            {images.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  width: selectedIndex === idx ? '24px' : '8px',
                  height: '8px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor:
                    selectedIndex === idx ? tokens.colors.common.white : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: `all ${tokens.motion.hover}`,
                }}
              />
            ))}
          </Box>
        )}
      </Box>

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
                border: `2px solid ${
                  selectedIndex === idx ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200]
                }`,
                transition: `all ${tokens.motion.hover}`,
                opacity: selectedIndex === idx ? 1 : 0.6,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                if (selectedIndex !== idx) {
                  e.currentTarget.style.opacity = '0.6';
                }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
});
