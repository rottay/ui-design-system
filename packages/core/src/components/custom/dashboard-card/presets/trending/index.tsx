/**
 * DashboardCard - Trending Preset
 * Value + trend indicator
 */

// import React from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DashboardCardProps } from '../../core';

export const TrendingDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Trending',
  render: ({ primitives, props, tokens }: PresetContext<DashboardCardProps>) => {
    const { Card, Box, Stack, Spinner } = primitives;
    const { title, value, description, icon, trend, color = 'default', onClick, loading, className, style } = props;

    const colorMap = {
      default: tokens.colors.neutral[700],
      primary: tokens.colors.primary,
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      error: tokens.colors.error,
    };

    const trendColor = trend?.direction === 'up' ? tokens.colors.success
      : trend?.direction === 'down' ? tokens.colors.error
      : tokens.colors.neutral[500];

    const trendIcon = trend?.direction === 'up' ? '↑'
      : trend?.direction === 'down' ? '↓'
      : '→';

    return (
      <Card
        variant="elevated"
        padding="lg"
        hoverable={!!onClick}
        onClick={onClick}
        className={className}
        style={style}
      >
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[6] }}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <Stack direction="vertical" spacing="md">
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], fontWeight: 500 }}>
                {title}
              </Box>
              {icon && (
                <Box style={{ color: colorMap[color], fontSize: '28px' }}>
                  {icon}
                </Box>
              )}
            </Box>

            <Box style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: 700 }}>
              {value}
            </Box>

            {(trend || description) && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {trend && (
                  <Box style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: `${trendColor}15`,
                    color: trendColor,
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: 500,
                  }}>
                    {trendIcon} {trend.value}%
                  </Box>
                )}
                {description && (
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    {trend?.label || description}
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        )}
      </Card>
    );
  },
});
