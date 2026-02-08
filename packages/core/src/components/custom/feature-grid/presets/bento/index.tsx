'use client';

/**
 * FeatureGrid - Bento Preset
 * First feature is large (spans 2 cols), rest in normal grid with gradient background
 */

import { useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createCardStyle,
  getCardHoverShadow,} from '../../../helpers';
import type { FeatureGridProps } from '../../core';

export const BentoFeatureGrid = createPreset<FeatureGridProps>({
  name: 'FeatureGrid.Bento',
  render: ({ primitives, props, tokens, engine }: PresetContext<FeatureGridProps>) => {
    const { Box, Stack } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const { features, columns = 3, title, description, className, style } = props;
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const [firstFeature, ...restFeatures] = features;

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
            {/* First feature - spans 2 columns with gradient */}
            {firstFeature && (
              <div
                onMouseEnter={() => setHoveredIndex(0)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={firstFeature.link?.onClick}
                style={{
                  gridColumn: `span ${Math.min(2, columns)}`,
                  background: `linear-gradient(135deg, ${tokens.colors.primaryScale[500]} 0%, ${tokens.colors.primaryScale[700]} 100%)`,
                  borderRadius: tokens.borderRadius.lg,
                  padding: tokens.spacing[8],
                  cursor: firstFeature.link ? 'pointer' : 'default',
                  transition: `all ${tokens.motion.hover}`,
                  transform: hoveredIndex === 0 && firstFeature.link ? tokens.motion.transform : 'none',
                  boxShadow: hoveredIndex === 0 ? getCardHoverShadow(tokens, 'sm') : tokens.shadows.sm,
                }}
              >
                <Stack direction="vertical" spacing="lg">
                  {firstFeature.icon && (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.common.white,
                        color: tokens.colors.primaryScale[600],
                        fontSize: '32px',
                      }}
                    >
                      {firstFeature.icon}
                    </Box>
                  )}

                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize['2xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.common.white,
                    }}
                  >
                    {firstFeature.title}
                  </Box>

                  {firstFeature.description && (
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        color: tokens.colors.common.white,
                        lineHeight: tokens.typography.lineHeight.relaxed,
                        opacity: 0.9,
                      }}
                    >
                      {firstFeature.description}
                    </Box>
                  )}

                  {firstFeature.link && (
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.sm,
                        fontWeight: tokens.typography.fontWeight.medium,
                        color: tokens.colors.common.white,
                      }}
                    >
                      {firstFeature.link.label} →
                    </Box>
                  )}
                </Stack>
              </div>
            )}

            {/* Rest of features - normal cards */}
            {restFeatures.map((feature, index) => {
              const actualIndex = index + 1;
              const isHovered = hoveredIndex === actualIndex;
              const cardStyle = useMemo(() => createCardStyle(tokens, {
                glass: isGlass,
                elevation: isHovered ? 'md' : 'sm',
                padding: tokens.spacing[6],
                interactive: !!feature.link,
              }), [tokens]);

              return (
                <div
                  key={feature.key}
                  onMouseEnter={() => setHoveredIndex(actualIndex)}
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
