'use client';

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { ServiceAccountDashboardProps } from '../../core';
import { getStatusColors } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createListItemStyle, createBadgeStyle, createFilterPillStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const OverviewServiceAccountDashboard = createPreset<ServiceAccountDashboardProps>({
  name: 'ServiceAccountDashboard.Overview',
  render: ({ primitives, props, tokens }: PresetContext<ServiceAccountDashboardProps>) => {
    const { Box } = primitives;
    const statusColors = getStatusColors(tokens);

    const { accounts, onCreateAccount, onEditAccount, onDeleteAccount, onRegenerateSecret, onToggleStatus, title = 'Service Accounts', subtitle, loading, className, style } = props;

    const [statusFilter, setStatusFilter] = useState<string | null>(null);

    const filtered = accounts.filter(a => !statusFilter || a.status === statusFilter);
    const statuses = ['active', 'inactive', 'suspended', 'expired'] as const;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: 0, ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{filtered.length} account{filtered.length !== 1 ? 's' : ''}</span>
            {onCreateAccount && (
              <button onClick={onCreateAccount} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Create Account</button>
            )}
          </Box>
        </Box>

        <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
          <span onClick={() => setStatusFilter(null)} style={createFilterPillStyle(tokens, { active: !statusFilter })}>All</span>
          {statuses.map(s => (
            <span key={s} onClick={() => setStatusFilter(s)} style={createFilterPillStyle(tokens, { active: statusFilter === s })}>{s}</span>
          ))}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : filtered.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No service accounts found</Box>
        ) : (
          <Box>
            {filtered.map((account) => {
              const sColors = statusColors[account.status];

              return (
                <Box key={account.id} style={{ ...createListItemStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], flex: 1, minWidth: 0 }}>
                    <Box style={{ width: tokens.spacing[8], height: tokens.spacing[8], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>{account.name.charAt(0).toUpperCase()}</span>
                    </Box>
                    <Box style={{ minWidth: 0 }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{account.name}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.bg, color: sColors.color, border: `1px solid ${sColors.border}`, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
                          <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: sColors.color }} />
                          {account.status}
                        </span>
                      </Box>
                      <Box style={{ fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], marginTop: tokens.spacing[1], overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.clientId.length > 24 ? `${account.clientId.slice(0, 24)}...` : account.clientId}</Box>
                      <Box style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                        {account.scopes.slice(0, 4).map(scope => (
                          <span key={scope} style={{ ...createBadgeStyle(tokens, 'info'), padding: `0 ${tokens.spacing[1]}px`, fontSize: tokens.typography.fontSize.xs }}>{scope}</span>
                        ))}
                        {account.scopes.length > 4 && (
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>+{account.scopes.length - 4} more</span>
                        )}
                      </Box>
                      <Box style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                        {account.lastUsedAt && <span>Last used: {formatDistanceToNow(account.lastUsedAt, { addSuffix: true })}</span>}
                        {account.requestCount !== undefined && <span>{account.requestCount.toLocaleString()} requests</span>}
                      </Box>
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1], flexShrink: 0 }}>
                    {onToggleStatus && <button onClick={() => onToggleStatus(account.id)} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>{account.status === 'active' ? 'Disable' : 'Enable'}</button>}
                    {onRegenerateSecret && <button onClick={() => onRegenerateSecret(account.id)} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.warningScale[300]}`, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Regenerate</button>}
                    {onDeleteAccount && <button onClick={() => onDeleteAccount(account.id)} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.errorScale[200]}`, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
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
