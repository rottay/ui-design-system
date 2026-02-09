'use client';

/**
 * BreachNotificationPanel - Summary Preset
 * Overview summary of all breach incidents
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BreachNotificationPanelProps } from '../../core';
import { getBreachSeverityColors, getBreachStatusColors, getCategoryLabel } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createInteractiveCardStyle,
  createAccentBarStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const SummaryBreachNotificationPanel = createPreset<BreachNotificationPanelProps>({
  name: 'BreachNotificationPanel.Summary',
  render: ({ primitives, props, tokens }: PresetContext<BreachNotificationPanelProps>) => {
    const { Box, Stack } = primitives;
    const severityColors = getBreachSeverityColors(tokens);
    const statusColors = getBreachStatusColors(tokens);

    const {
      incidents,
      onIncidentClick,
      onExport,
      title = 'Breach Incidents',
      subtitle,
      loading,
      className,
      style,
    } = props;

    const activeIncidents = incidents.filter(i => i.status !== 'closed' && i.status !== 'resolved');
    const totalAffected = incidents.reduce((s, i) => s + i.affectedUsers, 0);

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          {onExport && incidents.length > 0 && (
            <button onClick={() => onExport(incidents[0].id)} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white,
              color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
            }}>Export Report</button>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[4] }}>
            {/* Summary Stats */}
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4] }}>
              {[
                { label: 'Total Incidents', value: incidents.length, color: tokens.colors.neutral[900] },
                { label: 'Active', value: activeIncidents.length, color: activeIncidents.length > 0 ? tokens.colors.errorScale[600] : tokens.colors.successScale[600] },
                { label: 'Affected Users', value: totalAffected.toLocaleString(), color: tokens.colors.neutral[900] },
                { label: 'Pending Notifications', value: incidents.reduce((s, i) => s + i.notifications.filter(n => n.status === 'pending').length, 0), color: tokens.colors.warningScale[600] },
              ].map(stat => (
                <Box key={stat.label} style={{ textAlign: 'center', padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
                  <span style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: stat.color, display: 'block' }}>{stat.value}</span>
                  <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</span>
                </Box>
              ))}
            </Box>

            {/* Incident Cards */}
            <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
              {incidents.map((incident) => {
                const sevColors = severityColors[incident.severity];
                const statColors = statusColors[incident.status];

                return (
                  <Box key={incident.id} onClick={() => onIncidentClick?.(incident.id)} style={{
                    ...createInteractiveCardStyle(tokens),
                    overflow: 'hidden',
                    cursor: onIncidentClick ? 'pointer' : 'default',
                  }}>
                    <Box style={createAccentBarStyle(tokens, { position: 'top', color: sevColors.dot })} />
                    <Box style={{ padding: tokens.spacing[3] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{incident.title}</span>
                        <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sevColors.bg, color: sevColors.color, fontSize: tokens.typography.fontSize.xs }}>{incident.severity}</span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: statColors.bg, color: statColors.color, fontSize: tokens.typography.fontSize.xs }}>
                            <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: statColors.dot, display: 'inline-block' }} />
                            {incident.status}
                          </span>
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', gap: tokens.spacing[4], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        <span>{getCategoryLabel(incident.category)}</span>
                        <span>{incident.affectedUsers.toLocaleString()} users</span>
                        <span>{incident.notifications.filter(n => n.status === 'sent').length}/{incident.notifications.length} notifications sent</span>
                        <span>Detected: {formatDistanceToNow(incident.detectedAt, { addSuffix: true })}</span>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    );
  },
});
