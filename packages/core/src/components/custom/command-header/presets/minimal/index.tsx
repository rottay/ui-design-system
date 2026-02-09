'use client';

/**
 * CommandHeader - Minimal Preset
 * Sleek dark status bar with gradient background, animated status dots,
 * metric badges, accent bar, and hover-reveal values on status indicators.
 */

import React, { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { CommandHeaderProps } from '../../core';
import {
  createBadgeStyle,
  createAccentBarStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const MinimalCommandHeader = createPreset<CommandHeaderProps>({
  name: 'CommandHeader.Minimal',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommandHeaderProps>) => {
    const { Box, Text } = primitives;
    const {
      title,
      subtitle,
      icon,
      metrics = [],
      systemStatus = [],
      primaryAction,
      className,
      style,
    } = props;

    const [hoveredStatus, setHoveredStatus] = useState<number | null>(null);
    const isGlass = tokens.surface.useGlass && !!tokens.glass;

    const getStatusColor = (status?: string) => {
      switch (status) {
        case 'ok': return tokens.colors.successScale[400];
        case 'warning': return tokens.colors.warningScale[400];
        case 'error': return tokens.colors.errorScale[400];
        default: return tokens.colors.neutral[500];
      }
    };

    const containerStyle = useMemo((): React.CSSProperties => ({
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: tokens.spacing[4],
      padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
      borderRadius: tokens.borderRadius.lg,
      background: `linear-gradient(135deg, ${tokens.colors.neutral[900]}, ${tokens.colors.neutral[800]})`,
      color: tokens.colors.common.white,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
      boxShadow: tokens.shadows.lg,
      overflow: 'hidden',
      fontSize: tokens.typography.fontSize.xs,
      ...(isGlass && tokens.glass ? {
        backdropFilter: tokens.glass.blur,
        WebkitBackdropFilter: tokens.glass.blur,
      } : {}),
    }), [tokens, isGlass]);

    const accentBar = useMemo(() => createAccentBarStyle(tokens, { position: 'top' }), [tokens]);

    const separatorStyle = useMemo((): React.CSSProperties => ({
      width: 1,
      alignSelf: 'stretch',
      background: `linear-gradient(to bottom, transparent, ${tokens.colors.neutral[600]}, transparent)`,
      flexShrink: 0,
    }), [tokens]);

    const metricBadgeBase = useMemo((): React.CSSProperties => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[1],
      padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
      borderRadius: tokens.borderRadius.full,
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.medium,
      backgroundColor: `${tokens.colors.neutral[700]}`,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[600]}`,
      transition: `all ${tokens.motion.hover}`,
    }), [tokens]);

    return (
      <div className={className} style={{ ...containerStyle, ...style }}>
        {/* Accent bar at top */}
        <div
          style={{
            ...accentBar,
            position: 'absolute',
            top: 0,
            left: 0,
            opacity: 0.7,
          }}
        />

        {/* Title section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
          {icon && (
            <span
              style={{
                fontSize: tokens.typography.fontSize.md,
                display: 'flex',
                alignItems: 'center',
                color: tokens.colors.primaryScale[300],
              }}
            >
              {icon}
            </span>
          )}
          <div>
            <span
              style={{
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[100],
                fontSize: tokens.typography.fontSize.sm,
              }}
            >
              {title}
            </span>
            {subtitle && (
              <Text
                style={{
                  display: 'block',
                  fontSize: tokens.typography.fontSize.xs,
                  color: tokens.colors.neutral[500],
                  lineHeight: tokens.typography.lineHeight.tight,
                }}
              >
                {subtitle}
              </Text>
            )}
          </div>
        </div>

        {/* Separator */}
        {metrics.length > 0 && <div style={separatorStyle} />}

        {/* Metrics - show all, not just first */}
        {metrics.map((metric, idx) => (
          <div key={idx} style={metricBadgeBase}>
            {metric.icon && (
              <span style={{ fontSize: tokens.typography.fontSize.xs, display: 'flex' }}>
                {metric.icon}
              </span>
            )}
            <span style={{ color: tokens.colors.neutral[400] }}>{metric.label}</span>
            <span
              style={{
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.common.white,
              }}
            >
              {metric.value}
              {metric.unit && (
                <span style={{ fontWeight: tokens.typography.fontWeight.normal, color: tokens.colors.neutral[400] }}>
                  {metric.unit}
                </span>
              )}
            </span>
            {metric.change && (
              <span style={{
                color: metric.positive ? tokens.colors.successScale[400] : tokens.colors.errorScale[400],
                fontWeight: tokens.typography.fontWeight.semibold,
              }}>
                {metric.change}
              </span>
            )}
          </div>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* System status indicators */}
        {systemStatus.length > 0 && <div style={separatorStyle} />}
        {systemStatus.map((s, i) => {
          const isHovered = hoveredStatus === i;
          const dotColor = getStatusColor(s.status);

          return (
            <div
              key={i}
              onMouseEnter={() => setHoveredStatus(i)}
              onMouseLeave={() => setHoveredStatus(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                cursor: 'default',
                transition: `all ${tokens.motion.hover}`,
                padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                borderRadius: tokens.borderRadius.sm,
                backgroundColor: isHovered ? tokens.colors.neutral[700] : 'transparent',
              }}
            >
              {/* Animated pulse dot */}
              <div style={{ position: 'relative', width: 8, height: 8 }}>
                <div style={createStatusDotStyle(tokens, dotColor)} />
                {s.status === 'ok' && (
                  <div
                    style={{
                      ...createStatusDotStyle(tokens, dotColor),
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      animation: 'pulse 2s ease-in-out infinite',
                      opacity: 0.4,
                    }}
                  />
                )}
              </div>
              <span style={{ color: tokens.colors.neutral[400] }}>{s.label}</span>
              {isHovered && (
                <span style={{ color: tokens.colors.common.white, fontWeight: tokens.typography.fontWeight.semibold, fontSize: tokens.typography.fontSize.xs }}>
                  {s.value}
                </span>
              )}
            </div>
          );
        })}

        {/* Primary action button */}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing[1],
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.primaryScale[500]}`,
              backgroundColor: tokens.colors.primaryScale[600],
              color: tokens.colors.common.white,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.semibold,
              cursor: 'pointer',
              transition: `all ${tokens.motion.hover}`,
              fontFamily: 'inherit',
              outline: 'none',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[500]; e.currentTarget.style.transform = tokens.motion.transform; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.primaryScale[600]; e.currentTarget.style.transform = 'none'; }}
          >
            {primaryAction.icon}
            {primaryAction.label}
          </button>
        )}
      </div>
    );
  },
});
