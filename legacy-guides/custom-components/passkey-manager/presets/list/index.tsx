'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { PasskeyManagerProps } from '../../core';
import { getPasskeyTypeColors, getPasskeyIcon } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createListItemStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const ListPasskeyManager = createPreset<PasskeyManagerProps>({
  name: 'PasskeyManager.List',
  render: ({ primitives, props, tokens }: PresetContext<PasskeyManagerProps>) => {
    const { Box } = primitives;
    const typeColors = getPasskeyTypeColors(tokens);

    const { passkeys, onRegister, onDelete, onRename, title = 'Passkeys', subtitle, loading, supportsWebAuthn = true, className, style } = props;

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
            <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{passkeys.length} registered</span>
            {onRegister && supportsWebAuthn && (
              <button onClick={onRegister} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Register Passkey</button>
            )}
          </Box>
        </Box>

        {!supportsWebAuthn && (
          <Box style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.warningScale[50], color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.xs }}>
            WebAuthn is not supported in this browser
          </Box>
        )}

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : passkeys.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No passkeys registered</Box>
        ) : (
          <Box>
            {passkeys.map((pk) => {
              const tColors = typeColors[pk.type];
              return (
                <Box key={pk.id} style={{ ...createListItemStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px` }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xl }}>{getPasskeyIcon(pk.type)}</span>
                    <Box>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block' }}>{pk.name}</span>
                      <Box style={{ display: 'flex', gap: tokens.spacing[2], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        <span style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tColors.bg, color: tColors.color }}>{pk.type}</span>
                        {pk.deviceInfo && <span>{pk.deviceInfo}</span>}
                        <span>Created: {formatDistanceToNow(pk.createdAt, { addSuffix: true })}</span>
                        {pk.lastUsedAt && <span>Last used: {formatDistanceToNow(pk.lastUsedAt, { addSuffix: true })}</span>}
                      </Box>
                      {pk.transports && pk.transports.length > 0 && (
                        <Box style={{ display: 'flex', gap: tokens.spacing[1], marginTop: tokens.spacing[1] }}>
                          {pk.transports.map(t => (
                            <span key={t} style={{ padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[600], fontSize: tokens.typography.fontSize.xs }}>{t}</span>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </Box>
                  {onDelete && (
                    <button onClick={() => onDelete(pk.id)} style={{ padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, border: `1px solid ${tokens.colors.errorScale[200]}`, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs, cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                  )}
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    );
  },
});
