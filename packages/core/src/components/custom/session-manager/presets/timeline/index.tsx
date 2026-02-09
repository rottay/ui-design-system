'use client';

/**
 * SessionManager - Timeline Preset
 * Chronological timeline view of session activity
 */

import { createPreset, PresetContext } from '../../../factory';
import type { SessionManagerProps } from '../../core';
import { getSessionStatusColors, getDeviceIcon, formatSessionDuration } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createStatusDotStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const TimelineSessionManager = createPreset<SessionManagerProps>({
  name: 'SessionManager.Timeline',
  render: ({ primitives, props, tokens }: PresetContext<SessionManagerProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getSessionStatusColors(tokens);

    const {
      sessions,
      onRevoke,
      currentSessionId,
      title = 'Session Timeline',
      loading,
      showLocation = true,
      className,
      style,
    } = props;

    const sorted = [...sessions].sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), ...style }}>
        <Box style={createPanelHeaderStyle(tokens)}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
        </Box>

        {loading ? (
          <Box style={{ padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400] }}>Loading...</Box>
        ) : (
          <Box style={{ padding: tokens.spacing[4] }}>
            {sorted.map((session, idx) => {
              const isCurrent = session.id === currentSessionId || session.isCurrent;
              const colors = statusColors[session.status];
              const isLast = idx === sorted.length - 1;

              return (
                <Box key={session.id} style={{ display: 'flex', gap: tokens.spacing[3], position: 'relative' }}>
                  {/* Timeline line */}
                  <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                    <span style={{ ...createStatusDotStyle(tokens, colors.dot), width: 10, height: 10, marginTop: tokens.spacing[1], zIndex: 1 }} />
                    {!isLast && (
                      <Box style={{ width: 2, flex: 1, backgroundColor: tokens.colors.neutral[200], marginTop: tokens.spacing[1] }} />
                    )}
                  </Box>

                  {/* Content */}
                  <Box style={{ flex: 1, paddingBottom: tokens.spacing[4] }}>
                    <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                        <span>{getDeviceIcon(session.device.type)}</span>
                        <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                          {session.device.browser || session.device.type}
                        </span>
                        {isCurrent && (
                          <span style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[50], color: tokens.colors.primaryScale[700], fontSize: tokens.typography.fontSize.xs }}>
                            Current
                          </span>
                        )}
                      </Box>
                      <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>
                        {formatDistanceToNow(session.lastActiveAt, { addSuffix: true })}
                      </span>
                    </Box>

                    <Box style={{ marginTop: tokens.spacing[1], fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'flex', gap: tokens.spacing[3] }}>
                      <span style={{ fontFamily: 'monospace' }}>{session.ipAddress}</span>
                      {showLocation && session.location && <span>{session.location}</span>}
                      {session.device.os && <span>{session.device.os}</span>}
                    </Box>

                    <Box style={{ marginTop: tokens.spacing[1], display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: colors.bg, fontSize: tokens.typography.fontSize.xs, color: colors.color }}>
                        <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: colors.dot, display: 'inline-block' }} />
                        {session.status}
                      </span>
                      {session.status === 'active' && !isCurrent && onRevoke && (
                        <button onClick={() => onRevoke(session.id)} style={{
                          padding: `0 ${tokens.spacing[2]}px`,
                          borderRadius: tokens.borderRadius.sm,
                          border: `1px solid ${tokens.colors.errorScale[200]}`,
                          backgroundColor: 'transparent',
                          color: tokens.colors.errorScale[600],
                          fontSize: tokens.typography.fontSize.xs,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                        }}>
                          Revoke
                        </button>
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
