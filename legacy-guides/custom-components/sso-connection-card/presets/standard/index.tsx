'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { SsoConnectionCardProps } from '../../core';
import { getSsoStatusColors, getProtocolLabel, getProviderIcon } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createInteractiveCardStyle, createAccentBarStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const StandardSsoConnectionCard = createPreset<SsoConnectionCardProps>({
  name: 'SsoConnectionCard.Standard',
  render: ({ primitives, props, tokens }: PresetContext<SsoConnectionCardProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getSsoStatusColors(tokens);

    const { connections, onConnectionClick, onToggle, onCreate, onTest, title = 'SSO Connections', subtitle, loading, className, style } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          {onCreate && (
            <button onClick={onCreate} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>
              Add Connection
            </button>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : connections.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No SSO connections configured</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: tokens.spacing[3], padding: tokens.spacing[4] }}>
            {connections.map((conn) => {
              const colors = statusColors[conn.status];
              const certExpiring = conn.certificateExpiry && conn.certificateExpiry.getTime() - Date.now() < 30 * 24 * 60 * 60 * 1000;

              return (
                <Box key={conn.id} onClick={() => onConnectionClick?.(conn.id)} style={{ ...createInteractiveCardStyle(tokens), overflow: 'hidden', cursor: onConnectionClick ? 'pointer' : 'default' }}>
                  <Box style={createAccentBarStyle(tokens, { position: 'top', color: colors.dot })} />
                  <Box style={{ padding: tokens.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.xl }}>{getProviderIcon(conn.provider)}</span>
                        <Box>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{conn.name}</span>
                          <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{getProtocolLabel(conn.protocol)}</span>
                        </Box>
                      </Box>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, color: colors.color, fontSize: tokens.typography.fontSize.xs }}>
                        <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                        {conn.status}
                      </span>
                    </Box>

                    {conn.domain && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>Domain: {conn.domain}</span>}

                    <Box style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginBottom: tokens.spacing[2] }}>
                      {conn.totalLogins !== undefined && <span>{conn.totalLogins} logins</span>}
                      {conn.lastLoginAt && <span>Last: {formatDistanceToNow(conn.lastLoginAt, { addSuffix: true })}</span>}
                      {conn.jitProvisioning && <span style={{ color: tokens.colors.primaryScale[600] }}>JIT enabled</span>}
                    </Box>

                    {certExpiring && (
                      <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600], fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing[2] }}>
                        Certificate expires {conn.certificateExpiry!.toLocaleDateString()}
                      </span>
                    )}

                    <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
                      {onToggle && (
                        <button onClick={(e) => { e.stopPropagation(); onToggle(conn.id, conn.status !== 'active'); }} style={{
                          padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                          border: `1px solid ${conn.status === 'active' ? tokens.colors.errorScale[200] : tokens.colors.successScale[200]}`,
                          backgroundColor: conn.status === 'active' ? tokens.colors.errorScale[50] : tokens.colors.successScale[50],
                          color: conn.status === 'active' ? tokens.colors.errorScale[700] : tokens.colors.successScale[700],
                          fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                        }}>{conn.status === 'active' ? 'Disable' : 'Enable'}</button>
                      )}
                      {onTest && (
                        <button onClick={(e) => { e.stopPropagation(); onTest(conn.id); }} style={{
                          padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm,
                          border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white,
                          color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit',
                        }}>Test</button>
                      )}
                    </Box>
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
