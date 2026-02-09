'use client';

/**
 * CtaSection - Split Preset
 * Premium split layout with rich text section, decorative accents,
 * badge above title, gradient overlay, button hover states, and framed media area
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createHoverStyle,
  getCardHoverShadow,
} from '../../../helpers';
import type { CtaSectionProps } from '../../core';

export const SplitCtaSection = createPreset<CtaSectionProps>({
  name: 'CtaSection.Split',
  render: ({ primitives, props, tokens, engine }: PresetContext<CtaSectionProps>) => {
    const { Box, Stack, Button, Text } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const { title, description, actions, media, className, style } = props;

    const [hoveredAction, setHoveredAction] = useState<string | null>(null);

    const sectionStyle = useMemo(() => ({
      position: 'relative' as const,
      overflow: 'hidden' as const,
      background: `linear-gradient(135deg, ${tokens.colors.primaryScale[50]}, ${tokens.colors.common.white}, ${tokens.colors.secondaryScale?.[50] || tokens.colors.primaryScale[50]})`,
      padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
      ...style,
    }), [tokens, style]);

    const textCardStyle = useMemo(() => ({
      ...createCardStyle(tokens, { elevation: 'md', glass: isGlass, padding: tokens.spacing[8] }),
      position: 'relative' as const,
      overflow: 'hidden' as const,
    }), [tokens, isGlass]);

    const accentBarStyle = useMemo(
      () => createAccentBarStyle(tokens, { position: 'top' }),
      [tokens],
    );

    const badgeStyle = useMemo(
      () => createBadgeStyle(tokens, 'primary'),
      [tokens],
    );

    const mediaFrameStyle = useMemo(() => ({
      borderRadius: tokens.borderRadius.lg,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      boxShadow: tokens.shadows.lg,
      overflow: 'hidden' as const,
      backgroundColor: tokens.colors.neutral[50],
      position: 'relative' as const,
      transition: `all ${tokens.motion.hover}`,
    }), [tokens]);

    return (
      <Box className={className} style={sectionStyle}>
        {/* Decorative circles */}
        <Box
          style={{
            position: 'absolute' as const,
            top: `-${tokens.spacing[10]}px`,
            right: `-${tokens.spacing[10]}px`,
            width: '200px',
            height: '200px',
            borderRadius: tokens.borderRadius.full,
            background: `radial-gradient(circle, ${tokens.colors.primaryScale[100]}, transparent)`,
            opacity: 0.4,
            pointerEvents: 'none' as const,
          }}
        />
        <Box
          style={{
            position: 'absolute' as const,
            bottom: `-${tokens.spacing[8]}px`,
            left: `-${tokens.spacing[6]}px`,
            width: '160px',
            height: '160px',
            borderRadius: tokens.borderRadius.full,
            background: `radial-gradient(circle, ${tokens.colors.secondaryScale?.[100] || tokens.colors.primaryScale[100]}, transparent)`,
            opacity: 0.3,
            pointerEvents: 'none' as const,
          }}
        />

        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[8],
            maxWidth: '1200px',
            margin: '0 auto',
            flexWrap: 'wrap' as const,
            position: 'relative' as const,
            zIndex: 1,
          }}
        >
          {/* Left: Text card with accent bar */}
          <Box style={{ flex: '1 1 450px' }}>
            <div style={textCardStyle}>
              <div style={accentBarStyle} />

              <Stack direction="vertical" spacing="lg">
                {/* Badge label */}
                <Box>
                  <Box style={badgeStyle}>New Release</Box>
                </Box>

                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    lineHeight: tokens.typography.lineHeight.tight,
                  }}
                >
                  {title}
                </Text>

                {description && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.lg,
                      color: tokens.colors.neutral[600],
                      lineHeight: tokens.typography.lineHeight.relaxed,
                    }}
                  >
                    {description}
                  </Text>
                )}

                <Box
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[3],
                    flexWrap: 'wrap' as const,
                    marginTop: tokens.spacing[2],
                  }}
                >
                  {actions.map((action) => {
                    const isHovered = hoveredAction === action.key;
                    const isPrimary = action.variant !== 'secondary';

                    return (
                      <div
                        key={action.key}
                        onMouseEnter={() => setHoveredAction(action.key)}
                        onMouseLeave={() => setHoveredAction(null)}
                        style={{
                          transition: `all ${tokens.motion.hover}`,
                          transform: isHovered ? tokens.motion.transform : 'none',
                          boxShadow: isHovered
                            ? tokens.shadows.md
                            : tokens.shadows.sm,
                          borderRadius: tokens.borderRadius.md,
                        }}
                      >
                        <Button
                          variant={isPrimary ? 'primary' : 'default'}
                          size="lg"
                          onClick={action.onClick}
                        >
                          {action.label}
                        </Button>
                      </div>
                    );
                  })}
                </Box>
              </Stack>
            </div>
          </Box>

          {/* Right: Framed media area */}
          {media && (
            <Box style={{ flex: '1 1 450px', display: 'flex', justifyContent: 'center' }}>
              <Box style={mediaFrameStyle}>
                {/* Subtle accent bar on top of media */}
                <div style={accentBarStyle} />
                <Box
                  style={{
                    padding: tokens.spacing[2],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px',
                  }}
                >
                  {media}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
