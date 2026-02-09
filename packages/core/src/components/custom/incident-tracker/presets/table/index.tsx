'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { IncidentTrackerProps } from '../../core';
import { getIncidentSeverityColors, getIncidentStatusColors } from '../../core';
import { createCardStyle, createPanelHeaderStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const TableIncidentTracker = createPreset<IncidentTrackerProps>({
  name: 'IncidentTracker.Table',
  render: ({ primitives, props, tokens }: PresetContext<IncidentTrackerProps>) => {
    const { Box } = primitives;
    const sevColors = getIncidentSeverityColors(tokens);
    const statColors = getIncidentStatusColors(tokens);

    const { incidents, onIncidentClick, selectedIncidentId, title = 'Incidents', loading, className, style } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            <Box style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
              {['Incident', 'Severity', 'Status', 'Type', 'Assignee', 'Reported'].map(h => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </Box>

            {incidents.map((inc) => {
              const sev = sevColors[inc.severity];
              const stat = statColors[inc.status];
              const isSelected = inc.id === selectedIncidentId;

              return (
                <Box key={inc.id} onClick={() => onIncidentClick?.(inc.id)} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                  gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  backgroundColor: isSelected ? tokens.colors.primaryScale[50] : 'transparent',
                  cursor: onIncidentClick ? 'pointer' : 'default', alignItems: 'center',
                }}>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{inc.title}</span>
                    {inc.description && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: 300 }}>{inc.description}</span>}
                  </Box>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sev.bg, color: sev.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>{inc.severity}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: stat.bg, color: stat.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>
                    <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: stat.dot, display: 'inline-block' }} />{inc.status}
                  </span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], textTransform: 'capitalize' as const }}>{inc.type}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>{inc.assignee?.name || '—'}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDistanceToNow(inc.reportedAt, { addSuffix: true })}</span>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
