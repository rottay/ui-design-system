'use client';

/**
 * FeatureRolloutPlanner - Matrix Preset
 * Grid view showing features (rows) vs environments (columns).
 * Each cell shows the rollout stage and percentage for that
 * feature-environment combination. Ideal for cross-environment comparison.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FeatureRolloutPlannerProps } from '../../core';
import {
  getStageColors,
  getStageLabel,
  collectEnvironments,
  isOverdue,
} from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createEmptyStateStyle,
  createStatusDotStyle,
} from '../../../helpers';

export const MatrixFeatureRolloutPlanner = createPreset<FeatureRolloutPlannerProps>({
  name: 'FeatureRolloutPlanner.Matrix',
  render: ({ primitives, props, tokens }: PresetContext<FeatureRolloutPlannerProps>) => {
    const { Box, Text } = primitives;
    const {
      rollouts,
      onEditRollout,
      selectedRolloutId,
      title,
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredCell, setHoveredCell] = useState<string | null>(null);

    const stageColors = getStageColors(tokens);
    const environments = collectEnvironments(rollouts);

    if (loading) {
      return (
        <Box
          className={className}
          style={{
            ...createCardStyle(tokens, { elevation: 'sm' }),
            ...style,
          }}
        >
          <Box style={createEmptyStateStyle(tokens)}>
            <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              Loading matrix...
            </Text>
          </Box>
        </Box>
      );
    }

    const cellBorderStyle = `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`;

    return (
      <Box
        className={className}
        style={{
          ...createCardStyle(tokens, { elevation: 'sm', padding: 0 }),
          overflow: 'hidden',
          ...style,
        }}
      >
        {/* Header */}
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.semibold,
                color: tokens.colors.neutral[900],
              }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {subtitle}
              </Text>
            )}
          </Box>
          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
            {rollouts.length} features x {environments.length} environments
          </Text>
        </Box>

        {rollouts.length === 0 || environments.length === 0 ? (
          <Box style={createEmptyStateStyle(tokens)}>
            <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              {rollouts.length === 0 ? 'No feature rollouts' : 'No environments configured'}
            </Text>
          </Box>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `200px repeat(${environments.length}, 1fr)`, minWidth: 200 + environments.length * 140 }}>
              {/* Column Headers */}
              <div
                style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  backgroundColor: tokens.colors.neutral[50],
                  borderBottom: cellBorderStyle,
                  borderRight: cellBorderStyle,
                  position: 'sticky',
                  left: 0,
                  zIndex: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.xs,
                    fontWeight: tokens.typography.fontWeight.semibold,
                    color: tokens.colors.neutral[500],
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Feature
                </Text>
              </div>
              {environments.map((env) => (
                <div
                  key={env}
                  style={{
                    padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                    backgroundColor: tokens.colors.neutral[50],
                    borderBottom: cellBorderStyle,
                    borderRight: cellBorderStyle,
                    textAlign: 'center' as const,
                  }}
                >
                  <Text
                    style={{
                      fontSize: tokens.typography.fontSize.xs,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.neutral[500],
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {env}
                  </Text>
                </div>
              ))}

              {/* Data Rows */}
              {rollouts.map((rollout) => {
                const isSelected = selectedRolloutId === rollout.id;
                const overdue = isOverdue(rollout);
                const currentColors = stageColors[rollout.currentStage];

                return (
                  <>
                    {/* Feature Name Cell */}
                    <div
                      key={`${rollout.id}-name`}
                      onClick={() => onEditRollout?.(rollout.id)}
                      style={{
                        padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                        borderBottom: cellBorderStyle,
                        borderRight: cellBorderStyle,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        cursor: onEditRollout ? 'pointer' : 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                      }}
                    >
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[900],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rollout.featureName}
                        </Text>
                        {rollout.owner && (
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                            {rollout.owner}
                          </Text>
                        )}
                      </Box>
                      {overdue && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: tokens.borderRadius.full,
                            backgroundColor: tokens.colors.errorScale[500],
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>

                    {/* Environment Cells */}
                    {environments.map((env) => {
                      const isInEnv = rollout.environments.includes(env);
                      const cellKey = `${rollout.id}-${env}`;
                      const isCellHovered = hoveredCell === cellKey;

                      return (
                        <div
                          key={cellKey}
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                          style={{
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderBottom: cellBorderStyle,
                            borderRight: cellBorderStyle,
                            backgroundColor: isInEnv
                              ? isCellHovered
                                ? currentColors.bg
                                : tokens.colors.common.white
                              : tokens.colors.neutral[50],
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: tokens.spacing[1],
                            transition: `background-color ${tokens.motion.hover}`,
                          }}
                        >
                          {isInEnv ? (
                            <>
                              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                                <div style={createStatusDotStyle(tokens, currentColors.dot)} />
                                <Text
                                  style={{
                                    fontSize: tokens.typography.fontSize.xs,
                                    fontWeight: tokens.typography.fontWeight.medium,
                                    color: currentColors.text,
                                  }}
                                >
                                  {getStageLabel(rollout.currentStage)}
                                </Text>
                              </Box>
                              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                                {rollout.rolloutPercentage}%
                              </Text>
                              {/* Mini progress bar */}
                              <div
                                style={{
                                  width: '100%',
                                  height: 3,
                                  borderRadius: tokens.borderRadius.full,
                                  backgroundColor: tokens.colors.neutral[100],
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${rollout.rolloutPercentage}%`,
                                    height: '100%',
                                    backgroundColor: currentColors.bar,
                                    borderRadius: tokens.borderRadius.full,
                                    transition: `width ${tokens.motion.hover}`,
                                  }}
                                />
                              </div>
                            </>
                          ) : (
                            <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[300] }}>
                              --
                            </Text>
                          )}
                        </div>
                      );
                    })}
                  </>
                );
              })}
            </div>
          </Box>
        )}
      </Box>
    );
  },
});
