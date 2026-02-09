'use client';

/**
 * BreachNotificationPanel - Notification Preset
 * Notification management for breach incidents
 */

import { createPreset, PresetContext } from '../../../factory';
import type { BreachNotificationPanelProps } from '../../core';
import { getBreachSeverityColors, getBreachStatusColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createAccentBarStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const NotificationBreachNotificationPanel = createPreset<BreachNotificationPanelProps>({
  name: 'BreachNotificationPanel.Notification',
  render: ({ primitives, props, tokens }: PresetContext<BreachNotificationPanelProps>) => {
    const { Box } = primitives;
    const severityColors = getBreachSeverityColors(tokens);

    const {
      incidents,
      selectedIncidentId,
      onSendNotification,
      title = 'Breach Notifications',
      loading,
      className,
      style,
    } = props;

    const incident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

    if (loading || !incident) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>{loading ? 'Loading...' : 'No incidents'}</Box>;
    }

    const sevColors = severityColors[incident.severity];
    const notifStatusColors = {
      pending: { bg: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], dot: tokens.colors.warningScale[500] },
      sent: { bg: tokens.colors.successScale[50], color: tokens.colors.successScale[700], dot: tokens.colors.successScale[500] },
      acknowledged: { bg: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], dot: tokens.colors.primaryScale[500] },
      overdue: { bg: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], dot: tokens.colors.errorScale[500] },
    };

    const recipientIcons: Record<string, string> = {
      'authority': '\u{1F3DB}',
      'affected-users': '\u{1F465}',
      'internal': '\u{1F3E2}',
      'public': '\u{1F4E2}',
    };

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: sevColors.dot })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{incident.title}</span>
          </Box>
          {incident.regulatoryDeadline && (
            <Box style={{ textAlign: 'right' }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Regulatory Deadline</span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: incident.regulatoryDeadline.getTime() < Date.now() ? tokens.colors.errorScale[600] : tokens.colors.neutral[900] }}>
                {incident.regulatoryDeadline.toLocaleDateString()}
              </span>
            </Box>
          )}
        </Box>

        <Box>
          {incident.notifications.map((notif) => {
            const nColors = notifStatusColors[notif.status];
            const isOverdue = notif.status === 'overdue' || (notif.status === 'pending' && notif.dueDate.getTime() < Date.now());

            return (
              <Box key={notif.id} style={{
                ...createListItemStyle(tokens),
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
                borderLeft: isOverdue ? `3px solid ${tokens.colors.errorScale[500]}` : 'none',
              }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                  <span style={{ fontSize: tokens.typography.fontSize.xl }}>{recipientIcons[notif.recipientType] || '\u{1F4CB}'}</span>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', textTransform: 'capitalize' as const }}>
                      {notif.recipientType.replace(/-/g, ' ')}
                    </span>
                    <Box style={{ display: 'flex', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {notif.recipientCount && <span>{notif.recipientCount} recipients</span>}
                      <span>Due: {notif.dueDate.toLocaleDateString()}</span>
                      {notif.sentAt && <span>Sent: {formatDistanceToNow(notif.sentAt, { addSuffix: true })}</span>}
                    </Box>
                  </Box>
                </Box>

                <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: nColors.bg, color: nColors.color, fontSize: tokens.typography.fontSize.xs }}>
                    <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: nColors.dot, display: 'inline-block' }} />
                    {notif.status}
                  </span>
                  {notif.status === 'pending' && onSendNotification && (
                    <button onClick={() => onSendNotification(incident.id, notif.recipientType)} style={{
                      padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md,
                      border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white,
                      fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit',
                    }}>Send Now</button>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
});
