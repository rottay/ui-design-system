'use client';

/**
 * BreachNotificationPanel - Timeline Preset
 * Chronological timeline of breach incident events
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BreachNotificationPanelProps } from '../../core';
import { getBreachSeverityColors, getBreachStatusColors, getCategoryLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createStatusDotStyle,
  createAccentBarStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const TimelineBreachNotificationPanel = createPreset<BreachNotificationPanelProps>({
  name: 'BreachNotificationPanel.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<BreachNotificationPanelProps>) => {
    const { Box, Stack } = primitives;
    const severityColors = getBreachSeverityColors(tokens);
    const statusColors = getBreachStatusColors(tokens);

    const {
      incidents,
      selectedIncidentId,
      onUpdateStatus,
      title = 'Breach Timeline',
      loading,
      className,
      style,
    } = props;

    const incident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

    if (loading || !incident) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>{loading ? 'Loading...' : 'No incidents'}</Box>;
    }

    const sevColors = severityColors[incident.severity];
    const statColors = statusColors[incident.status];
    const sorted = [...incident.timeline].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const typeColors: Record<string, string> = {
      detection: tokens.colors.errorScale[500],
      investigation: tokens.colors.warningScale[500],
      containment: tokens.colors.infoScale[500],
      notification: tokens.colors.primaryScale[500],
      resolution: tokens.colors.successScale[500],
    };

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: sevColors.dot })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{incident.title}</h3>
            <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sevColors.bg, color: sevColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
                {incident.severity}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: statColors.bg, color: statColors.color, fontSize: tokens.typography.fontSize.xs }}>
                <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: statColors.dot, display: 'inline-block' }} />
                {incident.status}
              </span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{getCategoryLabel(incident.category)}</span>
            </Box>
          </Box>
          <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{incident.affectedUsers.toLocaleString()} users affected</span>
        </Box>

        <Box style={{ padding: tokens.spacing[4] }}>
          {sorted.map((event, idx) => {
            const isLast = idx === sorted.length - 1;
            const color = typeColors[event.type] || tokens.colors.neutral[400];

            return (
              <Box key={event.id} style={{ display: 'flex', gap: tokens.spacing[3] }}>
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                  <span style={{ ...createStatusDotStyle(tokens, color), width: 10, height: 10, marginTop: tokens.spacing[1], zIndex: 1 }} />
                  {!isLast && <Box style={{ width: 2, flex: 1, backgroundColor: tokens.colors.neutral[200], marginTop: tokens.spacing[1] }} />}
                </Box>
                <Box style={{ flex: 1, paddingBottom: tokens.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{event.action}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDistanceToNow(event.timestamp, { addSuffix: true })}</span>
                  </Box>
                  {event.description && <p style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600], margin: `${tokens.spacing[1]}px 0 0` }}>{event.description}</p>}
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1], display: 'block' }}>by {event.actor}</span>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
