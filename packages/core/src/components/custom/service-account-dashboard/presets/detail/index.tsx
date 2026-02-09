'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { ServiceAccountDashboardProps } from '../../core';
import { getStatusColors } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createListItemStyle, createBadgeStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const DetailServiceAccountDashboard = createPreset<ServiceAccountDashboardProps>({
  name: 'ServiceAccountDashboard.Detail',
  render: ({ primitives, props, tokens }: PresetContext<ServiceAccountDashboardProps>) => {
    const { Box } = primitives;
    const statusColors = getStatusColors(tokens);

    const { accounts, onEditAccount, onDeleteAccount, onRegenerateSecret, onToggleStatus, selectedAccountId, title = 'Service Account Details', loading, className, style } = props;

    const account = accounts.find(a => a.id === selectedAccountId) || accounts[0] || null;

    if (loading) {
      return (
        <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        </Box>
      );
    }

    if (!account) {
      return (
        <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
          <Box style={{ padding: tokens.spacing[8], textAlign: 'center' }}>
            <Box style={{ fontSize: tokens.typography.fontSize.lg, color: tokens.colors.neutral[400], marginBottom: tokens.spacing[2] }}>Select a service account</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Choose an account from the list to view its details</Box>
          </Box>
        </Box>
      );
    }

    const sColors = statusColors[account.status];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: 0, ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
            {onEditAccount && <button onClick={() => onEditAccount(account.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.primaryScale[300]}`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>}
            {onRegenerateSecret && <button onClick={() => onRegenerateSecret(account.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.warningScale[300]}`, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Regenerate Secret</button>}
            {onToggleStatus && <button onClick={() => onToggleStatus(account.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>{account.status === 'active' ? 'Disable' : 'Enable'}</button>}
            {onDeleteAccount && <button onClick={() => onDeleteAccount(account.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.errorScale[200]}`, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
          </Box>
        </Box>

        {/* Account Name + Status */}
        <Box style={{ padding: `${tokens.spacing[4]}px ${tokens.spacing[4]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <Box style={{ width: tokens.spacing[10], height: tokens.spacing[10], borderRadius: tokens.borderRadius.lg, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>{account.name.charAt(0).toUpperCase()}</span>
            </Box>
            <Box>
              <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <span style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{account.name}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.bg, color: sColors.color, border: `1px solid ${sColors.border}`, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium }}>
                  <span style={{ width: 8, height: 8, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.color }} />
                  {account.status}
                </span>
              </Box>
              {account.description && <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>{account.description}</Box>}
            </Box>
          </Box>
        </Box>

        {/* Client ID */}
        <Box style={{ ...createListItemStyle(tokens, { interactive: false }), padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
          <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[1] }}>Client ID</Box>
          <Box style={{ fontFamily: 'monospace', fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], backgroundColor: tokens.colors.neutral[50], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, wordBreak: 'break-all' }}>{account.clientId}</Box>
        </Box>

        {/* Scopes */}
        <Box style={{ ...createListItemStyle(tokens, { interactive: false }), padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
          <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>Scopes ({account.scopes.length})</Box>
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
            {account.scopes.map(scope => (
              <span key={scope} style={createBadgeStyle(tokens, 'info')}>{scope}</span>
            ))}
            {account.scopes.length === 0 && <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>No scopes assigned</span>}
          </Box>
        </Box>

        {/* IP Whitelist */}
        {account.ipWhitelist && account.ipWhitelist.length > 0 && (
          <Box style={{ ...createListItemStyle(tokens, { interactive: false }), padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>IP Whitelist</Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1] }}>
              {account.ipWhitelist.map(ip => (
                <span key={ip} style={{ fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs, padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700] }}>{ip}</span>
              ))}
            </Box>
          </Box>
        )}

        {/* Rate Limit */}
        {account.rateLimitPerMinute !== undefined && (
          <Box style={{ ...createListItemStyle(tokens, { interactive: false }), padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
            <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[1] }}>Rate Limit</Box>
            <Box style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{account.rateLimitPerMinute.toLocaleString()} requests / minute</Box>
          </Box>
        )}

        {/* Activity Metrics */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
          <Box style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: tokens.spacing[2] }}>Activity</Box>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: tokens.spacing[3] }}>
            <Box style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Requests</Box>
              <Box style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{account.requestCount !== undefined ? account.requestCount.toLocaleString() : '--'}</Box>
            </Box>
            <Box style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Last Used</Box>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{account.lastUsedAt ? formatDistanceToNow(account.lastUsedAt, { addSuffix: true }) : 'Never'}</Box>
            </Box>
            <Box style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
              <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[1] }}>Expires</Box>
              <Box style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: account.expiresAt && account.expiresAt.getTime() < Date.now() ? tokens.colors.errorScale[600] : tokens.colors.neutral[900] }}>{account.expiresAt ? account.expiresAt.toLocaleDateString() : 'Never'}</Box>
            </Box>
          </Box>
        </Box>

        {/* Metadata */}
        <Box style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
          <Box style={{ display: 'flex', justifyContent: 'space-between', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
            <span>Created by {account.createdBy}</span>
            <span>Created {formatDistanceToNow(account.createdAt, { addSuffix: true })}</span>
          </Box>
        </Box>
      </Box>
    );
  },
});
