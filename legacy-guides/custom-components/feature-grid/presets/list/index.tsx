/**
 * FeatureGrid - List Preset
 * Horizontal layout per feature: icon left, text right, stacked vertically with dividers
 */

import { createPreset, PresetContext } from '../../../factory';
import type { FeatureGridProps } from '../../core';

export const ListFeatureGrid = createPreset<FeatureGridProps>({
  name: 'FeatureGrid.List',
  render: ({ primitives, props, tokens, engine }: PresetContext<FeatureGridProps>) => {
    const { Box, Stack } = primitives;
    const { features, title, description, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          boxShadow: tokens.shadows.sm,
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          ...style,
        }}
      >
        <Stack direction="vertical" spacing="xl" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {(title || description) && (
            <Box style={{ textAlign: 'center' }}>
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

          <Stack direction="vertical" spacing="md">
            {features.map((feature, index) => (
              <Box key={feature.key}>
                <Box
                  style={{
                    display: 'flex',
                    gap: tokens.spacing[4],
                    alignItems: 'flex-start',
                    padding: tokens.spacing[4],
                    cursor: feature.link ? 'pointer' : 'default',
                    transition: `all ${tokens.motion.hover}`,
                    borderRadius: tokens.borderRadius.md,
                  }}
                  onClick={feature.link?.onClick}
                  onMouseEnter={(e) => {
                    if (feature.link) {
                      e.currentTarget.style.backgroundColor = tokens.colors.neutral[50];
                      e.currentTarget.style.transform = tokens.motion.transform;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  {feature.icon && (
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: tokens.colors.primaryScale[50],
                        color: tokens.colors.primaryScale[600],
                        fontSize: tokens.typography.fontSize.xl,
                        flexShrink: 0,
                      }}
                    >
                      {feature.icon}
                    </Box>
                  )}

                  <Box style={{ flex: 1 }}>
                    <Box
                      style={{
                        fontSize: tokens.typography.fontSize.lg,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[900],
                        marginBottom: tokens.spacing[1],
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
                          marginTop: tokens.spacing[2],
                        }}
                      >
                        {feature.link.label} →
                      </Box>
                    )}
                  </Box>
                </Box>

                {index < features.length - 1 && (
                  <Box
                    style={{
                      height: '1px',
                      backgroundColor: tokens.colors.neutral[200],
                      margin: `${tokens.spacing[2]}px 0`,
                    }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    );
  },
});
