'use client';

/**
 * ProductGallery - Grid Preset
 * Premium gallery with hover zoom on main image, navigation arrows,
 * image counter badge, active thumbnail indicator with accent bar,
 * loading placeholder, and smooth transitions on image switch
 */

import React, { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { ProductGalleryProps } from '../../core';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
} from '../../../helpers';

export default createPreset<ProductGalleryProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { images, onImageClick, className, style } = props;

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMainHovered, setIsMainHovered] = useState(false);
  const [hoveredThumb, setHoveredThumb] = useState<number | null>(null);

  const selectedImage = images[selectedIndex] || images[0];
  const hasMultiple = images.length > 1;

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { elevation: 'md', glass: isGlass }),
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing[4],
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  }), [tokens, isGlass, style]);

  const accentBarStyle = useMemo(
    () => createAccentBarStyle(tokens, { position: 'top' }),
    [tokens],
  );

  const counterBadgeStyle = useMemo(
    () => createBadgeStyle(tokens, 'primary'),
    [tokens],
  );

  const goToPrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Box className={className} style={containerStyle}>
      {/* Accent bar */}
      <div style={accentBarStyle} />

      {/* Main image area */}
      <Box
        onClick={() => onImageClick?.(selectedImage)}
        onMouseEnter={() => setIsMainHovered(true)}
        onMouseLeave={() => setIsMainHovered(false)}
        style={{
          position: 'relative' as const,
          width: '100%',
          height: '400px',
          borderRadius: tokens.borderRadius.lg,
          overflow: 'hidden' as const,
          cursor: onImageClick ? 'pointer' : 'default',
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[100],
        }}
      >
        {/* Image with zoom effect */}
        <Box
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: selectedImage ? `url(${selectedImage.src})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: `transform ${tokens.motion.hover}`,
            transform: isMainHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Loading placeholder when no image */}
        {!selectedImage && (
          <Box
            style={{
              position: 'absolute' as const,
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: tokens.colors.neutral[400],
              fontSize: tokens.typography.fontSize.sm,
            }}
          >
            No image available
          </Box>
        )}

        {/* Image counter badge */}
        {hasMultiple && (
          <Box
            style={{
              position: 'absolute' as const,
              top: tokens.spacing[3],
              right: tokens.spacing[3],
              ...counterBadgeStyle,
              boxShadow: tokens.shadows.sm,
            }}
          >
            {selectedIndex + 1} / {images.length}
          </Box>
        )}

        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <Box
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); goToPrev(); }}
              style={{
                position: 'absolute' as const,
                left: tokens.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                width: tokens.spacing[8],
                height: tokens.spacing[8],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.common.white,
                boxShadow: tokens.shadows.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.colors.neutral[700],
                transition: `all ${tokens.motion.hover}`,
                opacity: isMainHovered ? 1 : 0,
              }}
            >
              &#8249;
            </Box>
            <Box
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); goToNext(); }}
              style={{
                position: 'absolute' as const,
                right: tokens.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                width: tokens.spacing[8],
                height: tokens.spacing[8],
                borderRadius: tokens.borderRadius.full,
                backgroundColor: tokens.colors.common.white,
                boxShadow: tokens.shadows.md,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: tokens.typography.fontSize.lg,
                color: tokens.colors.neutral[700],
                transition: `all ${tokens.motion.hover}`,
                opacity: isMainHovered ? 1 : 0,
              }}
            >
              &#8250;
            </Box>
          </>
        )}
      </Box>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            overflowX: 'auto' as const,
            padding: `0 ${tokens.spacing[2]}px ${tokens.spacing[2]}px`,
          }}
        >
          {images.map((image, idx) => {
            const isSelected = selectedIndex === idx;
            const isHovered = hoveredThumb === idx;

            return (
              <Box
                key={image.id}
                onClick={() => setSelectedIndex(idx)}
                onMouseEnter={() => setHoveredThumb(idx)}
                onMouseLeave={() => setHoveredThumb(null)}
                style={{
                  position: 'relative' as const,
                  width: tokens.spacing[16],
                  height: tokens.spacing[16],
                  flexShrink: 0,
                  borderRadius: tokens.borderRadius.md,
                  backgroundImage: `url(${image.thumbnail || image.src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundColor: tokens.colors.neutral[100],
                  cursor: 'pointer',
                  border: `2px solid ${
                    isSelected
                      ? tokens.colors.primaryScale[600]
                      : isHovered
                        ? tokens.colors.primaryScale[300]
                        : tokens.colors.neutral[200]
                  }`,
                  transition: `all ${tokens.motion.hover}`,
                  opacity: isSelected ? 1 : isHovered ? 0.9 : 0.7,
                  transform: isHovered && !isSelected ? tokens.motion.transform : 'none',
                  overflow: 'hidden' as const,
                }}
              >
                {/* Active indicator accent bar at bottom */}
                {isSelected && (
                  <Box
                    style={{
                      position: 'absolute' as const,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: `linear-gradient(to right, ${tokens.colors.primaryScale[400]}, ${tokens.colors.primaryScale[600]})`,
                    }}
                  />
                )}
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
});
