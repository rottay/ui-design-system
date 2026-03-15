'use client';

/**
 * FeatureRolloutPlanner - Scheduler Preset
 * Gantt-like horizontal bar chart view showing feature rollouts
 * across a date timeline. Each rollout is a bar spanning from
 * startDate to targetDate, color-coded by current stage.
 */

import { useState, useMemo } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { FeatureRolloutPlannerProps, FeatureRollout } from '../../core';
import {
  getStageColors,
  getStageLabel,
  getAllStages,
  formatDate,
  formatDateFull,
  getDaysBetween,
  isOverdue,
  canAdvance,
} from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createEmptyStateStyle,
  createStatusDotStyle,
} from '../../../helpers';

/** Calculate date range for the scheduler view */
function computeDateRange(rollouts: FeatureRollout[]): { start: Date; end: Date; totalDays: number } {
  if (rollouts.length === 0) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);
    return { start, end, totalDays: getDaysBetween(start, end) };
  }

  const starts = rollouts.map(r => r.startDate.getTime());
  const ends = rollouts
    .map(r => (r.targetDate || r.startDate).getTime())
    .concat(starts);

  const padDays = 14;
  const minDate = new Date(Math.min(...starts) - padDays * 86400000);
  const maxDate = new Date(Math.max(...ends) + padDays * 86400000);

  return {
    start: minDate,
    end: maxDate,
    totalDays: getDaysBetween(minDate, maxDate),
  };
}

/** Generate month markers for the header */
function generateMonthMarkers(start: Date, end: Date): Array<{ label: string; offsetPercent: number }> {
  const markers: Array<{ label: string; offsetPercent: number }> = [];
  const totalMs = end.getTime() - start.getTime();
  const current = new Date(start.getFullYear(), start.getMonth(), 1);

  while (current <= end) {
    const offset = ((current.getTime() - start.getTime()) / totalMs) * 100;
    markers.push({
      label: current.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      offsetPercent: Math.max(0, offset),
    });
    current.setMonth(current.getMonth() + 1);
  }

  return markers;
}

