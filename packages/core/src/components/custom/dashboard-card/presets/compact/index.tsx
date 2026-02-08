'use client';

/**
 * DashboardCard - Compact Preset
 * Minimal value display with icon, engine-differentiated surface
 */

import { useState, useMemo} from 'react';
import { createPreset, PresetContext } from '../../../factory';
import {
  createAccentBarStyle, createCardStyle 
} from '../../../helpers';
import type { DashboardCardProps } from '../../core';

export const CompactDashboardCard = createPreset<DashboardCardProps>({
  name: 'DashboardCard.Compact',
  render: ({ primitives, props, tokens, engine }: PresetContext<DashboardCardProps>) => {
    const { Box, Spinner } = primitives;
    const isGlass = engine === 'modern' && !!tokens.glass;
    const { title, value, icon, color = 'default', onClick, loading, className, style } = props;
    const [isHovered, setIsHovered] = useState(false);

    const scaleMap: Record<string, any> = {
      default: tokens.colors.neutral,
      primary: tokens.colors.primaryScale,
      success: tokens.colors.successScale,
      warning: tokens.colors.warningScale,
      error: tokens.colors.errorScale,
    };
    const scale = scaleMap[color] || tokens.colors.neutral;

    const cardStyle = useMemo(() => createCardStyle(tokens, {
      glass: isGlass,
      elevation: isHovered && onClick ? 'md' : 'sm',
      padding: tokens.spacing[4],
      interactive: !!onClick,
    }), [tokens, onClick]);

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
          <Box style={{ display: 'flex', justifyContent: 'center', padding: tokens.spacing[4] }}>
            <Spinner size="md" />
          </Box>
        ) : (
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            {icon && (
              <Box
                style={{
                  color: scale[500],
                  fontSize: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: scale[50],
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}
            <Box style={{ minWidth: 0 }}>
              <Box
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                  fontWeight: tokens.typography.fontWeight.medium,
                  lineHeight: tokens.typography.lineHeight.tight,
                }}
              >
                {title}
              </Box>
              <Box
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: color === 'default' ? tokens.colors.neutral[900] : scale[700],
                  lineHeight: tokens.typography.lineHeight.tight,
                  marginTop: '2px',
                }}
              >
                {value}
              </Box>
            </Box>
          </Box>
        )}
      </div>
    );
  },
});
