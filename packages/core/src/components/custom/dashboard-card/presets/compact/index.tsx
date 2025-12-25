/**
 * DashboardCard - Compact Preset
 * Just value display, minimal UI
 */

// import React from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { DashboardCardProps } from '../../core';

export const CompactDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Compact',
  render: ({ primitives, props, tokens }: PresetContext<DashboardCardProps>) => {
    const { Card, Box, Spinner } = primitives;
    const { title, value, icon, color = 'default', onClick, loading, className, style } = props;

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
        padding="md"
        hoverable={!!onClick}
        onClick={onClick}
        className={className}
        style={style}
      >
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[4] }}>
            <Spinner size="md" />
          </Box>
        ) : (
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            {icon && (
              <Box style={{ color: colorMap[color], fontSize: '24px' }}>
                {icon}
              </Box>
            )}
            <Box>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                {title}
              </Box>
              <Box style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: 600, color: colorMap[color] }}>
                {value}
              </Box>
            </Box>
          </Box>
        )}
      </Card>
    );
  },
});
