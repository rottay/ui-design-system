'use client';

/**
 * DsarTracker - Table Preset
 * Tabular view of DSAR requests
 */

import { createPreset, PresetContext } from '../../../factory';
import type { DsarTrackerProps } from '../../core';
import { getDsarStatusColors, getDsarTypeLabel, getPriorityColors, getDaysRemaining } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const TableDsarTracker = createPreset<DsarTrackerProps>({
  name: 'DsarTracker.Table',
  render: ({ primitives, props, tokens }: PresetContext<DsarTrackerProps>) => {
    const { Box } = primitives;
    const statusColors = getDsarStatusColors(tokens);
    const priorityColors = getPriorityColors(tokens);

    const {
      requests,
      onRequestClick,
      selectedRequestId,
      title = 'DSAR Requests',
      loading,
      className,
      style,
    } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            <Box style={{
              display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
              gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50],
            }}>
              {['ID', 'Subject', 'Type', 'Status', 'Priority', 'Due', 'Assignee'].map(h => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </Box>

            {requests.map((req) => {
              const sColors = statusColors[req.status];
              const pColors = priorityColors[req.priority];
              const days = getDaysRemaining(req.dueDate);
              const isOverdue = days < 0 && req.status !== 'completed';
              const isSelected = req.id === selectedRequestId;

              return (
                <Box key={req.id} onClick={() => onRequestClick?.(req.id)} style={{
                  display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 1fr 1fr',
                  gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: onRequestClick ? 'pointer' : 'default',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, fontFamily: 'monospace', color: tokens.colors.neutral[600] }}>#{req.id.slice(0, 8)}</span>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{req.subject.name}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{req.subject.email}</span>
                  </Box>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{getDsarTypeLabel(req.type)}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.bg, color: sColors.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>
                    <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot, display: 'inline-block' }} />
                    {req.status}
                  </span>
                  <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: pColors.bg, color: pColors.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>{req.priority}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: isOverdue ? tokens.colors.errorScale[600] : tokens.colors.neutral[500], fontWeight: isOverdue ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.normal }}>
                    {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{req.assignee?.name || '\u2014'}</span>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
