import React from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { FeatureFlagPanelProps } from '../../core';
import { createCardStyle } from '../../../helpers';

export const List = createPreset<FeatureFlagPanelProps>((context: PresetContext<FeatureFlagPanelProps>) => {
  const { primitives, props, tokens } = context;
  const { Box, Text, Button } = primitives;

  const { flags, onToggle, className, style } = props;

  const cardStyle = createCardStyle(tokens);

  return (
    <Box style={cardStyle} className={className}>
      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
        Feature Flags
      </Text>

      {flags.map((flag) => (
        <Box
          key={flag.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: tokens.spacing[4],
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
          }}
        >
          <Box style={{ flex: 1 }}>
            <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                {flag.name}
              </Text>
              {flag.environment && (
                <Box
                  style={{
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    backgroundColor: tokens.colors.infoScale[100],
                    color: tokens.colors.infoScale[700],
                    borderRadius: tokens.borderRadius.sm,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {flag.environment}
                </Box>
              )}
            </Box>

            {flag.description && (
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[2] }}>
                {flag.description}
              </Text>
            )}

            {flag.rolloutPercent !== undefined && (
              <Box>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                  Rollout: {flag.rolloutPercent}%
                </Text>
                <Box
                  style={{
                    width: '200px',
                    height: '6px',
                    backgroundColor: tokens.colors.neutral[200],
                    borderRadius: tokens.borderRadius.full,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    style={{
                      width: `${flag.rolloutPercent}%`,
                      height: '100%',
                      backgroundColor: flag.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[400],
                      transition: `width ${tokens.motion.hover}`,
                    }}
                  />
                </Box>
              </Box>
            )}

            {flag.updatedAt && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                Updated {flag.updatedAt} {flag.updatedBy && `by ${flag.updatedBy}`}
              </Text>
            )}
          </Box>

          {onToggle && (
            <Button
              onClick={() => onToggle(flag.key)}
              style={{
                position: 'relative',
                width: '48px',
                height: '24px',
                backgroundColor: flag.enabled ? tokens.colors.successScale[500] : tokens.colors.neutral[300],
                borderRadius: tokens.borderRadius.full,
                border: 'none',
                cursor: 'pointer',
                transition: `all ${tokens.motion.hover}`,
                padding: 0,
              }}
            >
              <Box
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: flag.enabled ? '26px' : '2px',
                  width: '20px',
                  height: '20px',
                  backgroundColor: tokens.colors.common.white,
                  borderRadius: tokens.borderRadius.full,
                  transition: `all ${tokens.motion.hover}`,
                  boxShadow: tokens.shadows.sm,
                }}
              />
            </Button>
          )}
        </Box>
      ))}
    </Box>
  );
});
