'use client';

/**
 * DashboardCard - Trending Preset
 * Value + trend indicator + description, engine-differentiated
 */

import { useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createAccentBarStyle, createCardStyle, createBadgeStyle 
} from '../../../helpers';
import type { DashboardCardProps } from '../../core';

export const TrendingDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Trending',
  render: ({ primitives, props, tokens, engine }: PresetContext<DashboardCardProps>) => {
    const { Box, Stack, Spinner } = primitives;
    const { title, value, description, icon, trend, color = 'default', onClick, loading, className, style } = props;
    const [isHovered, setIsHovered] = useState(false);

    const scaleMap: Record<string, any> = {
      default: tokens.colors.neutral,
      primary: tokens.colors.primaryScale,
      success: tokens.colors.successScale,
      warning: tokens.colors.warningScale,
      error: tokens.colors.errorScale,
    };
    const scale = scaleMap[color] || tokens.colors.neutral;

    const trendScale = trend?.direction === 'up'
      ? tokens.colors.successScale
      : trend?.direction === 'down'
        ? tokens.colors.errorScale
        : tokens.colors.neutral;

    const trendIcon = trend?.direction === 'up' ? '↑'
      : trend?.direction === 'down' ? '↓'
      : '→';

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      elevation: isHovered && onClick ? 'md' : 'sm',
      padding: tokens.spacing[5],
      interactive: !!onClick,
      glass: tokens.surface.useGlass,
    }), [tokens, engine, onClick]);

    return (
      <div
        className={className}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        style={{
          ...cardStyle,
          transform: isHovered && onClick ? tokens.motion.transform : 'none',
          ...style,
        }}
      >
        <div style={createAccentBarStyle(tokens, { position: 'top' })} />
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[6] }}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <Stack direction="vertical" spacing="md">
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}
              >
                {title}
              </Box>
              {icon && (
                <Box
                  style={{
                    color: scale[500],
                    fontSize: tokens.typography.fontSize['2xl'],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '40px',
                    height: '40px',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: scale[50],
                  }}
                >
                  {icon}
                </Box>
              )}
            </Box>

            <Box
              style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                lineHeight: tokens.typography.lineHeight.tight,
              }}
            >
              {value}
            </Box>

            {(trend || description) && (
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                {trend && (
                  <Box
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                      borderRadius: tokens.borderRadius.sm,
                      backgroundColor: trendScale[50],
                      color: trendScale[700],
                      fontSize: tokens.typography.fontSize.sm,
                      fontWeight: tokens.typography.fontWeight.medium,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${trendScale[200]}`,
                    }}
                  >
                    {trendIcon} {trend.value}%
                  </Box>
                )}
                {(trend?.label || description) && (
                  <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    {trend?.label || description}
                  </Box>
                )}
              </Box>
            )}
          </Stack>
        )}
      </div>
    );
  },
});
