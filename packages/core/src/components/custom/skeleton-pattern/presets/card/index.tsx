import React, { useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
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

  const surfaceStyle = useMemo(() => createSurfaceStyle(tokens), [tokens]);

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
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: tokens.spacing[6],
          ...style,
        }}
      >
        {Array.from({ length: rows }).map((_, index) => (
          <Box
            key={`card-${index}`}
            style={{
              ...surfaceStyle,
              borderRadius: tokens.borderRadius.md,
              overflow: 'hidden',
            }}
          >
            {/* Image Placeholder */}
            <Box
              style={{
                width: '100%',
                aspectRatio: '16/9',
                ...shimmerStyle,
              }}
            />

            {/* Content */}
            <Box style={{ padding: tokens.spacing[6] }}>
              {/* Title */}
              <Box
                style={{
                  height: '20px',
                  width: '60%',
                  borderRadius: tokens.borderRadius.sm,
                  marginBottom: tokens.spacing[4],
                  ...shimmerStyle,
                }}
              />

              {/* Description Line 1 */}
              <Box
                style={{
                  height: '14px',
                  width: '100%',
                  borderRadius: tokens.borderRadius.sm,
                  marginBottom: tokens.spacing[2],
                  ...shimmerStyle,
                }}
              />

              {/* Description Line 2 */}
              <Box
                style={{
                  height: '14px',
                  width: '70%',
                  borderRadius: tokens.borderRadius.sm,
                  marginBottom: tokens.spacing[6],
                  ...shimmerStyle,
                }}
              />

              {/* Footer Bar */}
              <Box
                style={{
                  height: '16px',
                  width: '40%',
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
