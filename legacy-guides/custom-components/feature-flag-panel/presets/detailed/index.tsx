'use client';

import React, { useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import type { FeatureFlagPanelProps } from '../../core';
import {
  createCardStyle,
  createHoverStyle,
} from '../../../helpers';

export const Detailed = createPreset<FeatureFlagPanelProps>((context: PresetContext<FeatureFlagPanelProps>) => {
  const { primitives, props, tokens, engine } = context;
  const { Box, Text, Button, Input } = primitives;

  const { flags, onToggle, onRolloutChange, className, style } = props;

  const cardStyle = useMemo(() => createCardStyle(tokens), [tokens]);

  return (
    <Box className={className} style={style}>
      <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing[4] }}>
        Feature Flags
      </Text>

      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: tokens.spacing[4] }}>
        {flags.map((flag) => (
          <Box key={flag.key} style={cardStyle}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: tokens.spacing[2] }}>
              <Box>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[800] }}>
                  {flag.name}
                </Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], fontFamily: 'monospace' }}>
                  {flag.key}
                </Text>
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

            {flag.description && (
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], marginBottom: tokens.spacing[4] }}>
                {flag.description}
              </Text>
            )}

            {flag.environment && (
              <Box style={{ marginBottom: tokens.spacing[4] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>
                  Environment
                </Text>
                <Box
                  style={{
                    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
                    backgroundColor: tokens.colors.infoScale[100],
                    color: tokens.colors.infoScale[700],
                    borderRadius: tokens.borderRadius.sm,
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.medium,
                    display: 'inline-block',
                  }}
                >
                  {flag.environment}
                </Box>
              </Box>
            )}

            {flag.rolloutPercent !== undefined && (
              <Box style={{ marginBottom: tokens.spacing[4] }}>
                <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    Rollout Percentage
                  </Text>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>
                    {flag.rolloutPercent}%
                  </Text>
                </Box>
                {onRolloutChange && (
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={flag.rolloutPercent}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onRolloutChange(flag.key, parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      marginBottom: tokens.spacing[1],
                    }}
                  />
                )}
                <Box
                  style={{
                    width: '100%',
                    height: '8px',
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
                      transition: `width ${tokens.transitions?.normal || tokens.motion.hover}`,
                    }}
                  />
                </Box>
              </Box>
            )}

            {flag.updatedAt && (
              <Box style={{ paddingTop: tokens.spacing[2], borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                  Updated {flag.updatedAt}
                </Text>
                {flag.updatedBy && (
                  <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                    by {flag.updatedBy}
                  </Text>
                )}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
});
