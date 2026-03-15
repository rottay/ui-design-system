'use client';

/**
 * LogoCloud - Scrolling Preset
 * Premium scrolling logo ticker with gradient fade edges, hover to reveal
 * color + scale-up, logo name tooltip, styled title header, and accent bar
 */

import { useState, useMemo } from 'react';
import { createPreset } from '../../../factory';
import type { LogoCloudProps } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const ScrollingPreset = createPreset<LogoCloudProps>((context) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;
  const { logos, title, description, className, style } = props;

  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Duplicate logos for seamless infinite scroll loop
  const duplicatedLogos = [...logos, ...logos];

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { elevation: 'sm', glass: isGlass }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing[6],
    ...style,
  }), [tokens, isGlass, style]);

  const accentBarStyle = useMemo(
    () => createAccentBarStyle(tokens, { position: 'top' }),
    [tokens],
  );

  const headerStyle = useMemo(
    () => createPanelHeaderStyle(tokens),
    [tokens],
  );

  return (
    <Box className={className} style={containerStyle}>
      {/* Accent bar */}
      <div style={accentBarStyle} />

      {/* Title / description header */}
      {(title || description) && (
        <Box
          style={{
            ...headerStyle,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            gap: tokens.spacing[2],
            textAlign: 'center' as const,
            paddingTop: tokens.spacing[6],
            paddingBottom: tokens.spacing[4],
          }}
        >
          {title && (
            <Text
              style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
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
                color: tokens.colors.neutral[500],
                maxWidth: '500px',
                lineHeight: tokens.typography.lineHeight.relaxed,
              }}
            >
              {description}
            </Text>
          )}
        </Box>
      )}

      {/* Scroll keyframes */}
      <style>
        {`
          @keyframes scroll-logos {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}
      </style>

      {/* Scrolling area with gradient fade edges */}
      <Box
        style={{
          position: 'relative' as const,
          overflow: 'hidden' as const,
          padding: `${tokens.spacing[4]}px 0`,
        }}
      >
        {/* Left gradient fade */}
        <Box
          style={{
            position: 'absolute' as const,
            left: 0,
            top: 0,
            bottom: 0,
            width: tokens.spacing[10],
            background: `linear-gradient(to right, ${tokens.colors.common.white}, transparent)`,
            zIndex: 2,
            pointerEvents: 'none' as const,
          }}
        />

        {/* Right gradient fade */}
        <Box
          style={{
            position: 'absolute' as const,
            right: 0,
            top: 0,
            bottom: 0,
            width: tokens.spacing[10],
            background: `linear-gradient(to left, ${tokens.colors.common.white}, transparent)`,
            zIndex: 2,
            pointerEvents: 'none' as const,
          }}
        />

        {/* Scrolling track */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[8],
            animation: 'scroll-logos 40s linear infinite',
            width: 'fit-content',
          }}
        >
          {duplicatedLogos.map((item, index) => {
            const itemKey = `${item.key}-${index}`;
            const isHovered = hoveredKey === itemKey;

            return (
              <Box
                key={itemKey}
                onClick={item.onClick}
                onMouseEnter={() => setHoveredKey(itemKey)}
                onMouseLeave={() => setHoveredKey(null)}
                style={{
                  position: 'relative' as const,
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '140px',
                  padding: `${tokens.spacing[4]}px ${tokens.spacing[6]}px`,
                  filter: isHovered ? 'grayscale(0)' : 'grayscale(1)',
                  opacity: isHovered ? 1 : 0.6,
                  transition: `all ${tokens.motion.hover}`,
                  transform: isHovered ? `scale(1.1)` : 'scale(1)',
                  cursor: item.onClick || item.href ? 'pointer' : 'default',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: isHovered
                    ? tokens.colors.primaryScale[50]
                    : 'transparent',
                }}
              >
                {item.logo}

                {/* Tooltip - logo name on hover */}
                {isHovered && (
                  <Box
                    style={{
                      position: 'absolute' as const,
                      bottom: `-${tokens.spacing[1]}px`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      color: tokens.colors.primaryScale[700],
                      backgroundColor: tokens.colors.primaryScale[50],
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      whiteSpace: 'nowrap' as const,
                      pointerEvents: 'none' as const,
                      boxShadow: tokens.shadows.sm,
                    }}
                  >
                    {item.name}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Bottom padding */}
      <Box style={{ height: tokens.spacing[4] }} />
    </Box>
  );
});
