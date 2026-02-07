/**
 * StatsSection - Cards Preset
 * Each stat in a card with icon, value, label using grid layout
 */

import { createPreset, PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { StatsSectionProps } from '../../core';

export const CardsStatsSection = createPreset<StatsSectionProps>({
  name: 'StatsSection.Cards',
  render: ({ primitives, props, tokens }: PresetContext<StatsSectionProps>) => {
    const { Box, Stack } = primitives;
    const { stats, title, description, className, style } = props;

    return (
      <Box
        className={className}
        style={{
          padding: `${tokens.spacing[8]}px ${tokens.spacing[4]}px`,
          backgroundColor: tokens.colors.neutral[50],
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: tokens.spacing[6],
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.key}
                style={{
                  ...createCardStyle(tokens, {
                    elevation: 'sm',
                    padding: tokens.spacing[6],
                  }),
                }}
              >
                <Stack direction="vertical" spacing="md">
                  {stat.icon && (
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
                        fontSize: '24px',
                      }}
                    >
                      {stat.icon}
                    </Box>
                  )}

                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize['3xl'],
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.neutral[900],
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
                    }}
                  >
                    {stat.label}
                  </Box>
                </Stack>
              </div>
            ))}
          </Box>
        </Stack>
      </Box>
    );
  },
});
