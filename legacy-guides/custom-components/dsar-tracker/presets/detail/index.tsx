'use client';

/**
 * DsarTracker - Detail Preset
 * Detailed view of a single DSAR request
 */

import { createPreset, PresetContext } from '../../../factory';
import type { DsarTrackerProps } from '../../core';
import { getDsarStatusColors, getDsarTypeLabel, getPriorityColors, getDaysRemaining } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createAccentBarStyle,
  createProgressBarStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const DetailDsarTracker = createPreset<DsarTrackerProps>({
  name: 'DsarTracker.Detail',
  render: ({ primitives, props, tokens }: PresetContext<DsarTrackerProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getDsarStatusColors(tokens);
    const priorityColors = getPriorityColors(tokens);

    const {
      requests,
      selectedRequestId,
      onStatusChange,
      title,
      loading,
      className,
      style,
    } = props;

    const request = requests.find(r => r.id === selectedRequestId) || requests[0];

    if (loading) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>Loading...</Box>;
    }

    if (!request) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>No request selected</Box>;
    }

    const days = getDaysRemaining(request.dueDate);
    const isOverdue = days < 0 && request.status !== 'completed';
    const sColors = statusColors[request.status];
    const pColors = priorityColors[request.priority];
    const totalDays = Math.ceil((request.dueDate.getTime() - request.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
    const elapsed = totalDays - days;
    const progress = request.status === 'completed' ? 100 : Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
    const progressBar = createProgressBarStyle(tokens, { percent: progress, color: isOverdue ? tokens.colors.errorScale[500] : undefined });

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: isOverdue ? tokens.colors.errorScale[500] : sColors.dot })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>
              {title || `DSAR #${request.id.slice(0, 8)}`}
            </h3>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{getDsarTypeLabel(request.type)}</span>
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.bg, color: sColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
              <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.dot, display: 'inline-block' }} />
              {request.status}
            </span>
            <span style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: pColors.bg, color: pColors.color, fontSize: tokens.typography.fontSize.xs }}>{request.priority}</span>
          </Box>
        </Box>

        <Box style={{ padding: tokens.spacing[4] }}>
          {/* Progress */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>Time Progress</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: isOverdue ? tokens.colors.errorScale[600] : tokens.colors.neutral[600], fontWeight: tokens.typography.fontWeight.medium }}>
                {isOverdue ? `${Math.abs(days)}d overdue` : `${days}d remaining`}
              </span>
            </Box>
            <Box style={progressBar.track}><Box style={progressBar.fill} /></Box>
          </Box>

          {/* Subject Info */}
          <Box style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, display: 'block', marginBottom: tokens.spacing[2] }}>Data Subject</span>
            <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{request.subject.name}</span>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{request.subject.email}</span>
          </Box>

          {/* Details Grid */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[3] }}>
            {[
              { label: 'Regulation', value: request.regulation.toUpperCase() },
              { label: 'Submitted', value: formatDistanceToNow(request.submittedAt, { addSuffix: true }) },
              { label: 'Due Date', value: request.dueDate.toLocaleDateString() },
              { label: 'Assignee', value: request.assignee?.name || 'Unassigned' },
            ].map((item) => (
              <Box key={item.label}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{item.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{item.value}</span>
              </Box>
            ))}
          </Box>

          {request.description && (
            <Box style={{ marginBottom: tokens.spacing[3] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Description</span>
              <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], margin: 0, lineHeight: 1.5 }}>{request.description}</p>
            </Box>
          )}

          {/* Status Actions */}
          {onStatusChange && request.status !== 'completed' && (
            <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[3], borderTop: `1px solid ${tokens.colors.neutral[200]}`, paddingTop: tokens.spacing[3] }}>
              {request.status === 'new' && (
                <button onClick={() => onStatusChange(request.id, 'in-review')} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                  border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit',
                }}>Start Review</button>
              )}
              {request.status === 'in-review' && (
                <button onClick={() => onStatusChange(request.id, 'processing')} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                  border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit',
                }}>Start Processing</button>
              )}
              {request.status === 'processing' && (
                <button onClick={() => onStatusChange(request.id, 'completed')} style={{
                  padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                  border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit',
                }}>Mark Complete</button>
              )}
              <button onClick={() => onStatusChange(request.id, 'rejected')} style={{
                padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                border: `1px solid ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white,
                color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
              }}>Reject</button>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
