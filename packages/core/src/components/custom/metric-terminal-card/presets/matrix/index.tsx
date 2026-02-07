'use client';

import { useState } from 'react';

/**
 * MetricTerminalCard - Matrix Preset
 * Matrix/data stream aesthetic with dot matrix texture,
 * large value display, live indicator, progress bar, and activity bars
 */

import { createPreset, PresetContext } from '../../../factory';
import type { MetricTerminalCardProps } from '../../core';
import { METRIC_TERMINAL_CARD_DEFAULTS } from '../../core';

export const MatrixMetricTerminalCard = createPreset<MetricTerminalCardProps>({
  name: 'MetricTerminalCard.Matrix',
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

    const trendIcon = trend === 'up' ? '\u25B2' : trend === 'down' ? '\u25BC' : '';

    const progressColor = progress !== undefined
      ? progress >= 80
        ? tokens.colors.successScale[400]
        : progress >= 50
          ? tokens.colors.warningScale[400]
          : tokens.colors.errorScale[400]
      : tokens.colors.successScale[400];

    const matrixGreen = tokens.colors.successScale[400];

    // Generate activity bar heights deterministically from value
    const activityBars = Array.from({ length: 12 }, (_, i) => {
      const seed = (typeof value === 'number' ? value : String(value).length) + i;
      return 20 + ((seed * 17 + i * 31) % 80);
    });

    const Wrapper = onClick ? 'div' : Box;

    return (
      <>
        {isAnimated && (
          <style>{`
            @keyframes mtc-matrix-fadeIn {
              from { opacity: 0; transform: scale(0.96); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes mtc-matrix-pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            @keyframes mtc-matrix-rain {
              0% { background-position: 0 0; }
              100% { background-position: 0 40px; }
            }
            @keyframes mtc-matrix-barGrow {
              from { transform: scaleY(0); }
              to { transform: scaleY(1); }
            }
            @keyframes mtc-matrix-shimmer {
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
            position: 'relative',
            backgroundColor: tokens.colors.neutral[900],
            borderRadius: tokens.borderRadius.lg,
            overflow: 'hidden',
            minHeight: compact ? 120 : 240,
            cursor: onClick ? 'pointer' : 'default',
            animation: isAnimated ? 'mtc-matrix-fadeIn 0.5s ease-out' : 'none',
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[900]}`,
            ...style,
          }}
        >
          {/* Dot matrix texture background */}
          <div style={{
            boxShadow: tokens.shadows.md,
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${tokens.colors.successScale[800]} 1px, transparent 1px)`,
            backgroundSize: '12px 12px',
            opacity: 0.25,
            pointerEvents: 'none',
            animation: isFullAnimation ? 'mtc-matrix-rain 2s linear infinite' : 'none',
          }} />

          {/* Subtle vertical gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 0%, ${tokens.colors.neutral[900]}80 100%)`,
            pointerEvents: 'none',
          }} />

          {/* Content */}
          <Box style={{
            position: 'relative',
            zIndex: 1,
            padding: compact ? `${tokens.spacing[3]}px ${tokens.spacing[4]}px` : `${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
            {/* Header row */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing[3],
            }}>
              {/* Data point label */}
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                {icon && (
                  <span style={{
                    color: matrixGreen,
                    fontSize: tokens.typography.fontSize.lg,
                  }}>
                    {icon}
                  </span>
                )}
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: matrixGreen,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase' as const,
                  fontFamily: 'monospace',
                }}>
                  {label}
                </span>
              </Box>

              {/* Live indicator */}
              {liveIndicator && (
                <Box style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  backgroundColor: tokens.colors.successScale[900],
                  borderRadius: tokens.borderRadius.sm,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[700]}`,
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: matrixGreen,
                    animation: isAnimated ? 'mtc-matrix-pulse 1.5s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: matrixGreen,
                    fontWeight: tokens.typography.fontWeight.bold,
                    letterSpacing: '0.1em',
                    fontFamily: 'monospace',
                  }}>
                    LIVE
                  </span>
                </Box>
              )}

              {/* Status label (if no live indicator) */}
              {!liveIndicator && statusLabel && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                  fontFamily: 'monospace',
                }}>
                  {statusLabel}
                </span>
              )}
            </Box>

            {/* Largest value display */}
            <Box style={{
              flex: compact ? undefined : 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              marginBottom: tokens.spacing[2],
            }}>
              <span style={{
                fontSize: compact ? tokens.typography.fontSize['3xl'] : tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
                letterSpacing: '0.04em',
                lineHeight: tokens.typography.lineHeight.tight,
                fontFamily: 'monospace',
              }}>
                {value}
              </span>

              {/* Subtitle / data point label */}
              {subtitle && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[600],
                  marginTop: tokens.spacing[1],
                  fontFamily: 'monospace',
                }}>
                  {subtitle}
                </span>
              )}

              {/* Change indicator */}
              {change && (
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[2],
                  marginTop: tokens.spacing[2],
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: tokens.spacing[1],
                    fontSize: tokens.typography.fontSize.sm,
                    color: trendColor,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    fontFamily: 'monospace',
                  }}>
                    {trendIcon} {change}
                  </span>
                </Box>
              )}
            </Box>

            {/* Progress bar */}
            {progress !== undefined && !compact && (
              <Box style={{ marginBottom: tokens.spacing[3] }}>
                <Box style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[600],
                    fontFamily: 'monospace',
                  }}>
                    progress
                  </span>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: progressColor,
                    fontFamily: 'monospace',
                  }}>
                    [{progress}%]
                  </span>
                </Box>
                <Box style={{
                  height: 4,
                  backgroundColor: tokens.colors.neutral[800],
                  borderRadius: tokens.borderRadius.sm,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    borderRadius: tokens.borderRadius.sm,
                    background: isFullAnimation
                      ? `linear-gradient(90deg, ${progressColor}, ${tokens.colors.common.white}, ${progressColor})`
                      : progressColor,
                    backgroundSize: isFullAnimation ? '200% 100%' : undefined,
                    animation: isFullAnimation ? 'mtc-matrix-shimmer 2.5s linear infinite' : 'none',
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
                paddingTop: tokens.spacing[3],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[900]}`,
                marginBottom: tokens.spacing[3],
              }}>
                {stats.map((stat, i) => (
                  <Box key={i} style={{ textAlign: 'center' }}>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.common.white,
                      fontFamily: 'monospace',
                    }}>
                      {stat.value}
                    </Box>
                    <Box style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      marginTop: tokens.spacing[1],
                      fontFamily: 'monospace',
                    }}>
                      {stat.label}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* Activity bars indicator */}
            {!compact && (
              <Box style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                gap: 2,
                height: 32,
                paddingTop: tokens.spacing[2],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[900]}`,
              }}>
                {activityBars.map((height, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${height}%`,
                      backgroundColor: matrixGreen,
                      opacity: 0.4 + (height / 100) * 0.6,
                      borderRadius: `${tokens.borderRadius.sm} ${tokens.borderRadius.sm} 0 0`,
                      transformOrigin: 'bottom',
                      animation: isFullAnimation ? `mtc-matrix-barGrow 0.6s ease-out ${i * 0.05}s both` : 'none',
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Actions */}
            {actions && actions.length > 0 && !compact && (
              <Box style={{
                display: 'flex',
                gap: tokens.spacing[2],
                marginTop: tokens.spacing[3],
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
                      backgroundColor: tokens.colors.successScale[900],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.successScale[700]}`,
                      borderRadius: tokens.borderRadius.sm,
                      color: matrixGreen,
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
