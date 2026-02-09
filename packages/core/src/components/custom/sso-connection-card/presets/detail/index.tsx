'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { SsoConnectionCardProps } from '../../core';
import { getSsoStatusColors, getProtocolLabel, getProviderIcon } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createAccentBarStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const DetailSsoConnectionCard = createPreset<SsoConnectionCardProps>({
  name: 'SsoConnectionCard.Detail',
  render: ({ primitives, props, tokens }: PresetContext<SsoConnectionCardProps>) => {
    const { Box } = primitives;
    const statusColors = getSsoStatusColors(tokens);

    const { connections, onToggle, onDelete, onTest, title, loading, className, style } = props;

    const conn = connections[0];

    if (loading || !conn) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>{loading ? 'Loading...' : 'No connection'}</Box>;
    }

    const colors = statusColors[conn.status];

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: colors.dot })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{getProviderIcon(conn.provider)}</span>
            <Box>
              <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title || conn.name}</h3>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{conn.provider} · {getProtocolLabel(conn.protocol)}</span>
            </Box>
          </Box>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
            <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
            {conn.status}
          </span>
        </Box>

        <Box style={{ padding: tokens.spacing[4] }}>
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
            {[
              { label: 'Domain', value: conn.domain || '—' },
              { label: 'Client ID', value: conn.clientId || '—' },
              { label: 'Total Logins', value: conn.totalLogins?.toLocaleString() || '0' },
              { label: 'Last Login', value: conn.lastLoginAt ? formatDistanceToNow(conn.lastLoginAt, { addSuffix: true }) : 'Never' },
              { label: 'JIT Provisioning', value: conn.jitProvisioning ? 'Enabled' : 'Disabled' },
              { label: 'Default Role', value: conn.defaultRole || 'None' },
              { label: 'Created', value: formatDistanceToNow(conn.createdAt, { addSuffix: true }) },
              { label: 'Certificate Expiry', value: conn.certificateExpiry?.toLocaleDateString() || '—' },
            ].map(f => (
              <Box key={f.label}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{f.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{f.value}</span>
              </Box>
            ))}
          </Box>

          {conn.metadataUrl && (
            <Box style={{ marginBottom: tokens.spacing[3] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Metadata URL</span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[700], fontFamily: 'monospace', wordBreak: 'break-all' as const }}>{conn.metadataUrl}</span>
            </Box>
          )}

          <Box style={{ display: 'flex', gap: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[200]}`, paddingTop: tokens.spacing[3] }}>
            {onTest && (
              <button onClick={() => onTest(conn.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.primaryScale[300]}`, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Test Connection</button>
            )}
            {onToggle && (
              <button onClick={() => onToggle(conn.id, conn.status !== 'active')} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${conn.status === 'active' ? tokens.colors.errorScale[300] : tokens.colors.successScale[300]}`, backgroundColor: conn.status === 'active' ? tokens.colors.errorScale[50] : tokens.colors.successScale[50], color: conn.status === 'active' ? tokens.colors.errorScale[700] : tokens.colors.successScale[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>
                {conn.status === 'active' ? 'Disable' : 'Enable'}
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(conn.id)} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>Delete</button>
              )}
          </Box>
        </Box>
      </Box>
    );
  },
});
