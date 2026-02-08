import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ProgressTrackerProps } from '../../core';

export const Linear = createPreset<ProgressTrackerProps>((context: PresetContext<ProgressTrackerProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text } = primitives;

  const { stages, title, className, style } = props;

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const percentage = stages.length > 0 ? (completedCount / stages.length) * 100 : 0;

  return (
    <Box className={className} style={style}>
      {title && (
        <Text style={{
          boxShadow: tokens.shadows.sm, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
          {title}
        </Text>
      )}

      <Box style={{ marginBottom: tokens.spacing[6] }}>
        <Box
          style={{
            width: '100%',
            height: '8px',
            backgroundColor: tokens.colors.neutral[200],
            borderRadius: tokens.borderRadius.full,
            overflow: 'hidden',
            marginBottom: tokens.spacing[2],
          }}
        >
          <Box
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: tokens.colors.primaryScale[500],
              borderRadius: tokens.borderRadius.full,
              transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
            }}
          />
        </Box>
        <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>
          {completedCount} of {stages.length} completed ({Math.round(percentage)}%)
        </Text>
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'space-between', gap: tokens.spacing[4] }}>
        {stages.map((stage, index) => (
          <Box key={stage.key} style={{ flex: 1, textAlign: 'center' }}>
            <Box
              style={{
                width: '32px',
                height: '32px',
                margin: '0 auto',
                borderRadius: tokens.borderRadius.full,
                backgroundColor: stage.status === 'completed' ? tokens.colors.primaryScale[500] :
                  stage.status === 'current' ? tokens.colors.primaryScale[100] : tokens.colors.neutral[200],
                color: stage.status === 'completed' ? tokens.colors.common.white :
                  stage.status === 'current' ? tokens.colors.primaryScale[700] : tokens.colors.neutral[500],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                marginBottom: tokens.spacing[2],
              }}
            >
              {stage.icon || (index + 1)}
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: stage.status === 'current' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                color: stage.status === 'upcoming' ? tokens.colors.neutral[500] : tokens.colors.neutral[700],
              }}
            >
              {stage.label}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
});
