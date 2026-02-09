'use client';

/**
 * StatsSection - Inline Preset
 * Premium horizontal stat cards with icon containers, gradient dividers,
 * hover elevation, animated value styling, and accent bar
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createSectionHeaderStyle,
  getCardHoverShadow,
} from '../../../helpers';
import type { StatsSectionProps } from '../../core';

export const InlineStatsSection = createPreset<StatsSectionProps>({
  name: 'StatsSection.Inline',
  render: ({ primitives, props, tokens, engine }: PresetContext<StatsSectionProps>) => {
    const { Box, Stack, Text } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const { stats, title, description, className, style } = props;

    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const sectionStyle = useMemo(() => ({
      padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
      position: 'relative' as const,
      ...style,
    }), [tokens, style]);

    const accentBarStyle = useMemo(
      () => createAccentBarStyle(tokens, { position: 'top' }),
      [tokens],
    );

    return (
      <Box className={className} style={sectionStyle}>
        <Stack direction="vertical" spacing="xl" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section header */}
          {(title || description) && (
            <Box style={{ textAlign: 'center' as const, maxWidth: '700px', margin: '0 auto' }}>
              {title && (
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                    lineHeight: tokens.typography.lineHeight.tight,
                  }}
                >
                  {title}
                </Text>
              )}
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
            </Box>
          )}

          {/* Stats grid */}
          <Box
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: tokens.spacing[6],
              flexWrap: 'wrap' as const,
            }}
          >
            {stats.map((stat, index) => {
              const isHovered = hoveredIndex === index;

              const cardStyle = useMemo(() => ({
                ...createCardStyle(tokens, {
                  elevation: isHovered ? 'md' : 'sm',
                  glass: isGlass,
                  padding: tokens.spacing[6],
                }),
                position: 'relative' as const,
                overflow: 'hidden' as const,
                flex: '1 1 200px',
                maxWidth: '280px',
                textAlign: 'center' as const,
                transition: `all ${tokens.motion.hover}`,
                transform: isHovered ? tokens.motion.transform : 'none',
                cursor: 'default',
              }), [tokens, isHovered, isGlass]);

              return (
                <div
                  key={stat.key}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={cardStyle}
                >
                  {/* Accent bar on top of each card */}
                  <div style={accentBarStyle} />

                  <Stack direction="vertical" spacing="md" style={{ alignItems: 'center' }}>
                    {/* Icon container */}
                    {stat.icon && (
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: tokens.spacing[10],
                          height: tokens.spacing[10],
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: isHovered
                            ? tokens.colors.primaryScale[100]
                            : tokens.colors.primaryScale[50],
                          color: tokens.colors.primaryScale[600],
                          fontSize: tokens.typography.fontSize.xl,
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        {stat.icon}
                      </Box>
                    )}

                    {/* Value display */}
                    <Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize['3xl'],
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.primaryScale[600],
                          lineHeight: tokens.typography.lineHeight.tight,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {stat.prefix && (
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.xl,
                              color: tokens.colors.primaryScale[400],
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            {stat.prefix}
                          </span>
                        )}
                        {stat.value}
                        {stat.suffix && (
                          <span
                            style={{
                              fontSize: tokens.typography.fontSize.lg,
                              color: tokens.colors.primaryScale[400],
                              fontWeight: tokens.typography.fontWeight.medium,
                              marginLeft: tokens.spacing[1],
                            }}
                          >
                            {stat.suffix}
                          </span>
                        )}
                      </Text>
                    </Box>

                    {/* Label */}
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.neutral[500],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {stat.label}
                    </Text>
                  </Stack>

                  {/* Gradient divider between cards (visual only within each card) */}
                  {index < stats.length - 1 && (
                    <Box
                      style={{
                        position: 'absolute' as const,
                        right: `-${tokens.spacing[3]}px`,
                        top: '20%',
                        height: '60%',
                        width: '1px',
                        background: `linear-gradient(to bottom, transparent, ${tokens.colors.neutral[200]}, transparent)`,
                        pointerEvents: 'none' as const,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </Box>
        </Stack>
      </Box>
    );
  },
});
