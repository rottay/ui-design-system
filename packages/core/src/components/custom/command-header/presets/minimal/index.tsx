'use client';

/**
 * CommandHeader - Minimal Preset
 * Thin status bar with title, key metric, and status indicators
 */

import { createPreset, PresetContext } from '../../../factory';
import type { CommandHeaderProps } from '../../core';
import {
  createStatusDotStyle,
} from '../../../helpers';

export const MinimalCommandHeader = createPreset<CommandHeaderProps>({
  name: 'CommandHeader.Minimal',
  render: ({ primitives, props, tokens, engine }: PresetContext<CommandHeaderProps>) => {
    const { Box } = primitives;
    const {
      title,
      icon,
      metrics = [],
      systemStatus = [],
      className,
      style,
    } = props;

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
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing[4],
          padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`,
          borderRadius: tokens.borderRadius.md,
          backgroundColor: tokens.colors.neutral[900],
          color: tokens.colors.common.white,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[700]}`,
          fontSize: tokens.typography.fontSize.xs,
          ...style,
        }}
      >
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexShrink: 0 }}>
          {icon && <span style={{ fontSize: tokens.typography.fontSize.sm }}>{icon}</span>}
          <span style={{ fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[300] }}>{title}</span>
        </div>

        {/* Separator */}
        <div style={{ width: 1, height: 16, backgroundColor: tokens.colors.neutral[700] }} />

        {/* Key metric (first only) */}
        {metrics.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ color: tokens.colors.neutral[400] }}>{metrics[0].label}:</span>
            <span style={{ fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>{metrics[0].value}</span>
            {metrics[0].change && (
              <span style={{ color: metrics[0].positive ? tokens.colors.successScale[400] : tokens.colors.errorScale[400] }}>
                {metrics[0].change}
              </span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Status dots */}
        {systemStatus.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
            <div style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: getStatusColor(s.status) }} />
            <span style={{ color: tokens.colors.neutral[400] }}>{s.label}</span>
          </div>
        ))}
      </Box>
    );
  },
});
