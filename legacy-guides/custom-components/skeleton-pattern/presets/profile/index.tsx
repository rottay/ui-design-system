import React, { useMemo } from 'react';
import { createPreset } from '../../../factory';
import { createSurfaceStyle } from '../../../helpers';
import type { SkeletonPatternProps } from '../../core';

export default createPreset<SkeletonPatternProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const { animate = true, className, style } = props;

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
          ...surfaceStyle,
          borderRadius: tokens.borderRadius.md,
          padding: tokens.spacing[8],
          maxWidth: '400px',
          ...style,
        }}
      >
        {/* Avatar */}
        <Box
          style={{
            width: '64px',
            height: '64px',
            borderRadius: tokens.borderRadius.full,
            marginBottom: tokens.spacing[6],
            ...shimmerStyle,
          }}
        />

        {/* Name Bar */}
        <Box
          style={{
            height: '24px',
            width: '60%',
            borderRadius: tokens.borderRadius.sm,
            marginBottom: tokens.spacing[2],
            ...shimmerStyle,
          }}
        />

        {/* Subtitle Bar */}
        <Box
          style={{
            height: '16px',
            width: '40%',
            borderRadius: tokens.borderRadius.sm,
            marginBottom: tokens.spacing[8],
            ...shimmerStyle,
          }}
        />

        {/* Detail Rows */}
        {Array.from({ length: 3 }).map((_, index) => (
          <Box
            key={`detail-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[4],
              marginBottom: tokens.spacing[4],
            }}
          >
            {/* Label */}
            <Box
              style={{
                height: '14px',
                width: '30%',
                borderRadius: tokens.borderRadius.sm,
                ...shimmerStyle,
              }}
            />
            {/* Value */}
            <Box
              style={{
                height: '14px',
                flex: 1,
                borderRadius: tokens.borderRadius.sm,
                ...shimmerStyle,
              }}
            />
          </Box>
        ))}
      </Box>
    </>
  );
});
