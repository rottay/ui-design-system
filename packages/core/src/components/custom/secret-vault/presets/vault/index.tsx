'use client';

import { useState } from 'react';
import { createPreset, PresetContext } from '../../../factory';
import type { SecretVaultProps } from '../../core';
import { getSecretTypeColors, getSecretTypeIcon, getEnvironmentColors, isExpiringSoon } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createListItemStyle, createFilterPillStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const VaultSecretVault = createPreset<SecretVaultProps>({
  name: 'SecretVault.Vault',
  render: ({ primitives, props, tokens }: PresetContext<SecretVaultProps>) => {
    const { Box, Stack } = primitives;
    const typeColors = getSecretTypeColors(tokens);
    const envColors = getEnvironmentColors(tokens);

    const { secrets, onCreateSecret, onRotateSecret, onDeleteSecret, onViewSecret, onCopySecret, selectedEnvironment, onEnvironmentChange, title = 'Secret Management', subtitle, loading, className, style } = props;

    const [envFilter, setEnvFilter] = useState<string | null>(selectedEnvironment || null);

    const filtered = secrets.filter(s => !envFilter || s.environment === envFilter || s.environment === 'all');
    const envs = ['production', 'staging', 'development'] as const;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <Box style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{filtered.length} secrets</span>
            {onCreateSecret && (
              <button onClick={onCreateSecret} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Add Secret</button>
            )}
          </Box>
        </Box>

        <Box style={{ display: 'flex', gap: tokens.spacing[1], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `1px solid ${tokens.colors.neutral[100]}` }}>
          <span onClick={() => { setEnvFilter(null); onEnvironmentChange?.('all'); }} style={createFilterPillStyle(tokens, { active: !envFilter })}>All</span>
          {envs.map(env => (
            <span key={env} onClick={() => { setEnvFilter(env); onEnvironmentChange?.(env); }} style={createFilterPillStyle(tokens, { active: envFilter === env })}>{env}</span>
          ))}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : filtered.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No secrets found</Box>
        ) : (
          <Box>
            {filtered.map((secret) => {
              const tColors = typeColors[secret.type];
              const eColors = envColors[secret.environment as keyof typeof envColors] || envColors.all;
              const expiring = isExpiringSoon(secret.expiresAt);

              return (
                <Box key={secret.id} style={{ ...createListItemStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xl }}>{getSecretTypeIcon(secret.type)}</span>
                    <Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{secret.name}</span>
                        <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tColors.bg, color: tColors.color, fontSize: tokens.typography.fontSize.xs }}>{secret.type}</span>
                        <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: eColors.bg, color: eColors.color, fontSize: tokens.typography.fontSize.xs }}>{secret.environment}</span>
                      </Box>
                      {secret.maskedValue && <span style={{ fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400], display: 'block', marginTop: 2 }}>{secret.maskedValue}</span>}
                      <Box style={{ display: 'flex', gap: tokens.spacing[3], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], marginTop: tokens.spacing[1] }}>
                        <span>v{secret.versions.length}</span>
                        {secret.lastRotated && <span>Rotated: {formatDistanceToNow(secret.lastRotated, { addSuffix: true })}</span>}
                        {expiring && <span style={{ color: tokens.colors.warningScale[600], fontWeight: tokens.typography.fontWeight.medium }}>Expires: {secret.expiresAt!.toLocaleDateString()}</span>}
                        {secret.rotationPolicy?.autoRotate && <span style={{ color: tokens.colors.primaryScale[600] }}>Auto-rotate: {secret.rotationPolicy.intervalDays}d</span>}
                      </Box>
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {onViewSecret && <button onClick={() => onViewSecret(secret.id)} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>View</button>}
                    {onCopySecret && <button onClick={() => onCopySecret(secret.id)} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>}
                    {onRotateSecret && <button onClick={() => onRotateSecret(secret.id)} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.warningScale[300]}`, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Rotate</button>}
                    {onDeleteSecret && <button onClick={() => onDeleteSecret(secret.id)} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.errorScale[200]}`, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Delete</button>}
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
