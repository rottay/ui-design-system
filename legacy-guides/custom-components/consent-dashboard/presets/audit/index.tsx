'use client';

/**
 * ConsentDashboard - Audit Preset
 * Audit log of consent changes
 */

import { createPreset, PresetContext } from '../../../factory';
import type { ConsentDashboardProps } from '../../core';
import { getConsentStatusColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createStatusDotStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const AuditConsentDashboard = createPreset<ConsentDashboardProps>({
  name: 'ConsentDashboard.Audit',
  render: ({ primitives, props, tokens }: PresetContext<ConsentDashboardProps>) => {
    const { Box } = primitives;
    const statusColors = getConsentStatusColors(tokens);

    const {
      auditLog: rawAuditLog = [],
      consents,
      title = 'Consent Audit Log',
      loading,
      className,
      style,
    } = props;

    const auditLog = Array.isArray(rawAuditLog) ? rawAuditLog : [];

    const getConsentLabel = (consentId: string) => {
      return consents.find(c => c.id === consentId)?.label || consentId;
    };

    const getActionLabel = (action: string) => {
      const labels: Record<string, string> = { granted: 'Granted', denied: 'Denied', withdrawn: 'Withdrawn', updated: 'Updated', expired: 'Expired' };
      return labels[action] || action;
    };

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : auditLog.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No audit entries</Box>
        ) : (
          <Box>
            {/* Header */}
            <Box style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
              gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50],
            }}>
              {['Consent', 'Action', 'New Status', 'Source', 'Time'].map(h => (
                <span key={h} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </Box>

            {auditLog.map((entry) => {
              const colors = statusColors[entry.newStatus];
              return (
                <Box key={entry.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                  borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  alignItems: 'center',
                }}>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{getConsentLabel(entry.consentId)}</span>
                    <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>by {entry.actor}</span>
                  </Box>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{getActionLabel(entry.action)}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>
                    <span style={{ ...createStatusDotStyle(tokens, colors.dot), width: 5, height: 5 }} />
                    {entry.newStatus}
                  </span>
                  <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, width: 'fit-content' }}>{entry.source}</span>
                  <Box>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDistanceToNow(entry.timestamp, { addSuffix: true })}</span>
                    {entry.ipAddress && <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], fontFamily: 'monospace' }}>{entry.ipAddress}</span>}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
