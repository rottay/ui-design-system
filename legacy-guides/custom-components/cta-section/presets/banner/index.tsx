'use client';

/**
 * CtaSection - Banner Preset
 * Premium full-width gradient banner with decorative pattern overlay,
 * promo badge, shimmer accent, and button hover effects with inverse colors
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createBadgeStyle,
  createHoverStyle,
} from '../../../helpers';
import type { CtaSectionProps } from '../../core';

export const BannerCtaSection = createPreset<CtaSectionProps>({
  name: 'CtaSection.Banner',
  render: ({ primitives, props, tokens, engine }: PresetContext<CtaSectionProps>) => {
    const { Box, Button, Text, Stack } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const { title, description, actions, className, style } = props;

    const [hoveredAction, setHoveredAction] = useState<string | null>(null);

    const bannerStyle = useMemo(() => ({
      position: 'relative' as const,
      overflow: 'hidden' as const,
      background: `linear-gradient(135deg, ${tokens.colors.primaryScale[700]}, ${tokens.colors.primaryScale[600]}, ${tokens.colors.primaryScale[800]})`,
      padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
      borderRadius: tokens.borderRadius.lg,
      ...style,
    }), [tokens, style]);

    const promoBadgeStyle = useMemo(() => ({
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.full,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      backgroundColor: tokens.colors.common.white,
      color: tokens.colors.primaryScale[700],
      letterSpacing: '0.04em',
      textTransform: 'uppercase' as const,
    }), [tokens]);

    return (
      <Box className={className} style={bannerStyle}>
        {/* Decorative pattern overlay - diagonal lines */}
        <Box
          style={{
            position: 'absolute' as const,
            inset: 0,
            opacity: 0.06,
            backgroundImage: `repeating-linear-gradient(
              45deg,
              ${tokens.colors.common.white} 0,
              ${tokens.colors.common.white} 1px,
              transparent 0,
              transparent 50%
            )`,
            backgroundSize: `${tokens.spacing[4]}px ${tokens.spacing[4]}px`,
            pointerEvents: 'none' as const,
          }}
        />

        {/* Shimmer accent glow */}
        <Box
          style={{
            position: 'absolute' as const,
            top: 0,
            left: '20%',
            width: '60%',
            height: '1px',
            background: `linear-gradient(to right, transparent, ${tokens.colors.common.white}, transparent)`,
            opacity: 0.5,
            pointerEvents: 'none' as const,
          }}
        />

        {/* Decorative circle */}
        <Box
          style={{
            position: 'absolute' as const,
            top: `-${tokens.spacing[8]}px`,
            right: `-${tokens.spacing[4]}px`,
            width: '180px',
            height: '180px',
            borderRadius: tokens.borderRadius.full,
            border: `1px solid ${tokens.colors.common.white}`,
            opacity: 0.08,
            pointerEvents: 'none' as const,
          }}
        />
        <Box
          style={{
            position: 'absolute' as const,
            bottom: `-${tokens.spacing[6]}px`,
            left: `-${tokens.spacing[4]}px`,
            width: '120px',
            height: '120px',
            borderRadius: tokens.borderRadius.full,
            border: `1px solid ${tokens.colors.common.white}`,
            opacity: 0.06,
            pointerEvents: 'none' as const,
          }}
        />

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: tokens.spacing[8],
            maxWidth: '1200px',
            margin: '0 auto',
            flexWrap: 'wrap' as const,
            position: 'relative' as const,
            zIndex: 1,
          }}
        >
          {/* Left: Text content */}
          <Box style={{ flex: '1 1 400px' }}>
            <Stack direction="vertical" spacing="md">
              {/* Promo badge */}
              <Box>
                <Box style={promoBadgeStyle}>Limited Offer</Box>
              </Box>

              <Text
                style={{
                  fontSize: tokens.typography.fontSize['3xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.common.white,
                  lineHeight: tokens.typography.lineHeight.tight,
                }}
              >
                {title}
              </Text>

              {description && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    color: tokens.colors.common.white,
                    opacity: 0.9,
                    lineHeight: tokens.typography.lineHeight.relaxed,
                    maxWidth: '500px',
                  }}
                >
                  {description}
                </Text>
              )}
            </Stack>
          </Box>

          {/* Right: Action buttons */}
          <Box
            style={{
              display: 'flex',
              gap: tokens.spacing[3],
              flexWrap: 'wrap' as const,
              alignItems: 'center',
            }}
          >
            {actions.map((action) => {
              const isHovered = hoveredAction === action.key;
              const isSecondary = action.variant === 'secondary';

              return (
                <div
                  key={action.key}
                  onMouseEnter={() => setHoveredAction(action.key)}
                  onMouseLeave={() => setHoveredAction(null)}
                  style={{
                    transition: `all ${tokens.motion.hover}`,
                    transform: isHovered ? tokens.motion.transform : 'none',
                  }}
                >
                  <Button
                    variant={isSecondary ? 'default' : 'primary'}
                    size="lg"
                    onClick={action.onClick}
                    style={isSecondary ? {
                      backgroundColor: 'transparent',
                      color: tokens.colors.common.white,
                      borderColor: tokens.colors.common.white,
                      opacity: isHovered ? 1 : 0.9,
                    } : {
                      backgroundColor: isHovered
                        ? tokens.colors.common.white
                        : tokens.colors.common.white,
                      color: tokens.colors.primaryScale[700],
                      borderColor: tokens.colors.common.white,
                      boxShadow: isHovered
                        ? tokens.shadows.lg
                        : tokens.shadows.sm,
                    }}
                  >
                    {action.label}
                  </Button>
                </div>
              );
            })}
          </Box>
        </Box>

        {/* Bottom shimmer line */}
        <Box
          style={{
            position: 'absolute' as const,
            bottom: 0,
            left: '10%',
            width: '80%',
            height: '1px',
            background: `linear-gradient(to right, transparent, ${tokens.colors.common.white}, transparent)`,
            opacity: 0.3,
            pointerEvents: 'none' as const,
          }}
        />
      </Box>
    );
  },
});
