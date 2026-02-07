'use client';

import { useState } from 'react';

/**
 * MetricTerminalCard - Circuit Preset
 * Circuit board aesthetic with dot grid pattern, data flow line animation,
 * pulsing node indicators, stats grid, and action buttons
 */

import { createPreset, PresetContext } from '../../../factory';
import type { MetricTerminalCardProps } from '../../core';
import { METRIC_TERMINAL_CARD_DEFAULTS } from '../../core';

export const CircuitMetricTerminalCard = createPreset<MetricTerminalCardProps>({
  name: 'MetricTerminalCard.Circuit',
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

    const trendIcon = trend === 'up' ? '\u25B2' : trend === 'down' ? '\u25BC' : '\u25C6';

    const progressColor = progress !== undefined
      ? progress >= 80
        ? tokens.colors.successScale[400]
        : progress >= 50
          ? tokens.colors.warningScale[400]
          : tokens.colors.errorScale[400]
      : tokens.colors.successScale[400];

    const accentColor = tokens.colors.primaryScale[400];
    const nodeSize = 6;

    const Wrapper = onClick ? 'div' : Box;

    return (
      <>
        {isAnimated && (
          <style>{`
            @keyframes mtc-circuit-dataFlow {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(400%); }
            }
            @keyframes mtc-circuit-fadeIn {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes mtc-circuit-nodePulse {
              0%, 100% { opacity: 0.4; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.4); }
            }
            @keyframes mtc-circuit-glow {
              0%, 100% { box-shadow: 0 0 4px ${accentColor}; }
              50% { box-shadow: 0 0 12px ${accentColor}; }
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
            animation: isAnimated ? 'mtc-circuit-fadeIn 0.4s ease-out' : 'none',
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[800]}`,
            ...style,
          }}
        >
          {/* Circuit pattern background (dot grid) */}
          <div style={{
            boxShadow: tokens.shadows.md,
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${tokens.colors.neutral[700]} 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
            opacity: 0.4,
            pointerEvents: 'none',
          }} />

          {/* Data flow line animation */}
          {isFullAnimation && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: tokens.colors.neutral[800],
              overflow: 'hidden',
              pointerEvents: 'none',
            }}>
              <div style={{
                width: '25%',
                height: '100%',
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                animation: 'mtc-circuit-dataFlow 3s linear infinite',
              }} />
            </div>
          )}

          {/* Pulsing node indicators at corners */}
          {isAnimated && !compact && (
            <>
              <div style={{
                position: 'absolute',
                top: tokens.spacing[3],
                left: tokens.spacing[3],
                width: nodeSize,
                height: nodeSize,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: accentColor,
                animation: isFullAnimation ? 'mtc-circuit-nodePulse 2s ease-in-out infinite' : 'none',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                top: tokens.spacing[3],
                right: tokens.spacing[3],
                width: nodeSize,
                height: nodeSize,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: accentColor,
                animation: isFullAnimation ? 'mtc-circuit-nodePulse 2s ease-in-out infinite 0.5s' : 'none',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                bottom: tokens.spacing[3],
                left: tokens.spacing[3],
                width: nodeSize,
                height: nodeSize,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: accentColor,
                animation: isFullAnimation ? 'mtc-circuit-nodePulse 2s ease-in-out infinite 1s' : 'none',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                bottom: tokens.spacing[3],
                right: tokens.spacing[3],
                width: nodeSize,
                height: nodeSize,
                borderRadius: tokens.borderRadius.full,
                backgroundColor: accentColor,
                animation: isFullAnimation ? 'mtc-circuit-nodePulse 2s ease-in-out infinite 1.5s' : 'none',
                pointerEvents: 'none',
              }} />
            </>
          )}

          {/* Content */}
          <Box style={{
            position: 'relative',
            zIndex: 1,
            padding: compact ? `${tokens.spacing[3]}px ${tokens.spacing[4]}px` : `${tokens.spacing[5]}px ${tokens.spacing[5]}px`,
          }}>
            {/* Header: icon + label + status */}
            <Box style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: tokens.spacing[3],
            }}>
              <Box style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[2],
              }}>
                {/* Icon in boxed container */}
                {icon && (
                  <Box style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[900],
                    border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[700]}`,
                    color: accentColor,
                    fontSize: tokens.typography.fontSize.md,
                    animation: isFullAnimation ? 'mtc-circuit-glow 3s ease-in-out infinite' : 'none',
                  }}>
                    {icon}
                  </Box>
                )}

                {/* Label */}
                <span style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[400],
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {label}
                </span>
              </Box>

              {/* Status indicator */}
              {statusLabel && (
                <Box style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: accentColor,
                    animation: isAnimated ? 'mtc-circuit-nodePulse 2s ease-in-out infinite' : 'none',
                  }} />
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    {statusLabel}
                  </span>
                </Box>
              )}
            </Box>

            {/* Live indicator */}
            {liveIndicator && (
              <Box style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                marginBottom: tokens.spacing[2],
              }}>
                <span style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: tokens.colors.successScale[400],
                  animation: isAnimated ? 'mtc-circuit-nodePulse 1.5s ease-in-out infinite' : 'none',
                }} />
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.successScale[400],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  letterSpacing: '0.1em',
                }}>
                  LIVE
                </span>
              </Box>
            )}

            {/* Value display */}
            <Box style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: tokens.spacing[2],
              marginBottom: tokens.spacing[1],
            }}>
              <span style={{
                fontSize: compact ? tokens.typography.fontSize['2xl'] : tokens.typography.fontSize['3xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
                letterSpacing: '0.02em',
                lineHeight: tokens.typography.lineHeight.tight,
              }}>
                {value}
              </span>
              {change && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  fontSize: tokens.typography.fontSize.sm,
                  color: trendColor,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xs }}>{trendIcon}</span>
                  {change}
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

            {/* Progress bar */}
            {progress !== undefined && !compact && (
              <Box style={{ marginBottom: tokens.spacing[4] }}>
                <Box style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: tokens.spacing[1],
                }}>
                  <span style={{
                    fontSize: tokens.typography.fontSize.xs,
                    color: tokens.colors.neutral[500],
                  }}>
                    capacity
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
                  borderRadius: tokens.borderRadius.sm,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    borderRadius: tokens.borderRadius.sm,
                    transition: 'width 0.6s ease',
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
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.common.white,
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

            {/* Quick action buttons */}
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
                      backgroundColor: tokens.colors.primaryScale[900],
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[700]}`,
                      borderRadius: tokens.borderRadius.md,
                      color: accentColor,
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.medium,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
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
