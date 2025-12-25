/**
 * DashboardCard - Detailed Preset
 * Value + breakdown items
 */

// import React from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DashboardCardProps } from '../../core';

export const DetailedDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Detailed',
  render: ({ primitives, props, tokens }: PresetContext<DashboardCardProps>) => {
    const { Card, Box, Stack, Divider, Progress, Spinner } = primitives;
    const { title, value, description, icon, breakdown = [], trend, color = 'default', onClick, loading, className, style } = props;

    const colorMap = {
      default: tokens.colors.neutral[700],
      primary: tokens.colors.primary,
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      error: tokens.colors.error,
    };

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
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[8] }}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <Stack direction="vertical" spacing="lg">
            {/* Header */}
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], fontWeight: 500 }}>
                  {title}
                </Box>
                <Box style={{ fontSize: tokens.typography.fontSize['3xl'], fontWeight: 700, marginTop: tokens.spacing[1] }}>
                  {value}
                </Box>
                {description && (
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                    {description}
                  </Box>
                )}
              </Box>
              {icon && (
                <Box style={{
                  color: colorMap[color],
                  fontSize: '32px',
                  padding: tokens.spacing[3],
                  backgroundColor: `${colorMap[color]}10`,
                  borderRadius: '12px',
                }}>
                  {icon}
                </Box>
              )}
            </Box>

            {/* Trend */}
            {trend && (
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: trend.direction === 'up' ? `${tokens.colors.success}15` : trend.direction === 'down' ? `${tokens.colors.error}15` : `${tokens.colors.neutral[500]}15`,
                color: trend.direction === 'up' ? tokens.colors.success : trend.direction === 'down' ? tokens.colors.error : tokens.colors.neutral[500],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: 500,
                alignSelf: 'flex-start',
              }}>
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}% {trend.label}
              </Box>
            )}

            {/* Breakdown */}
            {breakdown.length > 0 && (
              <>
                <Divider />
                <Stack direction="vertical" spacing="sm">
                  {breakdown.map((item, index) => (
                    <Box key={index}>
                      <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
                          {item.label}
                        </Box>
                        <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: 500 }}>
                          {item.value}
                        </Box>
                      </Box>
                      {item.percentage !== undefined && (
                        <Progress percent={item.percentage} showInfo={false} strokeWidth={4} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Card>
    );
  },
});
