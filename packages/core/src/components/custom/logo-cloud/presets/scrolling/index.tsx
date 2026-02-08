'use client';

import { createPreset } from '../../../factory';
import type { LogoCloudProps } from '../../core';
import { createEmptyStateStyle } from '../../../helpers';

export const ScrollingPreset = createPreset<LogoCloudProps>((context) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;
  const { logos, title, description, className, style } = props;

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <Box
      className={className}
      style={{
        boxShadow: tokens.shadows.sm,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacing[8],
        overflow: 'hidden',
        padding: tokens.spacing[8],
        ...style,
      }}
    >
      {(title || description) && (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: tokens.spacing[2],
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {title && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {title}
            </Text>
          )}
          {description && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[600],
              }}
            >
              {description}
            </Text>
          )}
        </Box>
      )}

      <style>
        {`
          @keyframes scroll-logos {
            from {
              transform: translateX(0);
            }
            to {
              transform: translateX(-50%);
            }
          }
        `}
      </style>

      <Box
        style={{
          display: 'flex',
          gap: tokens.spacing[8],
          animation: 'scroll-logos 30s linear infinite',
          width: 'fit-content',
        }}
      >
        {duplicatedLogos.map((item, index) => (
          <Box
            key={`${item.key}-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '150px',
              padding: tokens.spacing[6],
              filter: 'grayscale(1)',
              opacity: 0.7,
            }}
          >
            {item.logo}
          </Box>
        ))}
      </Box>
    </Box>
  );
});
