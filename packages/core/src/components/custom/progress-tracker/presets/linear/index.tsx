'use client';

/**
 * ProgressTracker - Linear Preset
 * Horizontal progress bar with step circles, gradient connectors,
 * status badges, hover descriptions, and glass container.
 */
import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createAccentBarStyle,
  createProgressBarStyle,
  createBadgeStyle,
  createPanelHeaderStyle,
} from '../../../helpers';
import type { ProgressTrackerProps, ProgressStage } from '../../core';

const StepCircle = ({ stage, index, tokens, engine, primitives }: {
  stage: ProgressStage;
  index: number;
  tokens: any;
  engine: string;
  primitives: any;
}) => {
  const { Box, Text } = primitives;
  const [isHovered, setIsHovered] = useState(false);

  const isCompleted = stage.status === 'completed';
  const isCurrent = stage.status === 'current';

  const circleStyle = useMemo(() => {
    const base: React.CSSProperties = {
      width: tokens.spacing[10],
      height: tokens.spacing[10],
      borderRadius: tokens.borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: tokens.typography.fontSize.sm,
      fontWeight: tokens.typography.fontWeight.bold,
      transition: `all ${tokens.motion.hover}`,
      position: 'relative' as const,
      zIndex: 2,
      flexShrink: 0,
    };

    if (isCompleted) {
      base.backgroundColor = tokens.colors.successScale[500];
      base.color = tokens.colors.common.white;
      base.boxShadow = `0 0 0 ${tokens.spacing[1]}px ${tokens.colors.successScale[100]}`;
    } else if (isCurrent) {
      base.backgroundColor = tokens.colors.primaryScale[500];
      base.color = tokens.colors.common.white;
      base.boxShadow = `0 0 0 ${tokens.spacing[1]}px ${tokens.colors.primaryScale[100]}, 0 0 ${tokens.spacing[4]}px ${tokens.colors.primaryScale[200]}`;
      base.animation = 'pulse 2s ease-in-out infinite';
    } else {
      base.backgroundColor = tokens.colors.neutral[100];
      base.color = tokens.colors.neutral[400];
      base.border = `2px solid ${tokens.colors.neutral[200]}`;
    }

    return base;
  }, [tokens, isCompleted, isCurrent]);

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
      <Box style={circleStyle}>
        <Text style={{ fontSize: isCompleted ? tokens.typography.fontSize.md : tokens.typography.fontSize.sm, lineHeight: 1 }}>
          {isCompleted ? '\u2713' : (stage.icon || (index + 1))}
        </Text>
      </Box>

      {/* Label */}
      <Text style={{
        marginTop: tokens.spacing[2],
        fontSize: tokens.typography.fontSize.sm,
        fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
        color: stage.status === 'upcoming' ? tokens.colors.neutral[400] : tokens.colors.neutral[800],
        textAlign: 'center' as const,
        transition: `color ${tokens.motion.hover}`,
      }}>
        {stage.label}
      </Text>

      {/* Status badge */}
      <Box style={{
        ...createBadgeStyle(tokens, statusColor),
        marginTop: tokens.spacing[1],
        fontSize: tokens.typography.fontSize.xs,
      }}>
        {stage.status}
      </Box>

      {stage.description && isHovered && (
        <Box style={{
          position: 'absolute' as const, top: `calc(100% + ${tokens.spacing[2]}px)`,
          left: '50%', transform: 'translateX(-50%)',
          backgroundColor: tokens.colors.neutral[900], color: tokens.colors.common.white,
          padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
          fontSize: tokens.typography.fontSize.xs, whiteSpace: 'nowrap' as const,
          zIndex: 10, boxShadow: tokens.shadows.lg, pointerEvents: 'none' as const,
        }}>
          {stage.description}
        </Box>
      )}
    </div>
  );
};

export const Linear = createPreset<ProgressTrackerProps>((context: PresetContext<ProgressTrackerProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;
  const isGlass = engine === 'modern' && !!tokens.glass;

  const { stages, title, className, style } = props;

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const percentage = stages.length > 0 ? (completedCount / stages.length) * 100 : 0;

  const containerStyle = useMemo(() => ({
    ...createCardStyle(tokens, { glass: isGlass, elevation: 'md' }),
    position: 'relative' as const,
    overflow: 'hidden' as const,
    ...style,
  }), [tokens, isGlass, style]);

  const progressStyles = useMemo(
    () => createProgressBarStyle(tokens, { percent: percentage }),
    [tokens, percentage],
  );

  return (
    <Box className={className} style={containerStyle}>
      {/* Accent bar */}
      <div style={createAccentBarStyle(tokens, { position: 'top' })} />

      <Box style={{ padding: tokens.spacing[5] }}>
        {/* Panel header with title */}
        {title && (
          <Box style={{
            ...createPanelHeaderStyle(tokens),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing[5],
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
              ...createBadgeStyle(tokens, 'primary'),
              fontSize: tokens.typography.fontSize.xs,
            }}>
              {completedCount}/{stages.length} completed
            </Box>
          </Box>
        )}

        {/* Progress bar */}
        <Box style={{ marginBottom: tokens.spacing[6] }}>
          <Box style={{
            ...progressStyles.track,
            height: tokens.spacing[2],
          }}>
            <Box style={{
              ...progressStyles.fill,
              height: '100%',
            }} />
          </Box>
          <Text style={{
            fontSize: tokens.typography.fontSize.xs,
            color: tokens.colors.neutral[500],
            marginTop: tokens.spacing[1],
            fontWeight: tokens.typography.fontWeight.medium,
          }}>
            {Math.round(percentage)}% complete
          </Text>
        </Box>

        {/* Step circles with connector lines */}
        <Box style={{
          position: 'relative' as const,
          display: 'flex',
          justifyContent: 'space-between',
          gap: tokens.spacing[2],
        }}>
          {/* Connector line (background) */}
          <Box style={{
            position: 'absolute' as const,
            top: `calc(${tokens.spacing[10]}px / 2)`,
            left: `calc(${tokens.spacing[10]}px / 2)`,
            right: `calc(${tokens.spacing[10]}px / 2)`,
            height: 2,
            background: `linear-gradient(to right, ${tokens.colors.neutral[200]}, ${tokens.colors.neutral[200]})`,
            zIndex: 1,
          }} />

          {/* Connector line (filled) */}
          {stages.length > 1 && (
            <Box style={{
              position: 'absolute' as const,
              top: `calc(${tokens.spacing[10]}px / 2)`,
              left: `calc(${tokens.spacing[10]}px / 2)`,
              height: 2,
              width: `${(completedCount / (stages.length - 1)) * 100}%`,
              background: `linear-gradient(to right, ${tokens.colors.successScale[400]}, ${tokens.colors.primaryScale[400]})`,
              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
              zIndex: 1,
            }} />
          )}

          {/* Steps */}
          {stages.map((stage, index) => (
            <StepCircle
              key={stage.key}
              stage={stage}
              index={index}
              tokens={tokens}
              engine={engine}
              primitives={primitives}
            />
          ))}
        </Box>
      </Box>

      {/* Keyframes for pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </Box>
  );
});
