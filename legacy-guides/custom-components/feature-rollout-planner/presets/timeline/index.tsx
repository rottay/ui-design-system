'use client';

/**
 * FeatureRolloutPlanner - Timeline Preset
 * Visual timeline showing each rollout as a progression through stages
 * (planned -> canary -> beta -> ga). Each feature gets a row with stage
 * indicators, percentage bar, targets, and action buttons.
 */

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FeatureRolloutPlannerProps } from '../../core';
import {
  getStageColors,
  getStageLabel,
  getStageIndex,
  getAllStages,
  getTargetLabel,
  canAdvance,
  canRollback,
  formatDate,
  isOverdue,
} from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createStatusDotStyle,
  createSectionHeaderStyle,
  createEmptyStateStyle,
  createPanelHeaderStyle,
} from '../../../helpers';

export const TimelineFeatureRolloutPlanner = createPreset<FeatureRolloutPlannerProps>({
  name: 'FeatureRolloutPlanner.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<FeatureRolloutPlannerProps>) => {
    const { Box, Stack, Text } = primitives;
    const {
      rollouts,
      onEditRollout,
      onAdvanceStage,
      onRollback,
      onPause,
      selectedRolloutId,
      title,
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const stageColors = getStageColors(tokens);
    const stages = getAllStages();

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
              Loading rollouts...
            </Text>
          </Box>
        </Box>
      );
    }

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
            {rollouts.length} feature{rollouts.length !== 1 ? 's' : ''}
          </Text>
        </Box>

        {/* Stage Legend */}
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[3],
            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
            borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
          }}
        >
          {stages.filter(s => s !== 'deprecated').map((stage) => {
            const colors = stageColors[stage];
            return (
              <Box key={stage} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                <div style={createStatusDotStyle(tokens, colors.dot)} />
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                  {getStageLabel(stage)}
                </Text>
              </Box>
            );
          })}
        </Box>

        {/* Rollout Items */}
        {rollouts.length === 0 ? (
          <Box style={createEmptyStateStyle(tokens)}>
            <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No feature rollouts planned
            </Text>
          </Box>
        ) : (
          <Box style={{ padding: tokens.spacing[2] }}>
            <Stack direction="vertical" spacing="sm">
              {rollouts.map((rollout) => {
                const isSelected = selectedRolloutId === rollout.id;
                const isHovered = hoveredId === rollout.id;
                const overdue = isOverdue(rollout);
                const currentColors = stageColors[rollout.currentStage];
                const percentBar = createProgressBarStyle(tokens, {
                  color: currentColors.bar,
                  percent: rollout.rolloutPercentage,
                });

                return (
                  <div
                    key={rollout.id}
                    onMouseEnter={() => setHoveredId(rollout.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => onEditRollout?.(rollout.id)}
                    style={{
                      padding: tokens.spacing[3],
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${
                        isSelected ? tokens.colors.primaryScale[300] : tokens.colors.neutral[200]
                      }`,
                      backgroundColor: isSelected
                        ? tokens.colors.primaryScale[50]
                        : isHovered
                          ? tokens.colors.neutral[50]
                          : tokens.colors.common.white,
                      cursor: onEditRollout ? 'pointer' : 'default',
                      transition: `all ${tokens.motion.hover}`,
                    }}
                  >
                    {/* Feature Name + Stage Badge */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                          flex: 1,
                        }}
                      >
                        {rollout.featureName}
                      </Text>

                      {overdue && (
                        <Box
                          style={{
                            ...createBadgeStyle(tokens, 'error'),
                            fontSize: tokens.typography.fontSize.xs,
                          }}
                        >
                          Overdue
                        </Box>
                      )}

                      <Box
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: tokens.spacing[1],
                          padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.full,
                          fontSize: tokens.typography.fontSize.xs,
                          fontWeight: tokens.typography.fontWeight.medium,
                          backgroundColor: currentColors.bg,
                          color: currentColors.text,
                          border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${currentColors.border}`,
                        }}
                      >
                        <div style={createStatusDotStyle(tokens, currentColors.dot)} />
                        {getStageLabel(rollout.currentStage)}
                      </Box>
                    </Box>

                    {/* Stage Progress Visualization */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], marginBottom: tokens.spacing[2] }}>
                      {stages.filter(s => s !== 'deprecated').map((stage, idx) => {
                        const stageIdx = getStageIndex(stage);
                        const currentIdx = getStageIndex(rollout.currentStage);
                        const targetIdx = getStageIndex(rollout.targetStage);
                        const isPast = stageIdx < currentIdx;
                        const isCurrent = stageIdx === currentIdx;
                        const isFuture = stageIdx > currentIdx && stageIdx <= targetIdx;
                        const colors = stageColors[stage];

                        return (
                          <Box key={stage} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            {/* Stage Node */}
                            <div
                              style={{
                                width: isCurrent ? 14 : 10,
                                height: isCurrent ? 14 : 10,
                                borderRadius: tokens.borderRadius.full,
                                backgroundColor: isPast || isCurrent ? colors.dot : 'transparent',
                                border: `2px solid ${isPast || isCurrent ? colors.dot : isFuture ? tokens.colors.neutral[300] : tokens.colors.neutral[200]}`,
                                flexShrink: 0,
                                transition: `all ${tokens.motion.hover}`,
                              }}
                            />
                            {/* Connector */}
                            {idx < stages.filter(s => s !== 'deprecated').length - 1 && (
                              <div
                                style={{
                                  flex: 1,
                                  height: 2,
                                  backgroundColor: isPast ? colors.dot : tokens.colors.neutral[200],
                                  marginLeft: tokens.spacing[1],
                                  marginRight: tokens.spacing[1],
                                }}
                              />
                            )}
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Percentage + Targets + Dates */}
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], marginBottom: tokens.spacing[2] }}>
                      <Box style={{ flex: 1 }}>
                        <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                            Rollout
                          </Text>
                          <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                            {rollout.rolloutPercentage}%
                          </Text>
                        </Box>
                        <div style={percentBar.track}>
                          <div style={percentBar.fill} />
                        </div>
                      </Box>

                      <Box style={{ flexShrink: 0, textAlign: 'right' as const }}>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {formatDate(rollout.startDate)}
                          {rollout.targetDate && ` - ${formatDate(rollout.targetDate)}`}
                        </Text>
                      </Box>
                    </Box>

                    {/* Targets + Environments */}
                    <Box style={{ display: 'flex', gap: tokens.spacing[2], flexWrap: 'wrap', marginBottom: tokens.spacing[2] }}>
                      {rollout.targets.map((target) => (
                        <Box
                          key={target}
                          style={{
                            ...createBadgeStyle(tokens, 'secondary'),
                            fontSize: tokens.typography.fontSize.xs,
                          }}
                        >
                          {getTargetLabel(target)}
                        </Box>
                      ))}
                      {rollout.environments.map((env) => (
                        <Box
                          key={env}
                          style={{
                            ...createBadgeStyle(tokens, 'info'),
                            fontSize: tokens.typography.fontSize.xs,
                          }}
                        >
                          {env}
                        </Box>
                      ))}
                    </Box>

                    {/* Actions */}
                    {(onAdvanceStage || onRollback || onPause) && (
                      <Box
                        style={{
                          display: 'flex',
                          gap: tokens.spacing[2],
                          borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                          paddingTop: tokens.spacing[2],
                        }}
                      >
                        {onAdvanceStage && canAdvance(rollout) && (
                          <div
                            onClick={(e) => { e.stopPropagation(); onAdvanceStage(rollout.id); }}
                            style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.common.white,
                              backgroundColor: tokens.colors.successScale[600],
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            Advance
                          </div>
                        )}
                        {onRollback && canRollback(rollout) && (
                          <div
                            onClick={(e) => { e.stopPropagation(); onRollback(rollout.id); }}
                            style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.warningScale[700],
                              backgroundColor: tokens.colors.warningScale[50],
                              border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.warningScale[200]}`,
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            Rollback
                          </div>
                        )}
                        {onPause && rollout.currentStage !== 'planned' && rollout.currentStage !== 'deprecated' && (
                          <div
                            onClick={(e) => { e.stopPropagation(); onPause(rollout.id); }}
                            style={{
                              padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                              borderRadius: tokens.borderRadius.md,
                              fontSize: tokens.typography.fontSize.xs,
                              fontWeight: tokens.typography.fontWeight.medium,
                              color: tokens.colors.neutral[600],
                              backgroundColor: tokens.colors.neutral[100],
                              cursor: 'pointer',
                              transition: `all ${tokens.motion.hover}`,
                            }}
                          >
                            Pause
                          </div>
                        )}
                        {rollout.owner && (
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.neutral[400],
                              marginLeft: 'auto',
                              alignSelf: 'center',
                            }}
                          >
                            Owner: {rollout.owner}
                          </Text>
                        )}
                      </Box>
                    )}
                  </div>
                );
              })}
            </Stack>
          </Box>
        )}
      </Box>
    );
  },
});
