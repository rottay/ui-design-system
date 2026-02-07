import React from 'react';
import { createPreset } from '../../../factory';
import type { SkeletonPatternProps } from '../../core';

export default createPreset<SkeletonPatternProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const { rows = 5, animate = true, className, style } = props;

  const shimmerStyle = animate ? {
    background: `linear-gradient(90deg, ${tokens.colors.neutral[100]} 0%, ${tokens.colors.neutral[50]} 50%, ${tokens.colors.neutral[100]} 100%)`,
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
  } : {
    background: tokens.colors.neutral[100],
  };

  return (
    <>
      {animate && (
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200px 0; }
            100% { background-position: 200px 0; }
          }
        `}</style>
      )}
      <Box
        className={className}
        style={{
          width: '100%',
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          overflow: 'hidden',
          ...style,
        }}
      >
        {Array.from({ length: rows }).map((_, index) => (
          <Box
            key={`list-item-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              padding: tokens.spacing[4],
              borderBottom: index < rows - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : undefined,
            }}
          >
            {/* Avatar Circle */}
            <Box
              style={{
                width: '40px',
                height: '40px',
                borderRadius: tokens.borderRadius.full,
                flexShrink: 0,
                ...shimmerStyle,
              }}
            />

            {/* Text Content */}
            <Box style={{ flex: 1 }}>
              {/* Title Line */}
              <Box
                style={{
                  height: '16px',
                  width: '70%',
                  borderRadius: tokens.borderRadius.sm,
                  marginBottom: tokens.spacing[2],
                  ...shimmerStyle,
                }}
              />

              {/* Subtitle Line */}
              <Box
                style={{
                  height: '14px',
                  width: '50%',
                  borderRadius: tokens.borderRadius.sm,
                  ...shimmerStyle,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </>
  );
});
