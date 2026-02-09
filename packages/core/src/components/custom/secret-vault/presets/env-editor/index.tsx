'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { SecretVaultProps } from '../../core';
import { getEnvironmentColors, getSecretTypeIcon } from '../../core';
import { createCardStyle, createPanelHeaderStyle } from '../../../helpers';

export const EnvEditorSecretVault = createPreset<SecretVaultProps>({
  name: 'SecretVault.EnvEditor',
  render: ({ primitives, props, tokens }: PresetContext<SecretVaultProps>) => {
    const { Box } = primitives;
    const envColors = getEnvironmentColors(tokens);

    const { secrets, onCopySecret, onViewSecret, selectedEnvironment = 'development', title = 'Environment Variables', loading, className, style } = props;

    const envSecrets = secrets.filter(s => s.environment === selectedEnvironment || s.environment === 'all');

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          <span style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: envColors[selectedEnvironment as keyof typeof envColors]?.bg || tokens.colors.neutral[100], color: envColors[selectedEnvironment as keyof typeof envColors]?.color || tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>{selectedEnvironment}</span>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[3], fontFamily: 'monospace', fontSize: tokens.typography.fontSize.xs, backgroundColor: tokens.colors.neutral[900], borderRadius: `0 0 ${tokens.borderRadius.lg} ${tokens.borderRadius.lg}`, color: tokens.colors.neutral[300], overflow: 'auto' }}>
            {envSecrets.length === 0 ? (
              <span style={{ color: tokens.colors.neutral[500] }}># No variables for this environment</span>
            ) : (
              envSecrets.map((secret, idx) => (
                <Box key={secret.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[1]}px 0`, borderBottom: idx < envSecrets.length - 1 ? `1px solid ${tokens.colors.neutral[800]}` : 'none' }}>
                  <Box>
                    <span style={{ color: tokens.colors.successScale[400] }}>{secret.name}</span>
                    <span style={{ color: tokens.colors.neutral[500] }}>=</span>
                    <span style={{ color: tokens.colors.warningScale[400] }}>{secret.maskedValue || '••••••••'}</span>
                  </Box>
                  <Box style={{ display: 'flex', gap: tokens.spacing[1] }}>
                    {onViewSecret && <button onClick={() => onViewSecret(secret.id)} style={{ padding: `0 ${tokens.spacing[1]}px`, border: `1px solid ${tokens.colors.neutral[700]}`, backgroundColor: 'transparent', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs, borderRadius: tokens.borderRadius.sm, cursor: 'pointer', fontFamily: 'monospace' }}>reveal</button>}
                    {onCopySecret && <button onClick={() => onCopySecret(secret.id)} style={{ padding: `0 ${tokens.spacing[1]}px`, border: `1px solid ${tokens.colors.neutral[700]}`, backgroundColor: 'transparent', color: tokens.colors.neutral[400], fontSize: tokens.typography.fontSize.xs, borderRadius: tokens.borderRadius.sm, cursor: 'pointer', fontFamily: 'monospace' }}>copy</button>}
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>
    );
  },
});
