import React from 'react';
import { createPreset } from '../../../factory';
import type { SkeletonPatternProps } from '../../core';

export default createPreset<SkeletonPatternProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box } = primitives;
  const { rows = 5, columns = 4, animate = true, className, style } = props;

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
          overflow: 'hidden',
          borderRadius: tokens.borderRadius.md,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          ...style,
        }}
      >
        {/* Header Row */}
        <Box
          style={{
            display: 'flex',
            height: '44px',
            alignItems: 'center',
            padding: `0 ${tokens.spacing[4]}`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
            gap: tokens.spacing[4],
          }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Box
              key={`header-${i}`}
              style={{
                height: '20px',
                flex: i === 0 ? '2' : '1',
                borderRadius: tokens.borderRadius.sm,
                ...shimmerStyle,
              }}
            />
          ))}
        </Box>

        {/* Data Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Box
            key={`row-${rowIndex}`}
            style={{
              display: 'flex',
              height: '44px',
              alignItems: 'center',
              padding: `0 ${tokens.spacing[4]}`,
              borderBottom: rowIndex < rows - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : undefined,
              gap: tokens.spacing[4],
            }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => {
              const widths = ['60%', '80%', '40%', '70%'];
              return (
                <Box
                  key={`cell-${colIndex}`}
                  style={{
                    height: '16px',
                    flex: colIndex === 0 ? '2' : '1',
                    width: widths[colIndex % widths.length],
                    borderRadius: tokens.borderRadius.sm,
                    ...shimmerStyle,
                  }}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    </>
  );
});
