'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { PasskeyManagerProps } from '../../core';
import { getPasskeyTypeColors, getPasskeyIcon } from '../../core';
import { createCardStyle, createInteractiveCardStyle, createAccentBarStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const CardsPasskeyManager = createPreset<PasskeyManagerProps>({
  name: 'PasskeyManager.Cards',
  render: ({ primitives, props, tokens }: PresetContext<PasskeyManagerProps>) => {
    const { Box } = primitives;
    const typeColors = getPasskeyTypeColors(tokens);

    const { passkeys, onRegister, onDelete, title = 'Passkeys', loading, supportsWebAuthn = true, className, style } = props;

    return (
      <Box className={className} style={{ padding: tokens.spacing[4], ...style }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {onRegister && supportsWebAuthn && (
            <button onClick={onRegister} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Register Passkey</button>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: tokens.spacing[3] }}>
            {passkeys.map((pk) => {
              const tColors = typeColors[pk.type];
              return (
                <Box key={pk.id} style={{ ...createInteractiveCardStyle(tokens), overflow: 'hidden' }}>
                  <Box style={createAccentBarStyle(tokens, { position: 'top' })} />
                  <Box style={{ padding: tokens.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[2] }}>
                      <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{getPasskeyIcon(pk.type)}</span>
                      <Box>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{pk.name}</span>
                        <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tColors.bg, color: tColors.color, fontSize: tokens.typography.fontSize.xs }}>{pk.type}</span>
                      </Box>
                    </Box>
                    <Box style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {pk.deviceInfo && <span>{pk.deviceInfo}</span>}
                      <span>Created: {formatDistanceToNow(pk.createdAt, { addSuffix: true })}</span>
                      {pk.lastUsedAt && <span>Last used: {formatDistanceToNow(pk.lastUsedAt, { addSuffix: true })}</span>}
                      {pk.backupEligible !== undefined && <span>Backup: {pk.backupState ? 'Synced' : pk.backupEligible ? 'Eligible' : 'Not eligible'}</span>}
                    </Box>
                    {onDelete && (
                      <button onClick={() => onDelete(pk.id)} style={{ width: '100%', marginTop: tokens.spacing[2], padding: `${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.errorScale[200]}`, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                    )}
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
