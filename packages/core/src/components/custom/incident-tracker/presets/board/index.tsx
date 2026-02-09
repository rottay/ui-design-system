'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { IncidentTrackerProps, IncidentStatus } from '../../core';
import { getIncidentSeverityColors, getIncidentStatusColors } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createInteractiveCardStyle, createSectionHeaderStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const BoardIncidentTracker = createPreset<IncidentTrackerProps>({
  name: 'IncidentTracker.Board',
  render: ({ primitives, props, tokens }: PresetContext<IncidentTrackerProps>) => {
    const { Box, Stack } = primitives;
    const sevColors = getIncidentSeverityColors(tokens);
    const statColors = getIncidentStatusColors(tokens);

    const { incidents, onIncidentClick, onCreate, title = 'Incident Tracker', subtitle, loading, className, style } = props;

    const columns: { status: IncidentStatus; label: string }[] = [
      { status: 'open', label: 'Open' },
      { status: 'investigating', label: 'Investigating' },
      { status: 'mitigating', label: 'Mitigating' },
      { status: 'resolved', label: 'Resolved' },
    ];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          {onCreate && (
            <button onClick={onCreate} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.errorScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Report Incident</button>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: `repeat(${columns.length}, 1fr)`, gap: tokens.spacing[3], padding: tokens.spacing[4] }}>
            {columns.map((col) => {
              const colIncidents = incidents.filter(i => i.status === col.status);
              const colors = statColors[col.status];

              return (
                <Box key={col.status}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[3] }}>
                    <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot }} />
                    <span style={{ ...createSectionHeaderStyle(tokens), margin: 0 }}>{col.label}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], backgroundColor: tokens.colors.neutral[100], padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm }}>{colIncidents.length}</span>
                  </Box>

                  <Stack direction="vertical" spacing="sm">
                    {colIncidents.map((inc) => {
                      const sColors = sevColors[inc.severity];
                      return (
                        <Box key={inc.id} onClick={() => onIncidentClick?.(inc.id)} style={{
                          ...createInteractiveCardStyle(tokens), padding: tokens.spacing[3],
                          borderLeft: `3px solid ${sColors.dot}`,
                        }}>
                          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                            <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: sColors.bg, color: sColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>{inc.severity}</span>
                            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDistanceToNow(inc.reportedAt, { addSuffix: true })}</span>
                          </Box>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{inc.title}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginTop: tokens.spacing[1] }}>{inc.type}</span>
                          {inc.assignee && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1], display: 'block' }}>{inc.assignee.name}</span>}
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1], display: 'block' }}>{inc.updates.length} updates</span>
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
