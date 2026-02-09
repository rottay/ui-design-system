'use client';

/**
 * ProgressTracker - Milestone Preset
 * Diamond markers, animated connector, glow effects, hover tooltips,
 * status badges, accent bar, and glass container.
 */
import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createBadgeStyle,
  createPanelHeaderStyle,
} from '../../../helpers';
import type { ProgressTrackerProps, ProgressStage } from '../../core';

const MilestoneMarker = ({ stage, index, tokens, engine, primitives }: {
  stage: ProgressStage; index: number; tokens: any; engine: string; primitives: any;
}) => {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);

  const isCompleted = stage.status === 'completed';
  const isCurrent = stage.status === 'current';

  const diamondSize = tokens.spacing[5];

  const diamondStyle = useMemo(() => {
    const base: React.CSSProperties = {
      width: diamondSize,
      height: diamondSize,
      transform: 'rotate(45deg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: `all ${tokens.motion.hover}`,
      position: 'relative' as const,
      zIndex: 2,
      flexShrink: 0,
    };

    if (isCompleted) {
      base.backgroundColor = tokens.colors.successScale[500];
      base.border = `2px solid ${tokens.colors.successScale[300]}`;
      base.boxShadow = `0 0 0 ${tokens.spacing[1]}px ${tokens.colors.successScale[100]}`;
    } else if (isCurrent) {
      base.backgroundColor = tokens.colors.primaryScale[500];
      base.border = `2px solid ${tokens.colors.primaryScale[300]}`;
      base.boxShadow = `0 0 ${tokens.spacing[3]}px ${tokens.colors.primaryScale[300]}, 0 0 ${tokens.spacing[6]}px ${tokens.colors.primaryScale[100]}`;
      base.animation = 'milestoneGlow 2.5s ease-in-out infinite';
    } else {
      base.backgroundColor = tokens.colors.neutral[100];
      base.border = `2px solid ${tokens.colors.neutral[300]}`;
    }

    return base;
  }, [tokens, isCompleted, isCurrent, diamondSize]);

  const innerIconStyle: React.CSSProperties = {
    transform: 'rotate(-45deg)', fontSize: tokens.typography.fontSize.xs, lineHeight: 1,
    color: isCompleted || isCurrent ? tokens.colors.common.white : tokens.colors.neutral[400],
    fontWeight: tokens.typography.fontWeight.bold,
  };
  const statusColor = isCompleted ? 'success' as const : isCurrent ? 'primary' as const : 'secondary' as const;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        position: 'relative' as const,
        cursor: stage.description ? 'pointer' : 'default',
      }}
    >
      {/* Diamond marker */}
      <Box style={diamondStyle}>
        <Text style={innerIconStyle}>
          {isCompleted ? '\u2713' : (stage.icon || (index + 1))}
        </Text>
      </Box>

      {/* Label below diamond */}
      <Text style={{
        marginTop: tokens.spacing[3],
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: isCurrent ? tokens.typography.fontWeight.bold : tokens.typography.fontWeight.medium,
        color: stage.status === 'upcoming' ? tokens.colors.neutral[400] : tokens.colors.neutral[800],
        textAlign: 'center' as const,
        maxWidth: tokens.spacing[20],
        transition: `color ${tokens.motion.hover}`,
      }}>
        {stage.label}
      </Text>

      {/* Status badge */}
      <Box style={{
        ...createBadgeStyle(tokens, statusColor),
        marginTop: tokens.spacing[1],
      }}>
        {stage.status}
      </Box>

      {stage.description && isHovered && (
        <Box style={{
          position: 'absolute' as const, top: `calc(100% + ${tokens.spacing[2]}px)`,
          left: '50%', transform: 'translateX(-50%)',
          backgroundColor: tokens.colors.neutral[900], color: tokens.colors.common.white,
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium,
          whiteSpace: 'nowrap' as const, zIndex: 10, boxShadow: tokens.shadows.lg,
          pointerEvents: 'none' as const, maxWidth: tokens.spacing[48],
        }}>
          {stage.description}
        </Box>
      )}
    </div>
  );
};

