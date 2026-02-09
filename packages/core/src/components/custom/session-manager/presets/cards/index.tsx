'use client';

/**
 * SessionManager - Cards Preset
 * Card-based view of sessions for visual display
 */

import { createPreset, PresetContext } from '../../../factory';
import type { SessionManagerProps } from '../../core';
import { getSessionStatusColors, getDeviceIcon, formatSessionDuration } from '../../core';
import {
  createCardStyle,
  createBadgeStyle,
  createInteractiveCardStyle,
  createAccentBarStyle,
} from '../../../helpers';

export const CardsSessionManager = createPreset<SessionManagerProps>({
  name: 'SessionManager.Cards',
  render: ({ primitives, props, tokens }: PresetContext<SessionManagerProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getSessionStatusColors(tokens);

    const {
      sessions,
      onRevoke,
      onRevokeAll,
      currentSessionId,
      title = 'Active Sessions',
      loading,
      showLocation = true,
      className,
      style,
    } = props;

    return (
      <Box className={className} style={{ padding: tokens.spacing[4], ...style }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[4] }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          {onRevokeAll && (
            <button onClick={onRevokeAll} style={{
              padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`,
              borderRadius: tokens.borderRadius.md,
              border: `1px solid ${tokens.colors.errorScale[300]}`,
              backgroundColor: tokens.colors.common.white,
              color: tokens.colors.errorScale[600],
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}>
              Revoke All Others
            </button>
          )}
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: tokens.spacing[3] }}>
            {sessions.map((session) => {
              const isCurrent = session.id === currentSessionId || session.isCurrent;
              const colors = statusColors[session.status];

              return (
                <Box key={session.id} style={{
                  ...createInteractiveCardStyle(tokens, { active: !!isCurrent }),
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <Box style={createAccentBarStyle(tokens, { position: 'top', color: isCurrent ? tokens.colors.primaryScale[500] : undefined })} />
                  <Box style={{ padding: tokens.spacing[3] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[2] }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span style={{ fontSize: tokens.typography.fontSize['2xl'] }}>{getDeviceIcon(session.device.type)}</span>
                        <Box>
                          <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                            {session.device.browser || session.device.type}
                          </span>
                          {session.device.os && (
                            <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{session.device.os}</span>
                          )}
                        </Box>
                      </Box>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg }}>
                        <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                        <span style={{ fontSize: tokens.typography.fontSize.xs, color: colors.color, fontWeight: tokens.typography.fontWeight.medium }}>{session.status}</span>
                      </Box>
                    </Box>

                    {isCurrent && (
                      <span style={{ display: 'inline-block', padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, marginBottom: tokens.spacing[2] }}>
                        Current Session
                      </span>
                    )}

                    <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      <span>IP: <span style={{ fontFamily: 'monospace' }}>{session.ipAddress}</span></span>
                      {showLocation && session.location && <span>Location: {session.location}</span>}
                      <span>Active: {formatSessionDuration(session.lastActiveAt)}</span>
                    </Box>

                    {session.status === 'active' && !isCurrent && onRevoke && (
                      <button onClick={() => onRevoke(session.id)} style={{
                        width: '100%',
                        marginTop: tokens.spacing[3],
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.md,
                        border: `1px solid ${tokens.colors.errorScale[200]}`,
                        backgroundColor: tokens.colors.errorScale[50],
                        color: tokens.colors.errorScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.medium,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Revoke Session
                      </button>
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
