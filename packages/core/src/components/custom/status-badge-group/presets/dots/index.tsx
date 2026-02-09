'use client';

/**
 * StatusBadgeGroup - Dots Preset
 * Pulsing dots with ring indicators, hover cards, summary counts,
 * accent bar, and glass container.
 */
import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createPanelHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { StatusBadgeGroupProps, StatusBadge } from '../../core';

type StatusType = StatusBadge['status'];

const STATUS_COLOR_MAP: Record<StatusType, 'success' | 'warning' | 'error' | 'info'> = {
  healthy: 'success',
  degraded: 'warning',
  down: 'error',
  maintenance: 'info',
};

const StatusDotItem = ({ badge, tokens, engine, primitives }: {
  badge: StatusBadge; tokens: any; engine: string; primitives: any;
}) => {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);

  const colorName = STATUS_COLOR_MAP[badge.status] || 'info';
  const scale = tokens.colors[`${colorName}Scale`];

  const isActive = badge.status === 'healthy' || badge.status === 'degraded';

  const dotContainerStyle = useMemo((): React.CSSProperties => ({
    position: 'relative' as const,
    width: tokens.spacing[5],
    height: tokens.spacing[5],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }), [tokens]);

  const outerRingStyle = useMemo((): React.CSSProperties => ({
    position: 'absolute' as const,
    inset: 0,
    borderRadius: tokens.borderRadius.full,
    border: `2px solid ${scale[200]}`,
    animation: isActive ? 'statusPulse 2s ease-in-out infinite' : 'none',
  }), [tokens, scale, isActive]);

  const innerDotStyle = useMemo((): React.CSSProperties => ({
    width: tokens.spacing[3],
    height: tokens.spacing[3],
    borderRadius: tokens.borderRadius.full,
    backgroundColor: scale[500],
    boxShadow: `0 0 ${tokens.spacing[2]}px ${scale[300]}`,
    position: 'relative' as const,
    zIndex: 1,
  }), [tokens, scale]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacing[3],
        padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
        borderRadius: tokens.borderRadius.lg,
        backgroundColor: isHovered ? tokens.colors.neutral[50] : 'transparent',
        transition: `all ${tokens.motion.hover}`,
        cursor: badge.description ? 'pointer' : 'default',
        position: 'relative' as const,
      }}
    >
      {/* Dot with ring */}
      <Box style={dotContainerStyle}>
        <Box style={outerRingStyle} />
        <Box style={innerDotStyle} />
      </Box>

      {/* Label */}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text style={{
          fontSize: tokens.typography.fontSize.sm,
          fontWeight: tokens.typography.fontWeight.semibold,
          color: tokens.colors.neutral[800],
          display: 'block',
        }}>
          {badge.label}
        </Text>
        {badge.description && !isHovered && (
          <Text style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            display: 'block',
            overflow: 'hidden' as const,
            textOverflow: 'ellipsis' as const,
            whiteSpace: 'nowrap' as const,
          }}>
            {badge.description}
          </Text>
        )}
      </Box>

      {/* Status badge */}
      <Box style={createBadgeStyle(tokens, colorName)}>
        {badge.status}
      </Box>

      {/* Hover description card */}
      {badge.description && isHovered && (
        <Box style={{
          position: 'absolute' as const,
          top: `calc(100% + ${tokens.spacing[1]}px)`,
          left: tokens.spacing[4],
          right: tokens.spacing[4],
          backgroundColor: tokens.colors.common.white,
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
          borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.fontSize.xs,
          color: tokens.colors.neutral[700],
          boxShadow: tokens.shadows.lg,
          zIndex: 10,
          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          fontWeight: tokens.typography.fontWeight.medium,
        }}>
          {badge.description}
        </Box>
      )}
    </div>
  );
};

export const DotsPreset = createPreset<StatusBadgeGroupProps>((context: PresetContext<StatusBadgeGroupProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const isGlass = engine === 'modern' && !!tokens.glass;

  const { badges, title, lastUpdated, className, style } = props;

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  }), [tokens, isGlass, style]);

  // Compute summary counts
  const counts = useMemo(() => {
    const map: Record<StatusType, number> = { healthy: 0, degraded: 0, down: 0, maintenance: 0 };
    badges.forEach(b => { map[b.status] = (map[b.status] || 0) + 1; });
    return map;
  }, [badges]);

  return (
    <Box className={className} style={containerStyle}>
      {/* Accent bar */}
      <div style={createAccentBarStyle(tokens, { position: 'top' })} />

      <Box style={{ padding: tokens.spacing[5] }}>
        {/* Panel header */}
        {title && (
          <Box style={{
            ...createPanelHeaderStyle(tokens),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[4],
            borderRadius: tokens.borderRadius.md,
          }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {title}
            </Text>
            {lastUpdated && (
              <Box style={{
                ...createBadgeStyle(tokens, 'secondary'),
                fontSize: tokens.typography.fontSize.xs,
              }}>
                Updated: {lastUpdated}
              </Box>
            )}
          </Box>
        )}

        {/* Summary counts bar */}
        <Box style={{
          display: 'flex',
          gap: tokens.spacing[3],
          marginBottom: tokens.spacing[4],
          flexWrap: 'wrap' as const,
        }}>
          {counts.healthy > 0 && (
            <Box style={{ ...createBadgeStyle(tokens, 'success'), gap: tokens.spacing[1] }}>
              <Box style={createStatusDotStyle(tokens, tokens.colors.successScale[500])} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{counts.healthy} Healthy</Text>
            </Box>
          )}
          {counts.degraded > 0 && (
            <Box style={{ ...createBadgeStyle(tokens, 'warning'), gap: tokens.spacing[1] }}>
              <Box style={createStatusDotStyle(tokens, tokens.colors.warningScale[500])} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{counts.degraded} Degraded</Text>
            </Box>
          )}
          {counts.down > 0 && (
            <Box style={{ ...createBadgeStyle(tokens, 'error'), gap: tokens.spacing[1] }}>
              <Box style={createStatusDotStyle(tokens, tokens.colors.errorScale[500])} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{counts.down} Down</Text>
            </Box>
          )}
          {counts.maintenance > 0 && (
            <Box style={{ ...createBadgeStyle(tokens, 'info'), gap: tokens.spacing[1] }}>
              <Box style={createStatusDotStyle(tokens, tokens.colors.infoScale[500])} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs }}>{counts.maintenance} Maintenance</Text>
            </Box>
          )}
        </Box>

        {/* Badge list */}
        <Box style={{
          display: 'flex',
          flexDirection: 'column' as const,
          gap: tokens.spacing[1],
        }}>
          {badges.map((badge) => (
            <StatusDotItem
              key={badge.key}
              badge={badge}
              tokens={tokens}
              engine={engine}
              primitives={primitives}
            />
          ))}
        </Box>
      </Box>

      {/* Keyframes for pulse animation */}
      <style>{`
        @keyframes statusPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.6; }
        }
      `}</style>
    </Box>
  );
});

DotsPreset.displayName = 'StatusBadgeGroupDotsPreset';
