import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ProgressTrackerProps } from '../../core';

export const Milestone = createPreset<ProgressTrackerProps>((context: PresetContext<ProgressTrackerProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const { stages, title, className, style } = props;

  return (
    <Box className={className} style={style}>
      {title && (
        <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
          {title}
        </Text>
      )}

      <Box style={{ position: 'relative', paddingTop: tokens.spacing[6] }}>
        <Box
          style={{
            position: 'absolute',
            top: '24px',
            left: '0',
            right: '0',
            height: '2px',
            backgroundColor: tokens.colors.neutral[200],
          }}
        />

        <Box style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {stages.map((stage, index) => {
            const isCompleted = stage.status === 'completed';
            const isCurrent = stage.status === 'current';

            return (
              <Box key={stage.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: tokens.borderRadius.full,
                    backgroundColor: isCompleted ? tokens.colors.successScale[500] :
                      isCurrent ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                    border: `3px solid ${tokens.colors.common.white}`,
                    boxShadow: tokens.shadows.sm,
                    marginBottom: tokens.spacing[4],
                  }}
                />

                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: isCurrent ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                    color: stage.status === 'upcoming' ? tokens.colors.neutral[500] : tokens.colors.neutral[700],
                    textAlign: 'center',
                    maxWidth: '100px',
                  }}
                >
                  {stage.label}
                </Text>

                {stage.description && (
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      color: tokens.colors.neutral[600],
                      textAlign: 'center',
                      marginTop: tokens.spacing[1],
                      maxWidth: '100px',
                    }}
                  >
                    {stage.description}
                  </Text>
                )}
              </Box>
            );
          })}
        </Box>

        {stages.length > 1 && (
          <Box
            style={{
              position: 'absolute',
              top: '24px',
              left: '0',
              height: '2px',
              backgroundColor: tokens.colors.primaryScale[500],
              width: `${(stages.filter(s => s.status === 'completed').length / (stages.length - 1)) * 100}%`,
              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
            }}
          />
        )}
      </Box>
    </Box>
  );
});
