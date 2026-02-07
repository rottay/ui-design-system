'use client';

/**
 * CommandHeader - Compact Preset
 * Single-row header with title, metrics inline, and quick actions
 */

import { createPreset, PresetContext } from '../../../factory';
import type { CommandHeaderProps } from '../../core';

export const CompactCommandHeader = createPreset<CommandHeaderProps>({
  name: 'CommandHeader.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommandHeaderProps>) => {
    const { Box } = primitives;
    const {
      title,
      subtitle,
      icon,
      metrics = [],
      primaryAction,
      systemStatus = [],
      className,
      style,
    } = props;

    const getTrendColor = (positive?: boolean) =>
      positive ? tokens.colors.successScale[400] : tokens.colors.errorScale[400];

    const getStatusColor = (status?: string) => {
      switch (status) {
        case 'ok': return tokens.colors.successScale[500];
        case 'warning': return tokens.colors.warningScale[500];
        case 'error': return tokens.colors.errorScale[500];
        default: return tokens.colors.neutral[500];
      }
    };

    return (
      <Box
        className={className}
        style={{
          boxShadow: tokens.shadows.md,
          borderRadius: tokens.borderRadius.lg,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.common.white,
          overflow: 'hidden',
          ...style,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[5],
          padding: `${tokens.spacing[3]}px ${tokens.spacing[5]}px`,
        }}>
          {/* Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexShrink: 0 }}>
            {icon && <span style={{ fontSize: tokens.typography.fontSize.xl }}>{icon}</span>}
            <div>
              <div style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold }}>{title}</div>
              {subtitle && <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{subtitle}</div>}
            </div>
          </div>

          {/* Metrics inline */}
          {metrics.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[5], flex: 1, overflow: 'hidden' }}>
              {metrics.slice(0, 5).map((metric, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: tokens.spacing[2], flexShrink: 0 }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
                    {metric.label}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold }}>
                    {metric.value}
                  </span>
                  {metric.change && (
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: getTrendColor(metric.positive), fontWeight: tokens.typography.fontWeight.medium }}>
                      {metric.change}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* System status */}
          {systemStatus.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flexShrink: 0 }}>
              {systemStatus.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                  <div style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: getStatusColor(s.status) }} />
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{s.label}: {s.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Primary action */}
          {primaryAction && (
            <button
              onClick={primaryAction.onClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: tokens.spacing[1],
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                borderRadius: tokens.borderRadius.md,
                border: 'none',
                backgroundColor: tokens.colors.primaryScale[600],
                color: tokens.colors.common.white,
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              {primaryAction.icon && <span>{primaryAction.icon}</span>}
              {primaryAction.label}
            </button>
          )}
        </div>
      </Box>
    );
  },
});
