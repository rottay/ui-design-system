import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { ProgressTrackerProps } from '../../core';

export const Circular = createPreset<ProgressTrackerProps>((context: PresetContext<ProgressTrackerProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text } = primitives;

  const { stages, title, className, style } = props;

  const completedCount = stages.filter(s => s.status === 'completed').length;
  const percentage = stages.length > 0 ? (completedCount / stages.length) * 100 : 0;

  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Box className={className} style={style}>
      {title && (
        <Text style={{
          boxShadow: tokens.shadows.sm, fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
          {title}
        </Text>
      )}

      <Box style={{ display: 'flex', gap: tokens.spacing[8], alignItems: 'flex-start' }}>
        <Box style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={tokens.colors.neutral[200]}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={tokens.colors.primaryScale[500]}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{ transition: `stroke-dashoffset ${tokens.motion.hover}` }}
            />
          </svg>
          <Box
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
            }}
          >
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>
              {Math.round(percentage)}%
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
              Complete
            </Text>
          </Box>
        </Box>

        <Box style={{ flex: 1 }}>
          {stages.map((stage, index) => (
            <Box
              key={stage.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: tokens.spacing[2],
                marginBottom: tokens.spacing[4],
              }}
            >
              <Box
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: tokens.borderRadius.full,
                  backgroundColor: stage.status === 'completed' ? tokens.colors.successScale[500] :
                    stage.status === 'current' ? tokens.colors.primaryScale[500] : tokens.colors.neutral[300],
                  color: tokens.colors.common.white,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: tokens.typography.fontSize.xs,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  flexShrink: 0,
                }}
              >
                {stage.status === 'completed' ? '✓' : (index + 1)}
              </Box>
              <Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    fontWeight: stage.status === 'current' ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                    color: stage.status === 'upcoming' ? tokens.colors.neutral[500] : tokens.colors.neutral[700],
                  }}
                >
                  {stage.label}
                </Text>
                {stage.description && (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                    {stage.description}
                  </Text>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});
