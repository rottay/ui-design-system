'use client';

/**
 * SessionManager - Table Preset
 * Tabular view of all sessions with actions
 */

import { createPreset, PresetContext } from '../../../factory';
import type { SessionManagerProps } from '../../core';
import { getSessionStatusColors, getDeviceIcon, formatSessionDuration } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createBadgeStyle,
  createListItemStyle,
} from '../../../helpers';

export const TableSessionManager = createPreset<SessionManagerProps>({
  name: 'SessionManager.Table',
  render: ({ primitives, props, tokens }: PresetContext<SessionManagerProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getSessionStatusColors(tokens);

    const {
      sessions,
      onRevoke,
      onRevokeAll,
      currentSessionId,
      title = 'Active Sessions',
      subtitle,
      loading,
      showLocation = true,
      className,
      style,
    } = props;

    const activeSessions = sessions.filter(s => s.status === 'active');

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        {/* Header */}
        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], margin: `${tokens.spacing[1]}px 0 0` }}>{subtitle}</p>}
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
            <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {activeSessions.length} active
            </span>
            {onRevokeAll && activeSessions.length > 1 && (
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
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading sessions...</Box>
        ) : sessions.length === 0 ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>No sessions found</Box>
        ) : (
          <Box style={{ overflow: 'auto' }}>
            {/* Table Header */}
            <Box style={{
              display: 'grid',
              gridTemplateColumns: showLocation ? '2fr 1fr 1fr 1fr 1fr auto' : '2fr 1fr 1fr 1fr auto',
              gap: tokens.spacing[3],
              padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
              backgroundColor: tokens.colors.neutral[50],
            }}>
              {['Device', 'IP Address', ...(showLocation ? ['Location'] : []), 'Status', 'Last Active', ''].map((h, i) => (
                <span key={i} style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const }}>{h}</span>
              ))}
            </Box>

            {/* Table Rows */}
            {sessions.map((session) => {
              const isCurrent = session.id === currentSessionId || session.isCurrent;
              const colors = statusColors[session.status];

              return (
                <Box key={session.id} style={{
                  display: 'grid',
                  gridTemplateColumns: showLocation ? '2fr 1fr 1fr 1fr 1fr auto' : '2fr 1fr 1fr 1fr auto',
                  gap: tokens.spacing[3],
                  ...createListItemStyle(tokens, { active: !!isCurrent }),
                  alignItems: 'center',
                }}>
                  {/* Device */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ fontSize: tokens.typography.fontSize.lg }}>{getDeviceIcon(session.device.type)}</span>
                    <Box>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                        {session.device.browser || session.device.type}
                        {isCurrent && <span style={{ color: tokens.colors.primaryScale[600], marginLeft: tokens.spacing[1] }}>(this device)</span>}
                      </span>
                      {session.device.os && (
                        <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{session.device.os}</span>
                      )}
                    </Box>
                  </Box>

                  {/* IP */}
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], fontFamily: 'monospace' }}>{session.ipAddress}</span>

                  {/* Location */}
                  {showLocation && (
                    <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{session.location || '—'}</span>
                  )}

                  {/* Status */}
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}>
                    <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: colors.color }}>{session.status}</span>
                  </Box>

                  {/* Last Active */}
                  <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
                    {formatSessionDuration(session.lastActiveAt)}
                  </span>

                  {/* Action */}
                  <Box>
                    {session.status === 'active' && !isCurrent && onRevoke && (
                      <button onClick={() => onRevoke(session.id)} style={{
                        padding: `${tokens.spacing[1]}px ${tokens.spacing[2]}px`,
                        borderRadius: tokens.borderRadius.sm,
                        border: `1px solid ${tokens.colors.errorScale[200]}`,
                        backgroundColor: tokens.colors.errorScale[50],
                        color: tokens.colors.errorScale[700],
                        fontSize: tokens.typography.fontSize.xs,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}>
                        Revoke
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
