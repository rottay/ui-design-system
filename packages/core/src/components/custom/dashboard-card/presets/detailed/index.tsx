'use client';

/**
 * DashboardCard - Detailed Preset
 * Value + trend + breakdown items with progress bars, engine-differentiated
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { DashboardCardProps } from '../../core';

export const DetailedDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Detailed',
  render: ({ primitives, props, tokens, engine }: PresetContext<DashboardCardProps>) => {
    const { Box, Stack, Divider, Progress, Spinner } = primitives;
    const {
      title, value, description, icon, breakdown = [],
      trend, color = 'default', onClick, loading, className, style,
    } = props;
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

    const cardStyle = createCardStyle(tokens, {
      elevation: isHovered && onClick ? 'md' : 'sm',
      padding: tokens.spacing[5],
      interactive: !!onClick,
      glass: engine === 'modern',
    });

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
        {loading ? (
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[8] }}>
            <Spinner size="lg" />
          </Box>
        ) : (
          <Stack direction="vertical" spacing="lg">
            {/* Header */}
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {title}
                </Box>
                <Box
                  style={{
                    fontSize: tokens.typography.fontSize['3xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    marginTop: tokens.spacing[1],
                    color: tokens.colors.neutral[900],
                    lineHeight: tokens.typography.lineHeight.tight,
                  }}
                >
                  {value}
                </Box>
                {description && (
                  <Box
                    style={{
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[500],
                      marginTop: tokens.spacing[1],
                    }}
                  >
                    {description}
                  </Box>
                )}
              </Box>
              {icon && (
                <Box
                  style={{
                    color: scale[500],
                    fontSize: '28px',
                    padding: tokens.spacing[3],
                    backgroundColor: scale[50],
                    borderRadius: tokens.borderRadius.lg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {icon}
                </Box>
              )}
            </Box>

            {/* Trend */}
            {trend && (
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: trendScale[50],
                  color: trendScale[700],
                  fontSize: tokens.typography.fontSize.sm,
                  fontWeight: tokens.typography.fontWeight.medium,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${trendScale[200]}`,
                  alignSelf: 'flex-start',
                }}
              >
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'} {trend.value}%
                {trend.label && (
                  <span style={{ color: trendScale[600] }}>{trend.label}</span>
                )}
              </Box>
            )}

            {/* Breakdown */}
            {breakdown.length > 0 && (
              <>
                <Divider />
                <Stack direction="vertical" spacing="sm">
                  {breakdown.map((item, index) => (
                    <Box key={index}>
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        <Box
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            color: tokens.colors.neutral[600],
                          }}
                        >
                          {item.label}
                        </Box>
                        <Box
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.semibold,
                            color: tokens.colors.neutral[900],
                          }}
                        >
                          {item.value}
                        </Box>
                      </Box>
                      {item.percentage !== undefined && (
                        <Box
                          style={{
                            height: '4px',
                            backgroundColor: tokens.colors.neutral[100],
                            borderRadius: tokens.borderRadius.full,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.min(100, Math.max(0, item.percentage))}%`,
                              backgroundColor: tokens.colors.primaryScale[500],
                              borderRadius: tokens.borderRadius.full,
                              transition: `width ${tokens.motion.hover}`,
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Stack>
        )}
      </div>
    );
  },
});
