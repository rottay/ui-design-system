/**
 * StatsSection - Inline Preset
 * Stats in a horizontal row with dividers, large values with small labels
 */

import { createPreset, PresetContext } from '../../../factory';
import type { StatsSectionProps } from '../../core';

export const InlineStatsSection = createPreset<StatsSectionProps>({
  name: 'StatsSection.Inline',
  render: ({ primitives, props, tokens, engine }: PresetContext<StatsSectionProps>) => {
    const { Box, Stack } = primitives;
    const { stats, title, description, className, style } = props;

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
              display: 'flex',
              justifyContent: 'space-around',
              gap: tokens.spacing[6],
              flexWrap: 'wrap',
            }}
          >
            {stats.map((stat, index) => (
              <Box key={stat.key} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[6] }}>
                <Box style={{ textAlign: 'center' }}>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize['3xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.primaryScale[600],
                      lineHeight: tokens.typography.lineHeight.tight,
                    }}
                  >
                    {stat.prefix}
                    {stat.value}
                    {stat.suffix}
                  </Box>
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    {stat.label}
                  </Box>
                </Box>

                {index < stats.length - 1 && (
                  <Box
                    style={{
                      width: '1px',
                      height: '60px',
                      backgroundColor: tokens.colors.neutral[200],
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Stack>
      </Box>
    );
  },
});
