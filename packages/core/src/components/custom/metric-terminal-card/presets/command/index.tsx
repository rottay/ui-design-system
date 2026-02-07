'use client';

import { useState } from 'react';

/**
 * MetricTerminalCard - Command Preset
 * Terminal/command-line aesthetic with simulated terminal header,
 * command prompt, typing cursor, stats grid, and progress bar
 */

import { createPreset, PresetContext } from '../../../factory';
import type { MetricTerminalCardProps } from '../../core';
import { METRIC_TERMINAL_CARD_DEFAULTS } from '../../core';

export const CommandMetricTerminalCard = createPreset<MetricTerminalCardProps>({
  name: 'MetricTerminalCard.Command',
  render: ({ primitives, props, tokens, engine }: PresetContext<MetricTerminalCardProps>) => {
    const { Box } = primitives;
    const {
      label,
      value,
      change,
      trend,
      icon,
      progress,
      subtitle,
      onClick,
      animationIntensity = METRIC_TERMINAL_CARD_DEFAULTS.animationIntensity,
      compact,
      stats,
      actions,
      statusLabel,
      liveIndicator,
      className,
      style,
    } = props;
  const [isHovered, setIsHovered] = useState(false);

    const isAnimated = animationIntensity !== 'none';
    const isFullAnimation = animationIntensity === 'full';

    const trendColor = trend === 'up'
      ? tokens.colors.successScale[400]
      : trend === 'down'
        ? tokens.colors.errorScale[400]
        : tokens.colors.neutral[400];

    const trendIcon = trend === 'up' ? '+' : trend === 'down' ? '-' : '';

    const progressColor = progress !== undefined
      ? progress >= 80
        ? tokens.colors.successScale[400]
        : progress >= 50
          ? tokens.colors.warningScale[400]
          : tokens.colors.errorScale[400]
      : tokens.colors.successScale[400];

    const Wrapper = onClick ? 'div' : Box;

    return (
      <>
        {isAnimated && (
          <style>{`
            @keyframes mtc-cmd-fadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes mtc-cmd-blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            @keyframes mtc-cmd-shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}</style>
        )}
        <Wrapper
          className={className}
          onClick={onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            transition: `all ${tokens.motion.hover}`,
            transform: isHovered && onClick ? tokens.motion.transform : 'none',
            backgroundColor: tokens.colors.neutral[900],
            borderRadius: tokens.borderRadius.lg,
            overflow: 'hidden',
            minHeight: compact ? 120 : 240,
            cursor: onClick ? 'pointer' : 'default',
            animation: isAnimated ? 'mtc-cmd-fadeIn 0.4s ease-out' : 'none',
            fontFamily: 'monospace',
            ...style,
          }}
        >
          {/* Terminal header bar */}
          <Box style={{
            boxShadow: tokens.shadows.md,
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing[2],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
            backgroundColor: tokens.colors.neutral[800],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
          }}>
            <span style={{
              width: 12,
              height: 12,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.errorScale[400],
              display: 'inline-block',
            }} />
            <span style={{
              width: 12,
              height: 12,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.warningScale[400],
              display: 'inline-block',
            }} />
            <span style={{
              width: 12,
              height: 12,
              borderRadius: tokens.borderRadius.full,
              backgroundColor: tokens.colors.successScale[400],
              display: 'inline-block',
            }} />
            <span style={{
              flex: 1,
              textAlign: 'center',
              fontSize: tokens.typography.fontSize.xs,
              color: tokens.colors.neutral[500],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              {label}
            </span>
          </Box>

          {/* Card body */}
          <Box style={{ padding: compact ? `${tokens.spacing[3]}px ${tokens.spacing[4]}px` : `${tokens.spacing[5]}px ${tokens.spacing[5]}px` }}>
            {/* Command prompt line */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[3],
            }}>
              <span style={{
                color: tokens.colors.successScale[400],
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.bold,
              }}>$</span>
              <span style={{
                color: tokens.colors.neutral[400],
                fontSize: tokens.typography.fontSize.sm,
              }}>
                query {label.toLowerCase().replace(/\s+/g, '_')}
              </span>
              {isFullAnimation && (
                <span style={{
                  display: 'inline-block',
                  width: 8,
                  height: 16,
                  backgroundColor: tokens.colors.successScale[400],
                  animation: 'mtc-cmd-blink 1s step-end infinite',
                }} />
              )}
            </Box>

            {/* Status label */}
            {statusLabel && (
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                backgroundColor: tokens.colors.successScale[900],
                color: tokens.colors.successScale[400],
                fontSize: tokens.typography.fontSize.xs,
                borderRadius: tokens.borderRadius.sm,
                marginBottom: tokens.spacing[3],
                border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[700]}`,
              }}>
                {statusLabel}
              </Box>
            )}

            {/* Icon + value row */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[3],
              marginBottom: tokens.spacing[2],
            }}>
              {icon && (
                <Box style={{
                  color: tokens.colors.successScale[400],
                  fontSize: tokens.typography.fontSize['2xl'],
                  flexShrink: 0,
                }}>
                  {icon}
                </Box>
              )}
              <span style={{
                fontSize: tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
                letterSpacing: '0.05em',
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {value}
              </span>
              {change && (
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: trendColor,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {trendIcon}{change}
                </span>
              )}
            </Box>

            {/* Subtitle */}
            {subtitle && (
              <Box style={{
                fontSize: tokens.typography.fontSize.xs,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[3],
              }}>
                {subtitle}
              </Box>
            )}

            {/* Live indicator */}
            {liveIndicator && (
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                marginBottom: tokens.spacing[3],
              }}>
                <span style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.successScale[400],
                  animation: isAnimated ? 'mtc-cmd-blink 2s ease-in-out infinite' : 'none',
                }} />
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.successScale[400],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                }}>
                  LIVE
                </span>
              </Box>
            )}

            {/* Progress bar */}
            {progress !== undefined && !compact && (
              <Box style={{
                marginBottom: tokens.spacing[4],
              }}>
                <Box style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    progress
                  </span>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: progressColor,
                  }}>
                    {progress}%
                  </span>
                </Box>
                <Box style={{
                  height: 4,
                  backgroundColor: tokens.colors.neutral[800],
                  borderRadius: tokens.borderRadius.full,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    borderRadius: tokens.borderRadius.full,
                    background: isFullAnimation
                      ? `linear-gradient(90deg, ${progressColor}, ${tokens.colors.common.white}, ${progressColor})`
                      : progressColor,
                    backgroundSize: isFullAnimation ? '200% 100%' : undefined,
                    animation: isFullAnimation ? 'mtc-cmd-shimmer 2s linear infinite' : 'none',
                  }} />
                </Box>
              </Box>
            )}

            {/* Stats grid */}
            {stats && stats.length > 0 && !compact && (
              <Box style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`,
                gap: tokens.spacing[3],
                marginBottom: actions && actions.length > 0 ? tokens.spacing[4] : 0,
                paddingTop: tokens.spacing[3],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[800]}`,
              }}>
                {stats.map((stat, i) => (
                  <Box key={i} style={{ textAlign: 'center' }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.lg,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.common.white,
                      letterSpacing: '0.05em',
                    }}>
                      {stat.value}
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[500],
                      marginTop: tokens.spacing[1],
                    }}>
                      {stat.label}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Quick action footer */}
            {actions && actions.length > 0 && !compact && (
              <Box style={{
                display: 'flex',
                gap: tokens.spacing[2],
                paddingTop: tokens.spacing[3],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[800]}`,
              }}>
                {actions.map((action) => (
                  <button
                    key={action.key}
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick?.();
                    }}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: tokens.spacing[1],
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      backgroundColor: tokens.colors.neutral[800],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
                      borderRadius: tokens.borderRadius.md,
                      color: tokens.colors.neutral[300],
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'monospace',
                    }}
                  >
                    {action.icon && <span>{action.icon}</span>}
                    {action.label}
                  </button>
                ))}
              </Box>
            )}
          </Box>
        </Wrapper>
      </>
    );
  },
});
