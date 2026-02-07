'use client';

import { useState } from 'react';

/**
 * MetricTerminalCard - HUD Preset
 * Heads-up display / sci-fi aesthetic with corner brackets,
 * grid texture, scan line effect, and status indicators
 */

import { createPreset, PresetContext } from '../../../factory';
import type { MetricTerminalCardProps } from '../../core';
import { METRIC_TERMINAL_CARD_DEFAULTS } from '../../core';

export const HudMetricTerminalCard = createPreset<MetricTerminalCardProps>({
  name: 'MetricTerminalCard.HUD',
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

    const trendIcon = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192';

    const progressColor = progress !== undefined
      ? progress >= 80
        ? tokens.colors.successScale[400]
        : progress >= 50
          ? tokens.colors.warningScale[400]
          : tokens.colors.errorScale[400]
      : tokens.colors.successScale[400];

    const statusColor = statusLabel
      ? statusLabel.toLowerCase().includes('good') || statusLabel.toLowerCase().includes('ok') || statusLabel.toLowerCase().includes('active')
        ? tokens.colors.successScale[400]
        : statusLabel.toLowerCase().includes('warn') || statusLabel.toLowerCase().includes('moderate')
          ? tokens.colors.warningScale[400]
          : statusLabel.toLowerCase().includes('error') || statusLabel.toLowerCase().includes('critical') || statusLabel.toLowerCase().includes('attention')
            ? tokens.colors.errorScale[400]
            : tokens.colors.infoScale[400]
      : tokens.colors.successScale[400];

    const bracketSize = 16;
    const bracketColor = tokens.colors.primaryScale[400];

    const Wrapper = onClick ? 'div' : Box;

    return (
      <>
        {isAnimated && (
          <style>{`
            @keyframes mtc-hud-scanLine {
              0% { top: -2px; opacity: 0; }
              10% { opacity: 0.6; }
              90% { opacity: 0.6; }
              100% { top: 100%; opacity: 0; }
            }
            @keyframes mtc-hud-fadeIn {
              from { opacity: 0; transform: scale(0.97); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes mtc-hud-pulse {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
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
            animation: isAnimated ? 'mtc-hud-fadeIn 0.5s ease-out' : 'none',
            border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[800]}`,
            ...style,
          }}
        >
          {/* Grid texture background */}
          <div style={{
            boxShadow: tokens.shadows.md,
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${tokens.colors.primaryScale[800]} 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: 0.3,
            pointerEvents: 'none',
          }} />

          {/* Scan line effect */}
          {isFullAnimation && (
            <div style={{
              position: 'absolute',
              left: 0,
              right: 0,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${tokens.colors.primaryScale[400]}, transparent)`,
              animation: 'mtc-hud-scanLine 3s linear infinite',
              pointerEvents: 'none',
              zIndex: 2,
            }} />
          )}

          {/* Corner bracket decorations */}
          {/* Top-left */}
          <div style={{
            position: 'absolute',
            top: tokens.spacing[2],
            left: tokens.spacing[2],
            width: bracketSize,
            height: bracketSize,
            borderTop: `2px solid ${bracketColor}`,
            borderLeft: `2px solid ${bracketColor}`,
            pointerEvents: 'none',
          }} />
          {/* Top-right */}
          <div style={{
            position: 'absolute',
            top: tokens.spacing[2],
            right: tokens.spacing[2],
            width: bracketSize,
            height: bracketSize,
            borderTop: `2px solid ${bracketColor}`,
            borderRight: `2px solid ${bracketColor}`,
            pointerEvents: 'none',
          }} />
          {/* Bottom-left */}
          <div style={{
            position: 'absolute',
            bottom: tokens.spacing[2],
            left: tokens.spacing[2],
            width: bracketSize,
            height: bracketSize,
            borderBottom: `2px solid ${bracketColor}`,
            borderLeft: `2px solid ${bracketColor}`,
            pointerEvents: 'none',
          }} />
          {/* Bottom-right */}
          <div style={{
            position: 'absolute',
            bottom: tokens.spacing[2],
            right: tokens.spacing[2],
            width: bracketSize,
            height: bracketSize,
            borderBottom: `2px solid ${bracketColor}`,
            borderRight: `2px solid ${bracketColor}`,
            pointerEvents: 'none',
          }} />

          {/* Content */}
          <Box style={{
            position: 'relative',
            zIndex: 1,
            padding: compact ? `${tokens.spacing[3]}px ${tokens.spacing[4]}px` : `${tokens.spacing[5]}px ${tokens.spacing[6]}px`,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
            {/* Header row: label + status */}
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
                {icon && (
                  <span style={{
                    color: tokens.colors.primaryScale[400],
                    fontSize: tokens.typography.fontSize.lg,
                  }}>
                    {icon}
                  </span>
                )}
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.primaryScale[400],
                  fontWeight: tokens.typography.fontWeight.semibold,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase' as const,
                }}>
                  {label}
                </span>
              </Box>

              {/* Status badge */}
              {statusLabel && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${statusColor}`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  color: statusColor,
                  fontWeight: tokens.typography.fontWeight.medium,
                  backgroundColor: 'transparent',
                }}>
                  <span style={{
                    display: 'inline-block',
                    width: 6,
                    height: 6,
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: statusColor,
                    animation: isAnimated ? 'mtc-hud-pulse 2s ease-in-out infinite' : 'none',
                  }} />
                  {statusLabel}
                </span>
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
                  animation: isAnimated ? 'mtc-hud-pulse 1.5s ease-in-out infinite' : 'none',
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

            {/* Centered large value */}
            <Box style={{
              flex: compact ? undefined : 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: tokens.spacing[3],
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

              {/* Subtitle */}
              {subtitle && (
                <span style={{
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  marginTop: tokens.spacing[1],
                }}>
                  {subtitle}
                </span>
              )}

              {/* Trend badge */}
              {change && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  marginTop: tokens.spacing[2],
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                  border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${trendColor}`,
                  borderRadius: tokens.borderRadius.sm,
                  fontSize: tokens.typography.fontSize.xs,
                  color: trendColor,
                  fontWeight: tokens.typography.fontWeight.medium,
                }}>
                  {trendIcon} {change}
                </span>
              )}
            </Box>

            {/* Progress bar */}
            {progress !== undefined && !compact && (
              <Box style={{ marginBottom: tokens.spacing[3] }}>
                <Box style={{
                  height: 3,
                  backgroundColor: tokens.colors.neutral[800],
                  borderRadius: tokens.borderRadius.full,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    borderRadius: tokens.borderRadius.full,
                    transition: 'width 0.6s ease',
                  }} />
                </Box>
              </Box>
            )}

            {/* Bottom stats section */}
            {stats && stats.length > 0 && !compact && (
              <Box style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`,
                gap: tokens.spacing[3],
                paddingTop: tokens.spacing[3],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[800]}`,
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

            {/* Actions */}
            {actions && actions.length > 0 && !compact && (
              <Box style={{
                display: 'flex',
                gap: tokens.spacing[2],
                marginTop: tokens.spacing[3],
                paddingTop: tokens.spacing[3],
                borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[800]}`,
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
                      backgroundColor: 'transparent',
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[700]}`,
                      borderRadius: tokens.borderRadius.sm,
                      color: tokens.colors.primaryScale[400],
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