export const SchedulerFeatureRolloutPlanner = createPreset<FeatureRolloutPlannerProps>({
  name: 'FeatureRolloutPlanner.Scheduler',
  render: ({ primitives, props, tokens }: PresetContext<FeatureRolloutPlannerProps>) => {
    const { Box, Text } = primitives;
    const {
      rollouts,
      onEditRollout,
      onAdvanceStage,
      selectedRolloutId,
      title,
      subtitle,
      loading,
      className,
      style,
    } = props;

    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const [tooltipId, setTooltipId] = useState<string | null>(null);

    const stageColors = getStageColors(tokens);
    const stages = getAllStages();

    const { start: rangeStart, end: rangeEnd, totalDays } = useMemo(
      () => computeDateRange(rollouts),
      [rollouts],
    );

    const monthMarkers = useMemo(
      () => generateMonthMarkers(rangeStart, rangeEnd),
      [rangeStart, rangeEnd],
    );

    // Today marker position
    const todayMs = new Date().getTime();
    const rangeMs = rangeEnd.getTime() - rangeStart.getTime();
    const todayPercent = rangeMs > 0
      ? ((todayMs - rangeStart.getTime()) / rangeMs) * 100
      : 0;
    const showToday = todayPercent >= 0 && todayPercent <= 100;

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
              Loading scheduler...
            </Text>
          </Box>
        </Box>
      );
    }

    const ROW_HEIGHT = 44;
    const LABEL_WIDTH = 180;

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
          {/* Stage Legend */}
          <Box style={{ display: 'flex', gap: tokens.spacing[3] }}>
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
        </Box>

        {rollouts.length === 0 ? (
          <Box style={createEmptyStateStyle(tokens)}>
            <Text style={{ color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.sm }}>
              No rollouts scheduled
            </Text>
          </Box>
        ) : (
          <Box style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', minWidth: LABEL_WIDTH + 600 }}>
              {/* Left: Feature Labels */}
              <div
                style={{
                  width: LABEL_WIDTH,
                  flexShrink: 0,
                  borderRight: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  backgroundColor: tokens.colors.common.white,
                }}
              >
                {/* Month header spacer */}
                <div
                  style={{
                    height: 32,
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.neutral[50],
                    padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
                    display: 'flex',
                    alignItems: 'center',
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

                {/* Feature rows */}
                {rollouts.map((rollout) => {
                  const isSelected = selectedRolloutId === rollout.id;
                  const isHovered = hoveredId === rollout.id;
                  const overdue = isOverdue(rollout);
                  const colors = stageColors[rollout.currentStage];

                  return (
                    <div
                      key={rollout.id}
                      onClick={() => onEditRollout?.(rollout.id)}
                      onMouseEnter={() => setHoveredId(rollout.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        height: ROW_HEIGHT,
                        display: 'flex',
                        alignItems: 'center',
                        gap: tokens.spacing[2],
                        padding: `0 ${tokens.spacing[3]}px`,
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                        backgroundColor: isSelected
                          ? tokens.colors.primaryScale[50]
                          : isHovered
                            ? tokens.colors.neutral[50]
                            : tokens.colors.common.white,
                        cursor: onEditRollout ? 'pointer' : 'default',
                        transition: `background-color ${tokens.motion.hover}`,
                      }}
                    >
                      <div style={createStatusDotStyle(tokens, colors.dot)} />
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[900],
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rollout.featureName}
                        </Text>
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
                  );
                })}
              </div>

              {/* Right: Timeline Area */}
              <div style={{ flex: 1, position: 'relative' }}>
                {/* Month Headers */}
                <div
                  style={{
                    height: 32,
                    position: 'relative',
                    borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    backgroundColor: tokens.colors.neutral[50],
                  }}
                >
                  {monthMarkers.map((marker, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'absolute',
                        left: `${marker.offsetPercent}%`,
                        top: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: tokens.spacing[2],
                        borderLeft: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.xs,
                          color: tokens.colors.neutral[500],
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {marker.label}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* Bars */}
                {rollouts.map((rollout) => {
                  const isSelected = selectedRolloutId === rollout.id;
                  const isHovered = hoveredId === rollout.id;
                  const colors = stageColors[rollout.currentStage];
                  const overdue = isOverdue(rollout);

                  const startMs = rollout.startDate.getTime();
                  const endMs = rollout.targetDate
                    ? rollout.targetDate.getTime()
                    : startMs + 14 * 86400000; // default 2 weeks if no target

                  const leftPercent = ((startMs - rangeStart.getTime()) / rangeMs) * 100;
                  const widthPercent = ((endMs - startMs) / rangeMs) * 100;

                  return (
                    <div
                      key={rollout.id}
                      onMouseEnter={() => { setHoveredId(rollout.id); setTooltipId(rollout.id); }}
                      onMouseLeave={() => { setHoveredId(null); setTooltipId(null); }}
                      style={{
                        height: ROW_HEIGHT,
                        position: 'relative',
                        borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
                      }}
                    >
                      {/* Background alternating */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: isSelected
                            ? tokens.colors.primaryScale[50]
                            : isHovered
                              ? tokens.colors.neutral[50]
                              : 'transparent',
                          transition: `background-color ${tokens.motion.hover}`,
                        }}
                      />

                      {/* Rollout Bar */}
                      <div
                        onClick={() => onEditRollout?.(rollout.id)}
                        style={{
                          position: 'absolute',
                          left: `${Math.max(0, leftPercent)}%`,
                          width: `${Math.min(widthPercent, 100 - Math.max(0, leftPercent))}%`,
                          top: 8,
                          height: ROW_HEIGHT - 16,
                          backgroundColor: colors.bar,
                          borderRadius: tokens.borderRadius.md,
                          cursor: onEditRollout ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          paddingLeft: tokens.spacing[2],
                          paddingRight: tokens.spacing[2],
                          overflow: 'hidden',
                          opacity: isHovered ? 1 : 0.85,
                          transition: `opacity ${tokens.motion.hover}`,
                          zIndex: 1,
                          border: overdue
                            ? `2px solid ${tokens.colors.errorScale[500]}`
                            : isSelected
                              ? `2px solid ${tokens.colors.primaryScale[500]}`
                              : 'none',
                        }}
                      >
                        {/* Filled portion based on rollout percentage */}
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${rollout.rolloutPercentage}%`,
                            backgroundColor: colors.dot,
                            opacity: 0.3,
                            borderRadius: tokens.borderRadius.md,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.common.white,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            position: 'relative',
                            zIndex: 1,
                          }}
                        >
                          {rollout.rolloutPercentage}%
                        </Text>
                      </div>

                      {/* Tooltip */}
                      {tooltipId === rollout.id && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${Math.max(0, leftPercent)}%`,
                            bottom: ROW_HEIGHT - 4,
                            zIndex: 10,
                            padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: tokens.colors.neutral[800],
                            color: tokens.colors.common.white,
                            fontSize: tokens.typography.fontSize.xs,
                            boxShadow: tokens.shadows.md,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                          }}
                        >
                          <div style={{ fontWeight: tokens.typography.fontWeight.semibold as any, marginBottom: 2 }}>
                            {rollout.featureName}
                          </div>
                          <div>
                            {getStageLabel(rollout.currentStage)} - {rollout.rolloutPercentage}%
                          </div>
                          <div style={{ opacity: 0.7 }}>
                            {formatDateFull(rollout.startDate)}
                            {rollout.targetDate && ` to ${formatDateFull(rollout.targetDate)}`}
                          </div>
                          {rollout.owner && (
                            <div style={{ opacity: 0.7 }}>Owner: {rollout.owner}</div>
                          )}
                          {overdue && (
                            <div style={{ color: tokens.colors.errorScale[300] }}>Overdue</div>
                          )}
                        </div>
                      )}

                      {/* Advance button on hover */}
                      {isHovered && onAdvanceStage && canAdvance(rollout) && (
                        <div
                          onClick={(e) => { e.stopPropagation(); onAdvanceStage(rollout.id); }}
                          style={{
                            position: 'absolute',
                            right: tokens.spacing[2],
                            top: '50%',
                            transform: 'translateY(-50%)',
                            zIndex: 3,
                            padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                            borderRadius: tokens.borderRadius.md,
                            fontSize: tokens.typography.fontSize.xs,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.common.white,
                            backgroundColor: tokens.colors.successScale[600],
                            cursor: 'pointer',
                            boxShadow: tokens.shadows.sm,
                          }}
                        >
                          Advance
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Today Marker */}
                {showToday && (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${todayPercent}%`,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      backgroundColor: tokens.colors.errorScale[500],
                      zIndex: 5,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: -16,
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[1]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        backgroundColor: tokens.colors.errorScale[500],
                        color: tokens.colors.common.white,
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Today
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Box>
        )}
      </Box>
    );
  },
});