export const Milestone = createPreset<ProgressTrackerProps>((context: PresetContext<ProgressTrackerProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const isGlass = tokens.surface.useGlass && !!tokens.glass;

  const { stages, title, className, style } = props;

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const fillPercent = stages.length > 1
    ? (completedCount / (stages.length - 1)) * 100
    : 0;

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  }), [tokens, isGlass, style]);

  const diamondHalf = tokens.spacing[5] / 2;

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
            marginBottom: tokens.spacing[6],
            borderRadius: tokens.borderRadius.md,
          }}>
            <Text style={{
              fontSize: tokens.typography.fontSize.lg,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}>
              {title}
            </Text>
            <Box style={{
              ...createBadgeStyle(tokens, completedCount === stages.length ? 'success' : 'primary'),
            }}>
              {completedCount}/{stages.length} milestones
            </Box>
          </Box>
        )}

        {/* Timeline area */}
        <Box style={{
          position: 'relative' as const,
          paddingTop: tokens.spacing[2],
        }}>
          {/* Background connector line */}
          <Box style={{
            position: 'absolute' as const,
            top: `calc(${diamondHalf}px + ${tokens.spacing[2]}px)`,
            left: `calc(${100 / (stages.length * 2)}%)`,
            right: `calc(${100 / (stages.length * 2)}%)`,
            height: 3,
            backgroundColor: tokens.colors.neutral[200],
            borderRadius: tokens.borderRadius.full,
            zIndex: 0,
          }} />

          {/* Filled connector line (animated) */}
          {stages.length > 1 && (
            <Box style={{
              position: 'absolute' as const,
              top: `calc(${diamondHalf}px + ${tokens.spacing[2]}px)`,
              left: `calc(${100 / (stages.length * 2)}%)`,
              height: 3,
              width: `${fillPercent * ((stages.length - 1) / stages.length)}%`,
              background: `linear-gradient(to right, ${tokens.colors.successScale[400]}, ${tokens.colors.primaryScale[400]})`,
              borderRadius: tokens.borderRadius.full,
              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
              zIndex: 1,
            }} />
          )}

          {/* Milestone markers */}
          <Box style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative' as const,
            zIndex: 2,
          }}>
            {stages.map((stage, index) => (
              <MilestoneMarker key={stage.key} stage={stage} index={index}
                tokens={tokens} engine={engine} primitives={primitives} />
            ))}
          </Box>
        </Box>

        {/* Summary footer legend */}
        <Box style={{
          display: 'flex', justifyContent: 'center', gap: tokens.spacing[4],
          marginTop: tokens.spacing[5], paddingTop: tokens.spacing[3],
          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
        }}>
          {([
            { color: tokens.colors.successScale[500], label: `Completed (${completedCount})` },
            { color: tokens.colors.primaryScale[500], label: 'Current' },
            { color: tokens.colors.neutral[200], label: `Upcoming (${stages.filter(s => s.status === 'upcoming').length})`, border: `1px solid ${tokens.colors.neutral[300]}` },
          ] as const).map((item, i) => (
            <Box key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
              <Box style={{ width: tokens.spacing[2], height: tokens.spacing[2], backgroundColor: item.color, transform: 'rotate(45deg)', ...(('border' in item && item.border) ? { border: item.border } : {}) }} />
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{item.label}</Text>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Keyframes for glow animation */}
      <style>{`
        @keyframes milestoneGlow {
          0%, 100% { box-shadow: 0 0 ${tokens.spacing[3]}px ${tokens.colors.primaryScale[300]}, 0 0 ${tokens.spacing[6]}px ${tokens.colors.primaryScale[100]}; }
          50% { box-shadow: 0 0 ${tokens.spacing[5]}px ${tokens.colors.primaryScale[400]}, 0 0 ${tokens.spacing[8]}px ${tokens.colors.primaryScale[200]}; }
        }
      `}</style>
    </Box>
  );
});
