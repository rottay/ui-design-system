'use client';

/**
 * DsarTracker - Board Preset
 * Kanban-style board view of DSAR requests
 */

import { createPreset, PresetContext } from '../../../factory';
import type { DsarTrackerProps, DsarStatus } from '../../core';
import { getDsarStatusColors, getDsarTypeLabel, getPriorityColors, getDaysRemaining } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createInteractiveCardStyle,
  createSectionHeaderStyle,
  createProgressBarStyle,
} from '../../../helpers';

export const BoardDsarTracker = createPreset<DsarTrackerProps>({
  name: 'DsarTracker.Board',
  render: ({ primitives, props, tokens }: PresetContext<DsarTrackerProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getDsarStatusColors(tokens);
    const priorityColors = getPriorityColors(tokens);

    const {
      requests,
      metrics,
      onRequestClick,
      onExport,
      title = 'DSAR Tracker',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const columns: { status: DsarStatus; label: string }[] = [
      { status: 'new', label: 'New' },
      { status: 'in-review', label: 'In Review' },
      { status: 'processing', label: 'Processing' },
      { status: 'completed', label: 'Completed' },
    ];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            {metrics && (
              <Box style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                <span>Avg: <strong style={{ color: tokens.colors.neutral[700] }}>{metrics.avgResponseDays}d</strong></span>
                <span>Compliance: <strong style={{ color: metrics.complianceRate >= 90 ? tokens.colors.successScale[600] : tokens.colors.warningScale[600] }}>{metrics.complianceRate}%</strong></span>
              </Box>
            )}
            {onExport && (
              <button onClick={onExport} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white,
                color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
              }}>Export</button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: tokens.spacing[3], padding: tokens.spacing[4] }}>
            {columns.map((col) => {
              const colRequests = requests.filter(r => r.status === col.status);
              const colors = statusColors[col.status];

              return (
                <Box key={col.status} style={{ minWidth: 0 }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                    <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot }} />
                    <span style={{ ...createSectionHeaderStyle(tokens), margin: 0 }}>{col.label}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], backgroundColor: tokens.colors.neutral[100], padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm }}>{colRequests.length}</span>
                  </Box>

                  <Stack direction="vertical" spacing="sm">
                    {colRequests.map((req) => {
                      const days = getDaysRemaining(req.dueDate);
                      const isOverdue = days < 0 && req.status !== 'completed';
                      const pColors = priorityColors[req.priority];

                      return (
                        <Box key={req.id} onClick={() => onRequestClick?.(req.id)} style={{
                          ...createInteractiveCardStyle(tokens),
                          padding: tokens.spacing[3],
                          borderLeft: `3px solid ${isOverdue ? tokens.colors.errorScale[500] : colors.dot}`,
                        }}>
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>#{req.id.slice(0, 8)}</span>
                            <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: pColors.bg, color: pColors.color, fontSize: tokens.typography.fontSize.xs }}>{req.priority}</span>
                          </Box>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], display: 'block' }}>{getDsarTypeLabel(req.type)}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginTop: tokens.spacing[1] }}>{req.subject.name}</span>
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: tokens.spacing[2] }}>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: isOverdue ? tokens.colors.errorScale[600] : tokens.colors.neutral[400] }}>
                              {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                            </span>
                            {req.assignee && (
                              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{req.assignee.name}</span>
                            )}
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
