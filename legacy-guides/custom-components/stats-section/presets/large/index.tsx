/**
 * StatsSection - Large Preset
 * Full-width with very large values, minimal labels for maximum impact
 */

import { createPreset, PresetContext } from '../../../factory';
import type { StatsSectionProps } from '../../core';

export const LargeStatsSection = createPreset<StatsSectionProps>({
  name: 'StatsSection.Large',
  render: ({ primitives, props, tokens, engine }: PresetContext<StatsSectionProps>) => {
    const { Box, Stack } = primitives;
    const { stats, title, description, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          padding: `${tokens.spacing[10]}px ${tokens.spacing[4]}px`,
          background: `linear-gradient(180deg, ${tokens.colors.neutral[50]} 0%, ${tokens.colors.common.white} 100%)`,
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
              gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
              gap: tokens.spacing[8],
              textAlign: 'center',
            }}
          >
            {stats.map((stat) => (
              <Box key={stat.key}>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize['4xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.primaryScale[600],
                    lineHeight: tokens.typography.lineHeight.tight,
                    marginBottom: tokens.spacing[2],
                  }}
                >
                  {stat.prefix}
                  {stat.value}
                  {stat.suffix}
                </Box>

                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.md,
                    color: tokens.colors.neutral[600],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {stat.label}
                </Box>

                {stat.icon && (
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: tokens.spacing[3],
                      color: tokens.colors.primaryScale[400],
                      fontSize: '32px',
                    }}
                  >
                    {stat.icon}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    );
  },
});
