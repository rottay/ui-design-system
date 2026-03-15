'use client';

/**
 * FeatureGrid - Grid Preset
 * Responsive grid of feature cards with icons, titles, and descriptions
 */

import { useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';
import type { FeatureGridProps } from '../../core';

export const GridFeatureGrid = createPreset<FeatureGridProps>({
  name: 'FeatureGrid.Grid',
  render: ({ primitives, props, tokens, engine }: PresetContext<FeatureGridProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const { features, columns = 3, title, description, className, style } = props;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
      <Box
        className={className}
        style={{
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="xl" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {(title || description) && (
            <Box style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
              {title && (
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900],
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  {title}
                </Box>
              )}
              {description && (
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.lg,
                    color: tokens.colors.neutral[600],
                    lineHeight: tokens.typography.lineHeight.relaxed,
                  }}
                >
                  {description}
                </Box>
              )}
            </Box>
          )}

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gap: tokens.spacing[6],
            }}
          >
            {features.map((feature, index) => {
              const isHovered = hoveredIndex === index;
              const cardStyle = useMemo(() => createCardStyle(tokens, {
                glass: isGlass,
                elevation: isHovered ? 'md' : 'sm',
                padding: tokens.spacing[6],
                interactive: !!feature.link,
              }), [tokens]);

              return (
                <div
                  key={feature.key}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={feature.link?.onClick}
                  style={{
                    ...cardStyle,
                    transform: isHovered && feature.link ? tokens.motion.transform : 'none',
                  }}
                >
                  <Stack direction="vertical" spacing="md">
                    {feature.icon && (
                      <Box
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '48px',
                          height: '48px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.primaryScale[50],
                          color: tokens.colors.primaryScale[600],
                          fontSize: tokens.typography.fontSize['2xl'],
                        }}
                      >
                        {feature.icon}
                      </Box>
                    )}

                    {feature.image && (
                      <Box>{feature.image}</Box>
                    )}

                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                      }}
                    >
                      {feature.title}
                    </Box>

                    {feature.description && (
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[600],
                          lineHeight: tokens.typography.lineHeight.relaxed,
                        }}
                      >
                        {feature.description}
                      </Box>
                    )}

                    {feature.link && (
                      <Box
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.primaryScale[600],
                          cursor: 'pointer',
                          transition: `all ${tokens.motion.hover}`,
                        }}
                      >
                        {feature.link.label} →
                      </Box>
                    )}
                  </Stack>
                </div>
              );
            })}
          </Box>
        </Stack>
      </Box>
    );
  },
});
